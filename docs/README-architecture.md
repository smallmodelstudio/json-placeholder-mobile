# Architecture

The feature pattern Posts establishes in Phase 3, for People and Albums to
copy in Phases 4 and 5. People (Phase 4) copies it as-is for its directory and
profile screens, and adds three patterns of its own: client-side search,
prefetch-on-press and lazily-enabled segments, all covered below.

## A feature's files

`src/features/<feature>/` is flat — one file per hook, per component, per
screen — matching `src/api/` and `src/ui/`:

```text
src/features/posts/
  use-posts.ts           list query
  use-post.ts            detail query
  use-post-comments.ts   nested-resource query
  use-post-author.ts     secondary query, keyed on data from another query
  use-users.ts           lookup query for enriching the list
  post-card.tsx           list row
  comment-card.tsx        detail row
  posts-screen.tsx        list screen
  post-detail-screen.tsx  detail screen
  *.test.tsx              component tests, one file per screen
```

Each hook wraps exactly one `apiClient` call in `unwrap`, keyed by the
matching entry in `queryKeys` (`src/api/keys.ts`) — screens never call
`apiClient` or build a query key themselves. A feature never imports another
feature's hooks; if two features need the same resource (a person's name,
say), each defines its own thin hook for it. The API's own cache — every hook
reading `queryKeys.users.detail(id)` shares one cache entry — makes the
duplication free at runtime, and it keeps a feature deletable on its own.

## One query drives a screen's state

Every screen has the four states from `docs/README-plan.md`, but a screen
that combines several queries doesn't gate all four on all of them. One query
is the screen's **primary** data (the list, or the record the route names);
its `isPending` / `isError` / data decide which of loading, error, empty or
success the screen shows.

Every other query is **secondary** — data that enriches the primary view but
isn't itself the point of the screen — and degrades independently instead of
blocking it:

- `PostsScreen`'s primary query is `usePosts()`. `useUsers()` (for each row's
  author name) is secondary: while it's still loading, or if it fails, a row
  just renders without an author line rather than the whole list waiting or
  erroring.
- `PostDetailScreen`'s primary query is `usePost()`. `usePostAuthor()` shows
  a skeleton line while pending and falls back to "Unknown author" on error,
  never an `ErrorState`. `usePostComments()` is the exception: comments are
  as much the point of the detail screen as the post body, so it gets its own
  full loading/error/empty/success treatment, nested inside the screen's
  success state rather than gating it.

This is a judgement call per query, not a rule with one answer — the test is
whether the screen is still useful without that data.

## Lazily-enabled segments

`PersonProfileScreen`'s Posts / Albums / Todos segmented view (`SegmentedButtons`)
fetches only the selected segment's resource: `usePersonPosts`, `usePersonAlbums`
and `usePersonTodos` each take an `enabled` flag set to `segment === '<name>'`,
so switching segments fetches on demand rather than all three eagerly. Each
segment still gets the full loading/error/empty/success treatment, the same
exception `usePostComments` gets on the post detail screen — it's the point of
the segment, not secondary data.

## Prefetching

`usePerson` (`src/features/people/use-person.ts`) exposes its query as
`personQueryOptions(userId)`, a `queryOptions(...)` call, rather than only the
hook. `PeopleScreen` calls `queryClient.prefetchQuery(personQueryOptions(id))`
on row press, ahead of the navigation, so the profile query is often already
resolved by the time `PersonProfileScreen` mounts and calls `usePerson` with
the same options. `useQueryClient()` (not the `queryClient` singleton
imported from `@/api`) is what a screen uses to do this — it resolves to
whichever `QueryClient` is in context, so prefetching works the same way in
tests as it does in the app.

## Client-side search

`PeopleScreen` filters the full people list in memory rather than sending a
search param: the API contract rejects unknown query params on `/users`, and
the directory is the same small, unpaginated shape as `/posts`. `useDebouncedValue`
delays the filter by 250ms after the last keystroke, so it runs once per pause
in typing instead of on every character — filtering itself is cheap at this
size, but a search box should still feel like it isn't recomputing the whole
list on every keystroke.

## Errors are typed

`src/types/react-query.d.ts` registers `ApiError` as TanStack Query's default
error type, so every `useQuery().error` is one — `error.message` and
`error.correlationId` are usable directly in `ErrorState` with no cast, same
as `docs/README-api.md` describes for `unwrap`.

## Routes stay thin, screens own navigation

A dynamic route (`src/app/post/[id].tsx`) is still just a re-export:

```ts
import { PostDetailScreen } from '@/features/posts/post-detail-screen';

export default PostDetailScreen;
```

The screen itself calls `useLocalSearchParams` for the `id` and renders a
`<Stack.Screen options={{ title }} />` to set its header dynamically (e.g. to
the post's own title once it's loaded) — both are navigation concerns, not
data-fetching ones, so they belong with the screen rather than the route
file. A list screen navigates with `useRouter().push({ pathname, params })`
rather than wrapping rows in `Link`, since a Paper `Card`/`List.Item` already
takes an `onPress`.

## Lists

`@shopify/flash-list`'s `FlashList` renders anything backed by one of the
contract's collections, even a short one (Posts is ~100 rows) — consistency
with the `/photos` case (5,000 rows, unpaginated) matters more than
micro-optimising a small list. Pull-to-refresh is `FlashList`'s own
`onRefresh`/`refreshing` props, wired to the query's `refetch` and
`isRefetching`.

A resource's own small, bounded sub-list — a post's comments — renders inline
with `.map()` instead: `FlashList`, like any virtualised list, can't nest
inside the `ScrollView` the rest of the detail screen needs, and there's
nothing to virtualise in a list capped at a handful of rows.

## Testing

Component tests drive every state of a screen through MSW, per
`docs/README-testing.md`, plus a few patterns specific to query- and
router-backed screens:

- **Loading** is asserted by overriding a handler with
  `await delay('infinite')` (from `msw`) before rendering, freezing that
  query mid-flight so the loading branch is the only one that can render.
- **Skeletons get a `testID`.** They're intentionally hidden from the
  accessibility tree (`accessibilityElementsHidden`), so there's no accessible
  text or role to query them by — the one sanctioned exception to
  `docs/README-testing.md`'s "query like a user" rule.
- **`expo-router` is mocked per-hook, not with a router harness.**
  `useRouter()` returns the same imperative `router` singleton whether or not
  a navigator is mounted, so a list screen's navigation is asserted with
  `jest.spyOn(router, 'push')` and no mocking at all. A screen that reads
  route params instead mocks just the hooks it uses
  (`jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: '1' }), Stack: { Screen: () => null } }))`),
  since `useLocalSearchParams` resolves to `{}` outside a real route and
  `Stack.Screen` throws outside a real navigator.

Two more test-environment quirks these tests depend on — `FlashList`'s layout
mock and TanStack Query's notification scheduling — are covered in
`docs/README-api.md`'s testing section, alongside the ones already there.
