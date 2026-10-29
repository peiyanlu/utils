import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, describe, expect, it } from 'vitest'
import { gitUnstageAll, gitUnstageFile, shell } from '../../src/index.js'


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
      tool.stage()
    },
    () => { // 3
      tool.writeFileSync('b.txt', 'changed')
      tool.stage()
    },
    () => { // 4
      tool.stage()
      tool.commit('feat: second commit')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: TEMP_DIR,
})


describe('git undo.unstage integration', () => {
  it('gitUnstageFile should remove file from index', async () => {
    await manager.prepare(2)
    
    expect(tool.stagedFiles()).not.toBe('')
    expect(tool.unstagedFiles()).toBe('')
    
    await gitUnstageFile('a.txt')
    
    expect(tool.stagedFiles()).toBe('')
    expect(tool.unstagedFiles()).not.toBe('')
  })
  
  it('gitUnstageAll should remove all staged changes', async () => {
    await manager.prepare(3)
    
    await gitUnstageAll()
    
    expect(tool.stagedFiles()).toBe('')
    expect(tool.unstagedFiles()).not.toBe('')
  })
})
