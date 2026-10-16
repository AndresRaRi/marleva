import { it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
const clientRoot = path.resolve('apps/client');
const clientRequire = createRequire(path.join(clientRoot, 'package.json'));
const { withPlugins } = clientRequire('expo/config-plugins');
const legacy = `class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
  var reactNativeFactory: RCTReactNativeFactory?
  func start() {
    reactNativeFactory = factory

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
  }
}
`;
function configured() {
  const app = JSON.parse(readFileSync(path.join(clientRoot, 'app.json'), 'utf8')).expo;
  const plugin = app.plugins.find(
    (value) => Array.isArray(value) && value[0] === 'expo-build-properties',
  );
  expect(plugin, 'La app debe activar el ciclo de escenas oficial para iOS27').toBeDefined();
  return withPlugins({ ...app, _internal: { projectRoot: clientRoot } }, [plugin]);
}
async function apply(name, modResults) {
  const config = configured();
  const result = await config.mods.ios[name]({
    ...config,
    modRequest: { projectRoot: clientRoot, platform: 'ios', modName: name },
    modResults,
  });
  return result.modResults;
}
it('MAR-M1-UT-FE-IOS-SCENE | configuración real migra ventana al ciclo oficial y conserva identidad', async () => {
  const delegate = await apply('appDelegate', { language: 'swift', contents: legacy });
  expect(delegate.contents).toContain('ExpoReactNativeFactoryProvider');
  expect(delegate.contents).not.toContain('UIScreen.main');
  expect(delegate.contents).not.toContain('factory.startReactNative(');
  expect(delegate.contents).toContain('reactNativeFactory = factory');
  const info = await apply('infoPlist', { CFBundleIdentifier: 'mx.marleva.local' });
  expect(info.CFBundleIdentifier).toBe('mx.marleva.local');
  expect(
    info.UIApplicationSceneManifest.UISceneConfigurations.UIWindowSceneSessionRoleApplication[0]
      .UISceneDelegateClassName,
  ).toBe('EXExpoAppSceneDelegate');
  expect(await apply('appDelegate', delegate)).toEqual(delegate);
  expect(await apply('infoPlist', info)).toEqual(info);
});
it('MAR-M1-UT-FE-IOS-SCENE-OWNER | no sobrescribe un manifiesto nativo ajeno', async () => {
  await expect(
    apply('infoPlist', { UIApplicationSceneManifest: { owner: 'another-app' } }),
  ).rejects.toThrow('already declared');
});
