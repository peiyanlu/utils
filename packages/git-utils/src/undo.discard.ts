import { gitRestore } from './raw.js'


/**
 * 丢弃指定文件的所有修改（暂存区 + 工作区）
 * - 强制将文件恢复到 HEAD 状态
 * - 同时重置 Index 和 Working Tree
 * - 不会改变提交历史（HEAD）
 * @defaults `git restore --source=HEAD --staged --worktree <file>`
 */
export const gitDiscardFile = async (file: string): Promise<void> => {
  // await gitCheckout([ 'HEAD', '--', file ])
  await gitRestore([ '--staged', '--worktree', '--source=HEAD', file ])
}

/**
 * 丢弃所有文件的所有修改（暂存区 + 工作区）
 * - 强制将整个工作区恢复到 HEAD 状态
 * - 行为等价于 git reset --hard HEAD（按文件粒度）
 * - 不会删除未跟踪文件（untracked files）
 * @defaults `git restore --source=HEAD --staged --worktree .`
 */
export const gitDiscardAll = async (): Promise<void> => {
  // await gitCheckout([ 'HEAD', '--', '.' ])
  await gitRestore([ '--staged', '--worktree', '--source=HEAD', '.' ])
}
