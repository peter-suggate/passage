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
      ],
    },
  },
};
