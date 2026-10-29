import { resolve } from 'node:path'
import { readJsonFile } from './file-dir.js'


export interface PackageJson {
  name: string
  version: string
  private?: boolean
  publishConfig?: {
    access?: string
    registry?: string
    [key: string]: any
  }
  
  [key: string]: any
}

export interface PackageContext {
  pkg: PackageJson
  pkgDir: string
  pkgPath: string
}


export const isScopedPackageName = (name: string): boolean =>
  /^@[a-z0-9-]+\/.+$/.test(name)

export const isValidPackageName = (name: string): boolean =>
  /^(?:@[a-z0-9-]+\/)?[a-z0-9][a-z0-9._~-]*$/.test(name)

export const toValidPackageName = (name: string): string => name
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/^[._]/, '')
  .replace(/[^a-z\d\-~]+/g, '-')

export const toValidProjectName = (name: string): string => name
  .trim()
  .replace(/[<>:"\\|?*]/g, '')
  .replace(/\/+$/g, '')

export const getPackageInfo = (pkgName: string, getPkgDir: (pkg: string) => string): PackageContext => {
  const pkgDir = resolve(getPkgDir(pkgName))
  const pkgPath = resolve(pkgDir, 'package.json')
  const pkg = readJsonFile(pkgPath) as PackageJson
  
  return { pkg, pkgDir, pkgPath }
}

/**
 * 通过包管理器执行脚本时生效
 * @defaults UserAgent: `process.env.npm_config_user_agent`
 */
export const pkgFromUserAgent = (userAgent?: string): { name: string; version: string; } | undefined => {
  if (!userAgent) return undefined
  const [ pkgSpec ] = userAgent.split(' ')
  const [ name, version ] = pkgSpec.split('/')
  return { name, version }
}
