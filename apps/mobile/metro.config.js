const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const withStorybook = require('@storybook/react-native/metro/withStorybook');
const path = require('path');
const { FileStore } = require('metro-cache');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro sees changes in packages/*
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// Let Metro resolve node_modules from both the app and monorepo root.
// With pnpm hoisted mode, most deps live in root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Use a unique cache store scoped to this app to avoid stale resolution
config.cacheStores = [
  new FileStore({ root: path.join(projectRoot, '.metro-cache') }),
];

const nativeWindConfig = withNativeWind(config, { input: './src/global.css' });

module.exports = withStorybook(nativeWindConfig, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  configPath: path.resolve(projectRoot, '.rnstorybook'),
});
