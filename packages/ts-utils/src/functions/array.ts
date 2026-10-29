/** 参数数组化 */
export const castArray = <T>(v: T | readonly T[]): T[] => {
  return Array.isArray(v) ? [ ...v ] : [ v as T ]
}

/** 过滤数组中的 undefined 值 */
export const nonUndefined = <T>(arr: readonly T[]): Exclude<T, undefined>[] => {
  return arr.filter((e): e is Exclude<T, undefined> => e !== undefined)
}

/** 过滤数组中的 null 值 */
export const nonNull = <T>(arr: readonly T[]): Exclude<T, null>[] => {
  return arr.filter((e): e is Exclude<T, null> => e !== null)
}

/** 过滤数组中的 null 和 undefined 值 */
export const nonNullable = <T>(arr: readonly T[]): NonNullable<T>[] => {
  return arr.filter((e): e is NonNullable<T> => e !== null && e !== undefined)
}

/** 按固定大小分组数组元素 */
export const chunk = <T>(arr: readonly T[], size: number): T[][] => {
  if (size <= 0) return []
  
  return arr
    .reduce<T[][]>(
      (res, v, i) => {
        (res[Math.floor(i / size)] ??= []).push(v)
        return res
      },
      [],
    )
}

/** 按固定间隔替换数组元素 */
export const replaceEvery = <T, V = T>(arr: readonly T[], step: number, val: V): (T | V)[] => {
  if (step <= 0) return []
  
  return arr.map((v, i) => (i + 1) % step === 0 ? val : v)
}

export const partition = <T>(arr: readonly T[], predicate: (item: T) => boolean): [ T[], T[] ] => {
  const matched: T[] = []
  const unmatched: T[] = []
  
  for (const item of arr) {
    if (predicate(item)) {
      matched.push(item)
    } else {
      unmatched.push(item)
    }
  }
  
  return [ matched, unmatched ]
}
