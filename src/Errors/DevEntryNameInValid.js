const ErrorConstructor = require('./ErrorConstructor');

module.exports = class DevEntryNameInValid extends ErrorConstructor {
  /**
   * dev server 入口文件名无效
   * @param {string} message 
   */
  constructor(message) {
    super(`entry ${message} is non-existent in [options.pages]`, 'DevEntryNameInValid')
  }
}