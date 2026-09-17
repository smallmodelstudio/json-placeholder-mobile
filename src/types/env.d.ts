// Declaring each variable lets config code use the dot notation Expo needs to
// inline it at build time, which noPropertyAccessFromIndexSignature would
// otherwise reject. Add every new EXPO_PUBLIC_ variable here.
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
  }
}
