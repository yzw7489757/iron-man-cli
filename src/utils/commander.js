const { hump } = require("./index")

/**
 * @type {Commander.InjectCommandConfig['cleanArgs']}
 */
 exports.cleanArgs = function(cmd) {
  const args = {}
  cmd.options && cmd.options.forEach((o) => {
    const key = hump(o.long.replace(/^--/, ''))
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}

