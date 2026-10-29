import { type ChildProcess, spawn } from 'node:child_process'
import { once } from 'node:events'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough, Readable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'
import {
  catchProcessError,
  catchReadableAbortError,
  exitCode,
  outputBuffer,
  outputBufferStream,
  outputString,
  outputStringStream,
  throwProcessError,
} from '../src/index.js'


const runNode = (code: string) => spawn(process.execPath, [ '-e', code ])


describe('exitCode', () => {
  it('should return an existing exit code after close', async () => {
    const child = spawn(process.execPath, [ '-e', 'process.exit(0)' ])
    
    await once(child, 'close')
    expect(await exitCode(child)).toBe(0)
  })
  
  it('should return the exit code after the process closes', async () => {
    const child = runNode('process.exitCode = 3')
    
    await expect(exitCode(child)).resolves.toBe(3)
  })
  
  it('should resolve null when called after the process was killed', async () => {
    const child = runNode('setInterval(() => {}, 1000)')
    await once(child, 'spawn')
    child.kill()
    await once(child, 'close')
    
    await expect(exitCode(child)).resolves.toBeNull()
  })
})

describe('catchProcessError', () => {
  it('should return null when the process exits successfully', async () => {
    const child = runNode('process.exitCode = 0')
    
    await expect(catchProcessError(child)).resolves.toBeNull()
  })
  
  it('should return a default error for a non-zero exit without stderr', async () => {
    const child = runNode('process.exitCode = 2')
    
    await expect(catchProcessError(child)).resolves.toMatchObject({
      message: 'Process exited with non-zero code',
    })
  })
  
  it('should handle a null stderr stream', async () => {
    const child = spawn(
      process.execPath,
      [ '-e', 'process.exitCode = 2' ],
      {
        stdio: [ 'ignore', 'pipe', 'ignore' ],
      },
    )
    
    expect(child.stderr).toBeNull()
    await expect(catchProcessError(child)).resolves.toMatchObject({
      message: 'Process exited with non-zero code',
    })
  })
  
  it('should use stderr as the error message', async () => {
    const child = runNode('process.stderr.write("command failed"); process.exitCode = 2')
    
    await expect(catchProcessError(child)).resolves.toMatchObject({
      message: 'command failed',
    })
  })
  
  it('should return the system error when the process cannot be spawned', async () => {
    const child = spawn(process.execPath, [ '-e', '' ], {
      cwd: join(tmpdir(), `missing-cwd-${ Date.now() }`),
    })
    
    await expect(catchProcessError(child)).resolves.toMatchObject({
      code: 'ENOENT',
    })
  })
  
  it('should capture a process spawn error', async () => {
    const child = spawn('node-err', [ '-v' ])
    
    await expect(catchProcessError(child)).resolves.toMatchObject({
      code: 'ENOENT',
    })
  })
})

describe('throwProcessError', () => {
  it('should resolve when the process exits successfully', async () => {
    const child = runNode('process.exitCode = 0')
    
    await expect(throwProcessError(child)).resolves.toBeUndefined()
  })
  
  it('should throw stderr when the process exits unsuccessfully', async () => {
    const child = runNode('process.stderr.write("command failed"); process.exitCode = 2')
    
    await expect(throwProcessError(child)).rejects.toThrow('command failed')
  })
  
  it('should throw a default error when stderr is empty', async () => {
    const child = runNode('process.exitCode = 2')
    
    await expect(throwProcessError(child)).rejects.toThrow('Process exited with non-zero code')
  })
})

describe('catchReadableAbortError', () => {
  it('should kill the process when async iteration is aborted', async () => {
    const child = {
      exitCode: null,
      kill: vi.fn(),
    } as unknown as ChildProcess
    const readable = Readable.from([ 1, 5, 10 ])
    catchReadableAbortError(child, readable)
    
    const abortError = new Promise<Error>(resolve => readable.once('error', resolve))
    const consumeUntilMatch = async () => {
      for await (const chunk of readable) {
        if (chunk > 1) return
      }
    }
    
    await consumeUntilMatch()
    await abortError
    expect(child.kill).toHaveBeenCalledWith('SIGKILL')
  })
  
  it('should not kill the process for a different stream error', () => {
    const child = {
      exitCode: null,
      kill: vi.fn(),
    } as unknown as ChildProcess
    const readable = new PassThrough()
    catchReadableAbortError(child, readable)
    
    readable.emit('error', new Error('Read failed'))
    
    expect(child.kill).not.toHaveBeenCalled()
  })
  
  it('should not kill the process after it has exited', () => {
    const child = {
      exitCode: 0,
      kill: vi.fn(),
    } as unknown as ChildProcess
    const readable = new PassThrough()
    catchReadableAbortError(child, readable)
    
    const error = new Error('The operation was aborted')
    error.name = 'AbortError'
    readable.emit('error', error)
    
    expect(child.kill).not.toHaveBeenCalled()
  })
})

