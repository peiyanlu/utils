import { gitRestore } from './raw.js'


/**
 * 取消单个文件的暂存状态
 * - 用 HEAD 覆盖暂存区（Index）
 * - 不影响工作区（Working Tree）
 * - 等价于撤销 git add
 * @defaults `git restore --staged <file>`
 */
export const gitUnstageFile = async (file: string): Promise<void> => {
  await gitRestore([ '--staged', file ])
}

/**
 * 取消所有文件的暂存状态
 * - 用 HEAD 覆盖暂存区（Index）
 * - 不影响工作区（Working Tree）
 * - 等价于撤销所有 git add
 * @defaults `git restore --staged .`
 */
export const gitUnstageAll = async (): Promise<void> => {
  await gitRestore([ '--staged', '.' ])
}
