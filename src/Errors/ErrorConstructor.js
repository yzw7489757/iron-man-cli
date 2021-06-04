const chalk = require('chalk');

module.exports = class ErrorConstructor extends Error {
  /**
   * 
   * @param {string} message 
   * @param {ErrorHandler.ErrorCodeUnion} code 
   * @param { 'RuntimeError' | 'Error' | void} errorPrefix;
   */
  constructor(message, code = 'Unknown', errorPrefix = 'Error') {
    super(message);
    this.code = code;
    this.errorPrefix = errorPrefix;
    this.message = `${this.errorPrefix} [${this.code}]: ${this.message}.`
    Object.setPrototypeOf(this, new.target.prototype);
  }

   /**
   * @returns {this}
   */
    print() {
      console.error(
        chalk.red(
          this.message
        )
      );
      return this
    }
    
    /**
     * @param {Function | void} cb 
     */
    exits(cb) {
      if(typeof cb === 'function') {
        cb();
      }
      // 允许应用自然退出
      process.exitCode = 1;
    }
}
