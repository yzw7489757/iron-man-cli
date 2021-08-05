const path = require('path');
const fs = require('fs');

module.exports = (c) => {
  return class ActionPath extends c {
    _sourceRoot = '';
    _destinationRoot = '';
    
    /**
     * 相对路径，主要是
     * @param  {...string} dest 
     * @returns 
     */
    destinationPath(...dest) {
      let filepath = path.join.apply(path, dest);
  
      if (!path.isAbsolute(filepath)) {
        filepath = path.join(this.destinationRoot(), filepath);
      }
  
      return filepath;
    }
  
    /**
     * 
     * @param {string | void} rootPath 
     * @returns 
     */
    destinationRoot(rootPath) {
      if (typeof rootPath === 'string') {
        this._destinationRoot = path.resolve(rootPath);
        if (!fs.existsSync(rootPath)) {
          fs.mkdirSync(rootPath, { recursive: true });
        }
        this._destinationRoot = rootPath;
        // Reset the storage
        this._config = undefined;
        // Reset packageJson
        this._packageJson = undefined;
      }
      return this._destinationRoot; // || this.env.cwd;
    }
  
    /**
     * 设置、更改SourceRoot
     * @param  {String | void} rootPath new source root path
     * @return {String}          source root path
     */
    sourceRoot(rootPath) {
      if (typeof rootPath === 'string') {
        this._sourceRoot = path.resolve(rootPath);
      }
  
      return this._sourceRoot;
    }
  
    /**
     * 根据sourceRoot确定模板路径
     * @param  {...String} dest - path parts
     * @return {String}    joined path
     */
    templatePath(...dest) {
      let filepath = path.join.apply(path, dest);
  
      if (!path.isAbsolute(filepath)) {
        filepath = path.join(this.sourceRoot(), filepath);
      }
  
      return filepath;
    }
  }
}