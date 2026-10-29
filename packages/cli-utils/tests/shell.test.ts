import { createTempWorkspace } from '@peiyanlu/test-tools'
import { readFileSync, rmSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  checkVersion,
  checkVersionSync,
  execAsync,
  execSyncRe,
  runNode,
  runNodeSync,
  runNpm,
  runNpmSync,
  shell,
  spawnAsync,
  spawnSyncRe,
  splitLines,
} from '../src/index.js'


const { path: TEMP_DIR, remove } = createTempWorkspace()
const nodePrint = (code: string) => [ '-e', code ]


afterEach(() => {
  shell.configure({
    cwd: undefined,
    env: undefined,
  })
})

afterAll(() => {
  remove()
})


describe('spawnAsync', () => {
  it('returns stdout and respects trimEnd', async () => {
    await expect(spawnAsync('node', nodePrint('console.log("hello")'), { trimEnd: true })).resolves.toBe('hello')
  })
  
  it('returns fallback on non-zero exit by default', async () => {
    await expect(spawnAsync('node', nodePrint('process.stderr.write("bad"); process.exit(1)'), {
      fallback: 'fallback',
      trimEnd: true,
    })).resolves.toBe('fallback')
  })
  
  it('throws formatted error when error is throw', async () => {
    await expect(spawnAsync('node', nodePrint('process.exit(1)'), {
      error: 'throw',
      trimEnd: true,
    })).rejects.toThrow(/.*node -e/s)
  })
  
  it('logs error and returns fallback when error is log', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    await expect(spawnAsync('node', nodePrint('process.exit(1)'), {
      error: 'log',
      fallback: 'fallback',
      trimEnd: true,
    })).resolves.toBe('fallback')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/.*node -e/s))
  })
  
  it('supports dryRun without executing command', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    await expect(spawnAsync('node', nodePrint('process.exit(1)'), {
      dryRun: true,
      fallback: 'dry',
    })).resolves.toBe('dry')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\[dry-run].*node -e/s))
  })
  
  it('supports child.on.error', async () => {
    expect(await spawnAsync('node-err', [], {})).toBe(undefined)
  })
  
  it('supports stderr', async () => {
    expect(await spawnAsync('node', [ '-vv' ], {})).toBe(undefined)
  })
})

describe('execAsync', () => {
  it('infers return type from fallback', () => {
    expectTypeOf(execAsync('node -v')).toEqualTypeOf<Promise<string | undefined>>()
    expectTypeOf(execAsync('node -v', { fallback: false })).toEqualTypeOf<Promise<string | boolean>>()
    expectTypeOf(execAsync('node', [ '-v' ], { fallback: 0 })).toEqualTypeOf<Promise<string | number>>()
  })
  
  it('executes command string', async () => {
    await expect(execAsync(`node -e "console.log('123')"`, { trimEnd: true })).resolves.toBe('123')
  })
  
  it('executes command with args overload', async () => {
    await expect(execAsync('node', [ '-e', `"console.log('456')"` ], { trimEnd: true })).resolves.toBe('456')
  })
  
  it('returns fallback on command failure', async () => {
    await expect(execAsync('node -e "process.exit(1)"', {
      fallback: 'fallback',
    })).resolves.toBe('fallback')
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
      fallback: 'dry',
    })).resolves.toBe('dry')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\[dry-run].*node -e/s))
  })
})

describe('spawnSyncRe', () => {
  it('returns stdout and respects trimEnd', () => {
    expect(spawnSyncRe('node', nodePrint('console.log("hello")'), { trimEnd: true })).toBe('hello')
  })
  
  it('returns stdout and respects not trimEnd', () => {
    expect(spawnSyncRe('node', nodePrint('console.log("hello")'))).toBe('hello\n')
  })
  
  it('returns fallback on non-zero exit by default', () => {
    expect(spawnSyncRe('node', nodePrint('process.exit(1)'), { fallback: 'fallback' })).toBe('fallback')
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
      fallback: 'dry',
    })).toBe('dry')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\[dry-run].*node -e/s))
  })
})

describe('execSyncRe', () => {
  it('infers return type from fallback', () => {
    expectTypeOf(execSyncRe('node -v')).toEqualTypeOf<string | undefined>()
    expectTypeOf(execSyncRe('node -v', { fallback: false })).toEqualTypeOf<string | boolean>()
    expectTypeOf(execSyncRe('node', [ '-v' ], { fallback: 0 })).toEqualTypeOf<string | number>()
  })
  
  it('executes command string', () => {
    expect(execSyncRe(`node -e "console.log('123')"`, { trimEnd: true })).toBe('123')
  })
  
  it('executes command with args overload', () => {
    expect(execSyncRe('node', [ '-e', `"console.log('456')"` ], { trimEnd: true })).toBe('456')
  })
  
  it('returns fallback on command failure', () => {
    expect(execSyncRe('node -e "process.exit(1)"', { fallback: 'fallback' })).toBe('fallback')
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
      fallback: 'dry',
    })).toBe('dry')
    
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\[dry-run].*node -e/s))
  })
})

