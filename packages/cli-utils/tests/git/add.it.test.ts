import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, describe, expect, it } from 'vitest'
import { gitAdd, gitAddAll, gitAddTracked, shell } from '../../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.init()
      tool.writeFileSync('./package.json', '{"version": "1.0.0"}')
      tool.stage()
      tool.commit('feat: first commit')
    },
    () => { // 2
      tool.writeFileSync('./a.txt', 'hello')
    },
    () => { // 3
      tool.exec('git reset --hard HEAD')
      tool.writeFileSync('./a.txt', 'hello')
      tool.writeFileSync('./b.txt', 'world')
    },
    () => { // 4
      tool.exec('git reset --hard HEAD')
      tool.writeFileSync('./a.txt', 'hello')
    },
    () => { // 5
      tool.exec('git reset --hard HEAD')
      tool.writeFileSync('./tracked.txt', 'v1')
      tool.stage('tracked.txt')
      tool.commit('feat: second commit')
      tool.writeFileSync('./tracked.txt', 'v2')
      tool.writeFileSync('./untracked.txt', 'new')
    },
    () => { // 6
      tool.exec('git reset --hard HEAD')
      tool.writeFileSync('./a.txt', 'hello')
      tool.writeFileSync('./b.txt', 'world')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: TEMP_DIR,
})


describe('git add integration', () => {
  it('gitAdd should stage specified file', async () => {
    await manager.prepare(2)
    
    const file = 'a.txt'
    await gitAdd([ file ])
    
    const output = tool.exec('git diff --cached --name-only')
    expect(output.trim()).toBe(file)
  })
  
  it('gitAddAll should stage all files', async () => {
    await manager.prepare(3)
    
    await gitAddAll()
    
    const output = tool.exec('git diff --cached --name-only')
    expect(output).toContain('a.txt')
    expect(output).toContain('b.txt')
  })
  
  it('gitAddAll should accept extra arguments', async () => {
    await manager.prepare(4)
    
    await gitAddAll([ 'a.txt' ])
    
    const output = tool.exec('git diff --cached --name-only')
    expect(output.trim()).toBe('a.txt')
  })
  
  it('gitAddTracked should stage only tracked files', async () => {
    await manager.prepare(5)
    
    await gitAddTracked()
    
    const output = tool.exec('git diff --cached --name-only')
    expect(output).toContain('tracked.txt')
    expect(output).not.toContain('untracked.txt')
  })
  
  it('gitAdd should support arbitrary arguments', async () => {
    await manager.prepare(6)
    
    await gitAdd([ 'a.txt', 'b.txt' ])
    
    const output = tool.exec('git diff --cached --name-only')
    expect(output).toContain('a.txt')
    expect(output).toContain('b.txt')
  })
})
