import type { AnyFunction, AsyncFunction } from './function.js'


/** 提取指定类型 T 的 keys */
export type KeysOf<T> = keyof T

/** 提取 string 类型的 keys */
export type StringKeyOf<T> = Extract<keyof T, string>

/** 所有方法的键名 */
export type MethodsOf<T> = {
  [P in keyof T]: T[P] extends AnyFunction ? P : never;
}[keyof T];

/** 同步方法（不返回 Promise）的键名 */
export type SyncMethodsOf<T> = {
  [P in keyof T]: T[P] extends AsyncFunction
    ? never
    : T[P] extends AnyFunction
      ? P
      : never;
}[keyof T];

/** 异步方法的键名 */
export type AsyncMethodsOf<T> = {
  [P in keyof T]: T[P] extends AsyncFunction ? P : never;
}[keyof T];

/** 普通字段的键名 */
export type FieldKeysOf<T> = {
  [P in keyof T]: T[P] extends AnyFunction ? never : P;
}[keyof T];
