import { splitLines } from '../utils.js'
import { gitRemote } from './raw.js'


/**
 * 获取 url
 * @defaults `git remote get-url <args>`
 */
export const gitRemoteGetUrl = async (args: string[]): Promise<string | undefined> => {
  return gitRemote([ 'get-url', ...args ])
}

/**
 * 设置 url
 * @defaults `git remote set-url <args>`
 */
export const gitRemoteSetUrl = async (args: string[]): Promise<void> => {
  await gitRemote([ 'set-url', ...args ])
}

/**
 * 添加远程
 * @defaults `git remote add <name> <url>`
 */
export const gitRemoteAdd = async (name: string, url: string): Promise<void> => {
  await gitRemote([ 'add', name, url ])
}

/**
 * 重命名远程
 * @defaults `git remote rename <old-name> <new-name>`
 */
export const gitRemoteRename = async (oldName: string, newName: string): Promise<void> => {
  await gitRemote([ 'rename', oldName, newName ])
}

/**
 * 移除远程
 * @defaults `git remote remove <name>`
 */
export const gitRemoteRemove = async (name: string): Promise<void> => {
  await gitRemote([ 'remove', name ])
}


// -----------------------------------------------------


/** 获取关联的所有远程 */
export const getRemoteNames = async (): Promise<string[]> => {
  const res = await gitRemote([])
  return res ? splitLines(res) : []
}

/** 获取远程地址 */
export const getRemoteUrl = async (remote: string): Promise<string | undefined> => {
  return gitRemoteGetUrl([ remote ])
}

/** 获取所有远程 */
export const getRemoteList = async (): Promise<{ name: string; url?: string; }[]> => {
  const remotes = await getRemoteNames()
  return Promise.all(remotes.map(async name => {
    const url = await gitRemoteGetUrl([ name ])
    return { name, url }
  }))
}
