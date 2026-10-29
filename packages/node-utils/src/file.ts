import { type Dict, tryCall, tryCallSync } from '@peiyanlu/ts-utils'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'


/** 读取文本文件 */
export const readTextFile = async (file: string): Promise<string> => {
  if (!existsSync(file)) return ''
  return readFile(file, 'utf-8')
}

/** {@link readTextFile} 的同步版本 */
export const readTextFileSync = (file: string): string => {
  if (!existsSync(file)) return ''
  return readFileSync(file, 'utf-8')
}

/** 写入文本文件 */
export const writeTextFile = async (file: string, data: string): Promise<void> => {
  return writeFile(file, `${ data }\n`, 'utf-8')
}

/** {@link writeTextFile} 的同步版本 */
export const writeTextFileSync = (file: string, data: string): void => {
  return writeFileSync(file, `${ data }\n`, 'utf-8')
}

/** 编辑文件 */
export const editFile = async (
  file: string,
  callback: (content: string) => Promise<string> | string,
): Promise<void> => {
  if (!existsSync(file)) return
  
  const content = await readTextFile(file)
  const data = await callback(content)
  return writeTextFile(file, data)
}

/** 编辑 JSON 文件 */
export const editJsonFile = async <T extends Dict>(
  file: string,
  callback: (json: T) => Promise<void> | void,
): Promise<void> => {
  return editFile(file, async (str) => {
    return tryCall(async () => {
      const json = JSON.parse(str) as T
      await callback(json)
      return JSON.stringify(json, null, 2)
    }, str)
  })
}

/** 读取 JSON 文件 */
export const readJsonFile = async <T extends Dict<any>>(file: string): Promise<T> => {
  return tryCall(async () => {
    const text = await readTextFile(file)
    return JSON.parse(text) as T
  }, {} as T)
}

/** {@link readJsonFile} 的同步版本 */
export const readJsonFileSync = <T extends Dict<any>>(file: string): T => {
  return tryCallSync(() => {
    const text = readTextFileSync(file)
    return JSON.parse(text) as T
  }, {} as T)
}

/** 写入 JSON 文件 */
export const writeJsonFile = async <T extends Dict>(file: string, json: T): Promise<void> => {
  const data = JSON.stringify(json, null, 2)
  return writeTextFile(file, data)
}

/** {@link writeJsonFile} 的同步版本 */
export const writeJsonFileSync = <T extends Dict>(file: string, json: T): void => {
  const data = JSON.stringify(json, null, 2)
  return writeTextFileSync(file, data)
}

/** 是否是文件 */
export const isFileSync = (path: string): boolean => {
  return existsSync(path) && statSync(path).isFile()
}
