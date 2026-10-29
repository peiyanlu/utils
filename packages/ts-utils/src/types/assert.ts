/** 类型相同 */
export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
    ? true
    : false

/** 断言为 TRUE */
export type Assert<T extends true> = T
