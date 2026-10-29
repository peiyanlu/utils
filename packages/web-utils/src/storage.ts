export const getStorage = <T>(storage: Storage, key: string): T | null => {
  const value = storage.getItem(key)
  
  if (value === null) {
    return null
  }
  
  return JSON.parse(value)
}


export const setStorage = (storage: Storage, key: string, value: unknown): void => {
  storage.setItem(key, JSON.stringify(value))
}


export const removeStorage = (storage: Storage, key: string): void => {
  storage.removeItem(key)
}


export const clearStorage = (storage: Storage): void => {
  storage.clear()
}
