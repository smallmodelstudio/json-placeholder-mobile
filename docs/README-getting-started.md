# Getting started

How to install, configure and run the app locally.

## Prerequisites

| Tool                                  | Version                           | Needed for                       |
| ------------------------------------- | --------------------------------- | -------------------------------- |
| Node.js                               | 24, pinned in `.nvmrc`            | Everything                       |
| Android Studio (SDK, emulator, `adb`) | Recent                            | Running on Android               |
| The proxy API                         | Any version matching the contract | Real data (not needed for tests) |
| [Maestro](https://docs.maestro.dev)   | Recent                            | E2E flows (`npm run test:e2e`)   |

The web target (`npm run web`) needs neither Android Studio nor a device, which
makes it the quickest way to check a change. Treat Android as the real target,
though: some native modules behave differently on the web.

## Run

```bash
nvm use
npm install
npm start
```

In the Expo CLI, press `a` to open an Android emulator or `w` to open the web.
Screens reload when you save.

## Configuration

Settings come from `EXPO_PUBLIC_` environment variables, which Expo inlines into
the bundle at build time. They are visible to anyone with the app, so never put
secrets in them.

| File         | Committed       | Purpose                  |
| ------------ | --------------- | ------------------------ |
| `.env`       | Yes             | Shared defaults          |
| `.env.local` | No (gitignored) | Your machine's overrides |

| Variable              | Default in `.env`       | Controls                                         |
| --------------------- | ----------------------- | ------------------------------------------------ |
| `EXPO_PUBLIC_API_URL` | `http://localhost:3000` | Base URL of the proxy API; must be http or https |

`src/config/` validates the variables with zod when the app starts. An invalid
value throws straight away, with a message naming the variable.

To add a variable:

1. Add it to `.env`.
2. Declare it in `src/types/env.d.ts`.
3. Add it to the schema in `src/config/env.ts`.
4. Pass it in `src/config/index.ts` as `process.env.EXPO_PUBLIC_…`. Expo only
   inlines static dot notation, so destructuring or `process.env['…']` leaves
   the value undefined.

After changing a `.env` file, restart `npm start` with `--clear`.

## Reaching the API from an emulator (WSL2)

Inside an Android emulator, `localhost` is the emulator itself, not your
machine. On WSL2 there is a second hop between Windows and Linux. Use one of:

| Option                      | How                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `adb reverse` (recommended) | `adb reverse tcp:3000 tcp:3000`, then keep the default `http://localhost:3000`. Rerun after the emulator restarts |
| WSL mirrored networking     | Set `networkingMode=mirrored` in `%UserProfile%\.wslconfig`, then `wsl --shutdown`                                |
| A deployed API              | Set `EXPO_PUBLIC_API_URL` in `.env.local`                                                                         |

On the web target, `localhost` works as-is, but the API doesn't enable CORS,
so browser requests to it fail outright. Data-fetching features target
Android only for that reason — see [API](docs/README-api.md#web-and-cors).

## npm scripts

| Script       | Does                                                               |
| ------------ | ------------------------------------------------------------------ |
| `start`      | Start the Expo dev server                                          |
| `android`    | Start the dev server and open Android                              |
| `ios`        | Start the dev server and open iOS (macOS only)                     |
| `web`        | Start the dev server and open the web                              |
| `lint`       | ESLint, applying auto-fixes                                        |
| `lint:check` | ESLint without fixes; for CI                                       |
| `format`     | Prettier over the repo                                             |
| `typecheck`  | Type-check with `tsc`; emits nothing                               |
| `test`       | Jest tests                                                         |
| `test:watch` | Jest tests; re-run on change                                       |
| `test:cov`   | Jest tests with a coverage report; enforces the coverage threshold |
| `test:e2e`   | Maestro flows in `.maestro/`, against a running dev build          |
| `doctor`     | `expo-doctor`: checks dependency versions and project config       |
