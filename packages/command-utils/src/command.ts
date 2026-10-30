import { Options } from './options.js'
import type { CommandPublicOpts } from './types.js'


/**
 * Shell 命令的共享配置入口：
 * 
 * `configure` 设置全局默认项，`run` 在当前异步上下文中临时覆盖配置；
 * 配置优先级为：单次调用选项 > `run` 作用域选项 > 全局默认项。
 * 
 * 支持：`execAsync`、`execSyncRe`、`spawnAsync`、`spawnSyncRe` 和基于他们的封装
 */
export const command: Options<CommandPublicOpts> = new Options<CommandPublicOpts>()
