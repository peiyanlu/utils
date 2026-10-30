import { createTempWorkspace } from '@peiyanlu/test-tools'
import { splitNonEmptyLines } from '@peiyanlu/ts-utils'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { command, spawnAsync } from '../src/index.js'


const { path: TEMP_DIR, remove } = createTempWorkspace()
const nodePrint = (code: string) => [ '-e', code ]


afterEach(() => {
  command.configure({
    cwd: undefined,
    env: undefined,
  })
  vi.restoreAllMocks()
})

afterAll(() => {
  remove()
})


describe('command options and wrappers', () => {
  it('applies global cwd and allows per-call cwd override', async () => {
    const first = join(TEMP_DIR, 'first')
    const second = join(TEMP_DIR, 'second')
    await mkdir(first, { recursive: true })
    await mkdir(second, { recursive: true })
    
    command.configure({ cwd: first })
    
    expect(await spawnAsync('node', nodePrint('console.log(process.cwd())'), { trimEnd: true })).toBe(first)
    expect(await spawnAsync('node', nodePrint('console.log(process.cwd())'), {
      cwd: second,
      trimEnd: true,
    })).toBe(second)
  })
  
  it('applies global env and allows per-call env override', async () => {
    command.configure({
      env: {
        ...process.env,
        COMMAND_TEST_VALUE: 'global',
      },
    })
    
    expect(await spawnAsync('node', nodePrint('console.log(process.env.COMMAND_TEST_VALUE)'), { trimEnd: true }))
      .toBe('global')
    expect(await spawnAsync('node', nodePrint('console.log(process.env.COMMAND_TEST_VALUE)'), {
      env: {
        ...process.env,
        COMMAND_TEST_VALUE: 'local',
      },
      trimEnd: true,
    })).toBe('local')
  })
  
  it('should apply scoped options to spawnAsync', async () => {
    const res = await command.run({
      env: {
        ...process.env,
        COMMAND_TEST_VALUE: 'local',
      },
      trimEnd: true,
    }, () => {
      return spawnAsync('node', nodePrint('console.log(process.env.COMMAND_TEST_VALUE)'))
    })
    expect(res).toBe('local')
    
    const nested = await command.run({
      env: {
        ...process.env,
        COMMAND_TEST_VALUE: 'local',
      },
      error: 'throw',
    }, () => {
      return command.run({
        trimEnd: true,
        error: 'throw',
      }, () => {
        return spawnAsync('node', nodePrint('console.log(process.env.COMMAND_TEST_VALUE)'))
      })
    })
    expect(nested).toBe('local')
  })
})
