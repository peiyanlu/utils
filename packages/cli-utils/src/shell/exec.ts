import { dim } from 'ansis'
import { exec, execSync } from 'node:child_process'
import { stringifyArgs } from '../utils.js'
import { handleError } from './handle.js'
import { shell } from './options.js'
import type { ExecAsync, ExecAsyncOpts, ExecSync, ExecSyncOpts, ShellResult } from './types.js'


/** 异步执行 `exec` 获取字符串类型的结果 */
export const execAsync: ExecAsync = <TFallback = undefined>(
  cmd: string,
  argsOrOptions?: string[] | ExecAsyncOpts<TFallback>,
  maybeOptions?: ExecAsyncOpts<TFallback>,
) => {
  return new Promise<ShellResult<TFallback>>((resolve, reject) => {
    let command: string
    let options: ExecAsyncOpts<TFallback> | undefined
    
    if (Array.isArray(argsOrOptions)) {
      command = stringifyArgs([ cmd, ...argsOrOptions ])
      options = maybeOptions
    } else {
      command = cmd
      options = argsOrOptions
    }
    
    const resolved = shell.resolve<ExecAsyncOpts<TFallback>>(options ?? {})
    const { trimEnd, dryRun, error, fallback, ...others } = resolved
    
    if (dryRun) {
      console.log(`${ dim('[dry-run]') } ${ command }`)
      return resolve(fallback as ShellResult<TFallback>)
    }
    
    exec(
      command,
      { ...shell.resolve(others), encoding: 'utf-8' },
      (err, stdout, stderr) => {
        if (err) {
          const detail = stderr.toString() || err.message
          
          try {
            const res = handleError(command, fallback, error, detail)
            resolve(res as ShellResult<TFallback>)
          } catch (e) {
            reject(e)
          }
        }
        
        resolve(trimEnd ? stdout.trimEnd() : stdout)
      },
    )
  })
}


/** 执行 `execSync` 获取字符串类型的结果 */
export const execSyncRe: ExecSync = <TFallback = undefined>(
  cmd: string,
  argsOrOptions?: string[] | ExecSyncOpts<TFallback>,
  maybeOptions?: ExecSyncOpts<TFallback>,
) => {
  let command: string
  let options: ExecSyncOpts<TFallback> | undefined
  
  if (Array.isArray(argsOrOptions)) {
    command = stringifyArgs([ cmd, ...argsOrOptions ])
    options = maybeOptions
  } else {
    command = cmd
    options = argsOrOptions
  }
  
  const resolved = shell.resolve<ExecSyncOpts<TFallback>>(options ?? {})
  const { trimEnd, dryRun, error, fallback, ...others } = resolved
  
  if (dryRun) {
    console.log(`${ dim('[dry-run]') } ${ command }`)
    return fallback as ShellResult<TFallback>
  }
  
  try {
    const stdout = execSync(command, { ...others, encoding: 'utf-8' })
    
    return trimEnd ? stdout.trimEnd() : stdout
  } catch (e: any) {
    const detail = e?.stderr?.toString?.() || e?.message
    
    const res = handleError(command, fallback, error, detail)
    return res as ShellResult<TFallback>
  }
}

export { execSyncRe as execSyncWithString }
