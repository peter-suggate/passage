module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  globals: {
    globalThis: {},
  },
  setupFiles: ["<rootDir>/src/lib/audio/test-fixtures/setup.ts"],
};
