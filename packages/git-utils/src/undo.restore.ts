import { gitRestore } from './raw.js'


/**
 * 用【暂存区】覆盖【工作区】单个文件
 * - 用 Index 覆盖 Working Tree
 * - 不影响暂存区（Index）
 * @defaults `git restore --worktree <file>`
 */
export const gitRestoreFile = async (file: string): Promise<void> => {
  // await gitCheckout([ '--', file ])
  await gitRestore([ '--worktree', file ])
}

/**
 * 用【暂存区】覆盖【工作区】所有文件
 * - 用 Index 覆盖 Working Tree
 * - 不影响暂存区（Index）
 * @defaults `git --worktree restore .`
 */
export const gitRestoreAll = async (): Promise<void> => {
  // await gitCheckout([ '--', '.' ])
  await gitRestore([ '--worktree', '.' ])
}

/**
 * 用 指定 source 中的文件内容覆盖【工作区】文件
 * - 仅修改 Working Tree
 * - 不影响暂存区（Index）
 * - 不会改变提交历史（HEAD）
 * @defaults `git restore --worktree --source <source> <file>`
 * @see source = `git rev-parse <expr>`
 */
export const gitRestoreWorktreeFileFrom = async (source: string, file: string): Promise<void> => {
  await gitRestore([ '--worktree', '--source', source, file ])
}

/**
 * 用指定 source 中的文件内容覆盖【工作区】所有文件
 * - 仅修改 Working Tree
 * - 不影响暂存区（Index）
 * - 不会改变提交历史（HEAD）
 * @defaults `git restore --worktree --source <source> .`
 * @see source = `git rev-parse <expr>`
 */
export const gitRestoreWorktreeAllFrom = async (source: string): Promise<void> => {
  await gitRestore([ '--worktree', '--source', source, '.' ])
}

/**
 * 用指定 source 覆盖【暂存区】中的文件
 * - 用 source 覆盖 Index
 * - 不影响工作区（Working Tree）
 * - 不会改变提交历史（HEAD）
 * @defaults `git restore --staged --source <source> <file>`
 * @see source = `git rev-parse <expr>`
 */
export const gitRestoreIndexFileFrom = async (source: string, file: string): Promise<void> => {
  await gitRestore([ `--staged`, '--source', source, file ])
}

/**
 * 用指定 source 覆盖整个【暂存区】
 * - 用 source 覆盖 Index
 * - 不影响工作区（Working Tree）
 * - 不会改变提交历史（HEAD）
 * @defaults `git restore --staged --source <source> .`
 * @see source = `git rev-parse <expr>`
 */
export const gitRestoreIndexAllFrom = async (source: string): Promise<void> => {
  await gitRestore([ `--staged`, '--source', source, '.' ])
}

/**
 * 用指定 source 覆盖指定文件（暂存区 + 工作区）
 * - 将 Index 和 Working Tree 恢复到 source 状态
 * - 不会移动 HEAD
 * - 不会改变提交历史
 * @defaults `git restore --staged --worktree --source <source> <file>`
 * @see source = `git rev-parse <expr>`
 */
export const gitRestoreFileFrom = async (source: string, file: string): Promise<void> => {
  // await gitCheckout([ source, '--', file ])
  await gitRestore([ '--staged', '--worktree', '--source', source, file ])
}

/**
 * 用指定 source 覆盖所有文件（暂存区 + 工作区）
 * - 将 Index 和 Working Tree 恢复到 source 状态
 * - 不会移动 HEAD
 * - 不会改变提交历史
 * @defaults `git restore --staged --worktree --source <source> .`
 * @see source = `git rev-parse <expr>`
 */
export const gitRestoreAllFrom = async (source: string): Promise<void> => {
  // await gitCheckout([ source, '--', '.' ])
  await gitRestore([ '--staged', '--worktree', '--source', source, '.' ])
}
