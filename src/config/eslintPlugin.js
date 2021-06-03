// [tslint 配置]

const { joinByCurrentPosition } = require('../utils/path')
const EslintPlugin = require('eslint-webpack-plugin')
/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name tslint
 * @description ts 检查配置
 */
module.exports = ({
  config,
  options
}) => {
  const fs = require('fs')
  const path = require('path')
  return () => {
    if (fs.existsSync(path.resolve('tsconfig.json'))) {
      config
        .plugin('eslint')
        .use(EslintPlugin, [
          {
            context: joinByCurrentPosition('/src'),
            extensions: ['js', 'jsx', 'ts', 'tsx'],
          }
        ])
    }
  }
}
