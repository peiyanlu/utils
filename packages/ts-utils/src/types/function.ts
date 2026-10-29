/** 指定参数和返回值的函数 */
export type TypedFunction<Args extends unknown[] = unknown[], R = unknown> = (...args: Args) => R;

/** 任意函数 */
export type AnyFunction = (...args: any[]) => any;

/** 任意返回 Promise 的函数 */
export type AsyncFunction = (...args: any[]) => Promise<any>;

/** 无参数回调 */
export type Callback = () => void;

/** 类构造函数类型（可实例化） */
export type Class<T> = new (...args: any[]) => T;

/** 类构造函数类型（支持抽象类） */
export type AbstractClass<T> = abstract new (...args: any[]) => T;

/** 同步或异步值 */
export type MaybePromise<T> = T | Promise<T>;

/** 提取 Promise 返回值类型 */
export type PromiseReturnType<T extends AsyncFunction> = Awaited<ReturnType<T>>;

/** 取第 N 个参数类型定义 */
export type ParamAtSafe<F extends AnyFunction, I extends number> =
  Parameters<F> extends { [K in I]: infer R } ? R : never

/** 参数类型与原函数一致；返回值变为 Promise<原返回类型> */
export type Promisified<T extends AnyFunction> = (...args: Parameters<T>) => Promise<ReturnType<T>>;

/** 将对象中的所有函数类型转换为异步函数 */
export type Asyncify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : T[K]
}
