import { describe, expect, it, vi } from 'vitest'
import { type Context, SetupManager } from '../src/index.js'


interface TestContext extends Context {
  logs: string[]
  value?: number
}

describe('SetupManager', () => {
  it('should execute setup functions in order', async () => {
    const manager = new SetupManager<TestContext>()
    
    manager.setSetup([
      (ctx) => {
        ctx.logs = [ 'setup1' ]
      },
      (ctx) => {
        ctx.logs.push('setup2')
      },
      (ctx) => {
        ctx.logs.push('setup3')
      },
    ])
    
    expect(manager.setupCount).toBe(3)
    expect(manager.onceSetupCount).toBe(3)
    
    const context = await manager.prepare(3)
    
    expect(context.logs).toEqual([
      'setup1',
      'setup2',
      'setup3',
    ])
  })
  
  it('should only execute setup once', async () => {
    const manager = new SetupManager<TestContext>()
    
    const setup1 = vi.fn((ctx: TestContext) => {
      ctx.logs = [ 'setup1' ]
    })
    
    const setup2 = vi.fn((ctx: TestContext) => {
      ctx.logs.push('setup2')
    })
    
    manager.setSetup([
      setup1,
      setup2,
    ])
    
    await manager.prepare(2)
    await manager.prepare(3)
    
    expect(setup1).toHaveBeenCalledTimes(1)
    expect(setup2).toHaveBeenCalledTimes(1)
  })
  
  it('should execute only newly added setup when level increases', async () => {
    const manager = new SetupManager<TestContext>()
    
    const setup1 = vi.fn()
    const setup2 = vi.fn()
    const setup3 = vi.fn()
    
    manager.setSetup([
      setup1,
      setup2,
      setup3,
    ])
    
    await manager.prepare(1)
    
    expect(setup1).toHaveBeenCalledTimes(1)
    expect(setup2).not.toHaveBeenCalled()
    expect(setup3).not.toHaveBeenCalled()
    
    await manager.prepare(3)
    
    expect(setup1).toHaveBeenCalledTimes(1)
    expect(setup2).toHaveBeenCalledTimes(1)
    expect(setup3).toHaveBeenCalledTimes(1)
  })
  
  it('should call teardown and rerun setup when preparing same level with "strict=true"', async () => {
    const manager = new SetupManager<TestContext>()
    
    const setup1 = vi.fn()
    const setup2 = vi.fn()
    const teardown = vi.fn()
    
    manager.setSetup([
      setup1,
      setup2,
    ])
    
    manager.setTeardown(teardown)
    
    await manager.prepare(2)
    await manager.prepare(2)
    
    expect(teardown).toHaveBeenCalledTimes(1)
    expect(setup1).toHaveBeenCalledTimes(2)
    expect(setup2).toHaveBeenCalledTimes(2)
  })
  
  it('should not call teardown and rerun setup when preparing same level with "strict=false"', async () => {
    const manager = new SetupManager<TestContext>()
    
    const setup1 = vi.fn()
    const setup2 = vi.fn()
    const teardown = vi.fn()
    
    manager.setSetup([
      setup1,
      setup2,
    ])
    
    manager.setTeardown(teardown)
    
    await manager.prepare(2)
    await manager.prepare(2, false)
    
    expect(teardown).toHaveBeenCalledTimes(0)
    expect(setup1).toHaveBeenCalledTimes(1)
    expect(setup2).toHaveBeenCalledTimes(1)
  })
  
  it('should call teardown and rerun setup when preparing lower level', async () => {
    const manager = new SetupManager<TestContext>()
    
    const setup1 = vi.fn()
    const setup2 = vi.fn()
    const setup3 = vi.fn()
    const teardown = vi.fn()
    
    manager.setSetup([
      setup1,
      setup2,
      setup3,
    ])
    
    manager.setTeardown(teardown)
    
    await manager.prepare(3)
    await manager.prepare(1)
    
    expect(teardown).toHaveBeenCalledTimes(1)
    
    expect(setup1).toHaveBeenCalledTimes(2)
    expect(setup2).toHaveBeenCalledTimes(1)
    expect(setup3).toHaveBeenCalledTimes(1)
  })
  
  it('should throw if teardown is missing when resetting', async () => {
    const manager = new SetupManager<TestContext>()
    
    manager.setSetup([
      () => {},
    ])
    
    await manager.prepare(1)
    
    await expect(manager.prepare(1))
      .rejects.toThrow('Missing teardown. Call `setTeardown()`.')
  })
  
  it('should share context between setup functions', async () => {
    const manager = new SetupManager<TestContext>()
    
    manager.setSetup([
      (ctx) => {
        ctx.value = 1
      },
      (ctx) => {
        ctx.value! += 2
      },
    ])
    
    const context = await manager.prepare(2)
    
    expect(context.value).toBe(3)
  })
  
  it('should return the different context instance', async () => {
    const manager = new SetupManager<TestContext>()
    
    manager.setSetup([
      (ctx) => {
        ctx.logs = []
      },
      (ctx) => {
        ctx.logs.push('setup2')
      },
    ])
    
    const context1 = await manager.prepare(1)
    const context2 = await manager.prepare(2)
    
    expect(context1).not.toBe(context2)
  })
})
