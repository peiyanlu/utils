import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, describe, expect, it } from 'vitest'
import { gitDiscardAll, gitDiscardFile, shell } from '../../src/index.js'


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
      tool.writeFileSync('b.txt', 'changed')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: TEMP_DIR,
})


describe('git undo.discard integration', () => {
  it('gitDiscardFile should discard file staged and unstaged changes', async () => {
    await manager.prepare(2)
    
    await gitDiscardFile('a.txt')
    await gitDiscardFile('b.txt')
    
    expect(tool.exec('git status --short')).toBe('')
    expect(tool.readFileSync('a.txt', 'utf-8')).toBe('1')
  })
  
  it('gitDiscardAll should discard all changes', async () => {
    await manager.prepare(2)
    
    await gitDiscardAll()
    
    expect(tool.exec('git status --short')).toBe('')
  })
})
