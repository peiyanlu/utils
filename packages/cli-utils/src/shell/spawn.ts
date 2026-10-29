import { dim } from 'ansis'
import { spawn, spawnSync } from 'node:child_process'
import { stringifyArgs } from '../utils.js'
import { handleError } from './handle.js'
import { shell } from './options.js'
import type { ShellResult, SpawnAsyncOpts, SpawnSyncOpts } from './types.js'


/** 异步执行 `spawn` 获取字符串类型的结果 */
export const spawnAsync = <TFallback = undefined>(
  cmd: string,
  args: string[],
  options?: SpawnAsyncOpts<TFallback>,
): Promise<ShellResult<TFallback>> => {
  return new Promise<ShellResult<TFallback>>((resolve, reject) => {
    const resolved = shell.resolve<SpawnAsyncOpts<TFallback>>(options ?? {})
    const { trimEnd, error, dryRun, fallback, ...others } = resolved
    const fullCmd = stringifyArgs([ cmd, ...args ])
    
    if (dryRun) {
      console.log(`${ dim('[dry-run]') } ${ fullCmd }`)
      return resolve(fallback as ShellResult<TFallback>)
    }
    
    const child = spawn(cmd, args, { ...others })
    
    let stdout = ''
    child.stdout?.setEncoding('utf-8')
    child.stdout?.on('data', (d) => {
      stdout += trimEnd ? d.trimEnd() : d
    })
    
    let stderr = ''
    child.stderr?.setEncoding('utf-8')
    child.stderr?.on('data', (d) => {
      stderr += trimEnd ? d.trimEnd() : d
    })
    
    
    const handler = (err: string) => {
      try {
        const res = handleError<TFallback>(fullCmd, fallback, error, err)
        resolve(res as ShellResult<TFallback>)
      } catch (e) {
        reject(e)
      }
    }
    
    child.on('error', (sysErr) => handler(sysErr.message)) // 系统级错误（ENOENT）
    
    child.on('close', (code) => {
      if (code !== 0) {
        handler(stderr)
      }
      
      resolve(stdout)
    })
  })
}


/** 执行 `spawnSync` 获取字符串类型的结果 */
export const spawnSyncRe = <TFallback = undefined>(
  cmd: string,
  args: string[],
  options?: SpawnSyncOpts<TFallback>,
): ShellResult<TFallback> => {
  const resolved = shell.resolve<SpawnSyncOpts<TFallback>>(options ?? {})
  const { trimEnd, error, dryRun, fallback, ...others } = resolved
  const fullCmd = stringifyArgs([ cmd, ...args ])
  
  if (dryRun) {
    console.log(`${ dim('[dry-run]') } ${ fullCmd }`)
    return fallback as ShellResult<TFallback>
  }
  
  const { stdout, stderr, status, error: sysErr } = spawnSync(
    cmd,
    args,
    { ...others, encoding: 'utf-8' },
  )
  
  if (status !== 0) {
    const detail = sysErr?.message || stderr?.toString()
    const res = handleError<TFallback>(fullCmd, fallback, error, detail)
    
    return res as ShellResult<TFallback>
  }
  
  return trimEnd ? stdout.trimEnd() : stdout
}

export { spawnSyncRe as spawnSyncWithString }
