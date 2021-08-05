const fs = require('fs');
const EntryFileNameInValid = require('../Errors/EntryFileNameInValid');
const { resolveByCurrentPosition } = require('./path');
const { isObject } = require('../utils/object');

/**
   * @param {string} path
   * @returns {string} 
   */
 function recalculationPosition (path) {
  const mockPath = resolveByCurrentPosition('');
  if(path.startsWith(mockPath)) { // 包含了相对地址，已经定位过。
    return path 
  }
  return resolveByCurrentPosition(path)
}

/**
 * 校验entry是否有效
 * @param {string | WebpackConfig.PageConfig} entry 
 * @param {boolean | void} shouldComputedRelative 是否计算相对定位
 */
const validatorEntry = function(entry, shouldComputedRelative) {
  if(!entry) {
    throw new Error(`must set entry`)
  } else if(typeof entry === 'string') {
    const path = shouldComputedRelative ? recalculationPosition(entry) : entry;
    if(!fs.existsSync(path)) {
      const msg = path === entry ? `'${path}'` : `rawPath: '${entry}', actualPath: '${path}'`;
      throw new EntryFileNameInValid(msg).print().exits();
    }
  } else if(isObject(entry)) {
    const path = shouldComputedRelative ? recalculationPosition(entry.entry) : entry.entry;
    validatorEntry(path)
  }
}


module.exports = {
  validatorEntry
}