// Runs before src/test/setup-msw.ts. Expo replaces the global
// fetch/Request/Response/Headers with its own native-backed "winter" runtime
// (see expo/src/winter), which is stubbed out to no-ops under Jest and which
// MSW's interceptors can't see into either way. Swap in undici's — a
// spec-compliant, self-contained implementation — so MSW can intercept
// apiClient's requests the same way it would in a plain Node app. This has to
// finish, as its own require, before anything requires 'msw' or
// '@mswjs/interceptors': those capture the current global Request/Response
// classes for `instanceof` checks the first time they're loaded, so patching
// the globals afterwards would leave them checking against the wrong class.
//
// undici's fetch also expects the real `perf_hooks` performance object (it
// calls its Node-only `markResourceTiming`); jest-environment-node's is a
// plain stub without it.
import { performance } from 'node:perf_hooks';
import { fetch, Headers, Request, Response } from 'undici';

Object.assign(globalThis, { fetch, Headers, Request, Response, performance });
