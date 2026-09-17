// Fetches the API's OpenAPI document into openapi/proxy.json. Run by hand
// when the API changes, then review the diff and run `npm run api:generate`.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const apiUrl = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '');
const docsUrl = `${apiUrl}/docs-json`;
const outPath = fileURLToPath(
  new URL('../openapi/proxy.json', import.meta.url),
);

const response = await fetch(docsUrl);
if (!response.ok) {
  throw new Error(
    `GET ${docsUrl} returned ${response.status} ${response.statusText}`,
  );
}

const document = await response.json();
await writeFile(outPath, `${JSON.stringify(document, null, 2)}\n`);

console.log(`Wrote ${docsUrl} to openapi/proxy.json`);
