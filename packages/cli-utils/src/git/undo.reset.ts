import { gitReset, gitResetSync } from './raw.js'


export const headArg = (count = 1): string => {
  if (count < 0) throw new RangeError('count must be >= 0')
  return count === 0 ? 'HEAD' : `HEAD~${ count }`
}


/**
 * 撤销最近的 commit（移动 HEAD + 取消暂存）
 * - 暂存区被重置到目标 commit
 * - 未提交修改保持不变
 * @defaults `git reset --mixed HEAD~<count>`
 */
export const gitResetMixed = async (count: number = 1): Promise<void> => {
  await gitReset([ '--mixed', headArg(count) ])
}

/**
 * 撤销最近的 commit（完全重置）
 * - 暂存区 + 工作区都会被重置到目标 commit
 * - 未提交修改会丢失
 * @defaults `git reset --hard HEAD~<count>`
 */
export const gitResetHard = async (count: number = 1): Promise<void> => {
  await gitReset([ '--hard', headArg(count) ])
}

/**
 * 撤销最近的 commit（仅移动 HEAD）
 * - 暂存区保持不变
 * - 未提交修改保持不变
 * @defaults `git reset --soft HEAD~<count>`
 */
export const gitResetSoft = async (count: number = 1): Promise<void> => {
  await gitReset([ '--soft', headArg(count) ])
}

/**
 * 撤销最近的 commit（安全重置）
 * - 行为类似 --hard
 * - 若会覆盖工作区未提交修改则直接失败
 * @defaults `git reset --keep HEAD~<count>`
 */
export const gitResetKeep = async (count: number = 1): Promise<void> => {
  await gitReset([ '--keep', headArg(count) ])
}


/** {@link gitResetMixed} 的同步版本 */
export const gitResetMixedSync = (count: number = 1): void => {
  gitResetSync([ '--mixed', headArg(count) ])
}

/** {@link gitResetHard} 的同步版本 */
export const gitResetHardSync = (count: number = 1): void => {
  gitResetSync([ '--hard', headArg(count) ])
}

/** {@link gitResetSoft} 的同步版本 */
export const gitResetSoftSync = (count: number = 1): void => {
  gitResetSync([ '--soft', headArg(count) ])
}

/** {@link gitResetKeep} 的同步版本 */
export const gitResetKeepSync = (count: number = 1): void => {
  gitResetSync([ '--keep', headArg(count) ])
}
