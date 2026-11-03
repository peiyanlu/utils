import { gitCheckout } from './raw.js'


/**
 * 创建并签出
 * @defaults `git checkout -b <branch> <start-point>`
 * @fallback `git checkout <branch>`
 * @see
 * ```
 * git branch <branch> <start-point>
 * git checkout <branch>
 * ```
 */
export const gitCheckoutBranch = async (branch: string, startpoint?: string): Promise<void> => {
  await gitCheckout(
    [ '-b', branch, ...(startpoint ? [ startpoint ] : []) ],
    { error: 'throw' },
  )
    .catch(_ => gitCheckout([ branch ], { error: 'throw' }))
}

/**
 * 强制创建/重置并签出
 * @defaults `git checkout -B <branch> <start-point>`
 * @see
 * ```
 * git checkout <start-point>
 * git branch -f <branch> HEAD
 * git checkout <branch>
 * ```
 */
export const gitCheckoutBranchForce = async (branch: string, startpoint?: string): Promise<void> => {
  await gitCheckout([ '-B', branch, ...(startpoint ? [ startpoint ] : []) ])
}

/**
 * 创建孤儿分支
 * @defaults `git checkout --orphan <branch>`
 */
export const gitCheckoutBranchOrphan = async (branch: string, startpoint?: string): Promise<void> => {
  await gitCheckout([ '--orphan', branch, ...(startpoint ? [ startpoint ] : []) ])
}
