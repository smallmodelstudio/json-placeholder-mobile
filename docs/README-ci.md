# CI/CD

The quality gates a change should pass before it merges, and how a preview
build gets onto a device.

## Pipeline

`.harness/pipeline.yaml` defines a single `Quality gates` stage that runs, in
order:

1. `npm ci`
2. `npm run lint:check`
3. `npm run typecheck`
4. `npm run test:cov` (fails if coverage drops below the threshold below)
5. `npm run api:check-drift` (regenerates `src/api/schema.d.ts` from the
   committed `openapi/proxy.json` snapshot and fails if it no longer matches —
   see [API](README-api.md) for the contract-sync scripts)

The pipeline is written as pipeline-as-code but isn't connected to a live
Harness project: `projectIdentifier`, `orgIdentifier` and `connectorRef` are
left as `<+input>` placeholders for whoever imports it. It runs against a
committed contract snapshot, not a live API, so it stays decoupled per
[the plan's principles](README-plan.md#principles).

None of these steps need Maestro or an emulator — they run on Node alone.

## Coverage threshold

`package.json`'s Jest config sets a `coverageThreshold.global` floor:

| Metric     | Threshold |
| ---------- | --------- |
| Statements | 85%       |
| Branches   | 80%       |
| Functions  | 85%       |
| Lines      | 85%       |

`npm run test:cov` fails if any metric drops below its floor. The numbers sit
a few points under what the suite currently reports, so a small, deliberate
drop doesn't fail CI, but a real regression in a feature's tests does. Raise a
threshold when coverage improves and stays there; don't lower one to make a
red build green — fix the tests instead.

## Maestro flows

`.maestro/*.yaml` has one flow per tab, covering its happy path:

| Flow                       | Covers                                                          |
| -------------------------- | --------------------------------------------------------------- |
| `posts-happy-path.yaml`    | Open a post, see its comments, go back                          |
| `people-happy-path.yaml`   | Open a profile, see the segmented Posts/Albums/Todos, go back   |
| `albums-happy-path.yaml`   | Open an album, open its first photo, see the full-screen viewer |
| `settings-happy-path.yaml` | Switch the theme override through all three modes               |

Flows select list items by `testID` (`post-card-0`, `person-card-0`,
`album-card-0`), not by their title text, since post/person/album titles come
from live data and aren't fixed strings to match against. Those `testID`s are
index-based, set by each screen's `renderItem`, and only exist to give Maestro
a stable hook — they're not used anywhere else in the app.

Run a flow against a running dev build with:

```bash
maestro test .maestro/posts-happy-path.yaml
```

or every flow with `npm run test:e2e`. Maestro (the CLI, not an npm package —
install per [their docs](https://docs.maestro.dev)) needs a running Android
emulator or connected device with the app already installed, matching the
`appId` in each flow (`android.package` in `app.json`).

These flows are written but haven't been run: that needs Android Studio, which
isn't installed here (same gap as the emulator-dependent items in the
[build plan](README-plan.md)).

## EAS preview build

`eas.json` has a `preview` profile: internal distribution, an installable APK,
Android only (this app has no iOS build yet, per the plan's out-of-scope
list). To build one:

```bash
npx eas build --profile preview --platform android
```

This needs an Expo account linked to the project (`npx eas login`, then
`npx eas init` if the project isn't linked yet) and uses a cloud build credit,
so it's left for whoever owns that account to run — it isn't run as part of
this change.
