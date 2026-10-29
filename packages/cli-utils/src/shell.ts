import type { ExecAsyncOpts, ExecSyncOpts, SpawnAsyncOpts, SpawnSyncOpts } from './shell/index.js'
import { execAsync, execSyncRe, spawnAsync, spawnSyncRe } from './shell/index.js'


/** 基于 {@link spawnAsync} 实现 */
export const runGit = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return spawnAsync('git', args, { trimEnd: true, ...options })
}

/** 基于 {@link spawnSyncRe} 实现 */
export const runGitSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return spawnSyncRe('git', args, { trimEnd: true, ...options })
}

/** 基于 {@link execAsync} 实现 */
export const runNpm = (args: string[], options?: ExecAsyncOpts): Promise<string | undefined> => {
  return execAsync('npm', args, { trimEnd: true, ...options })
}

/** 基于 {@link execSyncRe} 实现 */
export const runNpmSync = (args: string[], options?: ExecSyncOpts): string | undefined => {
  return execSyncRe('npm', args, { trimEnd: true, ...options })
}

/** 基于 {@link spawnAsync} 实现 */
export const runNode = (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return spawnAsync('node', args, { trimEnd: true, ...options })
}

/** 基于 {@link spawnSyncRe} 实现 */
export const runNodeSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return spawnSyncRe('node', args, { trimEnd: true, ...options })
}


/** 支持所有支持 `--version` 命令的脚本查看版本 */
export const checkVersion = async (cmd: string): Promise<string | undefined> => {
  return execAsync(cmd, [ '--version' ], { trimEnd: true })
}

/** {@link checkVersion} 的同步版本 */
export const checkVersionSync = (cmd: string): string | undefined => {
  return execSyncRe(cmd, [ '--version' ], { trimEnd: true })
}
