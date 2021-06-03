const { getAvailablePort } = require('../utils/getPort')

/**
 * @param {WebpackConfig.Options} options 
 */
module.exports = async function (options) {
  const host = options.host || 'localhost';
  const https = options.https;
  const config = require('./base')(options)
  const webpack = require('webpack')
  const chalk = require('chalk')
  const WebpackDevServer = require('webpack-dev-server')
  const port = options.port || 8080
  const publicPath = options.publicPath || '/'

  config.target('web')
  config.devServer
    .quiet(true)
    .hot(true)
    .host(host)
    .https(https)
    .disableHostCheck(true)
    .publicPath(publicPath)
    .clientLogLevel('none')

  if (typeof options.chainWebpack === 'function') {
    options.chainWebpack(config)
  }

  const compiler = webpack(config.toConfig())

  // 拿到 devServer 参数
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
    compiler.hooks.done.tap('dev', (stats) => {
      const origin = `${https ? 'https': 'http'}://${host}:${devPort}`
      const devAdr = ` - dev  at: ${origin}${publicPath}\n`;
      const mockAdr = options.mock ? `- mock  at: ${origin}/api/\n` : ''
      const common = 'App running at:\n' + devAdr + mockAdr
      console.log(chalk.cyan(common))
    })
  })
}