# API layer

How the app talks to the proxy API: the generated contract, the HTTP client,
error handling, server-state caching and the mocks tests run against.

## The contract

```text
openapi/proxy.json          committed snapshot of the API's /docs-json
src/api/schema.d.ts         generated from the snapshot; never edited by hand
```

- `npm run api:sync` fetches `${EXPO_PUBLIC_API_URL}/docs-json` (default
  `http://localhost:3000`) into `openapi/proxy.json`. Run it by hand when the
  API changes, then review the diff.
- `npm run api:generate` regenerates `schema.d.ts` from the snapshot with
  `openapi-typescript`.

Both are manual steps: nothing in the app or its tests needs the API running,
per the decoupling principle in `docs/README-plan.md`.

## `src/api/`

| File              | Exports                             | Purpose                                                                   |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `schema.d.ts`     | `paths`, `components`, `operations` | Generated types for every route, request and response                     |
| `client.ts`       | `apiClient`, `unwrap`               | The typed HTTP client and the envelope/error adapter around it            |
| `api-error.ts`    | `ApiError`, `ErrorBody`             | The one error type every failed call throws                               |
| `query-client.ts` | `queryClient`                       | TanStack Query's `QueryClient`, configured for the contract's retry rules |
| `keys.ts`         | `queryKeys`                         | The single source of query keys, by resource                              |

### `apiClient` and `unwrap`

`apiClient` is an `openapi-fetch` client built from `schema.d.ts`, so every
call is checked against the contract: an unknown path, an undeclared query
param or a mistyped body is a type error, not a runtime one. A middleware
attaches a fresh `x-correlation-id` header (from `expo-crypto`'s `randomUUID`)
to every request, matching the API's "accepts and echoes `x-correlation-id`"
behaviour.

Screens never call `apiClient` directly. Every feature hook wraps a call in
`unwrap`, which:

- returns the proxy's `{ data, meta }` envelope's `data` on success;
- throws an `ApiError` for a typed error response (400/404/429/502/504, per
  the contract);
- throws an `ApiError` with `status: 0` for a request that never got a
  response at all (offline, DNS failure, …), which `openapi-fetch` surfaces as
  a rejected promise rather than `{ error }`.

```ts
const posts = await unwrap(
  apiClient.GET('/posts', { params: { query: { userId } } }),
);
```

### `ApiError`

`ApiError` normalises every failure to `{ message, status, correlationId, body }`.
`body` is the parsed `{ statusCode, message, error, path, timestamp, correlationId }`
envelope when the response matched it, and `undefined` otherwise (an upstream
outage returning HTML, for example). `error.isRetryable` is `true` for `0`
(network failure), `429` (rate limited) and any `5xx` — the cases the query
client retries — and `false` for every other `4xx`, since the request itself
was wrong and won't succeed on a later attempt.

Error states in the UI show `error.correlationId` as "Ref: …" so a failure can
be traced in the API's own logs.

### `queryClient`

Configured per the contract:

- `retry`: up to 3 attempts, only for `error.isRetryable`, with exponential
  backoff capped at 30s.
- `staleTime`: 60s, so navigating back to a screen doesn't immediately
  refetch.
- Refetch on focus: TanStack Query's `focusManager` only listens for browser
  events by default. `query-client.ts` wires it to React Native's `AppState`
  instead, so "refetch on focus" means "refetch when the app is foregrounded"
  on Android; the web target keeps the default window listener.

### `queryKeys`

The single source of query keys, so every feature invalidates and reads the
same cache entries — see `src/api/keys.ts`. Each resource nests under an
`all` key (`queryKeys.posts.all`), so a mutation can invalidate every query
for that resource without listing each variant.

## Testing

`src/test/msw/` holds the mocks every component test and `renderWithProviders`
run against:

| File          | Purpose                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `fixtures.ts` | Sample data shaped like the contract's schemas (`components['schemas']`) |
| `handlers.ts` | MSW handlers for the GET endpoints the app calls, returning the fixtures |
| `server.ts`   | The MSW server (`setupServer`) tests run against                         |

The app is read-only (per `docs/README-plan.md`), so there are no handlers for
the contract's write endpoints. A test overrides a handler for one case with
`server.use(...)` inside the test; `src/test/setup-msw.ts` resets it
afterwards.

`renderWithProviders` (`src/test/render.tsx`) wraps a component in its own
`QueryClientProvider` with retries off, so a test asserting an error state
doesn't sit through the retry backoff.

### Why the test setup looks like this

Three environment quirks, each worth knowing before touching
`src/test/setup-*.ts` or `package.json`'s `jest` config:

- **`expo-crypto` doesn't work under Jest.** Its `randomUUID()` is a native
  module with no Jest mock, and resolves to `undefined`. `__mocks__/expo-crypto.ts`
  is a manual Jest mock (auto-applied to every test, per Jest's convention for
  node_modules mocks) that uses Node's own `crypto.randomUUID()` instead.
- **Expo's own fetch doesn't work under Jest either, and MSW can't see it.**
  SDK 57 replaces the global `fetch`/`Request`/`Response`/`Headers` with its
  own native-backed "winter" runtime; jest-expo stubs the native side out to
  no-ops for tests, so a real call through it returns a broken, empty
  response. `src/test/setup-fetch-polyfill.ts` swaps in `undici`'s
  implementations (plus the real `node:perf_hooks` `performance`, which
  undici's fetch needs and Jest's is missing) before anything else loads.
  It has to run, and finish, before `msw/node` is `require`d anywhere: MSW's
  interceptors and `apiClient` both capture the current global classes the
  first time they load, so patching afterwards would leave them pointing at
  the wrong ones. That's also why `server.listen()` in `setup-msw.ts` runs at
  the top level instead of inside `beforeAll` — `apiClient` is a
  module-level singleton that captures `globalThis.fetch` once, when
  `src/api/client.ts` first loads (which happens while the test file's own
  imports resolve, before any `beforeAll` runs).
- **`msw/node` and a couple of its own dependencies need Jest config to reach
  them.** `package.json`'s `jest.moduleNameMapper` maps `msw/node` straight to
  its compiled file: the package's `exports` map explicitly disables that
  subpath for the `react-native` condition, which jest-expo's test
  environment sets. `jest.transformIgnorePatterns` and `jest.transform` add a
  few of MSW's transitive dependencies (`rettime`, `@open-draft/deferred-promise`,
  `until-async`) that ship ESM-only, and a `.mjs` transform rule, since
  Jest doesn't transform node_modules or `.mjs` files by default.

## Web and CORS

The API doesn't enable CORS, so a browser request to it fails outright. Until
that changes (a decision for the API repo, which this app doesn't depend on
per the decoupling principle), data-fetching features target Android only;
`npm run web` still works for UI-only screens. `docs/README-getting-started.md`
covers reaching the API from an Android emulator on WSL2.
