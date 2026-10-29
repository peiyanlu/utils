import { splitLines } from '../utils.js'
import { gitBranch } from './raw.js'


/**
 * 获取当前分支
 * @defaults `git branch --show-current`
 * */
export const gitBranchCurrent = async (): Promise<string> => {
  // await runGit([ 'rev-parse', '--abbrev-ref', 'HEAD' ])
  const branch = await gitBranch([ '--show-current' ])
  if (!branch) throw new Error('Detached HEAD')
  return branch
}

/**
 * 重命名本地分支
 * @defaults `git branch -m <old-name> <new-name>`
 */
export const gitBranchMove = async (oldName: string, newName: string): Promise<void> => {
  await gitBranch([ '-m', oldName, newName ])
}

/**
 * 重命名本地分支（强制）
 * @defaults `git branch -M <old-name> <new-name>`
 */
export const gitBranchMoveForce = async (oldName: string, newName: string): Promise<void> => {
  await gitBranch([ '-M', oldName, newName ])
}

/**
 * 删除本地分支
 * @defaults `git branch -d <branch>`
 */
export const gitBranchDelete = async (branch: string): Promise<void> => {
  await gitBranch([ '-d', branch ])
}

/**
 * 删除本地分支（强制）
 * @defaults `git branch -D <branch>`
 */
export const gitBranchDeleteForce = async (branch: string): Promise<void> => {
  await gitBranch([ '-D', branch ])
}


// -----------------------------------------------------


/** 获取所有分支 */
export const getLocalBranches = async (): Promise<string[]> => {
  const res = await gitBranch([ '--format', '%(refname:short)' ])
  return splitLines(res!)
}

export const getRemoteBranches = async (): Promise<string[]> => {
  const res = await gitBranch([ '--remotes', '--format', '%(refname:short)' ])
  return splitLines(res!)
}
