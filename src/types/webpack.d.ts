import type Config from 'webpack-chain'
import * as API from '../api/PluginAPI';
import type MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as express from 'express';
import * as https from 'https';
export {}

declare global {
  
  module WebpackConfig {
    interface PageConfig {
      entry: string;
      output: string;
  
      template?: string;
      filename?: string;
      publicPath?: string;
    }
    interface ResourceConfig {
      [p: string]: {
        patterns: string[];
      }
    }

    interface CssConfig {
      sourceMap?: boolean,
      loaderOptions?: {
        /**
         * @see https://github.com/webpack-contrib/css-loader/blob/v5.2.6/README.md#options
         */
        css: {
          sourceMap?: boolean;
          esModule?: boolean;
          /**
           * 0 => no loaders (default);
           * 1 => postcss-loader;
           * 2 => postcss-loader, sass-loader
           */
          importLoaders?: boolean | string | number;
          import?: boolean | ((url: string, media, resourcePath) => boolean);
          modules: boolean | string | Partial<{
            compileType: 'module' | 'icss';
            mode: "local" | "global" | "pure" | ((resourcePath: string) => "local" | "global" | "pure"),
            auto: boolean | RegExp | ((resourcePath: string) => boolean),
            exportGlobals: boolean,
            localIdentName: string;
            localIdentContext: string;
            localIdentRegExp: RegExp;
            localIdentHashPrefix: string;
            getLocalIdent: (context: any, localIdentName: string, localName: string, options: any) => string;
            namedExport: boolean,
            exportLocalsConvention: "asIs" | "camelCaseOnly" | "dashes" | "dashesOnly" | "camelCase";
            exportOnlyLocals: boolean;
          }>
        },
        less: {
          globalVars: {
            gray: '#ccc'
          }
        },
        sass: {},
        postcss: {},
        stylus: {}
      },
      isCssModule?: boolean, // 是否对css进行模块化处理
      needInlineMinification?: boolean // 是否需要压缩css
      extract?: MiniCssExtractPlugin.PluginOptions;
    }

    export interface Options {
      pages?: Record<string, PageConfig>;
      port?: number;
      https?: boolean | https.ServerOptions;
      mock?: boolean;
      host?: string;
      env?: Record<string, string>;
      alias?: Record<string, string>;
      resources?: ResourceConfig;

      dll?: string[];

      publicPath?: string;
      filename?: string;
      filenameHashing?: boolean;

      // loader 
      css?: CssConfig;

      tslint?: {
        lintOnSave: boolean, // 开启运行时检测
        forkTsOptions?: any;
      }

      chainWebpack?: (config: Config) => void;
    }

    export interface InnerOptions extends Options {
      name?: string;
    }

    interface LocalConfigIteratorParam {
      options: InnerOptions;
      config: Config;
      webpackVersion: string;
      resolve: (path: string) => string;
      api: typeof API;
    }
    export interface LocalConfigIterator {
      (config: LocalConfigIteratorParam): () => void;
    }
  }

  module WebpackMiddleware {
    export type DevServerApp = express.Application;
    export type MiddleWareIterator = express.RequestHandler;
  }
}