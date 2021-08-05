const assert = require('assert');
const path = require('path');
var store = require("mem-fs").create();
var editor = require("mem-fs-editor");

var fs = editor.create(store);

const fsworker = {};

/**
 * 读取模板
 * @param {string} filepath 
 * @param  {editor.ReadStringOptions} args 
 */
fsworker.readTemplate = (filepath, args) => {
  return fs.read(this.destinationPath(filepath), args)
}

/**
 * 读取JSON
 * @param {string} filepath 
 */
fsworker.readJSON = (filepath) => {
  return fs.readJSON(this.destinationPath(filepath))
}


/**
 * 写入模板内容
 * @param {string} filepath 
 * @param  {string | Buffer} contents 
 */
fsworker.write = (filepath, contents) => {
  return fs.write(this.destinationPath(filepath), contents)
}


/**
 * 写入JSON内容
 * @param {string} filepath 
 * @param {*} contents 
 * @param {(((key: string, value: any) => any) | Array<string | number>) | undefined | null} replacer
 * @param {number | string} space 
 */
fsworker.writeJSON = (filepath, contents, replacer, space) => {
  return fs.writeJSON(this.destinationPath(filepath), contents, replacer, space)
}

/**
 * 删除
 * @param {string} filepath 
 * @param  {editor.WithGlobOptions} options 
 */
fsworker.delete = (filepath, options) => {
  return fs.delete(this.destinationPath(filepath), options)
}

/**
 * 移动
 * @param {string} from 
 * @param {string} to 
 * @param  {editor.WithGlobOptions} options 
 */
fsworker.move = (from, to, options) => {
  return fs.move(this.destinationPath(from), this.destinationPath(to), options)
}


/**
 * 复制
 * @param {string} from 
 * @param {string} to 
 * @param  {editor.WithGlobOptions} options 
 */
fsworker.copy = (from, to, options) => {
  return fs.copy(this.destinationPath(from), this.destinationPath(to), options)
}

/**
 * 判断是否有文件存在
 * @param {string} filepath 
 * @returns 
 */
fsworker.exists = function (filepath) {
  return fs.exists(this.destinationPath(filepath));
};


/**
 * 模板templates文件夹复制
 * @param  {String|Array} from - 模板文件, absolute or relative.
 * @param  {String|Array} [to] - 目的, absolute or relative
 * @param {Record<string, any>} [templateData] - ejs data
 * @param {ejs.Options} [templateOptions] - ejs options
 * @param {editor.CopyOptions} [copyOptions] - mem-fs-editor copy options
 */
fsworker.renderTemplate = function (
  from = '',
  to = from,
  templateData = this._templateData(),
  templateOptions,
  copyOptions
) {
  if (typeof templateData === 'string') {
    templateData = this._templateData(templateData);
  }
  templateOptions = { context: this, ...templateOptions };

  /** @type {string[]} */
  from = Array.isArray(from) ? from : [from];
  /** @type {string[]} */
  to = Array.isArray(to) ? to : [to];

  fs.copyTpl(
    this.destinationPath(from[0], ...from.slice(1)),
    this.destinationPath(to[0], ...to.slice(1)),
    templateData,
    templateOptions,
    copyOptions
  );
};

/**
 * 模板templates文件夹复制
 * @param  {String|Array} from - 模板文件, absolute or relative.
 * @param  {String|Array} [to] - 目的, absolute or relative
 * @param {Record<string, any>} [templateData] - ejs data
 * @param {ejs.Options} [templateOptions] - ejs options
 * @param {editor.CopyOptions} [copyOptions] - mem-fs-editor copy options
 * @returns {Promise<void>}
 */
fsworker.renderTemplateAsync = function (
  from = '',
  to = from,
  templateData = this._templateData(),
  templateOptions,
  copyOptions
) {
  if (typeof templateData === 'string') {
    templateData = this._templateData(templateData);
  }
  templateOptions = { context: this, ...templateOptions };

  /** @type {string[]} */
  from = Array.isArray(from) ? from : [from];
  /** @type {string[]} */
  to = Array.isArray(to) ? to : [to];

  // @reson types文件@7.1.0
  // @ts-ignore  
  return fs.copyTplAsync(
    this.destinationPath(from[0], ...from.slice(1)),
    this.destinationPath(to[0], ...to.slice(1)),
    templateData,
    templateOptions,
    copyOptions
  );
};

/**
 * 
 * @param {{ 
 *  when: (tpData: Record<string, any>, context: any) => boolean,
 *  from: string,
 *  to: string,
 *  templateOptions: ejs.Options,
 *  copyOptions: editor.CopyOptions
 * }} template 
 * @param {Record<string, any>} templateData
 * @param {*} context 
 * @param {typeof fsworker.renderTemplate} callback 
 * @returns 
 */
const renderEachTemplate = (template, templateData, context, callback) => {
  if (template.when && !template.when(templateData, context)) {
    return;
  }

  const { from, to, templateOptions, copyOptions } = template;
  return callback(
    from,
    to,
    templateData,
    templateOptions,
    copyOptions
  );
};

/**
 * 将模板从templates文件夹复制到目标。
 * @param  {Array} templates - template file, absolute or relative to templatePath().
 * @param {Object} [templateData] - ejs data
 */
fsworker.renderTemplates = function (templates, templateData = this._templateData()) {
  assert(Array.isArray(templates), 'Templates must an array');
  if (typeof templateData === 'string') {
    templateData = this._templateData(templateData);
  }

  for (const template of templates)
    renderEachTemplate(template, templateData, this, this.renderTemplate);
};
/**
 * 将模板从templates文件夹复制到目标。
 * @param  {Array} templates - template file, absolute or relative to templatePath().
 * @param {Object} [templateData] - ejs data
 * @returns {Promise<void[]>} 
 */
fsworker.renderTemplatesAsync = function (templates, templateData = this._templateData()) {
  assert(Array.isArray(templates), 'Templates must an array');
  if (typeof templateData === 'string') {
    templateData = this._templateData(templateData);
  }

  return Promise.all(templates.map(tpl => {
    renderEachTemplate(tpl, templateData, this, this.renderTemplateAsync);
  }))
};


/**
 * Utility method to get a formatted data for templates.
 *
 * @param {String} path - path to the storage key.
 * @return {Object} data to be passed to the templates.
 */
fsworker._templateData = function (path) {
  if (path) {
    return this.config.getPath(path);
  }

  const allConfig = this.config.getAll();
  if (this.generatorConfig) {
    Object.assign(allConfig, this.generatorConfig.getAll());
  }

  if (this.instanceConfig) {
    Object.assign(allConfig, this.instanceConfig.getAll());
  }

  return allConfig;
};

/**
 * @mixin
 * @alias actions/fs
 */
module.exports = fsworker;