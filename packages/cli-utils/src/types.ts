export type CliOptions<T = string | boolean | number> = Record<string, T>

export interface PkgInfo {
  name: string
  version: string
}
