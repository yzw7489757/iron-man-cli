// [fork-ts-checher 检查ts类型]
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
// const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin')

const { isDev } = require('../utils/env')
const { join } = require('path')
const { resolveByCurrentPosition } = require('../utils/path')
/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name fork-ts-checker
 * @description 检查ts类型
 */
module.exports = ({ config, resolve }) => {
  const fs = require('fs')
  return () => {
    // 暂不支持 webpack5
    if (fs.existsSync(resolve('tsconfig.json'))) {
      config.plugin('fork-ts-checker')
        .use(ForkTsCheckerWebpackPlugin, [{
        // 将async设为false，可以阻止Webpack的emit以等待类型检查器/linter，并向Webpack的编译添加错误。
          async: isDev(),
          typescript: {
            configFile: resolveByCurrentPosition('./tsconfig.json')
          },
          eslint: {
            enabled: true, 
            files: resolveByCurrentPosition('src/**/*.{ts,tsx,js,jsx}')
          },
        }])
    }

    // 将TypeScript类型检查错误以弹框提示
    // 如果fork-ts-checker-webpack-plugin的async为false时可以不用
    // 否则建议使用，以方便发现错误
    // config.plugin('ts-notifier')
    //   .use(ForkTsCheckerNotifierWebpackPlugin, [{
    //     title: 'TypeScript',
    //     excludeWarnings: true,
    //     skipSuccessful: true
    //   }])
  }
}
