import { joinWithSpace } from '@peiyanlu/ts-utils'
import { exec, execSync } from 'node:child_process'
import { handleError } from './handle.js'
import { command } from './command.js'
import type { ExecAsync, ExecAsyncOpts, ExecSync, ExecSyncOpts, CommandOutput } from './types.js'


/** 异步执行 `exec` 获取字符串类型的结果 */
export const execAsync: ExecAsync = (
  cmd: string,
  argsOrOptions?: string[] | ExecAsyncOpts,
  maybeOptions?: ExecAsyncOpts,
): Promise<CommandOutput> => {
  return new Promise<CommandOutput>((resolve, reject) => {
    let fullCmd: string
    let options: ExecAsyncOpts | undefined
    
    if (Array.isArray(argsOrOptions)) {
      fullCmd = joinWithSpace([ cmd, ...argsOrOptions ])
      options = maybeOptions
    } else {
      fullCmd = cmd
      options = argsOrOptions
    }
    
    const resolved = command.resolve<ExecAsyncOpts>(options ?? {})
    const { trimEnd, dryRun, error, ...others } = resolved
    
    if (dryRun) {
      console.log(`[dry-run]${ fullCmd }`)
      return resolve('')
    }
    
    exec(
      fullCmd,
      { ...others, encoding: 'utf-8' },
      (sysErr, stdout, stderr) => {
        if (sysErr) {
          const detail = stderr || sysErr.message
          
          try {
            return resolve(handleError(fullCmd, detail, error))
          } catch (e) {
            return reject(e)
          }
        }
        
        return resolve(trimEnd ? stdout.trimEnd() : stdout)
      },
    )
  })
}


/** 执行 `execSync` 获取字符串类型的结果 */
export const execSyncRe: ExecSync = (
  cmd: string,
  argsOrOptions?: string[] | ExecSyncOpts,
  maybeOptions?: ExecSyncOpts,
): CommandOutput => {
  let fullCmd: string
  let options: ExecSyncOpts | undefined
  
  if (Array.isArray(argsOrOptions)) {
    fullCmd = joinWithSpace([ cmd, ...argsOrOptions ])
    options = maybeOptions
  } else {
    fullCmd = cmd
    options = argsOrOptions
  }
  
  const resolved = command.resolve<ExecSyncOpts>(options ?? {})
  const { trimEnd, dryRun, error, ...others } = resolved
  
  if (dryRun) {
    console.log(`[dry-run]${ fullCmd }`)
    return ''
  }
  
  try {
    const stdout = execSync(fullCmd, { ...others, encoding: 'utf-8' })
    
    return trimEnd ? stdout.trimEnd() : stdout
  } catch (e: any) {
    const stderr = e?.stderr?.toString()
    const detail = stderr || e?.message
    
    return handleError(fullCmd, detail, error)
  }
}
