import { EOL } from 'node:os'


/** 判断测试文件（夹） */
export const isTestFile = (name: string): boolean => {
  return [
    /(^|[\\/])(test(s?)|__test(s?)__)([\\/]|$)/,
    /\.([a-zA-Z0-9]+-)?(test|spec)\.m?(ts|js)$/,
    /^vitest([-.])(.*)\.m?(ts|js)$/,
  ].some(reg => reg.test(name))
}

/** 基于 EOL 的可多换行函数 */
export const eol = (n: number = 1): string => EOL.repeat(n)
