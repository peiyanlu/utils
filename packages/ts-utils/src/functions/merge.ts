import { isArray, isMap, isPlainObject, isSet } from './is.ts'


/**
 * 按来源值的类型递归合并两个值：数组拼接，Set 合并，普通对象和 Map 按键递归合并，其他值由来源覆盖。
 * 合并普通对象时会直接修改目标对象；数组、Set 和 Map 则返回新容器。
 */
export const merge = (target: unknown, source: unknown): unknown => {
  if (isArray(source)) {
    return [ ...isArray(target) ? target : [], ...source ]
  }
  
  if (isSet(source)) {
    return new Set([ ...isSet(target) ? target : [], ...source ])
  }
  
  if (isPlainObject(source)) {
    const result = (isPlainObject(target) ? target : {}) as Record<string, unknown>
    
    for (const [ key, value ] of Object.entries(source)) {
      result[key] = merge(result[key], value)
    }
    
    return result
  }
  
  if (isMap(source)) {
    const result = new Map(isMap(target) ? target : [])
    
    for (const [ key, value ] of source) {
      result.set(
        key,
        result.has(key) ? merge(result.get(key), value) : value,
      )
    }
    
    return result
  }
  
  return source
}
