import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, describe, expect, it } from 'vitest'
import {
  gitCommit,
  gitCommitAllowEmpty,
  gitCommitAmend,
  gitCommitAmendNoEdit,
  gitCommitMessage,
  shell,
} from '../../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.init()
      tool.writeFileSync('./package.json', '{"version": "1.0.0"}')
      tool.stage()
    },
    () => { // 2
      tool.exec('git update-ref -d HEAD')
      tool.writeFileSync('./a.txt', 'hello')
      tool.stage()
    },
    () => { // 3
      tool.exec('git update-ref -d HEAD')
      tool.commit('feat: before empty commit')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: TEMP_DIR,
})


describe('git commit integration', () => {
  it('gitCommit should execute commit command', async () => {
    await manager.prepare(1)
    
    await gitCommit([ '--message', 'first commit' ])
    
    const message = tool.exec('git log -1 --pretty=%s').trim()
    expect(message).toBe('first commit')
  })
  
  it('gitCommitMessage should create commit with message', async () => {
    await manager.prepare(2)
    
    await gitCommitMessage('feat: first')
    
    const message = tool.exec('git log -1 --pretty=%s').trim()
    expect(message).toBe('feat: first')
  })
  
  it('gitCommitAmend should replace previous commit message', async () => {
    await manager.prepare(1)
    
    await gitCommitMessage('gitCommitAmend first')
    await gitCommitAmend('gitCommitAmend second')
    
    const message = tool.exec('git log -1 --pretty=%s').trim()
    const count = tool.exec('git rev-list --count HEAD').trim()
    expect(message).toBe('gitCommitAmend second')
    expect(count).toBe('1')
  })
  
  it('gitCommitAmendNoEdit should preserve commit message', async () => {
    await manager.prepare(2)
    
    await gitCommitMessage('gitCommitMessage first')
    
    tool.writeFileSync('./c.txt', 'updated')
    tool.stage()
    
    await gitCommitAmendNoEdit()
    
    const message = tool.exec('git log -1 --pretty=%s').trim()
    expect(message).toBe('gitCommitMessage first')
    const count = tool.exec('git rev-list --count HEAD').trim()
    expect(count).toBe('1')
    expect(tool.exec('git show HEAD:c.txt')).toBe('updated')
  })
  
  it('gitCommitAllowEmpty should create empty commit', async () => {
    await manager.prepare(3)
    
    await gitCommitAllowEmpty('empty commit')
    
    const message = tool.exec('git log -1 --pretty=%s').trim()
    const count = tool.exec('git rev-list --count HEAD').trim()
    expect(message).toBe('empty commit')
    expect(count).toBe('2')
  })
  
  it('gitCommit should support additional args', async () => {
    await manager.prepare(1)
    
    await gitCommit([ '--message', 'signed', '--no-gpg-sign' ])
    
    const message = tool.exec('git log -1 --pretty=%s').trim()
    expect(message).toBe('signed')
  })
})
