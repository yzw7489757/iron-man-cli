// [friendly-errors-webpack-plugin] 友好错误提示
/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name friendly-errors-webpack-plugin
 * @description 友好错误提示
 */
module.exports = ({ config }) => {
  const { transformer, formatter } = require('../utils/resolveLoaderError')
  return () => {
    config.plugin('friendly-errors')
      .use(require('@soda/friendly-errors-webpack-plugin'), [{
        additionalTransformers: [transformer],
        additionalFormatters: [formatter]
      }])
  }
}
