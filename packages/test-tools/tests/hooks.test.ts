import { describe, expect, it, vi } from 'vitest'
import { Tool, useTool, useToolWithManager } from '../src/index.js'


describe('useTool', () => {
  it('should work with optional parameters using defaults', () => {
    const { tool, tempDir, tempDirName } = useTool(Tool)
    
    expect(tool).toBeInstanceOf(Tool)
    expect(tempDir.endsWith(tempDirName))
    expect(tool.existsSync(tempDir)).toBe(true)
    expect(tool.isDirSync(tempDir)).toBe(true)
    
    tool.cleanup()
  })
  
  it('should support function as parameter', () => {
    const { tool, tempDir, tempDirName } = useTool((cwd) => new Tool(cwd, {}))
    
    expect(tool).toBeInstanceOf(Tool)
    expect(tempDir.endsWith(tempDirName))
    expect(tool.existsSync(tempDir)).toBe(true)
    expect(tool.isDirSync(tempDir)).toBe(true)
    
    tool.cleanup()
  })
  
  it('should pass options to created tools', () => {
    const { tool } = useTool((cwd, env) => new Tool(cwd, env), { env: { TEST: 'test' } })
    expect(tool.env).toMatchObject({ TEST: 'test' })
    
    const { tool: tool1 } = useTool(Tool, { env: { TEST: 'test' } })
    expect(tool1.env).toMatchObject({ TEST: 'test' })
    
    tool.cleanup()
    tool1.cleanup()
  })
})

describe('useToolWithManager', () => {
  it('should work with optional parameters using defaults', async () => {
    const callbacks: (() => void)[] = []
    
    const { manager, tool, tempDir, tempDirName } = useToolWithManager(
      Tool,
      [
        (ctx) => {
          ctx.count = 1
        },
        (ctx) => {
          ctx.count = 2
        },
      ],
      fn => callbacks.push(fn),
    )
    
    expect(manager.setupCount).toBe(2)
    expect(manager.onceSetupCount).toBe(2)
    expect(tool.existsSync(tempDir)).toBe(true)
    expect(tempDir.endsWith(tempDirName)).toBe(true)
    
    const first = await manager.prepare(1)
    
    expect(first.count).toBe(1)
    
    const second = await manager.prepare(2)
    
    expect(second.count).toBe(2)
    
    const third = await manager.prepare(1)
    
    expect(third.count).toBe(1)
    
    expect(tool).toBeInstanceOf(Tool)
    expect(callbacks).toHaveLength(1)
    expect(tool.existsSync(tempDir)).toBe(true)
    
    callbacks[0]()
    
    expect(callbacks).toHaveLength(1)
    expect(tool.existsSync(tempDir)).toBe(false)
  })
  
  it('should support function as parameter', () => {
    const callbacks: (() => void)[] = []
    
    const { manager, tool, tempDir } = useToolWithManager(
      (cwd) => new Tool(cwd, {}),
      [
        (ctx) => {
          ctx.count = 1
        },
        (ctx) => {
          ctx.count = 2
        },
      ],
      fn => callbacks.push(fn),
    )
    
    expect(manager.setupCount).toBe(2)
    expect(manager.onceSetupCount).toBe(2)
    expect(tempDir).toBeDefined()
    expect(tool).toBeInstanceOf(Tool)
    expect(tool.existsSync(tempDir)).toBe(true)
    
    tool.cleanup()
  })
  
  it('should pass options to created tools', () => {
    const { tool } = useToolWithManager(
      Tool,
      [
        (ctx) => {
          ctx.count = 1
        },
        (ctx) => {
          ctx.count = 2
        },
      ],
      () => {},
      { env: { TEST: 'test' } },
    )
    expect(tool.env).toMatchObject({ TEST: 'test' })
    
    const { tool: tool1 } = useToolWithManager(
      (cwd, env) => new Tool(cwd, env),
      [
        (ctx) => {
          ctx.count = 1
        },
        (ctx) => {
          ctx.count = 2
        },
      ],
      () => {},
      { env: { TEST: 'test' } },
    )
    expect(tool1.env).toMatchObject({ TEST: 'test' })
    
    tool.cleanup()
    tool1.cleanup()
  })
  
  it('should prepare tool and execute lifecycle callbacks', async () => {
    const callbacks: (() => void)[] = []
    const onTeardown = vi.fn()
    const onAfterAll = vi.fn()
    
    const extraDir = 'extra-dir'
    const { manager, tempDir, tool } = useToolWithManager(
      Tool,
      [
        () => {
          tool.mkdirSync(extraDir, { recursive: true })
        },
      ],
      fn => callbacks.push(fn),
      {
        onTeardown,
        onAfterAll,
      },
    )
    
    expect(manager.setupCount).toBe(1)
    expect(manager.onceSetupCount).toBe(1)
    expect(tool.existsSync(tempDir)).toBe(true)
    
    await manager.prepare(1)
    
    expect(tool.existsSync(extraDir)).toBe(true)
    expect(onTeardown).toHaveBeenCalledTimes(0)
    expect(onAfterAll).toHaveBeenCalledTimes(0)
    
    await manager.prepare(1)
    
    expect(onTeardown).toHaveBeenCalledTimes(1)
    
    callbacks[0]()
    
    expect(callbacks).toHaveLength(1)
    expect(tool.existsSync(tempDir)).toBe(false)
    expect(onAfterAll).toHaveBeenCalledTimes(1)
    
    tool.rmSync(extraDir, { recursive: true, force: true })
  })
})
