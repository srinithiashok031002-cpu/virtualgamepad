/**
 * Config plugin that patches app/build.gradle after expo prebuild.
 *
 * Fixes two issues with the Expo SDK 54 / RN 0.81.5 generated template:
 *  1. Removes `enableBundleCompression` — not a valid ReactExtension property in RN 0.81.5
 *  2. Replaces the dynamic `entryFile` node command with a static path (avoids empty-string edge cases)
 */
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidBuildFix(config) {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    // 1. Remove enableBundleCompression line
    contents = contents.replace(
      /\s*enableBundleCompression\s*=\s*\(findProperty\([^)]+\)\s*\?:\s*false\)\.toBoolean\(\)\n?/g,
      '\n'
    );

    // 2. Replace dynamic entryFile command with static path
    contents = contents.replace(
      /entryFile\s*=\s*file\(\["node",\s*"-e",\s*"require\('expo\/scripts\/resolveAppEntry'\)".*?\.text\.trim\(\)\)/,
      'entryFile = file("$projectDir/../../index.js")'
    );

    mod.modResults.contents = contents;
    return mod;
  });
};
