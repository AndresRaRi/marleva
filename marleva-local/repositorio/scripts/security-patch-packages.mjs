import { createRequire } from 'node:module';
import path from 'node:path';
export function securityPatchPackages() {
  const client = createRequire(new URL('../apps/client/package.json', import.meta.url));
  const expo = createRequire(client.resolve('expo/package.json'));
  const cli = createRequire(expo.resolve('@expo/cli'));
  const metro = createRequire(cli.resolve('@expo/metro/package.json'));
  const files = createRequire(metro.resolve('metro-file-map/package.json'));
  const micromatch = createRequire(files.resolve('micromatch/package.json'));
  const certificates = createRequire(cli.resolve('@expo/code-signing-certificates'));
  return [
    ['braces', micromatch],
    ['node-forge', cli],
    ['node-forge', certificates],
  ].map(([name, require]) => ({
    name,
    version: require(name + '/package.json').version,
    root: path.dirname(require.resolve(name + '/package.json')),
    api: require(name),
  }));
}
