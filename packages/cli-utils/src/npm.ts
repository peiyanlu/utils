import { join } from 'node:path'
import { lt } from 'semver'
import { readJsonFile } from './file-dir.js'
import { runNpm } from './shell.js'
import { parseVersion } from './version.js'


export const DEFAULT_TAG: string = 'latest'
export const DEFAULT_ACCESS: string = 'public'
export const DEFAULT_REGISTRY: string = 'https://registry.npmjs.org/'

export const accessArg = (access: string = DEFAULT_ACCESS): string[] => {
  return [ '--access', access ]
}

export const registryArg = (registry: string = DEFAULT_REGISTRY): string[] => {
  return [ '--registry', registry ]
}

export const tagArg = (tag: string = DEFAULT_TAG): string[] => {
  return [ '--tag', tag ]
}


/**
 * 获取 npm registry
 * @param {string} pkgDir
 * @returns {Promise<string>}
 * @defaults https://registry.npmjs.org/
 */
export const getRegistry = async (pkgDir: string): Promise<string> => {
  const n = (r: string) => r.endsWith('/') ? r : `${ r }/`
  
  const { publishConfig = {} } = readJsonFile(join(pkgDir, 'package.json'))
  const { registry } = publishConfig
  if (registry) return n(registry)
  
  const res = await runNpm([ 'config', 'get', 'registry' ], { cwd: pkgDir })
  if (res) return n(res)
  
  return 'https://registry.npmjs.org/'
}

/**
 * 获取 publish access
 * @param {string} pkgDir
 * @returns {Promise<string>}
 * @defaults scoped: restricted; unscoped: public
 */
export const getAccess = async (pkgDir: string): Promise<'restricted' | 'public'> => {
  const { name, publishConfig = {} } = readJsonFile(join(pkgDir, 'package.json'))
  const { access } = publishConfig
  return access || (name.startsWith('@') ? 'restricted' : 'public')
}

/**
 * 检查与仓库的连接
 * @param {string} registry
 * @returns {Promise<boolean>}
 * @defaults npm ping --registry https://registry.npmjs.org/
 */
export const pingRegistry = async (registry?: string): Promise<boolean> => {
  return (undefined !== await runNpm([ 'ping', ...registryArg(registry) ]))
}

/**
 * 获取已登录用户
 * @param {string} registry
 * @returns {Promise<string | undefined>}
 * @defaults npm whoami --registry https://registry.npmjs.org/
 */
export const getAuthenticatedUser = (registry?: string): Promise<string | undefined> => {
  return runNpm([ 'whoami', ...registryArg(registry) ])
}

/**
 * 用户是否拥有写入权限
 * @param {string} pkg
 * @param {string} user
 * @param {string} registry
 * @returns {Promise<boolean>}
 * @defaults npm access list collaborators <pkg> --json
 * npm access ls-collaborators <pkg> --json
 */
export const hasWriteAccess = async (pkg: string, user: string, registry?: string): Promise<boolean> => {
  const res = await runNpm([ 'access', 'list', 'collaborators', pkg, '--json', ...registryArg(registry) ])
  
  const collaborators: Record<string, string> = JSON.parse(res ?? '{}')
  const permissions: string | undefined = collaborators[user]
  
  return (permissions ?? '').includes('read-write')
}

/**
 * 获取指定包的版本
 * @param {string} pkg pkgName pkgName@tag
 * @param {string} registry
 * @returns {Promise<string | undefined>}
 * @defaults npm view <pkg> version
 */
export const getPublishedVersion = (pkg: string, registry?: string): Promise<string | undefined> => {
  return runNpm([ 'view', pkg, 'version', ...registryArg(registry) ])
}

/**
 * 获取所有已发布的 dist-tags
 * @param {string} pkg
 * @param {string} registry
 * @returns {Promise<string[]>}
 * @defaults npm view <pkg> dist-tags --json
 */
export const getDistTags = async (pkg: string, registry?: string): Promise<string[]> => {
  const res = await runNpm([ 'view', pkg, 'dist-tags', '--json', ...registryArg(registry) ])
  return Object.keys(JSON.parse(res || '{}'))
}

/**
 * 更新包版本号
 * @param {string} version
 * @param {string[]} args
 * @param {string} cwd
 * @returns {Promise<string | undefined>}
 * @defaults npm version <version> --workspaces=false --no-git-tag-version --allow-same-version
 */
export const bumpPackageVersion = (
  version: string,
  args: string[] = [],
  cwd: string = '.',
): Promise<string | undefined> => {
  return runNpm([
    'version',
    version,
    '--workspaces=false',
    '--no-git-tag-version',
    '--allow-same-version',
    ...args,
  ], { cwd })
}

/**
 * 发布
 * @param {{access?: string, registry?: string, tag?: string, args?: string[], cwd?: string}} options
 * @returns {Promise<string | undefined>}
 * @defaults npm publish --tag latest --access public --registry https://registry.npmjs.org/ --workspaces=false
 */
export const publishPackage = (options?: {
  access?: string
  registry?: string
  tag?: string
  args?: string[]
  cwd?: string
}): Promise<string | undefined> => {
  const { tag, access, registry, args = [], cwd = '.' } = options ?? {}
  return runNpm([
    'publish',
    ...tagArg(tag),
    ...accessArg(access),
    ...registryArg(registry),
    '--workspaces=false',
    ...args,
  ], { cwd, error: 'throw' })
}

/** 解析发布的 dist-tag */
export const resolvePublishTag = async (pkgName: string, version: string): Promise<string> => {
  const { isPrerelease, preId } = parseVersion(version)
  
  if (isPrerelease) return preId || 'next'
  
  const active = await getPublishedVersion(pkgName)
  if (!active) return 'latest'
  
  return lt(version, active) ? 'previous' : 'latest'
}

/** OTP 错误 */
export const isOtpError = (err: unknown): boolean =>
  err instanceof Error && /one-time password|otp/i.test(err.message)

/** 发布是否可以成功 */
export const canPublish = async (registry?: string): Promise<boolean> => {
  const res = await runNpm(
    [ 'publish', '--dry-run', '--access', 'public', ...registryArg(registry) ],
    { error: 'throw' },
  ).catch((err: Error) => err)
  
  const allowedErr = (err: Error) => {
    const matches = [ /previously published versions/i, /cannot publish over/i ]
    return matches.some(reg => reg.test(err.message))
  }
  
  if (!(res instanceof Error) || allowedErr(res)) {
    return true
  }
  
  throw res
}

/** 生成 npm 包指定版本的详情页地址 */
export const getPackageUrl = (pkg: string, version: string): string => {
  return `https://www.npmjs.com/package/${ pkg }/v/${ version }`
}
