/** 大写字符串的首字符 */
export const upperFirst = (string: string): string => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : ''
}

/** 多空格函数 */
export const space = (n: number = 1): string => ' '.repeat(Math.abs(n))

/** 去掉模板首尾空行 */
export const trimTemplate = (str: string): string => str.replace(/^\s*\n+|\n+\s*$/g, '')

/** 按行拆分 */
export const splitLines = (text: string): string[] => text.split(/\r?\n/)

/** 按行拆分（过滤空行） */
export const splitNonEmptyLines = (text: string): string[] => splitLines(text).filter(Boolean)

/** 折叠连续空白行 */
export const collapseBlankLines = (str: string, opts: { threshold?: number; preserve?: number } = {}): string => {
  const { threshold = 3, preserve = 3 } = opts
  const eol = str.includes('\r\n') ? '\r\n' : '\n'
  
  return str.replace(
    new RegExp(`(?:\\r?\\n){${ threshold },}`, 'g'),
    eol.repeat(preserve),
  )
}

/** 生成一个或多个换行 */
export const newline = (n = 1): string => '\n'.repeat(Math.abs(n))

/** 消除缩进 */
export const dedent = (str: string): string => {
  const lines = str.split('\n')
  
  const indent = lines
    .filter(line => line.trim())
    .reduce(
      (min, line) => Math.min(min, line.search(/\S/)),
      Infinity,
    )
  
  if (!Number.isFinite(indent)) {
    return ''
  }
  
  return lines
    .map(line => line.slice(indent))
    .join('\n')
    .trim()
}
