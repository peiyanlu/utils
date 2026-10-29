import { runGit } from '../shell.js'
import { splitLines } from '../utils.js'
import { gitFetch, gitInit, gitLog, gitRevList, gitRevParse, gitStatus, gitSymbolicRef, gitUpdateRef } from './raw.js'
import { getLatestTag, getPreviousTag } from './tag.js'


/** 初始化裸仓库，模拟远程仓库 */
export const initBareRepo = async (dir: string): Promise<void> => {
  await gitInit([ '--bare', dir ])
}

/** 初始化仓库 */
export const initRepo = async (branch = 'master'): Promise<void> => {
  await gitInit([ '--initial-branch', branch ])
}

/** 判断指定目录是否是 git 仓库 */
export const isGitRepo = async (dir: string = '.'): Promise<boolean> => {
  return runGit(
    [ '-C', dir, 'status' ],
    { error: 'throw', trimEnd: true },
  )
    .then(_ => true)
    .catch(_ => false)
}

/** 判断指定目录是否是 git 裸仓库 */
export const isGitBareRepo = async (dir: string = '.'): Promise<boolean> => {
  return gitRevParse(
    [ '--is-bare-repository' ],
    { trimEnd: true, cwd: dir },
  )
    .then(res => 'true' === res)
}

/** 判断工作区是否干净 */
export const isWorkingTreeClean = async (): Promise<boolean> => {
  const status = await gitStatus([ '--porcelain' ])
  return !Boolean(status)
}

/**
 * 判断当前分支是否已设置 upstream
 * @defaults `git rev-parse --abbrev-ref --symbolic-full-name "<branch>@{u}"`
 */
export const hasUpstream = async (branch?: string): Promise<boolean> => {
  const ref = branch ? `${ branch }@{u}` : '@{u}'
  const upstream = await gitRevParse([ '--abbrev-ref', '--symbolic-full-name', ref ])
  return Boolean(upstream)
}

/**
 * 获取完整 hash
 * @defaults `git rev-parse <rev>`
 */
export const getFullHash = async (rev: string): Promise<string | undefined> => {
  return gitRevParse([ rev ])
}

/**
 * 获取短 hash
 * @defaults `git rev-parse --short <rev>`
 */
export const getShortHash = async (rev: string): Promise<string | undefined> => {
  return gitRevParse([ '--short', rev ])
}

/**
 * 提取所有分支
 * @defaults `git fetch --all --prune`
 */
export const fetchAllPrune = async (): Promise<void> => {
  await gitFetch([ '--all', '--prune' ])
}

/**
 * 获取当前工作区状态
 * @defaults `git status --short --untracked-files=no`
 */
export const getShortStatus = async (): Promise<string | undefined> => {
  return gitStatus([ '--short' ])
}

/**
 * 为 git status / changeset 输出添加颜色
 *
 * M -> 黄色（修改）
 * A -> 绿色（新增）
 * D -> 红色（删除）
 * @param {string} log `git status --short` 输出
 * @returns {string}
 */
export const coloredStatus = (log: string): string => {
  const colorStatusChar = (ch: string) => {
    switch (ch) {
      case 'M':
        return `\x1b[33m${ ch }\x1b[39m`
      case 'A':
        return `\x1b[32m${ ch }\x1b[39m`
      case 'D':
        return `\x1b[31m${ ch }\x1b[39m`
      case '?':
        return `\x1b[34m${ ch }\x1b[39m`
      default:
        return ch
    }
  }
  
  const colorStatus = (status: string) => status
    .split('')
    .map(colorStatusChar)
    .join('')
  
  return splitLines(log)
    .map((line) => {
      const status = line.slice(0, 2)
      const file = line.slice(3)
      return `${ colorStatus(status) } \x1b[2m${ file }\x1b[22m`
    })
    .join('\n')
}

/**
 * 计算 changelog 的 commit 范围
 * @param {boolean} isIncrement 是否为版本递增发布
 * @param {string} match tag match
 * @param {string} exclude tag exclude
 * @returns {Promise<{from: string, to: string}>}
 */
export const resolveChangelogRange = async (
  isIncrement: boolean = true,
  match: string = '*',
  exclude: string | string[] = '*-beta.*',
): Promise<{ from: string; to: string; }> => {
  const latestTag = await getLatestTag(match, exclude)
  if (!latestTag) {
    return { from: '', to: 'HEAD' }
  }
  
  const previousTag = await getPreviousTag(latestTag)
  if (!isIncrement && previousTag) {
    return { from: previousTag, to: `${ latestTag }^1` }
  }
  
  return { from: latestTag, to: 'HEAD' }
}

/**
 * 获取指定范围内的 commit 日志
 * @defaults `git log --pretty=format:"* %s (%h)" <from>...<to> -- <scope>`
 */
export const getLogSince = async (
  from: string = '',
  to: string = 'HEAD',
  scope?: string,
): Promise<string | undefined> => {
  const cmd = [ '--pretty=format:* %s (%h)' ]
  if (from) cmd.push(`${ from }...${ to }`)
  if (scope) cmd.push(...[ '--', scope ])
  
  return gitLog(cmd)
}

/** 判断字符串是否为合法 remote 名称 */
export const isRemoteName = async (remote: string): Promise<boolean> => {
  const res = await gitRevParse([ '--verify', `refs/remotes/${ remote }` ])
  return Boolean(res)
}

/** 统计自 tag 以来的提交数量 */
export const countCommitsSince = async (tag?: string): Promise<number> => {
  const ref = tag ? `${ tag }...HEAD` : 'HEAD'
  return gitRevList([ ref, '--count' ], { error: 'throw' }).then(Number).catch(_ => 0)
}

/**
 * 将 HEAD 指向指定分支（不会切换工作区）
 */
export const gitSetHeadBranch = async (branch: string): Promise<void> => {
  await gitSymbolicRef([ 'HEAD', `refs/heads/${ branch }` ])
}

/** 删除当前分支引用 */
export const gitDeleteHeadRef = async (): Promise<void> => {
  await gitUpdateRef([ '-d', 'HEAD' ])
}

/**
 * 创建一个没有任何提交的分支状态。
 */
export const createUnbornBranch = async (branch: string): Promise<void> => {
  await gitSymbolicRef([ 'HEAD', `refs/heads/${ branch }` ])
  await gitUpdateRef([ '-d', 'HEAD' ])
}
