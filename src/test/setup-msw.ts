// Runs after the test framework is installed, so it can use Jest's globals,
// and after src/test/setup-fetch-polyfill.ts. Starts the MSW server for the
// whole run: an unhandled request is a test bug (a missing handler or a
// typo'd URL), not a pass-through to the network.
//
// `listen()` runs here at the top level, not inside `beforeAll`, so that it
// patches global fetch before the test file's own imports run. `apiClient`
// (src/api/client.ts) captures `globalThis.fetch` once, when the module
// loads; patching any later would leave it holding the unpatched fetch.
import { notifyManager } from '@tanstack/react-query';

import { server } from './msw/server';

// TanStack Query batches query-state updates with `setTimeout(fn, 0)` by
// default, which fires outside React Native Testing Library's `act()` scope
// and logs a spurious "not wrapped in act" warning for every query-backed
// screen test. Scheduling with a microtask instead keeps the update inside
// the same act batch as the `await` that triggered it.
notifyManager.setScheduler(queueMicrotask);

server.listen({ onUnhandledRequest: 'error' });

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
