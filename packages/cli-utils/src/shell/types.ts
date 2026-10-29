import type { ExecOptions, ExecSyncOptions, SpawnOptions, SpawnSyncOptions } from 'node:child_process'


export interface BaseOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
}

export interface ExtraOptions {
  /** 去掉结果的末尾空格 */
  trimEnd?: boolean
  
  /** 仅打印命令，不实际执行命令 */
  dryRun?: boolean
  
  /** log: 打印错误信息，返回 undefined; throw: 抛出错误; 未定义: 返回 undefined */
  error?: 'log' | 'throw'
}


export type ShellResult<T> =
  [ T ] extends [ never ]
    ? string | undefined
    : string | T


export type ShellOpts<Options, TFallback = never> = Omit<Options, 'encoding'>
  & ExtraOptions
  & ({ fallback: TFallback } | { fallback?: never })

export type SpawnAsyncOpts<T = never> = ShellOpts<SpawnOptions, T>
export type SpawnSyncOpts<T = never> = ShellOpts<SpawnSyncOptions, T>

export type ExecAsyncOpts<T = never> = ShellOpts<ExecOptions, T>
export type ExecSyncOpts<T = never> = ShellOpts<ExecSyncOptions, T>

export type ExecAsync = {
  <TFallback = undefined>(cmd: string, options?: ExecAsyncOpts<TFallback>): Promise<ShellResult<TFallback>>
  <TFallback = undefined>(
    cmd: string,
    args: string[],
    options?: ExecAsyncOpts<TFallback>,
  ): Promise<ShellResult<TFallback>>
}
export type ExecSync = {
  <TFallback = undefined>(cmd: string, options?: ExecSyncOpts<TFallback>): ShellResult<TFallback>
  <TFallback = undefined>(cmd: string, args: string[], options?: ExecAsyncOpts<TFallback>): ShellResult<TFallback>
}
