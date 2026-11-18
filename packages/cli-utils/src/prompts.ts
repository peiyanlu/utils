import { cancel, isCancel } from '@clack/prompts'
import { styleText } from '@peiyanlu/node-utils'
import type { Awaitable } from '@peiyanlu/ts-utils'


/** 中断任务 */
export const abortTask: (msg?: string) => never = (msg?: string): never => {
  cancel(msg ?? '✕ Task cancelled.')
  process.exit(0)
}

/** 单问答运行包装 */
export const singlePrompt = async <T>(fn: () => Awaitable<T>, abortMsg?: string): Promise<Exclude<T, symbol>> => {
  const value = await fn()
  
  if (isCancel(value)) {
    abortTask(abortMsg)
  }
  
  return value as Exclude<T, symbol>
}

/** 问题信息添加 `?` 前缀 */
export const question = (msg: string, dryRun?: boolean): string => {
  const color = dryRun ? styleText.yellow : styleText.green
  return `${ color('?') } ${ msg }`
}
