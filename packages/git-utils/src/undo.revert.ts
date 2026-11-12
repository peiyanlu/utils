import { gitRevert } from './raw.ts'


/**
 * 安全撤销一个已提交（并可能已 push）的 commit
 * @defaults `git revert <commit>`
 */
export const gitRevertCommit = async (hash: string): Promise<void> => {
  await gitRevert([ hash ])
}
