module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  env: {
    test: {
      // Support import.meta for NodeJS environments (Jest).
      plugins: ["babel-plugin-transform-import-meta"],
    },
  },
};