describe('shell options and wrappers', () => {
  it('applies global cwd and allows per-call cwd override', async () => {
    const first = join(TEMP_DIR, 'first')
    const second = join(TEMP_DIR, 'second')
    await mkdir(first, { recursive: true })
    await mkdir(second, { recursive: true })
    
    shell.configure({ cwd: first })
    
    expect(await spawnAsync('node', nodePrint('console.log(process.cwd())'), { trimEnd: true })).toBe(first)
    expect(await spawnAsync('node', nodePrint('console.log(process.cwd())'), {
      cwd: second,
      trimEnd: true,
    })).toBe(second)
  })
  
  it('applies global env and allows per-call env override', async () => {
    shell.configure({
      env: {
        ...process.env,
        SHELL_TEST_VALUE: 'global',
      },
    })
    
    expect(await spawnAsync('node', nodePrint('console.log(process.env.SHELL_TEST_VALUE)'), { trimEnd: true }))
      .toBe('global')
    expect(await spawnAsync('node', nodePrint('console.log(process.env.SHELL_TEST_VALUE)'), {
      env: {
        ...process.env,
        SHELL_TEST_VALUE: 'local',
      },
      trimEnd: true,
    })).toBe('local')
  })
  
  it('should apply scoped options to spawnAsync', async () => {
    const res = await shell.run({
      env: {
        ...process.env,
        SHELL_TEST_VALUE: 'local',
      },
      trimEnd: true,
    }, () => {
      return spawnAsync('node', nodePrint('console.log(process.env.SHELL_TEST_VALUE)'))
    })
    expect(res).toBe('local')
    
    const nested = await shell.run({
      env: {
        ...process.env,
        SHELL_TEST_VALUE: 'local',
      },
      error: 'throw',
    }, () => {
      return shell.run({
        trimEnd: true,
        error: 'throw',
      }, () => {
        return spawnAsync('node', nodePrint('console.log(process.env.SHELL_TEST_VALUE)'))
      })
    })
    expect(nested).toBe('local')
  })
  
  it('runNode and runNodeSync delegate to node execution', async () => {
    await expect(runNode(nodePrint('console.log("async")'), { trimEnd: true })).resolves.toBe('async')
    expect(runNodeSync(nodePrint('console.log("sync")'), { trimEnd: true })).toBe('sync')
  })
  
  it('runs node cli with test environment flag and args', async () => {
    const cli = join(TEMP_DIR, 'cli.mjs')
    await writeFile(cli, [
      'console.log(process.env._VITE_TEST_CLI)',
      'console.log(process.argv.slice(2).join(","))',
    ].join('\n'))
    
    const res = runNodeSync([ cli, 'a', 'b' ], {
      env: { ...process.env, _VITE_TEST_CLI: 'true' },
    })
    expect(splitLines(res!)).toEqual([ 'true', 'a,b' ])
  })
  
  it('runNpm and runNpmSync delegate to npm execution', async () => {
    const { path: dir } = createTempWorkspace()
    const file = join(dir, 'package.json')
    await writeFile(file, '{"version": "1.0.0"}')
    
    await runNpm([ 'pkg', 'set', 'version="1.0.2"' ], { cwd: dir, error: 'throw' })
    expect(readFileSync(file, 'utf-8')).toBe('{"version":"1.0.2"}')
    
    runNpmSync([ 'pkg', 'set', 'version="1.0.3"' ], { cwd: dir })
    expect(readFileSync(file, 'utf-8')).toBe('{"version":"1.0.3"}')
    
    rmSync(dir, { recursive: true })
  })
  
  it('checkVersion runs --version command', async () => {
    await expect(checkVersion('node')).resolves.toMatch(/^v\d+\.\d+\.\d+/)
  })
  
  it('checkVersionSync runs --version command', () => {
    expect(checkVersionSync('node')).toMatch(/^v\d+\.\d+\.\d+/)
  })
  
  it('captures multi-line output consistently', async () => {
    const script = join(TEMP_DIR, 'multi-line.mjs')
    await writeFile(script, 'console.log("a")\nconsole.log("b")')
    
    const str = await spawnAsync('node', [ script ])
    expect(splitLines(str!)).toEqual([ 'a', 'b' ])
  })
})
