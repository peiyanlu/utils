import type { AnyFunction, AsyncFunction } from './function.js'


/** 所有函数成员 */
export type PickMethods<T> = {
  [P in keyof T as T[P] extends AnyFunction ? P : never]: T[P];
};

/** 同步函数成员
 * @see Omit<PickMethods<T>, AsyncMethodsOf<T>> */
export type PickSyncMethods<T> = {
  [P in keyof T as T[P] extends AsyncFunction
    ? never
    : T[P] extends AnyFunction
      ? P
      : never]: T[P];
};

/** 异步函数成员 */
export type PickAsyncMethods<T> = {
  [P in keyof T as T[P] extends AsyncFunction ? P : never]: T[P];
};

/** 普通字段成员
 * @see Pick<T, FieldKeysOf<T>> */
export type PickFields<T> = {
  [P in keyof T as T[P] extends AnyFunction ? never : P]: T[P];
};
