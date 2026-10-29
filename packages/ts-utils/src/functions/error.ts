/** 抛出错误 */
export const throwError = (err: string | Error): never => {
  throw err instanceof Error ? err : new Error(err)
}

/** 断言 */
export const assert = (value: unknown, message?: string | Error): asserts value => {
  !value && throwError(message ?? 'Assertion failed')
}

/** 获取当前调用堆栈 */
export const getCallStack = (): string[] => {
  class CallStack extends Error {
    readonly name: string = 'CallStack'
  }
  
  const stack = new CallStack().stack
  
  /* v8 ignore if -- @preserve */
  if (!stack) {
    return []
  }
  
  const result: string[] = []
  
  const lines = stack.split('\n')
  
  // 删掉当前函数的记录
  lines.splice(1, 1)
  
  result.push(lines.join('\n'))
  
  for (const line of lines) {
    const match = line.match(/at\s+((?:async\s+)?\S+)/)
    if (match) {
      result.push(match[1])
    }
  }
  
  return result.slice()
}
