import { gitCommit } from './raw.js'


/**
 * 提交
 * @defaults `git commit --message message <args>`
 */
export const gitCommitMessage = async (message: string, args: string[] = []): Promise<void> => {
  await gitCommit([ '--message', message, ...args ])
}

/**
 * 空内容提交
 * @defaults `git commit --message message --allow-empty <args>`
 */
export const gitCommitAllowEmpty = async (message: string, args: string[] = []): Promise<void> => {
  await gitCommitMessage(message, [ '--allow-empty', ...args ])
}


/**
 * 修正提交
 * @defaults `git commit --message message --amend <args>`
 */
export const gitCommitAmend = async (message: string, args: string[] = []): Promise<void> => {
  await gitCommitMessage(message, [ '--amend', ...args ])
}

/**
 * 修正提交 保留信息
 * @defaults `git commit --amend --no-edit <args>`
 */
export const gitCommitAmendNoEdit = async (args: string[] = []): Promise<void> => {
  await gitCommit([ '--amend', '--no-edit', ...args ])
}
