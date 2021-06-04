const ErrorConstructor = require('./ErrorConstructor');

module.exports = class EntryFileNameInValid extends ErrorConstructor {
  /**
   * server 入口文件名无效
   * @param {string} message 
   */
  constructor(message) {
    super(`entry file ${message} not exists`, 'EntryFileNameInValid', 'RuntimeError');
  }
}