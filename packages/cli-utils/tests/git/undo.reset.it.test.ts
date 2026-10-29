import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, describe, expect, it } from 'vitest'
import {
  gitResetHard,
  gitResetHardSync,
  gitResetKeep,
  gitResetKeepSync,
  gitResetMixed,
  gitResetMixedSync,
  gitResetSoft,
  gitResetSoftSync,
  headArg,
  shell,
} from '../../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.init()
      tool.writeFileSync('a.txt', '1')
      tool.writeFileSync('b.txt', '2')
      tool.stage()
      tool.commit('feat: first commit')
    },
    () => { // 2
      tool.writeFileSync('a.txt', 'changed')
      tool.writeFileSync('b.txt', 'changed')
      tool.stage()
      tool.commit('feat: second commit')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: TEMP_DIR,
})


describe('git undo.reset integration', () => {
  it('gitResetSoft should keep staged changes', async () => {
    await manager.prepare(2)
    
    await gitResetSoft()
    
    expect(tool.commitCount()).toBe('1')
    expect(tool.stagedFiles()).not.toBe('')
  })
  
  it('gitResetSoftSync should keep staged changes', async () => {
    await manager.prepare(2)
    
    gitResetSoftSync()
    
    expect(tool.commitCount()).toBe('1')
    expect(tool.stagedFiles()).not.toBe('')
  })
  
  it('gitResetMixed should keep unstaged changes', async () => {
    await manager.prepare(2)
    
    await gitResetMixed()
    
    expect(tool.commitCount()).toBe('1')
    expect(tool.unstagedFiles()).not.toBe('')
    expect(tool.stagedFiles()).toBe('')
  })
  
  it('gitResetMixedSync should keep unstaged changes', async () => {
    await manager.prepare(2)
    
    gitResetMixedSync()
    
    expect(tool.commitCount()).toBe('1')
    expect(tool.unstagedFiles()).not.toBe('')
    expect(tool.stagedFiles()).toBe('')
  })
  
  it('gitResetHard should discard all changes', async () => {
    await manager.prepare(2)
    
    await gitResetHard()
    
    expect(tool.commitCount()).toBe('1')
    expect(tool.exec('git status --short')).toBe('')
  })
  
  it('gitResetHardSync should discard all changes', async () => {
    await manager.prepare(2)
    
    gitResetHardSync()
    
    expect(tool.commitCount()).toBe('1')
    expect(tool.exec('git status --short')).toBe('')
  })
  
  it('gitResetKeep should reset HEAD, index and working tree', async () => {
    await manager.prepare(2)
    
    tool.writeFileSync('test.txt', 'v1')
    tool.stage()
    
    await gitResetKeep(1)
    
    expect(tool.stagedFiles()).toBe('')
  })
  
  it('gitResetKeepSync should reset HEAD, index and working tree', async () => {
    await manager.prepare(2)
    
    tool.writeFileSync('test.txt', 'v1')
    tool.stage()
    
    gitResetKeepSync(1)
    
    expect(tool.stagedFiles()).toBe('')
  })
  
  it('gitResetKeep should throw when local changes would be overwritten', async () => {
    await manager.prepare(2)
    
    tool.writeFileSync('test.txt', 'local-change')
    
    expect(await gitResetKeep(1)).toBeUndefined()
  })
  
  it('headArg should return valid parameters', () => {
    expect(headArg(0)).toEqual('HEAD')
    expect(headArg(1)).toEqual('HEAD~1')
  })
  
  it('headArg should throw error if count is less than 0', () => {
    expect(() => headArg(-1)).toThrow(RangeError)
  })
})
