import { type Dict, isNullable } from '@peiyanlu/ts-utils'


export type QueryValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>


const isAbsoluteUrl = (url: string): boolean => /^https?:\/\//.test(url)

const newUrl = (url: string, base: string = 'https://web-utils.com'): URL => new URL(url, base)

const stringifyUrl = (url: URL, absolute: boolean): string =>
  absolute ? url.toString() : `${ url.pathname }${ url.search }${ url.hash }`


/** 对象转查询参数 */
export const toQueryString = (obj: Dict<QueryValue>): string => {
  const search = new URLSearchParams()
  
  Object.entries(obj).forEach(([ key, value ]) => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        search.append(key, String(item))
      })
    } else {
      search.set(key, String(value))
    }
  })
  
  return search.toString() ? `?${ search }` : ''
}

/** 构建 url */
export const buildUrl = (path: string, query: Dict<QueryValue>): string => {
  const url = newUrl(path)
  
  url.search = toQueryString(query)
  
  return stringifyUrl(url, isAbsoluteUrl(path))
}

/** 解析查询参数 */
export const parseQueryParams = (url: string): Dict<string | string[]> => {
  const search = newUrl(url).searchParams
  const keys = Array.from(new Set(search.keys()))
  
  const entries = keys.map(k => {
    const vals = search.getAll(k)
    const v = vals.length === 1 ? vals[0] : vals
    return [ k, v ]
  })
  
  return Object.fromEntries(entries)
}

/** 是否包含参数 */
export const hasQueryParam = (url: string, key: string): boolean => {
  return newUrl(url).searchParams.has(key)
}

/** 获取参数值 */
export const getQueryParam = (url: string, key: string): string | null => {
  return newUrl(url).searchParams.get(key)
}

/** 获取参数所有值 */
export const getQueryParams = (url: string, key: string): string[] => {
  return Array.from(newUrl(url).searchParams.getAll(key))
}

/** 设置查询参数 */
export const setQueryParam = (url: string, key: string, value: string): string => {
  const u = newUrl(url)
  
  u.searchParams.set(key, value)
  
  return stringifyUrl(u, isAbsoluteUrl(url))
}

/** 设置查询参数的多个值 */
export const setQueryParamValues = (url: string, key: string, values: string[]): string => {
  const u = newUrl(url)
  
  u.searchParams.delete(key)
  values.forEach(v => {
    u.searchParams.append(key, v)
  })
  
  return stringifyUrl(u, isAbsoluteUrl(url))
}

/** 移除查询参数 */
export const removeQueryParam = (url: string, key: string): string => {
  const u = newUrl(url)
  
  u.searchParams.delete(key)
  
  return stringifyUrl(u, isAbsoluteUrl(url))
}

/** 合并查询参数 */
export const mergeQueryParams = (
  url: string,
  params: Dict<string | number | boolean | null | undefined>,
): string => {
  const u = newUrl(url)
  
  Object.entries(params).forEach(([ key, value ]) => {
    if (isNullable(value)) {
      u.searchParams.delete(key)
    } else {
      u.searchParams.set(key, String(value))
    }
  })
  
  return stringifyUrl(u, isAbsoluteUrl(url))
}
