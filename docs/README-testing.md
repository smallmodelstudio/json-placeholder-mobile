# Testing

How the tests run, and how to add one.

## Setup

| Kind      | Tool                                | Location                            | Run        |
| --------- | ----------------------------------- | ----------------------------------- | ---------- |
| Unit      | Jest (`jest-expo` preset)           | `*.test.ts`, next to the code       | `npm test` |
| Component | Jest + React Native Testing Library | `*.test.tsx`, next to the component | `npm test` |

Jest config lives under `"jest"` in `package.json`. The `jest-expo` preset mocks
the native parts of the Expo SDK and handles Babel transforms, so tests run in
Node without a device.

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
