import type { AbstractClass, AnyFunction, AsyncFunction, Class, Primitive } from '../types/index.js'
import { isSuccessSync } from './function.js'
import { getTag } from './object.js'


/** 判断一个值是否为 Object（非 null） */
export const isObject = (v: unknown): v is object => 'object' === typeof v && null !== v

/** 判断一个值是否不是 Object */
export const isNotObject = (v: unknown): boolean => 'object' !== typeof v || null === v

/** 判断一个值是否为普通对象（{} 或 Object.create(null)） */
export const isPlainObject = (v: unknown): v is object => {
  if (!isObject(v)) return false
  const proto = Object.getPrototypeOf(v)
  return Object.prototype === proto || null === proto
}

/** 判断一个值是否为函数 */
export const isFunction = (v: unknown): v is AnyFunction => 'function' === typeof v

/** 判断一个值是否为同步函数（即 `[object Function]`） */
export const isSyncFunction = (v: unknown): boolean => 'Function' === getTag(v)

/** 判断一个值是否为异步函数（即 `[object AsyncFunction]`） */
export const isAsyncFunction = (v: unknown): v is AsyncFunction => 'AsyncFunction' === getTag(v)

/** 安全判断对象是否为特定类实例 */
export const isInstanceOf = <T>(v: unknown, ctor: AbstractClass<T>): v is T => v instanceof ctor

/** 判断一个值是否为布尔值 */
export const isBoolean = (v: unknown): v is boolean => 'boolean' === typeof v

/** 判断一个值是否为字符串 */
export const isString = (v: unknown): v is string => 'string' === typeof v

/** 判断值是否为数字类型 */
export const isNumber = (v: unknown): v is number => 'number' === typeof v && !Number.isNaN(v)

/** 判断一个值是否为 bigint */
export const isBigInt = (v: unknown): v is bigint => 'bigint' === typeof v

/** 判断是否为有限数字 */
export const isFinite = (v: unknown): v is number => 'number' === typeof v && Number.isFinite(v)

/** 判断是否为整数 */
export const isInteger = (v: unknown): v is number => Number.isInteger(v)

/** 判断是否为正数 */
export const isPositive = (v: unknown): v is number => isNumber(v) && 0 < v

/** 判断一个值是否为 symbol */
export const isSymbol = (v: unknown): v is symbol => 'symbol' === typeof v

/** 判断一个值是否为原始类型 */
export const isPrimitive = (v: unknown): v is Primitive =>
  v === null || ('object' !== typeof v && 'function' !== typeof v)

/** 判断一个值是否为数组 */
export const isArray = (v: unknown): v is unknown[] => Array.isArray(v)

/** 判断一个值是否为有效日期 */
export const isDate = (v: unknown): v is Date => isInstanceOf(v, Date) && !Number.isNaN(v.getTime())

/** 判断一个值是否为正则 */
export const isRegExp = (v: unknown): v is RegExp => isInstanceOf(v, RegExp)

/** 判断一个值是否为 Promise */
export const isPromise = (v: unknown): v is Promise<unknown> => isObject(v) && isFunction((v as any).then)

/** 判断一个值是否可以使用 new 调用 */
export const isNewable = (v: unknown): v is Class<unknown> => {
  if (!isFunction(v)) return false
  return isSuccessSync(() => Reflect.construct(v, []))
}

/** 判断一个值是否为 Map */
export const isMap = (v: unknown): v is Map<unknown, unknown> => isInstanceOf(v, Map)

/** 判断一个值是否为 Set */
export const isSet = (v: unknown): v is Set<unknown> => isInstanceOf(v, Set)


// ---------------------------------------------------------------------------------------------------------------------


/** undefined 值判断 */
export const isUndefined = (v: unknown): v is undefined => undefined === v

/** null 值判断 */
export const isNull = (v: unknown): v is null => null === v

/** 断值不是 null/undefined */
export const isNonNullable = (v: unknown): v is {} => null !== v && undefined !== v

/** 断值是不是 null/undefined */
export const isNullable = (v: unknown): v is null | undefined => null === v || undefined === v

/** 0 值判断 */
export const isZero = (v: number): v is 0 => 0 === v

/** 数组索引值判断 */
export const isIndex = (v: number): boolean => isInteger(v) && -1 < v

/** 判断对象是否为空对象（无自身属性） */
export const isEmptyObject = (v: unknown): boolean => isPlainObject(v) && isZero(Reflect.ownKeys(v).length)

/** 判断字符串是否为空 */
export const isEmptyString = (v: unknown): boolean => isString(v) && isZero(v.length)

/** 判断数组是否为空 */
export const isEmptyArray = (v: unknown): boolean => isArray(v) && isZero(v.length)

/** 判断字符串是否为空白 */
export const isBlankString = (v: unknown): boolean => isString(v) && isZero(v.trim().length)

/** 判断 Map 是否为空 */
export const isEmptyMap = (v: unknown): boolean => isMap(v) && isZero(v.size)

/** 判断 Set 是否为空 */
export const isEmptySet = (v: unknown): boolean => isSet(v) && isZero(v.size)

/** 断值是不是空 */
export const isEmpty = (v: unknown): boolean =>
  isNullable(v) || isEmptyObject(v) || isEmptyArray(v) || isEmptyString(v) || isEmptyMap(v) || isEmptySet(v)

/** 断值是不是非空 */
export const isNotEmpty = (v: unknown): boolean => !isEmpty(v)
