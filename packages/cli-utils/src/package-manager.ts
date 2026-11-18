import type { OptionalOrComplete } from '@peiyanlu/ts-utils'


export type ParsedPackageManager = OptionalOrComplete<{
  name: string;
  version: string;
}>


/** 获取执行脚本的包管理器 */
export const parsePackageManagerUserAgent = (userAgent: string | undefined = process.env.npm_config_user_agent): ParsedPackageManager => {
  if (!userAgent) return {}
  
  const [ name, version ] = userAgent.split(/\s+/)[0]?.split('/')
  return version ? { name, version } : {}
}

/** 是否是 npm */
export const isNpm = (v: string): v is 'npm' => 'npm' === v

/** 是否是 pnpm */
export const isPnpm = (v: string): v is 'pnpm' => 'pnpm' === v

/** 是否是 yarn */
export const isYarn = (v: string): v is 'yarn' => 'yarn' === v
