const path = require('path');
const fs = require('fs');

/**
 * 获取当前所处相对地址
 * @param {string} _path 
 * @returns {string} 
 */
function resolveByCurrentPosition (_path) {
  return path.resolve(process.cwd(), _path)
}

/**
 * 获取当前所处相对地址
 * @param {string} _path 
 * @returns {string} 
 */
function joinByCurrentPosition (_path) {
  return path.join(process.cwd(), _path)
}

/**
 * 在当前相对位置的基础上确认文件是否存在
 * @param {string} _path 
 * @returns {string | false}  
 */
function resolveByCurrentPositionWithExistent(_path) {
  const path = resolveByCurrentPosition(_path);
  if(fs.existsSync(path)) {
    return path
  } 
  return false
}

/**
 * 获取当前路径
 * @returns {string}
 */
function getCwd () {
  return process.cwd()
}


module.exports = {
  getCwd,
  joinByCurrentPosition,
  resolveByCurrentPosition,
  resolveByCurrentPositionWithExistent
}