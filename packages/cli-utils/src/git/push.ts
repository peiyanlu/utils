import { hasUpstream } from './misc.js'
import { gitPush } from './raw.js'


/**
 * 推送 tag 到远程
 * @defaults `git push <remote> refs/tags/<tag> <args>`
 */
export const gitPushTag = async (remote: string, tag: string, args: string[] = []): Promise<void> => {
  await gitPush([ remote, `refs/tags/${ tag }`, ...args ])
}

/**
 * 推送分支到远程
 * 自动处理 upstream
 * @defaults `git push <remote> <branch> [--set-upstream] <args>`
 */
export const gitPushBranch = async (remote: string, branch: string, args: string[] = []): Promise<void> => {
  const has = await hasUpstream()
  const u = !has ? [ '--set-upstream' ] : []
  
  await gitPush([ remote, branch, ...u, ...args ])
}

/**
 * 删除远程引用（分支、tag）
 * @defaults `git push <remote> <ref> --delete <args>`
 */
export const gitPushDeleteRef = async (remote: string, ref: string, args: string[] = []): Promise<void> => {
  await gitPush([ remote, ref, '--delete', ...args ])
}
