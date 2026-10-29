export function joinUrl(...args: string[]): string
export function joinUrl(input: readonly string[]): string
export function joinUrl(input: string | readonly string[]): string {
  const temps: string[] = Array.isArray(input) ? input : [ ...arguments ]
  
  if (temps.length === 0) return ''
  
  const result: string[] = []
  const parts = [ ...temps ]
  
  /** 协议正则 */
  const PROTOCOL_RE = /^[^/:]+:\/*$/
  const FILE_PROTOCOL_RE = /^file:\/*/
  
  // 1️⃣ 合并纯 protocol（如 ['http:', 'example.com']）
  if (PROTOCOL_RE.test(parts[0]) && parts.length > 1) {
    parts[1] = parts[0] + parts[1]
    parts.shift()
  }
  
  // 2️⃣ 规范 protocol 后的斜杠数量
  if (FILE_PROTOCOL_RE.test(parts[0])) {
    parts[0] = parts[0].replace(/^([^/:]+):\/*/, '$1:///')
  } else {
    parts[0] = parts[0].replace(/^([^/:]+):\/*/, '$1://')
  }
  
  // 3️⃣ 逐段 normalize
  parts.forEach((part, index) => {
    if (!part) return
    
    let segment = part
    
    // 非首段，去掉开头 /
    if (index > 0) {
      segment = segment.replace(/^\/+/, '')
    }
    
    // 非末段，去掉结尾 /
    if (index < parts.length - 1) {
      segment = segment.replace(/\/+$/, '')
    } else {
      // 末段：多个 / 合成一个
      segment = segment.replace(/\/+$/, '/')
    }
    
    result.push(segment)
  })
  
  // 4️⃣ 合并
  let url = result.join('/')
  
  // 5️⃣ 移除参数 / hash 前的多余 /
  url = url.replace(/\/(\?|&|#[^!])/g, '$1')
  
  // 6️⃣ 多个 ? 转为 &
  const [ base, ...queryParts ] = url.split('?')
  url = base + (queryParts.length ? '?' + queryParts.join('&') : '')
  
  return url
}
