# CLAUDE.md

## Project Context

- **Overview and docs index:** `README.md`
- **Topic docs:** `docs/README-<topic>.md`
- **Build plan and progress:** `docs/README-plan.md`

## Workflow Rules

1. Before starting work, read the docs for the area you're changing.
2. Expo changes between SDKs. Check the versioned docs for the installed SDK
   (`https://docs.expo.dev/versions/v57.0.0/`) before writing Expo code, and
   install Expo-managed packages with `npx expo install` (`npx expo install <pkg> --dev`
   for dev dependencies; on Linux, `-- --dev` wrongly adds them to `dependencies`).
3. Follow the strict TypeScript rules in `tsconfig.json` (see `docs/README-code-quality.md`).
4. The app is decoupled from the API. Never import from, or depend on, the API
   repo; the only contract is HTTP.
5. Only routes and layouts go in `src/app/`. Tests and other code live elsewhere.
6. Documentation lives only in `docs/`, plus the root `README.md` index. Don't add
   Markdown files anywhere else.
7. When a change alters behaviour, commands or configuration covered in `docs/`,
   update that doc in the same change. Docs describe the current state, not its
   history.
8. Before finishing a change, run `npm run lint:check`, `npm run typecheck` and
   `npm test`.
