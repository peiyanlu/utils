import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { execAsync, execSyncRe } from '../src/index.js'


const nodePrint = (code: string) => [ '-e', code ]


afterEach(() => {
  vi.restoreAllMocks()
})


describe('execAsync', () => {
  it('returns string type', () => {
    expectTypeOf(execAsync('node -v')).toEqualTypeOf<Promise<string>>()
    expectTypeOf(execAsync('node', [ '-v' ])).toEqualTypeOf<Promise<string>>()
  })
  
  it('executes command string', async () => {
    await expect(execAsync(`node -e "console.log('123')"`, { trimEnd: true })).resolves.toBe('123')
  })
  
  it('executes command with args overload', async () => {
    await expect(execAsync('node', nodePrint(`"console.log('456')"`), { trimEnd: true })).resolves.toBe('456')
  })
  
  it('returns empty string on command failure', async () => {
    await expect(execAsync('node -e "process.exit(1)"')).resolves.toBe('')
  })
  
  it('throws when command fails and error is throw', async () => {
    await expect(execAsync('node -e "process.exit(1)"', {
      error: 'throw',
    })).rejects.toThrow(/.*node -e/s)
  })
  
  it('supports dryRun without executing command', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    await expect(execAsync('node -e "process.exit(1)"', {
      dryRun: true,
    })).resolves.toBe('')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\[dry-run].*node -e/s))
  })
})

describe('execSyncRe', () => {
  it('returns string type', () => {
    expectTypeOf(execSyncRe('node -v')).toEqualTypeOf<string>()
    expectTypeOf(execSyncRe('node', [ '-v' ])).toEqualTypeOf<string>()
  })
  
  it('executes command string', () => {
    expect(execSyncRe(`node -e "console.log('123')"`, { trimEnd: true })).toBe('123')
  })
  
  it('executes command with args overload', () => {
    expect(execSyncRe('node', nodePrint(`"console.log('456')"`), { trimEnd: true })).toBe('456')
  })
  
  it('returns empty string on command failure', () => {
    expect(execSyncRe('node -e "process.exit(1)"')).toBe('')
  })
  
  it('throws when command fails and error is throw', () => {
    expect(() => execSyncRe('node -e "process.exit(1)"', {
      error: 'throw',
    })).toThrow(/.*node -e/s)
  })
  
  it('supports dryRun without executing command', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    expect(execSyncRe('node -e "process.exit(1)"', {
      dryRun: true,
    })).toBe('')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\[dry-run].*node -e/s))
  })
})
