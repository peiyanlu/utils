export type FetchResponseType =
  | 'json'
  | 'text'
  | 'blob'
  | 'arrayBuffer'
  | 'bytes'
  | 'formData'


export const fetchWithTimeout = async <T>(
  url: string,
  options: RequestInit = {},
  timeout: number = 10_000,
  type: FetchResponseType = 'json',
): Promise<T | undefined> => {
  const c = new AbortController()
  const timer = setTimeout(() => c.abort(), timeout)
  
  try {
    const res = await fetch(url, { ...options, signal: c.signal })
    
    let data: unknown
    switch (type) {
      case 'json':
        data = await res.json()
        break
      case 'text':
        data = await res.text()
        break
      case 'blob':
        data = await res.blob()
        break
      case 'arrayBuffer':
        data = await res.arrayBuffer()
        break
      case 'formData':
        data = await res.formData()
        break
      case 'bytes':
        data = await res.bytes()
        break
    }
    
    return data as T
  } catch (e) {
    return void 0
  } finally {
    clearTimeout(timer)
  }
}
