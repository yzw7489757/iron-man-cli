// [打包分析]
/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name BundleAnalyzerPlugin
 * @description 打包分析
 */
const {
  BundleAnalyzerPlugin
} = require('webpack-bundle-analyzer')

module.exports = ({ config, options }) => () => {
  if (process.env.npm_config_report || options.report) {
    config.plugin('BundleAnalyzerPlugin')
      .use(BundleAnalyzerPlugin, [{
        analyzerMode: 'static'
      }])
  }
}
