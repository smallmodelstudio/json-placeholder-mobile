import { parseConfig } from './env';

describe('parseConfig', () => {
  it('returns the API URL', () => {
    expect(
      parseConfig({ EXPO_PUBLIC_API_URL: 'http://localhost:3000' }),
    ).toEqual({ apiUrl: 'http://localhost:3000' });
  });

  it('strips trailing slashes so paths can be appended safely', () => {
    expect(
      parseConfig({ EXPO_PUBLIC_API_URL: 'https://api.example.com//' }).apiUrl,
    ).toBe('https://api.example.com');
  });

  it('throws when the API URL is missing', () => {
    expect(() => parseConfig({})).toThrow(/EXPO_PUBLIC_API_URL/);
  });

  it.each(['not a url', 'ftp://example.com', 'javascript:alert(1)'])(
    'throws for %s',
    (value) => {
      expect(() => parseConfig({ EXPO_PUBLIC_API_URL: value })).toThrow(
        /http or https/,
      );
    },
  );
});
