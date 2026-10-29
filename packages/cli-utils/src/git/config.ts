import { gitConfig } from './raw.js'


/**
 * 获取指定的 git 配置
 * @defaults `git config [--global] --get <key>`
 */
export const gitConfigGet = async (key: string, global = false): Promise<string | undefined> => {
  const g = global ? [ '--global' ] : []
  return gitConfig([ ...g, '--get', key ])
}

/**
 * 指定的 git 配置
 * @defaults `git config [--global] <key> <value>`
 */
export const gitConfigSet = async (key: string, value: string, global = false): Promise<void> => {
  const g = global ? [ '--global' ] : []
  await gitConfig([ ...g, key, value ])
}

/**
 * 移除指定配置
 * @defaults `git config [--global] --unset <key>`
 */
export const gitConfigUnset = async (key: string, global = false): Promise<void> => {
  const g = global ? [ '--global' ] : []
  await gitConfig([ ...g, '--unset', key ])
}

/**
 * 配置列表
 * @defaults `git config [--global] --list`
 */
export const gitConfigList = async (global = false): Promise<string | undefined> => {
  const g = global ? [ '--global' ] : []
  return gitConfig([ ...g, '--list' ])
}
