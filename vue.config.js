module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    module: {
      rules: [
        {
          test: /audio-processor\.js$/,
          loader: "worklet-loader",
          options: {
            name: "js/[hash].worklet.js",
          },
        },
        {
          test: /music_analyzer_wasm_rs/,
          loader: require.resolve("@open-wc/webpack-import-meta-loader"),
        },
      ],
    },
  },
};
