import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, expect, it } from 'vitest'
import { gitReset, gitResetSync, gitRestore, gitRestoreSync, shell } from '../../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.init()
      tool.commit('feat: first commit')
    },
    () => { // 2
      tool.writeFileSync('a.txt', '1')
      tool.writeFileSync('b.txt', '2')
      tool.stage()
    },
    () => { // 3
      tool.commit('feat: second commit')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: TEMP_DIR,
})


it('gitRestore should execute restore command', async () => {
  await manager.prepare(2)
  
  tool.writeFileSync('a.txt', 'changed')
  
  await gitRestore([ 'a.txt' ])
  
  expect(tool.readFileSync('a.txt', 'utf-8')).toBe('1')
})

it('gitRestoreSync should execute restore command', async () => {
  await manager.prepare(2)
  
  tool.writeFileSync('a.txt', 'changed')
  
  gitRestoreSync([ 'a.txt' ])
  
  expect(tool.readFileSync('a.txt', 'utf-8')).toBe('1')
})

it('gitReset should execute reset command', async () => {
  await manager.prepare(3)
  
  await gitReset([ '--soft', 'HEAD~1' ])
  
  expect(tool.exec('git rev-list --count HEAD').trim()).toBe('1')
})

it('gitResetSync should execute reset command', async () => {
  await manager.prepare(3)
  
  gitResetSync([ '--soft', 'HEAD~1' ])
  
  expect(tool.exec('git rev-list --count HEAD').trim()).toBe('1')
})
