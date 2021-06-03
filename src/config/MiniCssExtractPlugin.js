// [mini-css-extract-plugin 配置]
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name mini-css-extract-plugin
 * @description 提取样式
 */
module.exports = ({ config, options }) => {
  const rootOptions = options
  const getAssetPath = require('../utils/getAssetPath')
  const isProd = process.env.NODE_ENV === 'production'
  return () => {
    const {
      extract = {}
    } = rootOptions.css || {};
    
    const filename = getAssetPath(
      rootOptions,
      `css/[name]${rootOptions.filenameHashing ? '.[contenthash:8]' : ''}.css`
    )
    const extractOptions = {
      filename,
      chunkFilename: filename,
      ...(extract && typeof extract === 'object' ? extract : {})
    }
    config
      .plugin('mini-css-extract')
      .use(MiniCssExtractPlugin, [extractOptions])
  }
}
