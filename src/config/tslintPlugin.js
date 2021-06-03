// [tslint 配置]

const { resolveByCurrentPositionWithExistent } = require('../utils/path')

/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name tslint
 * @description ts 检查配置
 */
module.exports = ({
  config,
  options: {
    tslint: {
      lintOnSave = false,
      forkTsOptions = {}
    } = {}
  }
}) => {
  const fs = require('fs')
  const path = require('path')
  return () => {
    if (fs.existsSync(path.resolve('tsconfig.json'))) {
      // config
      //   .plugin('fork-ts-checker')
      //   .tap(([options]) => {
      //     if(lintOnSave !== false) {
      //       // 启用 eslint
      //       options.eslint = {
      //         files: [resolveByCurrentPositionWithExistent('.eslintrc.js')].filter(Boolean),
      //         options: forkTsOptions
      //       }
      //     }
      //     options.formatter = 'codeframe';
      //     return [options]
      //   })
    }
  }
}
