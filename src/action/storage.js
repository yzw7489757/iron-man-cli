'use strict';
const assert = require('assert');
const _ = require('lodash');
const editor = require('mem-fs-editor');

/**
 * Proxy handler for Storage
 */
const proxyHandler = {
  get(storage, property) {
    return storage.get(property);
  },
  set(storage, property, value) {
    storage.set(property, value);
    return true;
  },
  ownKeys(storage) {
    return Reflect.ownKeys(storage._store);
  },
  has(target, prop) {
    return target.get(prop) !== undefined;
  },
  getOwnPropertyDescriptor(target, key) {
    return {
      get: () => this.get(target, key),
      enumerable: true,
      configurable: true
    };
  }
};



module.exports = (c) => {
  /**
   * 存储实例处理一个json文件，可以在其中存储数据。
   * 默认情况下，`Generator`类实例化名为`config`的存储。
   *
   * @constructor
   * @param {String} [name] The name of the new storage (this is a namespace)
   * @param {editor} fs  A mem-fs editor instance
   * @param {String} configPath The filepath used as a storage.
   * @param {Object} [options] Storage options.
   * @param {Boolean} [options.lodashPath=false] Set true to treat name as a lodash path.
   * @param {Boolean} [options.disableCache=false] true => 禁用json对象缓存。
   * @param {Boolean} [options.disableCacheByFile=false] true => 每次更改将清除缓存.
   *
   * @example
   * class extend Generator {
   *   writing: function() {
   *     this.config.set('coffeescript', false);
   *   }
   * }
   */
  return class Storage extends c {
    /**
     * 
     * @param {*} name 
     * @param {typeof import('./fs')} fs 
     * @param {*} configPath 
     * @param {*} options 
     */
    constructor(name, fs, configPath, options = {}) {
      super();
      // if (name !== undefined && typeof name !== 'string') {
      //   configPath = fs;
      //   fs = name;
      //   name = undefined;
      // }

      if (typeof options === 'boolean') {
        options = { lodashPath: options };
      }

      _.defaults(options, {
        lodash: false,
        disableCache: false,
        disableCacheByFile: false
      });

      assert(configPath, 'A config filepath is required to create a storage');

      this.path = configPath;
      this.name = name;
      this.fs = fs;
      this.indent = 2;
      this.lodashPath = options.lodashPath;
      this.disableCache = options.disableCache;
      this.disableCacheByFile = options.disableCacheByFile;

      this.existed = Object.keys(this._store).length > 0;

      this.fs.store.on('change', (filename) => {
        if (this.disableCacheByFile || (filename && filename !== this.path)) {
          return;
        }

        delete this._cachedStore;
      });
    }

    /**
     * 将当前存储作为JSON对象返回
     * @return {Object} the store content
     * @private
     */
    get _store() {
      const store = this._cachedStore || this.fs.readJSON(this.path);
      if (!this.disableCache) {
        this._cachedStore = store;
      }

      if (!this.name) {
        return store || {};
      }

      return (this.lodashPath ? _.get(store, this.name) : store[this.name]) || {};
    }

    /**
     * 将配置持久化到磁盘
     * @param {Object} value - current configuration values
     * @private
     */
    _persist(value) {
      /** @type {any} */
      let fullStore;
      if (this.name) {
        fullStore = this.fs.readJSON(this.path);
        if (this.lodashPath) {
          _.set(fullStore, this.name, value);
        } else {
          fullStore[this.name] = value;
        }
      } else {
        fullStore = value;
      }

      this.fs.writeJSON(this.path, fullStore, null, this.indent);
    }

    save() {
      this._persist(this._store);
    }

    /**
     * 获取存储值
     * @param  {String} key  The key under which the value is stored.
     * @return {*}           The stored value. Any JSON valid type could be returned
     */
    get(key) {
      return this._store[key];
    }

    /**
     * 获取存储值
     * @param  {String} path  The path under which the value is stored.
     * @return {*}           The stored value. Any JSON valid type could be returned
     */
    getPath(path) {
      return _.get(this._store, path);
    }

    /**
     * 获取所有存储的值
     * @return {Object}  key-value object
     */
    getAll() {
      return _.cloneDeep(this._store);
    }

    /**
     * 更新
     * @param {String} key  The key under which the value is stored
     * @param {*} value Any valid JSON type value (String, Number, Array, Object).
     * @return {*} val  Whatever was passed in as val.
     */
    set(key, value) {
      assert(!_.isFunction(value), "Storage value can't be a function");

      const store = this._store;

      if (_.isObject(key)) {
        value = _.assignIn(store, key);
      } else {
        store[key] = value;
      }

      this._persist(store);
      return value;
    }

    /**
     * 更新值 —— path
     * @param {String} path  The key under which the value is stored
     * @param {*} value  Any valid JSON type value (String, Number, Array, Object).
     * @return {*} val  Whatever was passed in as val.
     */
    setPath(path, value) {
      assert(!_.isFunction(value), "Storage value can't be a function");

      const store = this._store;
      _.set(store, path, value);
      this._persist(store);
      return value;
    }

    /**
     * Delete a key from the store and schedule a save.
     * @param  {String} key  The key under which the value is stored.
     */
    delete(key) {
      const store = this._store;
      delete store[key];
      this._persist(store);
    }

    /**
     * 使用默认值设置存储并安排保存。
     * If keys already exist, the initial value is kept.
     * @param  {Object} defaults  Key-value object to store.
     * @return {*} val  Returns the merged options.
     */
    defaults(defaults) {
      assert(
        _.isObject(defaults),
        'Storage `defaults` method only accept objects'
      );
      const store = _.defaults({}, this._store, defaults);
      this._persist(store);
      return this.getAll();
    }

    /**
     * @param  {Object} source  Key-value object to store.
     * @return {*} val  Returns the merged object.
     */
    merge(source) {
      assert(_.isObject(source), 'Storage `merge` method only accept objects');
      const value = _.merge({}, this._store, source);
      this._persist(value);
      return this.getAll();
    }

    /**
     * Create a child storage.
     * @param  {String} path - relative path of the key to create a new storage.
     *                         Some paths need to be escaped. Eg: ["dotted.path"]
     * @return {Storage} Returns a new Storage.
     */
    createStorage(path) {
      const childName = this.name ? `${this.name}.${path}` : path;
      return new Storage(childName, this.fs, this.path, true);
    }

    /**
     * Creates a proxy object.
     * @return {Object} proxy.
     */
    createProxy() {
      return new Proxy(this, proxyHandler);
    }
  }
}

