// [别名配置]

const { resolveByCurrentPositionWithExistent } = require('../utils/path')

/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name alias
 * @description 别名配置
 */
module.exports = ({ config, options, resolve }) => {
  const fs = require('fs')
  const conf = options.alias
  return () => {

    let aliasConfig = config.resolve
      .extensions
      .merge(['.mjs', '.js', '.jsx', '.vue', '.ts', '.tsx', '.json', '.wasm'])
      .end()
      .alias

    // 判断是否有src
    if (resolveByCurrentPositionWithExistent('src')) {
      // 生成src默认别名
      const dirs = fs.readdirSync(resolve('src'))
      dirs.forEach((v) => {
        const stat = fs.statSync(resolve(`src/${v}`))
        if (stat.isDirectory()) {
          aliasConfig = aliasConfig.set(`@${v}`, resolve(`src/${v}`))
        }
      })
    }

    // 用户使用配置别名
    if (conf && conf.alias) {
      const keys = Object.keys(conf.alias)
      keys.forEach((key) => {
        aliasConfig = aliasConfig.set(key, conf.alias[key])
      })
    }

    // 自定义设置别名
    aliasConfig
      .set('@', resolve('src'))
      .set('@src', resolve('src'))
  }
}
