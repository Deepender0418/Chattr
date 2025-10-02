// Custom Expo Webpack configuration to fix resolution of use-latest-callback
const { withExpo } = require('@expo/webpack-config');

module.exports = function (env, argv) {
  const config = withExpo(env, argv);
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'use-latest-callback$': require('path').resolve(__dirname, 'node_modules/use-latest-callback/lib/src/index.js'),
  };
  return config;
};


