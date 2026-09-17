# JSON Placeholder Mobile

A React Native app that reads the
[JSONPlaceholder proxy API](https://github.com/smallmodelstudio/json-placeholder-api)
and shows posts, people, albums and photos.

The app is deliberately simple. The repo is a sandbox for learning React Native
and the practices around it: typed API contracts, server-state caching,
component and end-to-end testing, and mobile CI/CD. It is decoupled from the API
and talks to it only over HTTP.

**Stack:** Expo SDK 57 · React Native 0.86 · Expo Router · TypeScript 6 · Zod ·
Jest + React Native Testing Library

## Status

Phase 1 (theme and app shell) is done. See the [build plan](docs/README-plan.md)
for what comes next.

## Quick start

```bash
nvm use
npm install
npm start
```

Then press `a` for an Android emulator or `w` for the web. See
[Getting started](docs/README-getting-started.md) for reaching the API from an
emulator.

## Repository map

| Path                                               | Contents                                                    | Docs                                              |
| -------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| `package.json`, `.env`, `app.json`                 | Scripts, configuration, Expo app config                     | [Getting started](docs/README-getting-started.md) |
| `src/app/`                                         | Expo Router routes and layouts only                         | [Build plan](docs/README-plan.md)                 |
| `src/features/`                                    | Screens and feature code                                    | [Build plan](docs/README-plan.md)                 |
| `src/theme/`                                       | Paper theme (light, dark), fonts, theme mode override       | [UI](docs/README-ui.md)                           |
| `src/ui/`                                          | Shared components: Screen, EmptyState, ErrorState, Skeleton | [UI](docs/README-ui.md)                           |
| `src/config/`                                      | Environment parsing and validation                          | [Getting started](docs/README-getting-started.md) |
| `src/test/`                                        | Jest setup and test helpers                                 | [Testing](docs/README-testing.md)                 |
| `eslint.config.js`, `.prettierrc`, `tsconfig.json` | Lint, format and compiler rules                             | [Code quality](docs/README-code-quality.md)       |
