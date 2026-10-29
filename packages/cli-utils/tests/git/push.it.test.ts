import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { gitPush, gitPushBranch, gitPushDeleteRef, gitPushTag, gitTag, shell } from '../../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.exec(`git init --bare ${ remoteDir }`)
      tool.init()
      tool.exec(`git remote add origin ${ remoteDir }`)
      
      tool.writeFileSync('./package.json', '{"version": "1.0.0"}')
      tool.stage()
      tool.commit('feat: first commit')
    },
    () => { // 2
      tool.exec('git checkout -b feature')
      tool.writeFileSync('./a.txt', '{"version": "1.0.0"}')
      tool.stage()
      tool.commit('feat: feature commit')
    },
    () => { // 3
      tool.exec('git checkout master')
    },
    () => { // 4
      tool.exec('git checkout -b to-delete')
      tool.writeFileSync('./a.txt', '{"version": "1.0.0"}')
      tool.stage()
      tool.commit('feat: to-delete commit')
    },
  ],
  afterAll,
  {
    onTeardown: () => {
      rmSync(remoteDir, { recursive: true })
    },
    onAfterAll: () => {
      rmSync(remoteDir, { recursive: true })
    },
  }
)

const remoteDir = join(TEMP_DIR, '..', 'test-push-remote.git')

shell.configure({
  cwd: TEMP_DIR,
})


describe('git push integration', () => {
  it('gitPush should push branch to remote', async () => {
    await manager.prepare(1)
    
    await gitPush([ 'origin', 'master' ])
    
    const refs = tool.exec(`git ls-remote origin refs/heads/master`)
    expect(refs).toContain('refs/heads/master')
  })
  
  it('pushBranch should push and set upstream', async () => {
    await manager.prepare(2)
    
    await gitPushBranch('origin', 'feature')
    
    const remote = tool.exec(`git ls-remote origin refs/heads/feature`)
    expect(remote.trim()).toContain('feature')
    
    const upstream = tool.exec(`git rev-parse --abbrev-ref --symbolic-full-name @{u}`)
    expect(upstream.trim()).toBe('origin/feature')
  })
  
  it('pushBranch should push and exists upstream', async () => {
    await manager.prepare(2)
    
    tool.exec(`git push --set-upstream origin feature --force`)
    tool.commit('feat: exists upstream')
    
    await gitPushBranch('origin', 'feature')
    
    const remote = tool.exec(`git ls-remote origin refs/heads/feature`)
    expect(remote.trim()).toContain('feature')
    
    const upstream = tool.exec(`git rev-parse --abbrev-ref --symbolic-full-name @{u}`)
    expect(upstream.trim()).toBe('origin/feature')
  })
  
  it('pushTag should push tag to remote', async () => {
    await manager.prepare(3)
    
    await gitTag([ 'v1.0.0' ])
    await gitPushTag('origin', 'v1.0.0')
    
    const tags = tool.exec(`git ls-remote --tags origin`)
    expect(tags).toContain('refs/tags/v1.0.0')
  })
  
  it('deleteRemote should delete remote branch', async () => {
    await manager.prepare(4)
    
    await gitPush([ 'origin', 'to-delete' ])
    await gitPushDeleteRef('origin', 'to-delete')
    
    const exists = tool.exec(`git ls-remote origin refs/heads/to-delete`)
    expect(exists).toBe('')
  })
})
