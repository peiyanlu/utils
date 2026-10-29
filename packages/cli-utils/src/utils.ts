import { space } from '@peiyanlu/ts-utils'
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

/** 将字符串以空格分割为数组 */
export const parseArgs = (args: string): string[] =>
  args.trim() ? args.trim().split(space()) : []

/** 将数组以空格拼接为字符串 */
export const stringifyArgs = (args: string[]): string =>
  args.length ? args.join(space()) : ''

/** 去掉模板字符串首尾换行 */
export const trimTemplate = (str: string): string =>
  str.replace(/^\s*\n+|\n+\s*$/g, '')

/** 字符串按换行符分割并过滤 */
export const splitLines = (text: string): string[] => {
  return text.split(/\r?\n/).filter(Boolean)
}
