const fs = require('fs');
const Config = require('webpack-chain')

const config = new Config()
const path = require('path')
const PluginAPI = require('../api/PluginAPI')
const { resolveByCurrentPosition } = require('../utils/path');
const webpackVersion = require('webpack').version;
const DevEntryNameInValid = require('../Errors/DevEntryNameInValid');
const { validatorEntry } = require('../utils/validatorEntry');

// const webpackVersion = require(resolveByCurrentPosition('node_modules/webpack/package.json')).version
/**
 * 
 * @param {WebpackConfig.InnerOptions} options 
 * @returns 
 */
module.exports = (options) => {
  const { name, pages } = options;
  const configPath = path.join(__dirname, '..', 'config');

  if(Reflect.get(pages, name) === undefined) {
    new DevEntryNameInValid(name).print().exits();
  }

  // 检查
  validatorEntry(options.pages[name], true);

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
