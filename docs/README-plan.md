# Build plan

The plan for building the app, phase by phase. Tick items off as they land, and
delete this file once every phase is done (topic docs then describe the app).

## Goal

A React Native app that reads the
[JSONPlaceholder proxy API](https://github.com/smallmodelstudio/json-placeholder-api)
and shows the data in a polished UI. The app is read-only.

The repo is a learning exercise, so structure, tooling and tests count as much
as the features.

## Principles

- **Decoupled from the API.** The app shares no code, packages or repo with the
  API. The only contract is HTTP, described by a committed OpenAPI snapshot. The
  app works against any server that honours that contract, and no test or CI
  step needs the API to be running.
- **Types come from the contract.** Response types are generated from the
  snapshot, never written by hand.
- **One boundary.** Screens never see raw HTTP. The API layer removes the
  envelope and turns every failure into a typed error.
- **Every screen has four states:** loading, empty, error and success.
- **Docs describe the current state.** Topic docs live in `docs/README-<topic>.md`
  and are updated in the same change as the code.

## Stack

| Area                 | Choice                                                                             | Why                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Framework            | Expo (latest SDK, dev builds)                                                      | The React Native team's recommended way to start; native config through config plugins                                  |
| Navigation           | Expo Router, typed routes                                                          | File-based routes, with deep links for free                                                                             |
| Language             | TypeScript, `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | Catches mistakes at compile time                                                                                        |
| UI kit               | React Native Paper (Material 3)                                                    | Off the shelf, polished, themeable light/dark; Material 3 also carries over to the planned Android Studio (Compose) app |
| Lists and images     | `@shopify/flash-list`, `expo-image`                                                | Virtualised lists and cached images                                                                                     |
| Motion               | `react-native-reanimated`, `react-native-gesture-handler`, `expo-haptics`          | Transitions, the photo viewer and tactile feedback                                                                      |
| Server state         | TanStack Query                                                                     | Caching, retries, refetching and request status, with no global store                                                   |
| API client           | `openapi-fetch` + types from `openapi-typescript`                                  | Typed paths, params and responses from the contract                                                                     |
| Config               | `EXPO_PUBLIC_API_URL`, validated with zod at startup                               | Fails fast on bad config                                                                                                |
| Lint/format          | ESLint (flat config, `eslint-config-expo`), Prettier                               |                                                                                                                         |
| Unit/component tests | Jest (`jest-expo`) + React Native Testing Library                                  | The standard React Native setup; Vitest's React Native support is immature                                              |
| API mocking          | MSW                                                                                | The same handlers serve component tests and offline development                                                         |
| E2E tests            | Maestro                                                                            | Simple YAML flows on an emulator                                                                                        |
| CI                   | Harness pipeline; EAS Build for binaries                                           |                                                                                                                         |

## The API contract

The API's facts that shape the app. All of them come from its OpenAPI document
and response behaviour, not its source code.

| API behaviour                                                               | What the app does                                                                                                          |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Success responses are `{ data, meta }`                                      | `apiClient` returns `data` only                                                                                            |
| Errors are `{ statusCode, message, error, path, timestamp, correlationId }` | Parsed into an `ApiError` class; unknown shapes become `ApiError` with status 0                                            |
| Accepts and echoes `x-correlation-id`                                       | The client sends a generated ID per request; error states show it as "Ref: …" so a failure can be traced in the API's logs |
| Rate limits per IP (429)                                                    | Query retry: back off on 429, 5xx and network errors; never retry other 4xx                                                |
| Lists are not paginated (`/photos` is 5,000 items)                          | Prefer nested routes (`/albums/:id/photos`); virtualise every list                                                         |
| Unknown query params return 400                                             | Only send params the contract declares (the generated types enforce this)                                                  |
| Photo URLs point at `via.placeholder.com`, which no longer serves images    | Render a coloured tile from the hex colour in the URL, used as the image placeholder and fallback                          |

### Keeping the contract in sync

```text
openapi/proxy.json          committed snapshot of the API's /docs-json
src/api/schema.d.ts         generated from the snapshot; never edited by hand
```

- `npm run api:sync` fetches `${API_URL}/docs-json` into `openapi/proxy.json`.
  Run it by hand when the API changes, then review the diff.
- `npm run api:generate` regenerates `schema.d.ts` from the snapshot.
- CI runs `api:generate` and fails if `schema.d.ts` changes. The check is
  against the snapshot, not the live API, so CI stays decoupled.

## Screens

```text
(tabs)
  Posts     list of cards (title, excerpt, author)
            → post detail: body, author, comments
  People    directory with search
            → profile: contact, company
              segmented: Posts | Albums | Todos
  Albums    grid of albums (cover tile, photo count)
            → photo grid → full-screen viewer (swipe, pinch to zoom)
  Settings  theme (system, light, dark), API URL, app version
```

Across screens: skeleton loaders instead of spinners, pull-to-refresh on every
list, and an error state with a retry button and the correlation ID.

Stretch goal: a "new post" form (react-hook-form + zod) to practise mutations and
optimistic updates. The API accepts writes, but its upstream doesn't persist them.

## Repository layout

```text
src/
  app/                      Expo Router routes and layouts only: thin, re-export feature screens
  api/                      client, ApiError, generated schema, query key factory
  features/<feature>/       hooks (usePosts, usePost), components, mappers
  ui/                       app-wide components on top of Paper: Screen, ErrorState, Skeleton, ColourTile
  theme/                    Paper theme (light, dark), fonts
  config/                   env parsing and validation
  types/                    global type declarations (process.env)
  test/                     Jest setup, MSW handlers, fixtures, render helper with providers
openapi/                    contract snapshot
.maestro/                   e2e flows
docs/README-<topic>.md      topic docs
README.md                   overview and docs index
CLAUDE.md                   workflow rules
```

Rules:

- Routes in `src/app/` don't fetch data or hold tests. They re-export screens
  from `src/features/`.
- A feature never imports from another feature. Shared code moves to `src/ui/`
  or `src/api/`.
- `src/ui/` has no data dependencies.
- All query keys come from the factory in `src/api/`.

## Local development on WSL2

An emulator or phone can't reach `localhost` inside WSL2. Pick one and document
it in `docs/README-getting-started.md`:

- WSL mirrored networking (`networkingMode=mirrored` in `.wslconfig`)
- `adb reverse tcp:3000 tcp:3000` for an Android emulator or USB device
- Point `EXPO_PUBLIC_API_URL` at a deployed instance of the API
- Run against MSW mocks, with no API at all

## Phases

Each phase ends with a working app, passing checks and updated docs.

### Phase 0: Scaffold

- [x] `create-expo-app` with TypeScript and Expo Router; template demo removed
- [x] Strict `tsconfig.json`, ESLint, Prettier, `typecheck` / `lint` / `format` scripts
- [x] Jest (`jest-expo`) + React Native Testing Library, with passing tests
- [x] `src/config/` env validation, committed `.env` with `.env.local` overrides
- [ ] App running on an Android emulator from WSL2 (needs Android Studio installed;
      the Android bundle already builds with `npx expo export --platform android`)
- [x] `README.md`, `CLAUDE.md`, `docs/README-getting-started.md`, `docs/README-code-quality.md`, `docs/README-testing.md`

Learn: the Expo toolchain, dev builds compared with Expo Go.

### Phase 1: Theme and app shell

- [x] React Native Paper provider with Material 3 light and dark themes, following the system setting
- [x] Custom font through `expo-font`
- [x] Tab navigation with icons; Settings screen with a theme override
- [x] Shared `Screen`, `ErrorState`, `EmptyState`, `Skeleton` components
- [x] `docs/README-ui.md`

Learn: theming, safe areas, accessibility basics (roles, labels, font scaling).

### Phase 2: API layer

- [x] `openapi/proxy.json` snapshot, `api:sync` and `api:generate` scripts
- [x] `apiClient` on `openapi-fetch`: base URL, correlation ID header, envelope unwrap
- [x] `ApiError` and response parsing, with unit tests
- [x] QueryClient config: retry policy, stale times, refetch on focus
- [x] Query key factory
- [x] MSW handlers and fixtures; test render helper with all providers
- [x] `docs/README-api.md`
- [x] Decide on the web target: the API doesn't enable CORS, so browser requests
      fail. Decided to keep web out of API testing (Android only) rather than
      change the API repo, which this app doesn't depend on

Learn: type-safe boundaries, error modelling, caching strategy.

### Phase 3: Posts (first vertical slice)

- [ ] Posts list with skeletons, empty and error states, pull-to-refresh
- [ ] Post detail with author and comments
- [ ] Component tests for each state, using MSW
- [ ] `docs/README-architecture.md` describing the feature pattern

Learn: this slice sets the pattern every later feature copies.

### Phase 4: People

- [ ] Directory with debounced search
- [ ] Profile with segmented Posts, Albums and Todos
- [ ] Prefetch a profile when its row is pressed

Learn: reusing the pattern, nested routes, prefetching.

### Phase 5: Albums and photos

- [ ] Album grid and photo grid with colour-tile fallbacks
- [ ] Full-screen viewer: swipe between photos, pinch to zoom
- [ ] List performance check on a low-end emulator profile

Learn: FlashList, image caching, Reanimated and Gesture Handler.

### Phase 6: Polish

- [ ] Screen transitions and list item animations
- [ ] Haptics on key interactions
- [ ] Offline banner (`@react-native-community/netinfo`)
- [ ] App icon and splash screen
- [ ] Accessibility pass with TalkBack

Learn: what separates "works" from "feels good".

### Phase 7: Quality gates

- [ ] Maestro flows for each tab's happy path
- [ ] Coverage threshold
- [ ] Harness pipeline: lint, typecheck, test, contract drift check
- [ ] EAS preview build
- [ ] Extend `docs/README-testing.md` (MSW, Maestro, coverage); add `docs/README-ci.md`

Learn: CI/CD for mobile.

## Out of scope

- Authentication, since the API has none
- iOS builds, until an Apple developer account is set up (the code stays cross-platform)
- The native Android Studio app, which is a separate project
