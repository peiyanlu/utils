import type { AnyFunction, MaybePromise, Promisified } from '../types/index.js'
import { isFunction } from './is.js'


/** 仅执行一次的方法 */
export const once = <Args extends unknown[], R>(
  fn: (...args: Args) => R,
): (...args: Args) => R => {
  let called = false
  let result: R
  
  return (...args: Args) => {
    if (!called) {
      result = fn(...args)
      called = true
    }
    return result
  }
}

/** 仅执行一次的异步方法 */
export const onceAsync = <Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
): (...args: Args) => Promise<R> => {
  let promise: Promise<R> | undefined
  
  return (...args: Args) => {
    if (!promise) {
      promise = fn(...args)
        .catch(err => {
          promise = undefined
          throw err
        })
    }
    return promise
  }
}

/** 同步函数转为异步 */
export const promisify = <T extends AnyFunction>(fn: T): Promisified<T> => {
  return (...args) => {
    return new Promise<ReturnType<T>>((resolve, reject) => {
      try {
        const result = fn(...args)
        if (result instanceof Promise) {
          result.then(resolve).catch(reject)
        } else {
          resolve(result)
        }
      } catch (e) {
        reject(e)
      }
    })
  }
}

/** 安全调用函数，异常时返回 undefined */
export const tryCall = async <T, F>(
  fn: () => MaybePromise<T>,
  fallback: F | ((error: unknown) => F),
): Promise<T | F> => {
  try {
    return await fn()
  } catch (e) {
    return isFunction(fallback)
      ? fallback(e)
      : fallback
  }
}

/** {@link tryCall} 的同步版本 */
export const tryCallSync = <T, F>(
  fn: () => T,
  fallback: F | ((error: unknown) => F),
): T | F => {
  try {
    return fn()
  } catch (e) {
    return isFunction(fallback)
      ? fallback(e)
      : fallback
  }
}

/** 判断函数执行是否成功 */
export const isSuccess = async (fn: () => MaybePromise<unknown>): Promise<boolean> => {
  try {
    await fn()
    return true
  } catch {
    return false
  }
}

/** {@link isSuccess} 的同步版本 */
export const isSuccessSync = (fn: () => unknown): boolean => {
  try {
    fn()
    return true
  } catch {
    return false
  }
}
