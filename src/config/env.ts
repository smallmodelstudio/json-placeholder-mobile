import { z } from 'zod';

export interface AppConfig {
  /** Base URL of the proxy API, without a trailing slash. */
  readonly apiUrl: string;
}

const EnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z
    .url({ protocol: /^https?$/, error: 'must be an http or https URL' })
    .transform((url) => url.replace(/\/+$/, '')),
});

export type RawEnv = {
  [K in keyof z.input<typeof EnvSchema>]?: string | undefined;
};

export function parseConfig(env: RawEnv): AppConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return { apiUrl: result.data.EXPO_PUBLIC_API_URL };
}
