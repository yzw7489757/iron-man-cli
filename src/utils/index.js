/**
 * 转驼峰
 * @param {string} str 
 * @returns {string}
 */
exports.hump = function(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}