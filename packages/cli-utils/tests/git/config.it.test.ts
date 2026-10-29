import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  gitConfig,
  gitConfigGet,
  gitConfigList,
  gitConfigSet,
  gitConfigSync,
  gitConfigUnset,
  shell,
} from '../../src/index.js'


const { manager, tool, tempDir } = useToolWithManager(
  (cwd) => new GitTool(cwd, { GIT_CONFIG_GLOBAL: join(cwd, `.gitconfig`) }),
  [
    () => { // 1
      tool.init()
    },
    () => { // 2
      tool.exec('git config user.name tester-local')
      tool.exec('git config user.email test-local@test.com')
    },
    () => { // 3
      tool.exec('git config --global user.name tester-global')
      tool.exec('git config --global user.email test-global@test.com')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: tempDir,
  env: {
    ...process.env,
    GIT_CONFIG_GLOBAL: join(tempDir, `.gitconfig`),
  },
})


describe('git config integration', () => {
  it('gitConfig should execute config command', async () => {
    await manager.prepare(1)
    
    await gitConfig([ 'user.name', 'tester-execute' ])
    
    const value = tool.exec('git config --get user.name').trim()
    expect(value).toBe('tester-execute')
  })
  
  it('gitConfigSync should execute config command synchronously', async () => {
    await manager.prepare(1)
    
    gitConfigSync([ 'user.name', 'tester-sync' ])
    
    const value = tool.exec('git config --get user.name').trim()
    expect(value).toBe('tester-sync')
  })
  
  it('gitConfigSet should set local config', async () => {
    await manager.prepare(1)
    
    await gitConfigSet('user.email', 'test-set-local@test.com')
    
    const value = tool.exec('git config --get user.email')
    expect(value.trim()).toBe('test-set-local@test.com')
  })
  
  it('gitConfigSet should set global config', async () => {
    await manager.prepare(1)
    
    await gitConfigSet('user.email', 'test-set-global@test.com', true)
    
    const value = tool.exec('git config --global --get user.email')
    expect(value.trim()).toBe('test-set-global@test.com')
  })
  
  it('gitConfigGet should return local config value', async () => {
    await manager.prepare(2)
    
    const value = await gitConfigGet('user.name')
    
    expect(value).toBe('tester-local')
  })
  
  it('gitConfigGet should return global config value', async () => {
    await manager.prepare(3)
    
    const value = await gitConfigGet('user.name', true)
    
    expect(value).toBe('tester-global')
  })
  
  it('gitConfigUnset should remove local config', async () => {
    await manager.prepare(2)
    
    await gitConfigUnset('user.name')
    
    const list = tool.exec('git config --list')
    expect(list).not.toContain('user.name=')
    expect(() => tool.exec('git config --get user.name')).toThrow(/Command failed/)
  })
  
  it('gitConfigUnset should remove global config', async () => {
    await manager.prepare(3)
    
    await gitConfigUnset('user.name', true)
    
    const list = tool.exec('git config --global --list')
    expect(list).not.toContain('user.name=')
    expect(() => tool.exec('git config --global --get user.name')).toThrow(/Command failed/)
  })
  
  it('gitConfigList should return config list', async () => {
    await manager.prepare(2)
    
    const list = await gitConfigList()
    
    expect(list).toContain('user.name=tester-local')
    expect(list).toContain('user.email=test-local@test.com')
  })
  
  it('gitConfigList should return global config list', async () => {
    await manager.prepare(3)
    
    const list = await gitConfigList(true)
    
    expect(list).toContain('user.name=tester-global')
    expect(list).toContain('user.email=test-global@test.com')
  })
})
