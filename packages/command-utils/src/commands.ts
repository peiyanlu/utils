import { execAsync, execSyncRe } from './exec.js'
import { spawnAsync, spawnSyncRe } from './spawn.js'
import type { ExecAsyncOpts, ExecSyncOpts, CommandOutput, SpawnAsyncOpts, SpawnSyncOpts } from './types.js'


/** 基于 {@link spawnAsync} 实现 */
export const runGit = async (args: string[], options?: SpawnAsyncOpts): Promise<CommandOutput> => {
  return spawnAsync('git', args, { trimEnd: true, ...options })
}

/** 基于 {@link spawnSyncRe} 实现 */
export const runGitSync = (args: string[], options?: SpawnSyncOpts): CommandOutput => {
  return spawnSyncRe('git', args, { trimEnd: true, ...options })
}

/** 基于 {@link execAsync} 实现 */
export const runNpm = (args: string[], options?: ExecAsyncOpts): Promise<CommandOutput> => {
  return execAsync('npm', args, { trimEnd: true, ...options })
}

/** 基于 {@link execSyncRe} 实现 */
export const runNpmSync = (args: string[], options?: ExecSyncOpts): CommandOutput => {
  return execSyncRe('npm', args, { trimEnd: true, ...options })
}

/** 基于 {@link spawnAsync} 实现 */
export const runNode = async (args: string[], options?: SpawnAsyncOpts): Promise<CommandOutput> => {
  return spawnAsync('node', args, { trimEnd: true, ...options })
}

/** 基于 {@link spawnSyncRe} 实现 */
export const runNodeSync = (args: string[], options?: SpawnSyncOpts): CommandOutput => {
  return spawnSyncRe('node', args, { trimEnd: true, ...options })
}


/** 支持所有支持 `--version` 命令的脚本查看版本 */
export const checkVersion = async (cmd: string): Promise<CommandOutput> => {
  return execAsync(cmd, [ '--version' ], { trimEnd: true })
}

/** {@link checkVersion} 的同步版本 */
export const checkVersionSync = (cmd: string): CommandOutput => {
  return execSyncRe(cmd, [ '--version' ], { trimEnd: true })
}