describe('outputBufferStream', () => {
  it('should yield stdout chunks as buffers', async () => {
    const child = runNode('process.stdout.write("hello"); process.stdout.write(" world")')
    const chunks: Buffer[] = []
    
    for await (const chunk of outputBufferStream(child)) {
      chunks.push(chunk)
    }
    
    expect(chunks.every(Buffer.isBuffer)).toBe(true)
    expect(Buffer.concat(chunks).toString()).toBe('hello world')
  })
  
  it('should yield no chunks when stdout is null', async () => {
    const child = spawn(process.execPath, [ '-e', 'process.exitCode = 0' ], {
      stdio: [ 'ignore', 'ignore', 'ignore' ],
    })
    const chunks: Buffer[] = []
    
    for await (const chunk of outputBufferStream(child)) {
      chunks.push(chunk)
    }
    
    expect(child.stdout).toBeNull()
    expect(chunks).toEqual([])
  })
  
  it('should reject when the process exits unsuccessfully', async () => {
    const child = runNode('process.stderr.write("stream failed"); process.exitCode = 2')
    
    const consume = async () => {
      for await (const _chunk of outputBufferStream(child)) {
        // consume stdout before checking the process result
      }
    }
    
    await expect(consume()).rejects.toThrow('stream failed')
  })
})

describe('outputStringStream', () => {
  it('should decode stdout chunks into strings', async () => {
    const child = runNode('process.stdout.write("hello"); process.stdout.write(" world")')
    const chunks: string[] = []
    
    for await (const chunk of outputStringStream(child)) {
      chunks.push(chunk)
    }
    
    expect(chunks.join('')).toBe('hello world')
  })
  
  it('should decode a UTF-8 character split across stdout chunks', async () => {
    const child = runNode(
      'const bytes = Buffer.from("你"); process.stdout.write(bytes.subarray(0, 1)); setTimeout(() => process.stdout.write(bytes.subarray(1)), 30)',
    )
    const chunks: string[] = []
    
    for await (const chunk of outputStringStream(child)) {
      chunks.push(chunk)
    }
    
    expect(chunks.join('')).toBe('你')
  })
  
  it('should reject when the process exits unsuccessfully', async () => {
    const child = runNode('process.stderr.write("stream failed"); process.exitCode = 2')
    
    const consume = async () => {
      for await (const _chunk of outputStringStream(child)) {
        // consume stdout before checking the process result
      }
    }
    
    await expect(consume()).rejects.toThrow('stream failed')
  })
})

describe('outputBuffer', () => {
  it('should collect stdout as a buffer', async () => {
    const child = runNode('process.stdout.write("hello")')
    
    await expect(outputBuffer(child)).resolves.toEqual(Buffer.from('hello'))
  })
  
  it('should handle a null stdout stream', async () => {
    const child = spawn(
      process.execPath,
      [ '-e', 'console.log(999)' ],
      {
        stdio: [ 'ignore', 'ignore', 'ignore' ],
      },
    )
    
    expect(child.stdout).toBeNull()
    await expect(outputBuffer(child))
      .resolves.toEqual(Buffer.from(''))
  })
})

describe('outputString', () => {
  it('should collect stdout as a string', async () => {
    const child = runNode('process.stdout.write("hello")')
    
    await expect(outputString(child)).resolves.toBe('hello')
  })
  
  it('should preserve UTF-8 characters split across stdout chunks', async () => {
    const child = runNode(
      'const b = Buffer.from("你"); process.stdout.write(b.subarray(0, 1)); setTimeout(() => process.stdout.write(b.subarray(1)), 30)',
    )
    
    await expect(outputString(child)).resolves.toBe('你')
  })
  
  it('should reject with stderr when the process exits unsuccessfully', async () => {
    const child = runNode('process.stderr.write("failed"); process.exitCode = 2')
    
    await expect(outputString(child)).rejects.toThrow('failed')
  })
})
