import type { Simplify } from '@peiyanlu/ts-utils'
import type { ExecOptions, ExecSyncOptions, SpawnOptions, SpawnSyncOptions } from 'node:child_process'


export interface BaseOptions {
  cwd?: string | URL
  env?: NodeJS.ProcessEnv
}

export interface ExtraOptions {
  /** 去掉结果的末尾空格 */
  trimEnd?: boolean
  
  /** 仅打印命令，不实际执行命令 */
  dryRun?: boolean
  
  /** log: 打印错误信息并返回空字符串; throw: 抛出错误; 未定义: 静默返回空字符串 */
  error?: 'log' | 'throw'
}


export type CommandPublicOpts = Simplify<BaseOptions & ExtraOptions>


export type CommandOpts<Options> = Omit<Options & ExtraOptions, 'encoding'>

export type SpawnAsyncOpts = CommandOpts<SpawnOptions>
export type SpawnSyncOpts = CommandOpts<SpawnSyncOptions>

export type ExecAsyncOpts = CommandOpts<ExecOptions>
export type ExecSyncOpts = CommandOpts<ExecSyncOptions>


export type CommandOutput = string


export type ExecAsync = {
  (cmd: string, options?: ExecAsyncOpts): Promise<CommandOutput>
  (cmd: string, args: string[], options?: ExecAsyncOpts): Promise<CommandOutput>
}
export type ExecSync = {
  (cmd: string, options?: ExecSyncOpts): CommandOutput
  (cmd: string, args: string[], options?: ExecSyncOpts): CommandOutput
}
