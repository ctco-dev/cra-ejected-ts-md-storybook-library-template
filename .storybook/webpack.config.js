var genDefaultConfig = require('@kadira/storybook/dist/server/config/defaults/webpack.config.js');
var autoprefixer = require('autoprefixer');
var paths = require('../config/paths');

module.exports = function (config, env) {
  var config = genDefaultConfig(config, env);

  config.resolve.extensions.push('.ts', '.tsx');

  config.module.preLoaders = config.module.preLoaders || [];
  config.module.preLoaders.push({
    test: /\.(ts|tsx)$/,
    loader: 'tslint-loader',
    include: paths.appSrc,
  });

  config.module.loaders.push(
    {
      test: /\.(ts|tsx)?$/,
      loader: 'awesome-typescript-loader'
    }
  );

  return config;
};
