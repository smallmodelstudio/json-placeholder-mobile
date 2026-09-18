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
`GestureHandlerRootView` → `ThemeModeProvider` → Paper's `PaperProvider` →
`expo-router`'s `ThemeProvider`. `GestureHandlerRootView` isn't needed by
anything in Phases 0–4; it's there for the photo viewer's pinch-to-zoom
(`react-native-gesture-handler`'s `GestureDetector` needs it as an ancestor to
work reliably, especially on Android), and wrapping the whole app is simpler
and safer than scoping it to one screen.

## Navigation

```text
src/app/
  _layout.tsx        Stack: providers, the tabs group, and the post detail route
  (tabs)/
    _layout.tsx       Tabs: icons and titles for each screen
    index.tsx         Posts
    people.tsx        People
    albums.tsx        Albums
    settings.tsx       Settings
  post/
    [id].tsx          Post detail, pushed on top of the tabs
  person/
    [id].tsx          Person profile, pushed on top of the tabs
  album/
    [id].tsx          Album's photo grid, pushed on top of the tabs
    [id]/
      [photoId].tsx   Full-screen photo viewer, pushed on top of the photo grid
```

Each route file re-exports its screen from `src/features/<feature>/`, per the
routing rule in `docs/README-plan.md`. Tab icons come from
`@expo/vector-icons`'s `MaterialCommunityIcons`, matching Paper's Material
look. `docs/README-architecture.md` covers how a dynamic route like
`post/[id].tsx` stays this thin, and how `album/[id]/[photoId].tsx` coexists
with `album/[id].tsx` as a route file and a route directory sharing the same
dynamic segment name.

Posts, People, Albums and Settings are all fully built: Posts lists posts from
the API with a detail screen, People a searchable directory with a profile
screen, and Albums a grid of albums with a per-album photo grid and full-screen
viewer, all per `docs/README-architecture.md`; Settings shows the theme
picker, the configured API URL and the app version.

## Shared components (`src/ui/`)

| Component    | Purpose                                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Screen`     | Safe-area wrapper with the theme's background colour; `padded` and `edges` are configurable so a future edge-to-edge list can opt out of the default padding   |
| `EmptyState` | Icon, title and optional message for a list with nothing in it                                                                                                 |
| `ErrorState` | Icon, message, optional retry button and optional correlation ID (`Ref: …`), for the failure state the API contract calls for                                  |
| `Skeleton`   | A pulsing placeholder block (via Reanimated) for the loading state; hidden from screen readers                                                                 |
| `ColourTile` | A solid-colour tile, falling back to the theme's surface colour when no colour is given — see `docs/README-architecture.md`'s "Colour tiles instead of images" |

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
