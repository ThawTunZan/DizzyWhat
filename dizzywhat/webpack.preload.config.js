module.exports = {
    entry: './src/main/preload.ts',
    module: {
      rules: require('./webpack.rules'),
    },
  };