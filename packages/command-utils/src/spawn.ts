import { joinWithSpace, once } from '@peiyanlu/ts-utils'
import { spawn, spawnSync } from 'node:child_process'
import { handleError } from './handle.js'
import { command } from './command.js'
import type { CommandOutput, SpawnAsyncOpts, SpawnSyncOpts } from './types.js'


/** 异步执行 `spawn` 获取字符串类型的结果 */
export const spawnAsync = (cmd: string, args: string[], options?: SpawnAsyncOpts): Promise<CommandOutput> => {
  return new Promise<CommandOutput>((resolve, reject) => {
    const resolved = command.resolve<SpawnAsyncOpts>(options ?? {})
    const { trimEnd, error, dryRun, ...others } = resolved
    const fullCmd = joinWithSpace([ cmd, ...args ])
    
    if (dryRun) {
      console.log(`[dry-run]${ fullCmd }`)
      return resolve('')
    }
    
    const child = spawn(cmd, args, { ...others })
    
    let stdout = ''
    child.stdout?.setEncoding('utf-8')
    child.stdout?.on('data', (d) => {
      stdout += d
    })
    
    let stderr = ''
    child.stderr?.setEncoding('utf-8')
    child.stderr?.on('data', (d) => {
      stderr += d
    })
    
    
    const handler = once((err: string) => {
      try {
        return resolve(handleError(fullCmd, err, error))
      } catch (e) {
        return reject(e)
      }
    })
    
    child.on('error', (sysErr) => handler(sysErr.message)) // 系统级错误（ENOENT）
    
    child.on('close', (code) => {
      if (code !== 0) {
        return handler(stderr)
      }
      
      return resolve(trimEnd ? stdout.trimEnd() : stdout)
    })
  })
}


/** 执行 `spawnSync` 获取字符串类型的结果 */
export const spawnSyncRe = (cmd: string, args: string[], options?: SpawnSyncOpts): CommandOutput => {
  const resolved = command.resolve<SpawnSyncOpts>(options ?? {})
  const { trimEnd, error, dryRun, ...others } = resolved
  const fullCmd = joinWithSpace([ cmd, ...args ])
  
  if (dryRun) {
    console.log(`[dry-run]${ fullCmd }`)
    return ''
  }
  
  const { stdout, stderr, status, error: sysErr } = spawnSync(
    cmd,
    args,
    { ...others, encoding: 'utf-8' },
  )
  
  if (sysErr || status !== 0) {
    const detail = stderr || sysErr?.message || `Exit status: ${ status }`
    
    return handleError(fullCmd, detail, error)
  }
  
  return trimEnd ? stdout.trimEnd() : stdout
}
