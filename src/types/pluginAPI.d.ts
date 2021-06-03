
export {}

declare global {
  module PluginAPI {
    export type genCacheConfig = (id: string, partialIdentifier: string, configFiles?: string[]) => { cacheDirectory: string, cacheIdentifier: string }
  }
}