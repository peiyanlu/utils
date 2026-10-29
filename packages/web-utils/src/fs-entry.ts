/** 是否是文件实体 */
export const isFileEntry = (entry: FileSystemEntry): entry is FileSystemFileEntry => entry.isFile

/** 是否是目录实体 */
export const isDirectoryEntry = (entry: FileSystemEntry): entry is FileSystemDirectoryEntry => entry.isDirectory

/** 获取文件实体对应的 File 对象 */
export const getFileFromFileEntry = async (entry: FileSystemFileEntry): Promise<File> => {
  return new Promise<File>((resolve, reject) => {
    entry.file(resolve, reject)
  })
}

/** 获取目录下的所有子实体 */
export const getDirectoryEntries = async (entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> => {
  return new Promise((resolve, reject) => {
    const reader = entry.createReader()
    const entries: FileSystemEntry[] = []
    
    const recursionRead = () => {
      reader.readEntries(
        result => {
          if (result.length === 0) {
            return resolve(entries)
          }
          entries.push(...result)
          
          recursionRead()
        },
        reject,
      )
    }
    
    recursionRead()
  })
}

/** 获取实体中的所有文件 */
export const getFilesFromEntry = async (entry: FileSystemEntry): Promise<File[]> => {
  if (isFileEntry(entry)) {
    return [ await getFileFromFileEntry(entry) ]
  }
  
  if (isDirectoryEntry(entry)) {
    const entries = await getDirectoryEntries(entry)
    const files = await Promise.all(entries.map(getFilesFromEntry))
    return files.flat()
  }
  
  return []
}
