import type { AnyFunction } from './function.js'
import type { Builtin } from './primitive.js'


/** 简化包装类型 */
export type Simplify<T extends object> = {
  [K in keyof T]: T[K]
} & {}

/** 移除 readonly 修饰符 */
export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

/** 指定属性可选 */
export type MarkOptional<T, K extends keyof T> = Simplify<Pick<Partial<T>, K> & Omit<T, K>>;

/** 指定属性必填 */
export type MarkRequired<T, K extends keyof T> = Simplify<Pick<Required<T>, K> & Omit<T, K>>;

/** 至少包含一个属性（非空对象约束） */
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Simplify<Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>>;
}[keyof T];

/** 对象类型转可索引对象类型 */
export type Indexable<T> = {
  [K in keyof T]: T[K]
}

/** 递归 Partial */
export type DeepPartial<T> =
// Builtin
  T extends Builtin
    ? T
    // Function
    : T extends AnyFunction
      ? T
      // Tuple（保留结构）
      : T extends readonly [ ...infer U ]
        ? { [K in keyof U]?: DeepPartial<U[K]> }
        // Array / readonly array（统一为可写数组）
        : T extends readonly (infer U)[]
          ? DeepPartial<U>[]
          // Object
          : T extends object
            ? { [K in keyof T]?: DeepPartial<T[K]> }
            : T

/** 递归 Required */
export type DeepRequired<T> =
// Builtin
  T extends Builtin
    ? T
    // Function
    : T extends AnyFunction
      ? T
      // Tuple（保留结构）
      : T extends readonly [ ...infer U ]
        ? { [K in keyof U]-?: DeepRequired<U[K]> }
        // Array / readonly array（统一为可写数组）
        : T extends readonly (infer U)[]
          ? DeepRequired<U>[]
          // Object
          : T extends object
            ? { [K in keyof T]-?: DeepRequired<T[K]> }
            : T

/** 以字符串为键的字典对象 */
export type Dict<T = unknown> = Record<string, T>
