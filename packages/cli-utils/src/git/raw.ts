import { runGit, runGitSync } from '../shell.js'
import type { SpawnAsyncOpts, SpawnSyncOpts } from '../shell/index.js'


/**
 * 引用解析操作
 * @defaults `git rev-parse <args>`
 */
export const gitRevParse = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'rev-parse', ...args ], options)
}

/** {@link gitRevParse} 的同步版本 */
export const gitRevParseSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'rev-parse', ...args ], options)
}


/**
 * 提交遍历操作
 * @defaults `git rev-list <args>`
 */
export const gitRevList = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'rev-list', ...args ], options)
}

/** {@link gitRevList} 的同步版本 */
export const gitRevListSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'rev-list', ...args ], options)
}


/**
 * 引用遍历操作
 * @defaults `git for-each-ref <args>`
 */
export const gitForEachRef = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'for-each-ref', ...args ], options)
}

/** {@link gitForEachRef} 的同步版本 */
export const gitForEachRefSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'for-each-ref', ...args ], options)
}


/**
 * 暂存操作
 * @defaults `git add <args>`
 */
export const gitAdd = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'add', ...args ], options)
}

/** {@link gitAdd} 的同步版本 */
export const gitAddSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'add', ...args ], options)
}


/**
 * 分支操作
 * @defaults `git branch <args>`
 */
export const gitBranch = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'branch', ...args ], options)
}

/** {@link gitBranch} 的同步版本 */
export const gitBranchSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'branch', ...args ], options)
}


/**
 * 迁出操作
 * @defaults `git checkout <args>`
 */
export const gitCheckout = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'checkout', ...args ], options)
}

/** {@link gitCheckout} 的同步版本 */
export const gitCheckoutSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'checkout', ...args ], options)
}


/**
 * 提交操作
 * @defaults `git commit <args>`
 */
export const gitCommit = async (args: string[] = [], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'commit', ...args ], options)
}

/** {@link gitCommit} 的同步版本 */
export const gitCommitSync = (args: string[] = [], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'commit', ...args ], options)
}


/**
 * 配置操作
 * @defaults `git config <args>`
 */
export const gitConfig = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'config', ...args ], options)
}

/** {@link gitConfig} 的同步版本 */
export const gitConfigSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'config', ...args ], options)
}


/**
 * 符号引用操作
 * @defaults `git symbolic-ref <args>`
 */
export const gitSymbolicRef = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'symbolic-ref', ...args ], options)
}

/** {@link gitSymbolicRef} 的同步版本 */
export const gitSymbolicRefSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'symbolic-ref', ...args ], options)
}


/**
 * 引用更新操作
 * @defaults `git update-ref <args>`
 */
export const gitUpdateRef = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'update-ref', ...args ], options)
}

/** {@link gitUpdateRef} 的同步版本 */
export const gitUpdateRefSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'update-ref', ...args ], options)
}


/**
 * 推送操作
 * @defaults `git push <args>`
 */
export const gitPush = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'push', ...args ], options)
}

/** {@link gitPush} 的同步版本 */
export const gitPushSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'push', ...args ], options)
}


/**
 * 远程操作
 * @defaults `git remote <args>`
 */
export const gitRemote = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'remote', ...args ], options)
}

/** {@link gitRemote} 的同步版本 */
export const gitRemoteSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'remote', ...args ], options)
}


/**
 * tag 操作
 * @defaults `git tag <args>`
 */
export const gitTag = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'tag', ...args ], options)
}

/** {@link gitTag} 的同步版本 */
export const gitTagSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'tag', ...args ], options)
}


/**
 * 重置操作
 * @defaults `git reset <args>`
 */
export const gitReset = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'reset', ...args ], options)
}

/** {@link gitReset} 的同步版本 */
export const gitResetSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'reset', ...args ], options)
}


/**
 * 恢复操作
 * @defaults `git restore <args>`
 */
export const gitRestore = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'restore', ...args ], options)
}

/** {@link gitRestore} 的同步版本 */
export const gitRestoreSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'restore', ...args ], options)
}


/**
 * 回退操作
 * @defaults `git revert <args>`
 */
export const gitRevert = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'revert', ...args ], options)
}

/** {@link gitRevert} 的同步版本 */
export const gitRevertSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'revert', ...args ], options)
}


/**
 * 远程引用查询操作
 * @defaults `git ls-remote <args>`
 */
export const gitLsRemote = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'ls-remote', ...args ], options)
}

/** {@link gitLsRemote} 的同步版本 */
export const gitLsRemoteSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'ls-remote', ...args ], options)
}


/**
 * 状态查询操作
 * @defaults `git status <args>`
 */
export const gitStatus = async (args: string[] = [], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'status', ...args ], options)
}

/** {@link gitStatus} 的同步版本 */
export const gitStatusSync = (args: string[] = [], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'status', ...args ], options)
}


/**
 * 对象查看操作
 * @defaults `git show <args>`
 */
export const gitShow = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'show', ...args ], options)
}

/** {@link gitShow} 的同步版本 */
export const gitShowSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'show', ...args ], options)
}


/**
 * 差异比较操作
 * @defaults `git diff <args>`
 */
export const gitDiff = async (args: string[] = [], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'diff', ...args ], options)
}

/** {@link gitDiff} 的同步版本 */
export const gitDiffSync = (args: string[] = [], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'diff', ...args ], options)
}


/**
 * 暂存区保存操作
 * @defaults `git stash <args>`
 */
export const gitStash = async (args: string[] = [], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'stash', ...args ], options)
}

/** {@link gitStash} 的同步版本 */
export const gitStashSync = (args: string[] = [], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'stash', ...args ], options)
}


/**
 * 删除文件操作
 * @defaults `git rm <args>`
 */
export const gitRm = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'rm', ...args ], options)
}

/** {@link gitRm} 的同步版本 */
export const gitRmSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'rm', ...args ], options)
}


/**
 * 移动文件操作
 * @defaults `git mv <args>`
 */
export const gitMv = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'mv', ...args ], options)
}

/** {@link gitMv} 的同步版本 */
export const gitMvSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'mv', ...args ], options)
}


/**
 * 对象内容操作
 * @defaults `git cat-file <args>`
 */
export const gitCatFile = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'cat-file', ...args ], options)
}

/** {@link gitCatFile} 的同步版本 */
export const gitCatFileSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'cat-file', ...args ], options)
}


/**
 * 日志查询操作
 * @defaults `git log <args>`
 */
export const gitLog = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'log', ...args ], options)
}

/** {@link gitLog} 的同步版本 */
export const gitLogSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'log', ...args ], options)
}


/**
 * 仓库初始化操作
 * @defaults `git init <args>`
 */
export const gitInit = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'init', ...args ], options)
}

/** {@link gitInit} 的同步版本 */
export const gitInitSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'init', ...args ], options)
}


/**
 * 获取远程更新操作
 * @defaults `git fetch <args>`
 */
export const gitFetch = async (args: string[], options?: SpawnAsyncOpts): Promise<string | undefined> => {
  return runGit([ 'fetch', ...args ], options)
}

/** {@link gitFetch} 的同步版本 */
export const gitFetchSync = (args: string[], options?: SpawnSyncOpts): string | undefined => {
  return runGitSync([ 'fetch', ...args ], options)
}
