const os = require('os');
const path = require('path');
const fs = require('fs');
const { readPackageUpSync } = require('read-pkg-up');
const Storage = require('./storage');

module.exports = class ConfigGuard {
  /**
   * @param {typeof import ('./fs')} [fs]
   * @param {object} [options]
   * @param {string?} [options.configDir] 
   * @param {string?} [options.resolved] 
   */
  constructor(fs, options) {
    this.fs = fs;    
    this.options = options || {};
    this.resolved = this.options.resolved || __dirname;
  }

  /**
  * 生成器配置存储。
  */
  get config() {
    if (!this._config) {
      this._config = this._getStorage();
    }

    return this._config;
  }

  /**
   * Package.json Storage.
   */
  get packageJson() {
    if (!this._packageJson) {
      this._packageJson = this.createStorage('package.json');
    }

    return this._packageJson;
  }

  /**
   * 获取包名
   * @returns 
   */
  rootGeneratorName() {
    const { packageJson: { name = '*' } = {} } = readPackageUpSync({ cwd: this.resolved }) || {};
    return name;
  }

  /**
   * 
   * @returns 获取版本号
   */
  rootGeneratorVersion() {
    const { packageJson: { version = '0.0.0' } = {} } = readPackageUpSync({ cwd: this.resolved }) || {};
    return version;
  }

  destinationRoot(rootPath) {
    if (typeof rootPath === 'string') {
      this._destinationRoot = path.resolve(rootPath);

      if (!fs.existsSync(this._destinationRoot)) {
        fs.mkdirSync(this._destinationRoot, { recursive: true });
      }

      // Reset the storage
      this._config = undefined;
      // Reset packageJson
      this._packageJson = undefined;
    }

    return this._destinationRoot;
  }

  /**
   * 返回一个存储实例。
   * @param  {String} storePath  json文件的路径
   * @param  {String} [path] 存储在json中的名称
   * @param  {String | boolean} [lodashPath] Treat path as an lodash path
   * @return {Storage} json storage
   */
  createStorage(storePath, path, lodashPath = false) {
    storePath = this.destinationPath(storePath);
    return new Storage(path, this.fs, storePath, lodashPath);
  }

  /**
   * 获取配置
   * @param {*} rootName 
   * @returns 
   */
  _getStorage(rootName = this.rootGeneratorName()) {
    const storePath = path.join(this.destinationRoot(), '.iron-rc.json');
    return new Storage(rootName, this.fs, storePath);
  }

  _getGlobalConfig() {
    const globalStorageDir = this.options.configDir || os.homedir();
    const storePath = path.join(globalStorageDir, '.iron-rc-global.json');
    const storeName = `${this.rootGeneratorName()}:${this.rootGeneratorVersion()}`;
    return new Storage(storeName, this.fs, storePath);
  }
}