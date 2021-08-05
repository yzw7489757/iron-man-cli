// [html-webpack-plugin 生成html]
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path');
const { joinByCurrentPosition } = require('../utils/path');

/**
 * @name html-webpack-plugin
 * @type {WebpackConfig.LocalConfigIterator}
 * @description 生成html
 */
module.exports = ({ config, options }) => {
  let template = path.join(process.cwd(), 'public/index.html')
  let publicPath = options.publicPath || '/'
  let filename = options.filename || 'index.html'

  if (options.name && options.pages) {
    const { name, pages } = options;
    const page = pages[name];
    filename = page.filename || filename;
    publicPath = page.publicPath || publicPath;
    template = joinByCurrentPosition(page.template) || template
  }

  return () => {
    config.plugin('html')
      .use(HtmlWebpackPlugin, [{
        template,
        filename,
        publicPath,
        inject: true
      }])
  }
}
