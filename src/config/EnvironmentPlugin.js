// [EnvironmentPlugin 定义通用变量]
const webpack = require('webpack')
/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name EnvironmentPlugin
 * @description 定义通用变量
 */
module.exports = ({ config, options }) => () => {
  const resolveClientEnv = require('../utils/resolveClientEnv')
  config
    .plugin('process-env')
    .use(webpack.EnvironmentPlugin, [
      resolveClientEnv(options)
    ])
}
