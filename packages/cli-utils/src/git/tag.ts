import { splitLines } from '../utils.js'
import { gitForEachRef, gitLsRemote, gitTag, gitTagSync } from './raw.js'


/**
 * 创建 lightweight tag
 * @defaults `git tag <tag> <args>`
 */
export const gitTagLightweight = async (tag: string, args: string[] = []): Promise<void> => {
  await gitTag([ tag, ...args ])
}

/**
 * 创建 annotated
 * @defaults `git tag -annotate -message <msg> <tag> <args>`
 */
export const gitTagAnnotated = async (tag: string, message: string = tag, args: string[] = []): Promise<void> => {
  await gitTag([ '--annotate', '--message', message, tag, ...args ])
}

/**
 * 删除本地 tag
 * @defaults `git tag --delete <tag> <args>`
 */
export const gitTagDelete = async (tag: string, args: string[] = []): Promise<void> => {
  await gitTag([ '--delete', tag, ...args ])
}

/** {@link gitTagDelete} 的同步版本 */
export const gitTagDeleteSync = (tag: string, args: string[] = []): void => {
  gitTagSync([ '--delete', tag, ...args ])
}


// -----------------------------------------------------


export type SortKey = 'v:refname' | 'creatordate'
export type GitSort = SortKey | `-${ SortKey }`

export enum GitSorter {
  NAME_ASC = 'v:refname',
  NAME_DESC = '-v:refname',
  DATE_ASC = 'creatordate',
  DATE_DESC = '-creatordate'
}

/**
 * 获取本地所有 tag
 * @defaults `git for-each-ref refs/tags/<match> --format "%(refname:short)" --sort <sort>
 *   --exclude refs/tags/<match> --count <count>`
 */
export const getLocalTags = async (
  match: string = '*',
  exclude: string | string[] = '*-beta.*',
  sort: GitSort = GitSorter.NAME_DESC,
  count: number = 0,
): Promise<string[]> => {
  const excludes = [ exclude ].flat().flatMap(k => [ `--exclude`, `refs/tags/${ k }` ])
  const res = await gitForEachRef([
    `refs/tags/${ match }`,
    ...excludes,
    '--format',
    '%(refname:short)',
    `--sort`,
    `${ sort }`,
    `--count`,
    `${ count }`,
  ])
  return res ? splitLines(res) : []
}

/**
 * 获取远程所有 tag
 * @defaults `git ls-remote --tags --refs --sort <sort> <remote>`
 */
export const getRemoteTags = async (
  remote = 'origin',
  sort: GitSort = GitSorter.NAME_DESC,
): Promise<string[]> => {
  const res = await gitLsRemote([ '--tags', '--refs', '--sort', sort, remote ])
  return res ? splitLines(res).map(t => t.split('refs/tags/')[1]) : []
}

/** 获取最新 tag */
export const getLatestTag = async (
  match: string = '*',
  exclude: string | string[] = '*-beta.*',
): Promise<string> => {
  const [ latestTag ] = await getLocalTags(match, exclude, GitSorter.NAME_DESC, 1)
  return latestTag
}

/** 获取上一个 tag */
export const getPreviousTag = async (
  tag: string,
  match: string = '*',
  exclude: string | string[] = '*-beta.*',
): Promise<string> => {
  const all = await getLocalTags(match, exclude, GitSorter.NAME_DESC, 0)
  const index = all.findIndex(k => tag === k)
  return all[index + 1]
}
