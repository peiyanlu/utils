import { getFilesFromEntry } from './fs-entry.js'


/** 复制文本 */
export const copyText = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text)
}

/** 读取文本 */
export const readText = async (): Promise<string> => {
  return navigator.clipboard.readText()
}

/** 复制 Blob */
export const copyBlob = async (blob: Blob): Promise<void> => {
  const item = new ClipboardItem({ [blob.type]: blob })
  await navigator.clipboard.write([ item ])
}

/** 获取粘贴文本 */
export const getPasteText = (evt: ClipboardEvent): string => {
  const data = evt.clipboardData
  if (!data) return ''
  
  return data.getData('text/plain')
}

/** 获取粘贴文件 */
export const getPasteFiles = async (evt: ClipboardEvent): Promise<File[]> => {
  const items = evt.clipboardData?.items
  if (!items) return []
  
  const all = await Promise.all(Array.from(items).map(async item => {
    const entry = item.webkitGetAsEntry()
    if (!entry) return []
    return getFilesFromEntry(entry)
  }))
  
  return all.flat()
}
