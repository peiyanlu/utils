import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, describe, expect, it } from 'vitest'
import { gitRevertCommit, shell } from '../../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.init()
      tool.writeFileSync('a.txt', '1')
      tool.stage()
      tool.commit('feat: first commit')
    },
    () => { // 2
      tool.writeFileSync('b.txt', '2')
      tool.stage()
      tool.commit('feat: second commit')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: TEMP_DIR,
})


describe('git undo.revert integration', () => {
  it('gitRevertCommit should create revert commit', async () => {
    await manager.prepare(2)
    
    const head = tool.exec('git rev-parse HEAD')
    await gitRevertCommit(head.trim())
    
    expect(tool.exec('git rev-list --count HEAD').trim())
      .toBe('3')
    
    expect(tool.exec('git log -1 --pretty=%s'))
      .toContain('Revert')
  })
})
