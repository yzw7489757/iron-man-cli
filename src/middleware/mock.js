const { existsSync } = require('fs')
const { join } = require('path')
const bodyParser = require('body-parser')
const glob = require('glob')
const assert = require('assert')
const chokidar = require('chokidar')
const { pathToRegexp } = require('path-to-regexp')


const VALID_METHODS = ['get', 'post', 'put', 'patch', 'delete']
const BODY_PARSED_METHODS = ['post', 'put', 'patch']

/**
 * mock 插件
 * @returns {WebpackMiddleware.MiddleWareIterator}
 */
module.exports = function getMockMiddleware(/* api */) {
  const api = {
    debug: require('debug'),
    service: {
      cwd: process.cwd()
    }
  }
  const { debug } = api
  const { cwd } = api.service
  const absMockPath = join(cwd, 'mock')
  const absConfigPath = join(cwd, 'mock.config.js')

  let mockData = getConfig();
  
  watch()
  // 监听所有mock文件
  function watch() {
    if (process.env.WATCH_FILES === 'none') return
    const watcher = chokidar.watch([absConfigPath, absMockPath], {
      ignoreInitial: true
    })
    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}, reload mock data`)
      mockData = getConfig()
    })
  }

  function getConfig() {
    cleanRequireCache()
    let ret = null
    if (existsSync(absConfigPath)) {
      debug(`load mock data from ${absConfigPath}`)
      ret = require(absConfigPath)
    } else {
      const mockFiles = glob.sync('**/*.{js,ts}', {
        cwd: absMockPath
      })
      debug(
        `load mock data from ${absMockPath}, including files ${JSON.stringify(
          mockFiles
        )}`
      )
      ret = mockFiles.reduce((memo, mockFile) => {
        memo = {
          ...memo,
          ...require(join(absMockPath, mockFile))
        }
        return memo
      }, {})
    }
    return normalizeConfig(ret)
  }

  /**
   * 
   * @param {string} key 
   * @returns {{ method: string, path: string }}
   */
  function parseKey(key) {
    let method = 'get'
    let path = key
    if (key.indexOf(' ') > -1) {
      const splited = key.split(' ')
      method = splited[0].toLowerCase()
      path = splited[1]
    }
    assert(
      VALID_METHODS.includes(method),
      `Invalid method ${method} for path ${path}, please check your mock files.`
    )
    return {
      method,
      path
    }
  }

  function createHandler(method, path, handler) {
    return function (req, res, next) {
      if (BODY_PARSED_METHODS.includes(method)) {
        bodyParser.json({ limit: '5mb', strict: false })(req, res, () => {
          bodyParser.urlencoded({ limit: '5mb', extended: true })(
            req,
            res,
            () => {
              sendData()
            }
          )
        })
      } else {
        sendData()
      }

      function sendData() {
        if (typeof handler === 'function') {
          handler(req, res, next)
        } else {
          res.json(handler)
        }
      }
    }
  }

  function normalizeConfig(config) {
    return Object.keys(config).reduce((memo, key) => {
      const handler = config[key]
      const type = typeof handler
      assert(
        type === 'function' || type === 'object',
        `mock value of ${key} should be function or object, but got ${type}`
      )
      const { method, path } = parseKey(key)
      const keys = []
      const re = pathToRegexp(path, keys)
      memo.push({
        method,
        path,
        re,
        keys,
        handler: createHandler(method, path, handler)
      })
      return memo
    }, [])
  }

  function cleanRequireCache() {
    Object.keys(require.cache).forEach((file) => {
      if (file === absConfigPath || file.indexOf(absMockPath) > -1) {
        delete require.cache[file]
      }
    })
  }

  /** @param {Parameters<WebpackMiddleware.MiddleWareIterator>['0']} req */
  function matchMock(req) {
    const { path: exceptPath } = req
    const exceptMethod = req.method.toLowerCase()
    for (const mock of mockData) {
      const { method, re, keys } = mock
      if (method === exceptMethod) {
        const match = re.exec(req.path)
        if (match) {
          const params = {}

          for (let i = 1; i < match.length; i += 1) {
            const key = keys[i - 1]
            const prop = key.name
            const val = decodeParam(match[i])

            if (val !== undefined || !Object.prototype.hasOwnProperty.call(params, prop)) {
              params[prop] = val
            }
          }
          // @ts-ignore 重写params
          req.params = params
          return mock
        }
      }
    }

    function decodeParam(val) {
      if (typeof val !== 'string' || val.length === 0) {
        return val
      }

      try {
        return decodeURIComponent(val)
      } catch (err) {
        if (err instanceof URIError) {
          err.message = `Failed to decode param ' ${val} '`
          err.status = err.statusCode = 400
        }

        throw err
      }
    }

    return mockData.filter(({ method, re }) => method === exceptMethod && re.test(exceptPath))[0]
  }

  return (req, res, next) => {
    const match = matchMock(req)
    if (match) {
      debug(`mock matched: [${match.method}] ${match.path}`)
      return match.handler(req, res, next)
    }
    return next()
  }
}
