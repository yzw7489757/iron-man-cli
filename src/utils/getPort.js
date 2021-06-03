/**
 * 获取可用端口
 * @param {number} port 
 * @param {number | void } max
 * @returns {Promise<number>}
 */
exports.getAvailablePort = function (port, max) {
  port = port || 3000;

  const { getPort } = require('portfinder');
  return new Promise((resolve, reject) => {
    getPort({
      port: port,
      stopPort: max || port + 100
    }, (err, port) => {
      if(err) {
        reject(err);
      } else {
        resolve(port)
      }
    })
  })
}