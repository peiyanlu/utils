import { isNull } from '@peiyanlu/ts-utils'
import type { ChildProcess } from 'node:child_process'
import type { Readable } from 'node:stream'
import { concatBufferStream, concatStringStream, decodeUtf8 } from './stream.js'


export const exitCode = async (process: ChildProcess): Promise<number | null> => {
  // exit 事件时有数值，close 事件之后会保持该数值（close 在 exit 之后触发）
  if (!isNull(process.exitCode)) return process.exitCode
  // 由信号终止的进程会保持 exitCode 为 null
  // 如果 close 已经触发，再等待它会导致这个 Promise 永远处于挂起状态
  if (!isNull(process.signalCode)) return null
  return new Promise<number | null>(resolve => process.once('close', resolve))
}


export const catchProcessError = async (process: ChildProcess): Promise<Error | null> => {
  let error = new Error('Process exited with non-zero code')
  let stderr = ''
  
  const codePromise = exitCode(process)
  
  process.on('error', (err: Error) => error = err)
  
  if (process.stderr) {
    let chunk: Buffer
    for await (chunk of process.stderr) {
      stderr += chunk.toString()
    }
  } else {}
  
  if (stderr) {
    error = new Error(stderr)
  }
  
  return 0 !== await codePromise ? error : null
}


export const throwProcessError = async (process: ChildProcess): Promise<void> => {
  const error = await catchProcessError(process)
  if (error) throw error
}


export const catchReadableAbortError = (process: ChildProcess, readable: Readable): void => {
  readable.on('error', (err: Error) => {
    // 迭代被中断，例如：在 for-await 循环中 `break` 或 `return`
    if (err.name === 'AbortError' && isNull(process.exitCode)) {
      process.kill('SIGKILL')
    }
  })
}


export async function* outputBufferStream(process: ChildProcess): AsyncGenerator<Buffer> {
  const { stdout } = process
  const errorPromise = throwProcessError(process)
  
  if (stdout) {
    catchReadableAbortError(process, stdout)
    
    yield* stdout as AsyncIterable<Buffer>
  } else {}
  
  // 仅在迭代未被中断的情况下处理错误
  await errorPromise
}


export async function* outputStringStream(process: ChildProcess): AsyncGenerator<string> {
  yield* decodeUtf8(outputBufferStream(process))
}


export const outputBuffer = (process: ChildProcess): Promise<Buffer> => concatBufferStream(outputBufferStream(process))


export const outputString = (process: ChildProcess): Promise<string> => concatStringStream(outputStringStream(process))
