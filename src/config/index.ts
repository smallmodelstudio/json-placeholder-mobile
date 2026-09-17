import { parseConfig } from './env';

export type { AppConfig } from './env';

// Expo inlines EXPO_PUBLIC_ variables at build time, and only when they are
// read with static dot notation. Destructuring or process.env['…'] would
// leave them undefined in the bundle.
export const config = parseConfig({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});
