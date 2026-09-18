/**
 * The single source of query keys, so every feature invalidates and reads the
 * same cache entries. Each resource nests under an `all` key, so
 * `queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })`
 * invalidates every query for that resource.
 */
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    list: (params?: { userId?: string }) =>
      [...queryKeys.posts.all, 'list', params ?? {}] as const,
    detail: (id: number) => [...queryKeys.posts.all, 'detail', id] as const,
    comments: (postId: number) =>
      [...queryKeys.posts.all, 'detail', postId, 'comments'] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.users.all, 'detail', id] as const,
    posts: (userId: number) =>
      [...queryKeys.users.all, 'detail', userId, 'posts'] as const,
    albums: (userId: number) =>
      [...queryKeys.users.all, 'detail', userId, 'albums'] as const,
    todos: (userId: number) =>
      [...queryKeys.users.all, 'detail', userId, 'todos'] as const,
  },
  albums: {
    all: ['albums'] as const,
    list: () => [...queryKeys.albums.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.albums.all, 'detail', id] as const,
    photos: (albumId: number) =>
      [...queryKeys.albums.all, 'detail', albumId, 'photos'] as const,
  },
} as const;
