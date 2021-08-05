const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')
const { getAvailablePort } = require('../utils/getPort')
/**
 * @param {WebpackConfig.InnerOptions} options 
 */
module.exports = async function (options) {
  const host = options.host || 'localhost';
  const https = options.https;
  const config = require('./base')(options)
  const port = options.port || 8080
  const publicPath = options.publicPath || '/'

  const contentBase = Array.isArray(options.contentBase) ? options.contentBase : [options.contentBase];
  if(contentBase.indexOf('public') === -1) {
    contentBase.push('public')
  }

  config.target('web');
  
  config.devServer
    .quiet(true)
    .hot(true)
    .host(host)
    .https(https)
    .contentBase(contentBase.filter(Boolean))
    .disableHostCheck(true)
    .publicPath(publicPath)
    .clientLogLevel('none')

  if (typeof options.chainWebpack === 'function') {
    options.chainWebpack(config)
  }

  const compiler = webpack(config.toConfig())

  const chainDevServer = compiler.options.devServer;

  const server = new WebpackDevServer(
    compiler,
    chainDevServer
  );

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      server.close(() => {
        process.exit(0)
      })
    })
  })

  const devPort = await getAvailablePort(port)
  
  // 监听端口
  server.listen(devPort)

  new Promise(() => {
    const origin = `${https ? 'https': 'http'}://${host}:${devPort}`
    const devAdr = `- dev  at: ${origin}${publicPath}\n`;
    const mockAdr = options.mock ? `- mock  at: ${origin}/api/\n` : ''
    const common = 'App running at:\n' + devAdr + mockAdr;

    compiler.hooks.done.tap('dev', (stats) => {
      if(stats.hasErrors()){
        console.log(chalk.yellow(stats.compilation.errors))
      } else {
        console.log(chalk.cyan(common))
      }
    })
  })
}