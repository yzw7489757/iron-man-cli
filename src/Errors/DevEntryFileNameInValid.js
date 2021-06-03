const ErrorConstructor = require('./ErrorConstructor');

module.exports = class DevEntryFileNameInValid extends ErrorConstructor {
  /**
   * dev server 入口文件名无效
   * @param {string} message 
   */
  constructor(message) {
    super(message, 'DevEntryFileNameInValid')
  }
}