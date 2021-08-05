const path = require("path");
const _ = require("lodash");

const ActionPath = require("./path");
const ConfigGuard = require("./config-guard");
const fsworker = require("./fs");
const EventEmitter = require('events');

const mixins = [
  require("./path"),
  require("./storage")
];

const Base = mixins.reduce((a, b) => b(a), EventEmitter)

class ActionGenerator extends Base {

  /** @type {typeof import('./fs')} */
  fs = null;

  /** @type {ConfigGuard} */
  config = null;

  /**
   */
  constructor() {
    super();
    this.fs = fsworker;
    this.config = new ConfigGuard(fsworker, {});
  }

  /**
   * 确定应用名称
   * @returns 
   */
  determineAppname() {
    const packageJSON = this.fs.readJSON(this.destinationPath('package.json'));
    let appname = _.isObject(packageJSON) ? packageJSON['name'] : ''

    if (!appname) {
      appname = path.basename(this.destinationRoot());
    }

    return appname.replace(/[^\w\s]+?/g, ' ');
  }
}

// _.extend(ActionGenerator.prototype, require('./'))

module.exports = ActionGenerator;