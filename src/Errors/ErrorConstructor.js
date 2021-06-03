module.exports = class ErrorConstructor extends Error {
  /**
   * 
   * @param {string} message 
   * @param {ErrorHandler.ErrorCodeUnion} code 
   * @param {*} detail;
   */
  constructor(message, code = 'Unknown', detail) {
    super(message);
    this.code = code;
    this.detail = detail;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
