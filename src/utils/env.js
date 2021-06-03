/**
 * 开发环境
 * @returns {boolean}
 */
exports.isDev = function() {
  return process.env.NODE_ENV === 'development';
}
/**
 * 生成环境
 * @returns {boolean}
 */
exports.isProd = function() {
  return process.env.NODE_ENV === 'production'
}