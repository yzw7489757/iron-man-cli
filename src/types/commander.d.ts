import commander from 'commander';

declare global {
  module Commander {
    export interface CommanderStandard {
      (instructions: Instructions): void;
    }

    export interface Instructions {
      injectCommand: InjectCommand;
      api: {
        genCacheConfig: PluginAPI.genCacheConfig;
      };
    }

    export type InjectCommandConfig = {
      program: commander.CommanderStatic,
      cleanArgs: (cmd: Record<string, any>) => Record<string, any>;
      boxConfig: WebpackConfig.Options,
      commandStore: string[]
    }
    
    export type IntersectionStatus = 'pending' | 'done'
    
    export type injectCommandCallback = (config: InjectCommandConfig) => void;
    
    export interface InjectCommand {
      (callback: injectCommandCallback): void;
    }
  }
}

