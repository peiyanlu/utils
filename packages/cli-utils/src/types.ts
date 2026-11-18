export type CliOptions<T = string | boolean | number> = Record<string, T>

/** @deprecated */
export interface PkgInfo {
  name: string
  version: string
}
