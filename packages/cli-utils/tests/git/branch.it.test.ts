import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  getLocalBranches,
  getRemoteBranches,
  gitBranch,
  gitBranchCurrent,
  gitBranchDelete,
  gitBranchDeleteForce,
  gitBranchMove,
  gitBranchMoveForce,
  shell,
} from '../../src/index.js'


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
      tool.exec('git checkout -b feature')
    },
    () => { // 3
      tool.exec('git checkout --detach')
    },
    () => { // 4
      tool.exec('git checkout -b old-name')
    },
    () => { // 5
      tool.exec('git checkout -b old-m-name')
      tool.exec('git checkout master')
      tool.exec('git checkout -b new-m-name')
      tool.exec('git checkout old-m-name')
    },
    () => { // 6
      tool.exec('git checkout -b feature1')
      tool.exec('git checkout master')
      tool.exec('git merge feature1')
    },
    () => { // 7
      tool.exec('git checkout -b feature2')
      tool.writeFileSync('./test.txt', 'hello')
      tool.exec('git add .')
      tool.exec('git commit -m "feat: test"')
      tool.exec('git checkout master')
    },
    () => { // 8
      tool.exec('git update-ref -d HEAD')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: TEMP_DIR,
})


describe('git branch integration', () => {
  it('gitBranch should create a new branch', async () => {
    await manager.prepare(1)
    
    const branch = 'only-create-branch'
    await gitBranch([ branch ])
    
    const branches = tool.exec('git branch')
    expect(branches).toContain(branch)
  })
  
  it('gitBranchCurrent should return current branch', async () => {
    await manager.prepare(2)
    
    await expect(gitBranchCurrent()).resolves.toBe('feature')
  })
  
  it('gitBranchCurrent should throw on detached HEAD', async () => {
    await manager.prepare(3)
    
    await expect(gitBranchCurrent()).rejects.toThrow('Detached HEAD')
  })
  
  it('moveBranch should rename branch', async () => {
    await manager.prepare(4)
    
    await gitBranchMove('old-name', 'new-name')
    
    const branches = tool.exec('git branch')
    
    expect(branches).toContain('new-name')
    expect(branches).not.toContain('old-name')
  })
  
  it('moveBranchForce should overwrite existing branch', async () => {
    await manager.prepare(5)
    
    await gitBranchMoveForce('old-name', 'new-name')
    
    const branches = tool.exec('git branch')
    
    expect(branches).toContain('new-name')
    expect(branches).not.toContain('old-name')
  })
  
  it('deleteBranch should delete merged branch', async () => {
    await manager.prepare(6)
    
    const branch = 'feature1'
    await gitBranchDelete(branch)
    
    const branches = tool.exec('git branch')
    
    expect(branches).not.toContain(branch)
  })
  
  it('deleteBranchForce should delete unmerged branch', async () => {
    await manager.prepare(7)
    
    const branch = 'feature2'
    await gitBranchDeleteForce(branch)
    
    const branches = tool.exec('git branch')
    
    expect(branches).not.toContain(branch)
  })
  
  it('getLocalBranches should return all branch names', async () => {
    await manager.prepare(2)
    
    expect(await getLocalBranches()).toEqual([
      'feature',
      'master',
    ])
  })
  
  it('getRemoteBranches should return all remote branch names', async () => {
    await manager.prepare(2)
    
    const remote = join(TEMP_DIR, '..', 'remote-branch.git')
    
    tool.initBare(remote)
    tool.exec(`git remote add origin ${ remote }`)
    tool.exec('git push -u origin master')
    tool.exec('git push -u origin feature')
    
    expect(await getRemoteBranches()).toEqual([
      'origin/feature',
      'origin/master',
    ])
    
    rmSync(remote, { recursive: true })
  })
})
