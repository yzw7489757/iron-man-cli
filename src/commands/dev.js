const inquirer = require('inquirer');

/**
 * @type {Commander.CommanderStandard}
 * @param {Commander.Instructions} instructions 
 * @returns {void}
 */
const dev = ({ injectCommand }) => {
  injectCommand((config) => {
    const { program, cleanArgs, boxConfig } = config;
    program
      .command('dev [app-page]')
      .description('构建开发环境')
      .option('-d, --dll', '合并差分包')
      .option('-e <file>, --entry <file>', '指定入口文件')
      .action(async (/** @type {string | void} */ name, /** @type {Record<string, string>} */ cmd) => {
        process.env.NODE_ENV = 'development';
        const options = cleanArgs(cmd);
        /** @type {WebpackConfig.InnerOptions} */
        const args = Object.assign(options, { name: name || '', pages: {} }, boxConfig)

        if (!name && boxConfig.pages) {
          const choicesPage = await inquirer.prompt([{
            type: 'list',
            name: 'page',
            message: '请选择您要编译的页面',
            choices: Object.keys(boxConfig.pages).map((page) => ({
              name: page,
              value: page
            }))
          }])

          args.name = choicesPage.page
        } 

        require('../build/dev')(args)
      })
  })
}

module.exports = dev;
