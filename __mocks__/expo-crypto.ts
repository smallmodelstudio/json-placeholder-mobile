// expo-crypto's real implementation is a native module, which jest-expo
// doesn't provide a working mock for — `randomUUID()` resolves to `undefined`
// under Jest. Node has the same function built in, so use that instead.
import { randomUUID as nodeRandomUUID } from 'node:crypto';

export function randomUUID(): string {
  return nodeRandomUUID();
}
