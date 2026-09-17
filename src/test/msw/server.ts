import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** The MSW server component tests and `renderWithProviders` run requests against. */
export const server = setupServer(...handlers);
