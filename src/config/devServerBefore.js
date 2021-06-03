// [devServer.before 在devServer中添加中间件]
const express = require('express');
/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name devServer.before
 * @description 在devServer中添加中间件，mock数据
 */
module.exports = ({
  config,
  options
}) => () => {
  if (!options.mock) return
  const createMockMiddleware = require('../middleware/mock')
  config.devServer.before((/** @type {WebpackMiddleware.DevServerApp} */app) => {
    app.use(
      createMockMiddleware()
    )
  })
}
