# Testing

How the tests run, and how to add one.

## Setup

| Kind      | Tool                                | Location                            | Run                |
| --------- | ----------------------------------- | ----------------------------------- | ------------------ |
| Unit      | Jest (`jest-expo` preset)           | `*.test.ts`, next to the code       | `npm test`         |
| Component | Jest + React Native Testing Library | `*.test.tsx`, next to the component | `npm test`         |
| E2E       | Maestro                             | `.maestro/*.yaml`                   | `npm run test:e2e` |

Jest config lives under `"jest"` in `package.json`. The `jest-expo` preset mocks
the native parts of the Expo SDK and handles Babel transforms, so tests run in
Node without a device.

## Coverage threshold

`npm run test:cov` enforces the `coverageThreshold` in `package.json`'s Jest
config (statements, branches, functions and lines). It fails the run, not just
the report, if coverage drops below the floor. See
[CI/CD](README-ci.md#coverage-threshold) for the current numbers and how to
change them.

## Maestro (end-to-end)

Maestro drives a real build on a device or emulator, unlike the Jest tests
above, which render in Node against MSW. One flow per tab lives in
`.maestro/`, covering that tab's happy path: open a detail screen from the
list and back out of it (Settings instead exercises the theme toggle, since it
has no list). See [CI/CD](README-ci.md#maestro-flows) for what each flow does
and how to run one.

Flows select list cards by a `testID` (`post-card-0`, `person-card-0`,
`album-card-0`), since the titles are live data, not fixed strings to match
against. That doesn't change the rule below for Jest: those `testID`s exist
only for Maestro, and component tests still query the same cards by their
accessible text or role.

Maestro is a standalone CLI, not an npm dependency — install it per
[Maestro's docs](https://docs.maestro.dev), then run `npm run test:e2e` or
`maestro test .maestro/<flow>.yaml` against a running dev build.

## Rules

- **No tests in `src/app/`.** Expo Router treats every file there as a route.
  Keep routes thin: they re-export screens from `src/features/`, and the tests
  target those screens.
- **Globals are on.** `describe`, `it` and `expect` come from Jest's globals,
  typed through `"types": ["jest"]` in `tsconfig.json`.
- **Config is fixed in tests.** `src/test/setup-env.ts` runs before every test
  file and sets `EXPO_PUBLIC_API_URL` to `http://api.test`, so tests never depend
  on `.env`. Test config parsing itself through `parseConfig()`, which takes the
  environment as an argument.
- **`render` is async.** React Native Testing Library 14 returns a promise from
  `render`, so `await` it.
- **Query like a user.** Prefer `getByText`, `getByRole` and `getByLabelText`
  over `getByTestId`, and assert with `toBeOnTheScreen()`.
- **Network calls are mocked with MSW**, not with `jest.mock` on `@/api`. See
  [API](docs/README-api.md) for the handlers, fixtures and the environment
  quirks (Expo's fetch, `expo-crypto`) their setup works around.
