/** 判断两个值相等 */
export const equals = <A, B>(a: A, b: B): boolean => Object.is(a, b)

/** 判断两个值不等 */
export const notEquals = <A, B>(a: A, b: B): boolean => !Object.is(a, b)

/** 判断两个数组内容是否相同 */
export const arrayEquals = <T, K extends string | number | bigint = never>(
  a1: readonly T[],
  a2: readonly T[],
  key?: (item: T) => K,
): boolean => {
  if (a1.length !== a2.length) return false
  
  if (!key) {
    return a1.every((v, i) => Object.is(v, a2[i]))
  }
  
  const compare = (a: K, b: K) =>
    a < b ? -1 : a > b ? 1 : 0
  const k1 = a1.map(key).sort(compare)
  const k2 = a2.map(key).sort(compare)
  
  return k1.every((v, i) => Object.is(v, k2[i]))
}
