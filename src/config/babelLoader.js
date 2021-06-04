const path = require('path');
const { isDev, isTest } = require('../utils/env');
const { isObject } = require('../utils/object');

/**
 * 生成 React 运行时配置
 * @see https://babeljs.io/docs/en/babel-preset-react;
 * @param {WebpackConfig.InnerOptions['env']} env 
 * @return {WebpackConfig.ReactConfig | null}
 */
function generatorReactConfig(env) {
  if(!env.react) {
    return null
  }

  /** @type {WebpackConfig.ReactConfig} */
  let config = {
    runtime: 'classic',
    development: isDev() || isTest(),
  }
  if(isObject(env.react)) {
    Object.assign(config, {
      ...(env.react.runtime !== 'automatic' ? { useBuiltIns: true } : {})
    })
  } 
  return config;
}

// [babel-loader 配置]
/**
 * @type {WebpackConfig.LocalConfigIterator}
 * @name babel-loader
 * @description babel-loader 配置
 */
module.exports = ({ config, options }) => {
  const { env } = options

  const reactConfig = generatorReactConfig(env);
  const presets = [
    env.typescript && [require('@babel/preset-typescript')],
    reactConfig && [require('@babel/preset-react'), reactConfig],
    [
      require('@babel/preset-env'),
      {
        modules: false,
        targets: {
          chrome: 59,
          edge: 13,
          firefox: 50,
          safari: 8
        }
      }
    ]

  ].filter(Boolean)
  const babelConf = {
    env: {
      test: {
        plugins: [require('@babel/plugin-transform-modules-commonjs')]
      }
    },
    presets,
    plugins: [
      require('babel-plugin-macros'),
      require('@babel/plugin-proposal-object-rest-spread'),
      require('@babel/plugin-syntax-dynamic-import'),
      require('@babel/plugin-proposal-class-properties'),
      env.typescript && [
        require('@babel/plugin-proposal-decorators'),
        { legacy: true },
      ],
      require('@babel/plugin-proposal-optional-chaining'),
      // require('@babel/plugin-proposal-nullish-coalescing-operator').default,
      [require('babel-plugin-import'), { libraryName: 'antd', style: true }]
    ].filter(Boolean)
  }

  const baseRule = config.module.rule('babel').test(/.[jt]sx?$/)
  
  return () => {
    baseRule
      .use('babel')
      .loader(require.resolve('babel-loader'))
      .options(babelConf)
      .after('process-env')
  }
}
