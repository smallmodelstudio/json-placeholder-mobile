# Code quality

The static checks — linting, formatting and type-checking — and the compiler rules
they enforce.

## Checks

| Command              | Tool                                                                                                                                          | Config                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `npm run lint`       | ESLint: `eslint-config-expo`, `typescript-eslint`'s type-checked rules for `.ts`/`.tsx`, and Prettier reported as lint errors. Rewrites files | `eslint.config.js`               |
| `npm run lint:check` | Same rules, no `--fix`; fails instead of rewriting                                                                                            | `eslint.config.js`               |
| `npm run format`     | Prettier (single quotes, trailing commas)                                                                                                     | `.prettierrc`, `.prettierignore` |
| `npm run typecheck`  | `tsc`, no emit                                                                                                                                | `tsconfig.json`                  |
| `npm run doctor`     | `expo-doctor`: SDK-compatible versions, config problems                                                                                       | —                                |

CI should run `lint:check`, not `lint`: the auto-fixing one rewrites a
badly formatted file and still exits 0.

Metro, not `tsc`, builds the app, and Metro strips types without checking them.
A type error never stops the app running, so `typecheck` is the only thing that
catches it.

## Strict compiler flags

`tsconfig.json` extends `expo/tsconfig.base` and turns on, on top of `strict`:

| Flag                                   | Effect                                              | How to comply                                                                                                                                      |
| -------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `noUncheckedIndexedAccess`             | `arr[0]` is typed `T \| undefined`                  | Guard it explicitly; avoid `!`                                                                                                                     |
| `exactOptionalPropertyTypes`           | An optional key can't be set to `undefined`         | Omit the key with a conditional spread, or type the key `?: T \| undefined` when `undefined` is a real value (see `RawEnv` in `src/config/env.ts`) |
| `noPropertyAccessFromIndexSignature`   | `obj.key` on an index signature is an error         | Use `obj['key']`. For `process.env`, declare the variable in `src/types/env.d.ts` instead, because Expo needs dot notation                         |
| `noImplicitOverride`                   | Overriding a base-class method needs a keyword      | Mark it `override`                                                                                                                                 |
| `noUnusedLocals`, `noUnusedParameters` | Unused names are errors                             | Prefix a required-but-unused parameter with `_`                                                                                                    |
| `noFallthroughCasesInSwitch`           | A `case` must end with `break`, `return` or `throw` |                                                                                                                                                    |

TypeScript 6 defaults `types` to `[]`, so global type packages load only when
`types` lists them. It lists `jest`, which gives tests `describe`, `it` and
`expect`. Add a package there if its globals are needed.

## Imports

Use the `@/` alias for anything under `src/` (for example
`import { config } from '@/config'`), and relative imports only within a folder.
Metro and Jest both read the alias from `tsconfig.json`'s `paths`.

## File naming

Files are kebab-case (`home-screen.tsx`). Components and types are PascalCase;
functions and variables are camelCase. Use named exports, except for route
files in `src/app/`, which Expo Router requires to default-export.

## Lint rules

`typescript-eslint`'s `recommendedTypeChecked` runs as-is on TypeScript files;
no rule is relaxed from its default severity.
