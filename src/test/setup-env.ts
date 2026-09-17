// Runs before each test file, so modules that read config at import time get a
// fixed, known API URL instead of whatever .env holds.
process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
