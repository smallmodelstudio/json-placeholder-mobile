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
and safer than scoping it to one screen. `OfflineBanner` sits directly above
the `Stack`, so it overlays every route without each screen mounting it
itself.

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

| Component                    | Purpose                                                                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Screen`                     | Safe-area wrapper with the theme's background colour; `padded` and `edges` are configurable so a future edge-to-edge list can opt out of the default padding   |
| `EmptyState`                 | Icon, title and optional message for a list with nothing in it                                                                                                 |
| `ErrorState`                 | Icon, message, optional retry button and optional correlation ID (`Ref: …`), for the failure state the API contract calls for                                  |
| `Skeleton`                   | A pulsing placeholder block (via Reanimated) for the loading state; hidden from screen readers                                                                 |
| `ColourTile`                 | A solid-colour tile, falling back to the theme's surface colour when no colour is given — see `docs/README-architecture.md`'s "Colour tiles instead of images" |
| `OfflineBanner`              | A banner shown across every screen when `@react-native-community/netinfo` reports `isConnected === false`; see "Motion and haptics" below                      |
| `PressableScale`             | A `Pressable` that scales down slightly on press, for grid tiles (`AlbumCard`, `PhotoTile`) that have no Paper ripple of their own                             |
| `hapticTap` / `hapticSelect` | Thin wrappers over `expo-haptics` — a light impact for presses/navigation/refresh, a selection tick for a segmented control or toggle changing value           |

These cover the loading, empty and error states every screen needs per
`docs/README-plan.md`; the success state is each feature's own content.

## Motion and haptics

Phase 6 polish, layered onto the existing screens without changing their
state model:

- **Content fades in on state change.** Each screen wraps its
  loading/error/empty/success switch in an `Animated.View` keyed by the
  driving query's `status` (`entering={FadeIn.duration(200)}`). Keying by
  `status` rather than remounting on every render means a pull-to-refresh
  (which keeps `status: 'success'`) doesn't re-trigger the fade — only an
  actual pending → success/error transition does.
- **Grid tiles get press feedback.** `AlbumCard` and `PhotoTile` use
  `PressableScale` instead of a plain `Pressable`, since they have no Material
  ripple of their own (unlike the `Card`-based `PostCard`/`PersonCard`, whose
  ripple is already their press feedback).
- **The photo viewer opens with a fade**, not the default push transition
  (`animation: 'fade'` on `album/[id]/[photoId]`'s `Stack.Screen` in the root
  layout), for a lightbox feel.
- **Haptics mark the interactions that do something**: a light tap
  (`hapticTap`) on every card/tile press, pull-to-refresh, `ErrorState`'s
  retry button, a contact row on the profile screen and the photo viewer's
  double-tap-to-zoom; a selection tick (`hapticSelect`) when a
  `SegmentedButtons` value changes (profile segments, the Settings theme
  picker).

`OfflineBanner` reads `@react-native-community/netinfo`'s `useNetInfo()` hook
and renders only when `isConnected === false` — `null` (not yet known) and
`true` render nothing, so it doesn't flash on at app start before the first
check resolves. Its test (`offline-banner.test.tsx`) drives this by mocking
`useNetInfo`'s return value directly: `package.json`'s
`jest.moduleNameMapper` points `@react-native-community/netinfo` at the
package's own `jest/netinfo-mock.js`, which is what makes `useNetInfo` a
`jest.fn()` in the first place.

## Accessibility

- Interactive elements use Paper components (`Button`, `SegmentedButtons`),
  which carry the right accessibility roles and states by default.
- `ErrorState` renders with `accessibilityRole="alert"` so a screen reader
  announces a failure as it appears; `OfflineBanner` does the same, plus
  `accessibilityLiveRegion="polite"` so Android announces it appearing and
  disappearing, not just its initial render.
- Text uses Paper's `Text`, which scales with the system font size setting;
  none of the shared components fix a line height that would clip at larger
  sizes.
- Rows with no visible label beyond an icon or a colour get an explicit
  `accessibilityLabel`: `PostCard`/`PersonCard` (title plus author/username,
  read as one unit rather than every `Text` child separately), `AlbumCard`
  (`"<title> album"`), `PhotoTile` (`"Photo <n>"`, since a colour tile has
  nothing else to read), the photo viewer's `ZoomablePhoto`
  (`accessibilityHint="Double tap to zoom"`), and the profile screen's
  email/phone/website rows (`"Email <address>"` etc., alongside their
  `List.Icon`).
- This is a code-level pass — labels, roles and live regions — not a
  verified TalkBack run; the app hasn't been driven on an emulator yet (see
  `docs/README-plan.md`'s Phase 0 and Phase 5 entries for the same
  Android Studio constraint).

## Testing

`src/test/render.tsx` exports `renderWithProviders`, which wraps a component
in `ThemeModeProvider` and `PaperProvider` — the providers every screen needs
— mirroring the root layout. Use it instead of RNTL's `render` for anything
under `src/features/` or `src/ui/`.

Reanimated's native module (`react-native-worklets`) has no native runtime
under Jest, so `package.json`'s Jest config sets
`"resolver": "react-native-worklets/jest/resolver.js"`, which resolves it to
its web implementation instead.
