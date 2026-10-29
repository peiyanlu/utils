import { gitAdd } from './raw.js'


/**
 * 暂存所有文件
 * @defaults `git add --all`
 */
export const gitAddAll = async (args: string[] = []): Promise<void> => {
  await gitAdd([ '--all', ...args ])
}


/**
 * 暂存已追踪文件
 * @defaults `git add --update`
 */
export const gitAddTracked = async (args: string[] = []): Promise<void> => {
  await gitAdd([ '--update', ...args ])
}
