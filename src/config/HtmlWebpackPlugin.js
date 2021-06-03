// [html-webpack-plugin 生成html]
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path');
const DevEntryFileNameInValid = require('../Errors/DevEntryFileNameInValid');

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
    const { name } = options
    if(Reflect.get(options.pages, name) === undefined) {
      throw new DevEntryFileNameInValid(name)
    } 
    filename = options.pages[name].filename
    publicPath = options.pages[name].publicPath
    template = options.pages[name].template
  }

  return () => {
    config.plugin('html')
      .use(HtmlWebpackPlugin, [{
        template,
        filename,
        publicPath
      }])
  }
}