import type { AbstractClass, Dict, Simplify, StringKeyOf } from '../types/index.js'
import { isEmptyString, isInstanceOf, isNullable, isObject, isUndefined } from './is.js'


/** 安全转换对象为特定类实例 */
export const asInstanceOf = <T>(obj: unknown, ctor: AbstractClass<T>): T | undefined =>
  isInstanceOf<T>(obj, ctor) ? obj : undefined

/** 运行时删除对象指定属性（浅拷贝） */
export const omit = <
  T extends object,
  const K extends readonly (keyof T)[],
>(obj: T, keys: K): Simplify<Omit<T, K[number]>> => {
  const clone = { ...obj }
  
  for (const key of keys) {
    delete clone[key]
  }
  
  return clone
}

/** 运行时挑选对象指定属性（浅拷贝） */
export const pick = <
  T extends object,
  const K extends readonly (keyof T)[],
>(obj: T, keys: K): Simplify<Pick<T, K[number]>> => {
  const clone = {} as Pick<T, K[number]>
  
  for (const key of keys) {
    clone[key] = obj[key]
  }
  
  return clone
}


/** 获取对象原始类型字符串 */
export const toRawString = (self: unknown): string => Object.prototype.toString.call(self)

/** @deprecated Use toRawString instead. */
export const toString = (self: unknown): string => toRawString(self)

/** 获取值的类型标签 */
export const getTag = (self: unknown): string => toRawString(self).slice(8, -1)

/** 类型化实体 */
export const typedEntries = <T extends object>(obj: T): { [P in StringKeyOf<T>]: [ P, T[P] ]; }[StringKeyOf<T>][] =>
  Object.entries(obj) as { [P in StringKeyOf<T>]: [ P, T[P] ] }[StringKeyOf<T>][]

/** 映射对象的键和值，并返回新的对象 */
export const mapObject = <
  T extends Record<PropertyKey, unknown>,
  S extends Extract<keyof T, string> = Extract<keyof T, string>,
  R extends PropertyKey = S,
  V = unknown,
>(
  obj: T,
  mapper: <P extends S>(key: P, value: T[P]) => [ R, V ],
  keys?: readonly S[],
): { [P in R]: V; } => {
  const result = {} as { [P in R]: V }
  const selectedKeys = keys ?? (Object.keys(obj) as S[])
  
  for (const key of selectedKeys) {
    const [ newKey, value ] = mapper(key, obj[key])
    result[newKey] = value
  }
  
  return result
}

/** 将点分隔路径转换为键数组，支持使用 `\.` 转义点号 */
export const pathToKeys = (path: string): string[] => {
  if (isEmptyString(path)) return [ '' ]
  
  const keys: string[] = []
  let key = ''
  
  const pushKey = () => {
    key && keys.push(key)
    key = ''
  }
  
  const updateKey = (val: string) => {
    key += val
  }
  
  for (let i = 0; i < path.length; i++) {
    const char = path[i]
    
    if (char === '\\') {
      const next = path[i + 1]
      
      if (next === '.' || next === '\\' || next === '[' || next === ']') {
        updateKey(next)
        i++
      } else {
        updateKey('\\')
      }
    } else if (char === '.') {
      const pre = path[i - 1]
      const next = path[i + 1]
      
      !pre && keys.push('')
      
      if (pre === '.') {
        keys.push('')
      } else {
        pushKey()
      }
      
      !next && keys.push('')
    } else if (char === '[') {
      pushKey()
      
      let index = ''
      
      i++
      
      while (i < path.length && path[i] !== ']') {
        index += path[i]
        i++
      }
      
      keys.push(`[${ index }]`)
    } else {
      updateKey(char)
    }
  }
  
  pushKey()
  
  return keys
}

/** 根据键路径删除对象的嵌套属性 */
export const deleteProperty = (
  object: Dict,
  keys: readonly string[],
): boolean => {
  const last = keys.at(-1)
  if (isUndefined(last)) return false
  
  const arrKey = /^\[(\d+)]$/
  
  let target: any = object
  for (const key of keys.slice(0, -1)) {
    if (arrKey.test(key)) {
      const index = key.match(arrKey)?.[1]!
      target = target[index]
    } else {
      target = target[key]
    }
    
    if (!isObject(target)) {
      return false
    }
  }
  
  if (arrKey.test(last)) {
    const index = last.match(arrKey)?.[1]!
    delete target[index]
  } else {
    delete target[last]
  }
  
  return true
}

/** 根据点分隔路径删除对象的嵌套属性 */
export const unset = (object: Dict, path: string): boolean => {
  return deleteProperty(object, pathToKeys(path))
}

/** 根据键路径设置对象的嵌套属性 */
export const setProperty = (
  object: Dict,
  keys: readonly string[],
  value: unknown,
): boolean => {
  const last = keys.at(-1)
  if (isUndefined(last)) return false
  
  const arrKey = /^\[(\d+)]$/
  
  let target: any = object
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const next = keys[i + 1]
    
    if (!isObject(target[key])) {
      target[key] = arrKey.test(next) ? [] : {}
    }
    
    target = target[key]
  }
  
  if (arrKey.test(last)) {
    const index = last.match(arrKey)?.[1]!
    target[index] = value
  } else {
    target[last] = value
  }
  
  return true
}

/** 根据点分隔路径设置对象的嵌套属性 */
export const set = (object: Dict, path: string, value: unknown): boolean => {
  return setProperty(object, pathToKeys(path), value)
}

/** 根据键路径获取对象的嵌套属性 */
export const getProperty = <V>(
  object: Dict,
  keys: readonly string[],
): V | undefined => {
  const last = keys.at(-1)
  if (isUndefined(last)) return undefined
  
  const arrKey = /^\[(\d+)]$/
  
  let target: any = object
  for (const key of keys) {
    if (arrKey.test(key)) {
      const index = key.match(arrKey)?.[1]!
      target = target[index]
    } else {
      target = target[key]
    }
    
    if (isNullable(target)) {
      return undefined
    }
  }
  
  return target as V
}

/** 根据点分隔路径获取对象的嵌套属性 */
export const get = <V>(object: Dict, path: string): V | undefined => {
  return getProperty<V>(object, pathToKeys(path))
}

/** 克隆实例 */
export const cloneInstance = <T>(inst: T): T => {
  return Object.assign(Object.create(Object.getPrototypeOf(inst)), inst)
}
