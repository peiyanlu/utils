import { minimatch } from 'minimatch'
import { resolve } from 'node:path'
import { globSync, isDynamicPattern } from 'tinyglobby'


/** glob 模式扫描文件 */
export const scanFiles = (dirs: string[], patterns: string[]): { file: string; dir: string; }[] => {
  return dirs
    .map(d => resolve(d))
    .flatMap(
      dir => globSync(
        patterns,
        {
          cwd: dir,
          onlyFiles: true,
          absolute: true,
          dot: true,
        },
      )
        .sort()
        .map(file => ({ file, dir })),
    )
}

/** 创建字符串匹配函数，支持正则、Glob 模式和精确匹配 */
export const createMatcher = (pattern: string | RegExp): (name: string) => boolean => {
  if (pattern instanceof RegExp) {
    return (name: string) => {
      pattern.lastIndex = 0
      return pattern.test(name)
    }
  }
  
  if (isDynamicPattern(pattern)) {
    return (name: string) => minimatch(name, pattern)
  }
  
  return (name: string) => name === pattern
}
