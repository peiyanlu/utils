export interface CopyOptions {
  rename?: Record<string, string>
  /** @deprecated use `ignore` */
  skips?: ((name: string, isDir: boolean) => boolean)[]
  ignore?: ((name: string, isDir: boolean) => boolean)[]
}

export type CliOptions<T = string | boolean | number> = Record<string, T>

export interface PkgInfo {
  name: string
  version: string
}
