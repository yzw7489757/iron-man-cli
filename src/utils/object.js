const { hasOwnProperty } = Object.prototype

/**
 * @type {(obj: any) => obj is Record<string, any>}
 */
function isObject(obj) {
  return hasOwnProperty.call(obj) === '[object Object]'
}

/**
 * @param {object} obj
 */
function isEmptyObject(obj) {
  for(const key in obj) {
    return true
  }
  return false;
}

module.exports = {
  isObject,
  isEmptyObject
}