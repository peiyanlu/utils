import { isNotEmpty, isNumber, isUndefined } from '@peiyanlu/ts-utils'
import { clean, coerce, parse, prerelease, valid } from 'semver'


export interface ParsedVersion {
  version?: string;
  isPrerelease?: boolean;
  preId?: string;
  preBase?: string | false;
}

export enum PreId {
  ALPHA = 'alpha',
  BETA = 'beta',
  RC = 'rc',
  NEXT = 'next',
  CANARY = 'canary',
  NIGHTLY = 'nightly',
  DEV = 'dev',
}


/** 是否是预发行版本 */
export const isPrerelease = (version: string): boolean => Boolean(prerelease(version))


/** 是否是合法版本号 */
export const isValidVersion = (version: string): boolean => Boolean(valid(version))


/** 清理版本号 */
export const cleanVersion = (version: string): string => clean(version) ?? version


/** 解析版本号 */
export const parseVersion = (raw: string): ParsedVersion => {
  const version = isValidVersion(raw) ? raw : coerce(raw)?.toString()
  if (!version) return {}
  
  const parsed = parse(version)!
  const { prerelease: [ _idOrBase, _base ], prerelease } = parsed
  
  const isPrerelease = isNotEmpty(prerelease)
  
  const [ preId, preBase ] = isPrerelease
    ? isNumber(_idOrBase)
      ? [ '', String(_idOrBase) ]
      : [ _idOrBase, (isUndefined(_base) ? false : String(_base)) as (string | false) ]
    : []
  
  return { version, isPrerelease, preId, preBase }
}
