# UI

The app shell: theming, navigation and the shared components every screen is
built from.

## Theme

`src/theme/theme.ts` builds a light and a dark [Material 3](https://m3.material.io)
theme with React Native Paper's `MD3LightTheme` / `MD3DarkTheme`, overriding
the type scale to use the [Inter](https://rsms.me/inter/) font loaded through
`@expo-google-fonts/inter` (regular for body text, semi-bold for titles and
labels, bold for headlines and displays).

A `Theme` for `expo-router`'s own navigation chrome (header, tab bar) is built
from the same Paper theme by `buildNavigationTheme`, so headers and tab bars
match the Material colours instead of React Navigation's defaults. This is
done by hand rather than with Paper's `adaptNavigationTheme`: since SDK 56,
`expo-router` vendors its own React Navigation fork and no longer accepts
`@react-navigation/native`'s `Theme` type, which `adaptNavigationTheme` is
typed against.

`src/theme/theme-mode.tsx` provides `ThemeModeProvider` and `useThemeMode()`,
tracking a `mode` of `'system' | 'light' | 'dark'` (default `'system'`) and
resolving it against `useColorScheme()` into the `colorScheme` the root layout
renders with. The Settings screen calls `setMode` to override it. The choice
is in-memory only and resets on restart; persisting it can wait until the app
has a storage dependency for something else.

The root layout (`src/app/_layout.tsx`) loads the fonts with `expo-font`,
keeping the splash screen up until they're ready, then wraps the app in
`ThemeModeProvider` → Paper's `PaperProvider` → `expo-router`'s `ThemeProvider`.

## Navigation

```text
src/app/
  _layout.tsx        Stack: providers, one route group
  (tabs)/
    _layout.tsx       Tabs: icons and titles for each screen
    index.tsx         Posts
    people.tsx        People
    albums.tsx        Albums
    settings.tsx       Settings
```

Each route file re-exports its screen from `src/features/<feature>/`, per the
routing rule in `docs/README-plan.md`. Tab icons come from
`@expo/vector-icons`'s `MaterialCommunityIcons`, matching Paper's Material
look.

Posts, People and Albums are placeholders (an `EmptyState` saying what's
coming) until Phases 3–5 add their data. Settings is fully built: it shows the
theme picker, the configured API URL and the app version.

## Shared components (`src/ui/`)

| Component    | Purpose                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Screen`     | Safe-area wrapper with the theme's background colour; `padded` and `edges` are configurable so a future edge-to-edge list can opt out of the default padding |
| `EmptyState` | Icon, title and optional message for a list with nothing in it                                                                                               |
| `ErrorState` | Icon, message, optional retry button and optional correlation ID (`Ref: …`), for the failure state the API contract calls for                                |
| `Skeleton`   | A pulsing placeholder block (via Reanimated) for the loading state; hidden from screen readers                                                               |

These cover the loading, empty and error states every screen needs per
`docs/README-plan.md`; the success state is each feature's own content.

## Accessibility

- Interactive elements use Paper components (`Button`, `SegmentedButtons`),
  which carry the right accessibility roles and states by default.
- `ErrorState` renders with `accessibilityRole="alert"` so a screen reader
  announces a failure as it appears.
- Text uses Paper's `Text`, which scales with the system font size setting;
  none of the shared components fix a line height that would clip at larger
  sizes.

## Testing

`src/test/render.tsx` exports `renderWithProviders`, which wraps a component
in `ThemeModeProvider` and `PaperProvider` — the providers every screen needs
— mirroring the root layout. Use it instead of RNTL's `render` for anything
under `src/features/` or `src/ui/`.

Reanimated's native module (`react-native-worklets`) has no native runtime
under Jest, so `package.json`'s Jest config sets
`"resolver": "react-native-worklets/jest/resolver.js"`, which resolves it to
its web implementation instead.
