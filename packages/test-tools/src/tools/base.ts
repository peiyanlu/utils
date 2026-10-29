import type { ExecSyncOptionsWithStringEncoding } from 'node:child_process'
import { execSync } from 'node:child_process'
import {
  existsSync,
  type MakeDirectoryOptions,
  mkdirSync,
  readFileSync,
  type RmOptions,
  rmSync,
  type Stats,
  statSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'


export class Tool {
  constructor(public cwd: string, public env?: NodeJS.ProcessEnv | undefined) {}
  
  resolve(...paths: string[]): string {
    return resolve(this.cwd, ...paths)
  }
  
  mkdirSync(dir: string, options?: MakeDirectoryOptions): string | undefined {
    return mkdirSync(this.resolve(dir), options)
  }
  
  rmSync(target: string, options?: RmOptions): void {
    return rmSync(this.resolve(target), options)
  }
  
  writeFileSync(file: string, content: string): void {
    return writeFileSync(this.resolve(file), content)
  }
  
  readFileSync(file: string): Buffer<ArrayBuffer>
  readFileSync(file: string, encoding: BufferEncoding): string
  readFileSync(file: string, encoding?: BufferEncoding): string | Buffer<ArrayBuffer> {
    return readFileSync(this.resolve(file), encoding)
  }
  
  existsSync(target: string): boolean {
    return existsSync(this.resolve(target))
  }
  
  statSync(target: string): Stats {
    return statSync(this.resolve(target))
  }
  
  isDirSync = (path: string): boolean => {
    return this.existsSync(path) && this.statSync(path).isDirectory()
  }
  
  isFileSync = (path: string): boolean => {
    return this.existsSync(path) && this.statSync(path).isFile()
  }
  
  exec(cmd: string, options?: ExecSyncOptionsWithStringEncoding): string {
    return this.execRaw(cmd, options).trimEnd()
  }
  
  execRaw(cmd: string, options?: ExecSyncOptionsWithStringEncoding): string {
    return execSync(
      cmd.trim(),
      {
        cwd: this.cwd,
        stdio: 'pipe',
        encoding: 'utf-8',
        env: {
          ...process.env,
          ...this.env,
        },
        ...options,
      },
    )
  }
  
  cleanup(keepDir: boolean = false): void {
    this.rmSync(this.cwd, { recursive: true, force: true })
    keepDir && this.mkdirSync(this.cwd, { recursive: true })
  }
  
  [Symbol.dispose](): void {
    this.cleanup()
  }
}
