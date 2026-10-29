/** 异步迭代转数组 */
export const toArray = async <T>(iterable: AsyncIterable<T>): Promise<T[]> => {
  const result: T[] = []
  
  for await (const item of iterable) {
    result.push(item)
  }
  
  return result
}

/** 第一个异步迭代数据 */
export const firstFromIterable = async <T>(iterable: AsyncIterable<T>): Promise<T | undefined> => {
  const iterator = iterable[Symbol.asyncIterator]()
  const { value, done } = await iterator.next()
  
  return done ? undefined : value
}
