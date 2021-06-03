const hash = require('hash-sum');
const fs = require('fs');
const { resolveByCurrentPosition, resolveByCurrentPositionWithExistent } = require('../utils/path');

/**
 * 
 * @param {string} id 
 * @param {string} partialIdentifier 
 * @param {string[]?} configFiles 
 * @returns {{ cacheDirectory: string, cacheIdentifier: string }}
 */
exports.genCacheConfig = function (id, partialIdentifier, configFiles = []) {
  /**
   * @type {string}
   */
  const cacheDirectory = resolveByCurrentPosition(`node_modules/.cache/${id}`)

  const variables = {
    partialIdentifier,
    'cli-service': require('../../package.json').version,
    'cache-loader': require('cache-loader/package.json').version,
    env: process.env.NODE_ENV,
    config: [],
    configFiles: ''
  }

  if (!Array.isArray(configFiles)) {
    configFiles = [configFiles]
  }

  configFiles = configFiles.concat([
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ])

  /** @type {(file: string) => string} */
  const readConfig = (file) => {
    const absolutePath = resolveByCurrentPositionWithExistent(file)
    if (!absolutePath) {
      return
    }
    if (absolutePath.endsWith('.js')) {
      try {
        return JSON.stringify(require(absolutePath))
      } catch (e) {
        return fs.readFileSync(absolutePath, 'utf-8')
      }
    } else {
      return fs.readFileSync(absolutePath, 'utf-8')
    }
  }

  for (const file of configFiles) {
    const content = readConfig(file)
    if (content) {
      variables.configFiles = content.replace(/\r\n?/g, '\n')
      break
    }
  }

  const cacheIdentifier = hash(variables)
  return { cacheDirectory, cacheIdentifier }
}
