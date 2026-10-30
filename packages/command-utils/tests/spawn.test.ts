import { afterEach, describe, expect, it, vi } from 'vitest'
import { spawnAsync, spawnSyncRe } from '../src/index.js'


const nodePrint = (code: string) => [ '-e', code ]


afterEach(() => {
  vi.restoreAllMocks()
})


describe('spawnAsync', () => {
  it('returns stdout', async () => {
    await expect(spawnAsync('node', nodePrint('console.log("hello")'))).resolves.toBe('hello\n')
  })
  
  it('returns stdout and respects trimEnd', async () => {
    await expect(spawnAsync('node', nodePrint('console.log("hello")'), { trimEnd: true })).resolves.toBe('hello')
  })
  
  it('returns empty string on non-zero exit by default', async () => {
    await expect(spawnAsync('node', nodePrint('process.stderr.write("bad"); process.exit(1)'), {
      trimEnd: true,
    })).resolves.toBe('')
  })
  
  it('throws formatted error when error is throw', async () => {
    await expect(spawnAsync('node', nodePrint('process.exit(1)'), {
      error: 'throw',
      trimEnd: true,
    })).rejects.toThrow(/.*node -e/s)
  })
  
  it('logs error and returns empty string when error is log', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    await expect(spawnAsync('node', nodePrint('process.exit(1)'), {
      error: 'log',
      trimEnd: true,
    })).resolves.toBe('')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/.*node -e/s))
  })
  
  it('supports dryRun without executing command', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    await expect(spawnAsync('node', nodePrint('process.exit(1)'), {
      dryRun: true,
    })).resolves.toBe('')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\[dry-run].*node -e/s))
  })
  
  it('supports child.on.error', async () => {
    expect(await spawnAsync('node-err', [], {})).toBe('')
  })
  
  it('supports stderr', async () => {
    expect(await spawnAsync('node', [ '-vv' ], {})).toBe('')
  })
})

describe('spawnSyncRe', () => {
  it('returns stdout and respects trimEnd', () => {
    expect(spawnSyncRe('node', nodePrint('console.log("hello")'), { trimEnd: true })).toBe('hello')
  })
  
  it('returns stdout and respects not trimEnd', () => {
    expect(spawnSyncRe('node', nodePrint('console.log("hello")'))).toBe('hello\n')
  })
  
  it('returns empty string on non-zero exit by default', () => {
    expect(spawnSyncRe('node', nodePrint('process.exit(1)'))).toBe('')
  })
  
  it('throws formatted error when error is throw', () => {
    expect(() => spawnSyncRe('node', nodePrint('process.exit(1)'), {
      error: 'throw',
      trimEnd: true,
    })).toThrow(/.*node -e/s)
  })
  
  it('supports dryRun without executing command', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    expect(spawnSyncRe('node', nodePrint('process.exit(1)'), {
      dryRun: true,
    })).toBe('')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\[dry-run].*node -e/s))
  })
})
