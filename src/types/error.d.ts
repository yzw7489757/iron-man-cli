import Error = require('../Errors/ErrorCode');

export {}

declare global {
  // type KeyCode<T extends object> = {
  //   [K in keyof T]: {
  //     K: K
  //   }
  // }
  
  // mock
  interface URIError {
    status?: number;
    statusCode?: number;
  }

  module ErrorHandler {
    export type ErrorCodeUnion = keyof typeof Error.ErrorCode;
  }
}