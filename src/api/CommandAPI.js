const fs = require('fs')
const path = require('path')
const program = require('commander')
const chalk = require('chalk')
const semver = require('semver')
const packageConfig = require('../../package.json')
const { cleanArgs } = require('../utils/commander')


const commandNames = []

/**
 * @type {string[]}
 */
const commandStore = []

exports.commandStore = commandStore;

/** @type {WebpackConfig.Options} */
let boxConfig = {};
const boxPath = path.join(process.cwd(), 'webpack.config.js');
if (fs.existsSync(boxPath)) {
  boxConfig = require(boxPath)()
}
/**
 * @type { Commander.IntersectionStatus}
 */
let status = 'pending';

checkNodeVersionForWarning()

program
  .usage('<command> [options]')
  .version(packageConfig.version)

/**
 * 
 * @param {Commander.injectCommandCallback} cmd 
 */
exports.injectCommand = function (cmd) {
  if (status === 'done') {
    console.error('注册命令行时机已经是 done，请提前注册～')
    return
  }
  if (typeof cmd !== 'function') {
    console.error(cmd, '必须是一个函数')
    return
  }

  cmd({
    program, boxConfig, commandStore, cleanArgs
  })
}


/**
 * 获取所有命令
 * @returns {Array<Commander.CommanderStandard>}
 */
exports.getAllCommands = function() {
  const localCommanderDir = path.join(__dirname, '..', 'commands')
  const localCommanderFiles = [...fs.readdirSync(localCommanderDir)]
  /**
   * @type {Array<Commander.CommanderStandard>}
   */
  const RegisterCommands = [];

  localCommanderFiles.forEach((name) => {
    const cwdPath = path.join(localCommanderDir, name)
    RegisterCommands.push(require(cwdPath))
  })

  // const { getAllPluginIdOfPackageJson } = require('@pkb/shared-utils')

  // getAllPluginIdOfPackageJson().forEach((id) => {
  //   const command = `${id}/command.config.js`
  //   try {
  //     const cwd = require(command)
  //     RegisterCommands.push(cwd)
  //   } catch (error) {
  //     console.log(`没有 ${command}`)
  //   }
  // })
  return RegisterCommands
}

exports.commandComplete = function () {
  commandValidate()
  parse()
  status = 'done';
}

function parse() {
  program.parse(process.argv)
  program.commands.forEach((c) => c.on('--help', () => console.log()))
}

function commandValidate() {
  program.commands.map((_) => commandNames.push(_.name()))
  const commandName = process.argv[2]
  if (commandName && !commandNames.includes(commandName)) {
    console.log()
    console.log(chalk.red(`  没有找到 ${process.argv[2]} 命令`))
    console.log()
    program.help()
  }

  if (!process.argv[2]) {
    program.help()
  }
}

function checkNodeVersionForWarning() {
  if (semver.satisfies(process.version, '10.x')) {
    console.log(chalk.red(
      `你正在用的 node 版本是：${process.version}.\n` +
      '未来版本将不再支持 10.x 版本.\n'
    ))
  }
}