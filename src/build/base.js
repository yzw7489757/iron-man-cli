const fs = require('fs');
const Config = require('webpack-chain')

const config = new Config()
const path = require('path')
const PluginAPI = require('../api/PluginAPI')
const { resolveByCurrentPosition } = require('../utils/path');
const webpackVersion = require('webpack').version;

// const webpackVersion = require(resolveByCurrentPosition('node_modules/webpack/package.json')).version

module.exports = (options) => {
  const configPath = path.join(__dirname, '..', 'config')
  const files = fs.readdirSync(configPath)
  /** @type {Array<[string, WebpackConfig.LocalConfigIterator]>} */
  const innerConfigs = files.map((fileName) => {
    return [fileName, require(`${configPath}/${fileName}`)]
  })

  innerConfigs.forEach(([key, innerConfig]) => {
    innerConfig({
      config,
      webpackVersion,
      resolve: resolveByCurrentPosition,
      options,
      api: PluginAPI
    })()
})
  
  return config
}
