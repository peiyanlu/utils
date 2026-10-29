import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  getRemoteList,
  getRemoteNames,
  getRemoteUrl,
  gitRemote,
  gitRemoteAdd,
  gitRemoteGetUrl,
  gitRemoteRemove,
  gitRemoteRename,
  gitRemoteSetUrl,
  gitRemoteSync,
  shell,
} from '../../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.exec(`git init --bare ${ remoteDir1 }`)
      tool.exec(`git init --bare ${ remoteDir2 }`)
      tool.init()
    },
    () => { // 2
      tool.exec(`git remote add upstream ${ remoteDir2 }`)
    },
  ],
  afterAll,
  {
    onTeardown: () => {
      rmSync(remoteDir1, { recursive: true })
      rmSync(remoteDir2, { recursive: true })
    },
    onAfterAll: () => {
      rmSync(remoteDir1, { recursive: true })
      rmSync(remoteDir2, { recursive: true })
    },
  },
)

const remoteDir1 = join(TEMP_DIR, '..', 'test-remote-origin.git')
const remoteDir2 = join(TEMP_DIR, '..', 'test-remote-upstream.git')

shell.configure({
  cwd: TEMP_DIR,
})


describe('git remote integration', () => {
  it('gitRemote should execute remote command', async () => {
    await manager.prepare(1)
    
    await gitRemoteAdd('origin', remoteDir1)
    
    const result = await gitRemote([])
    expect(result?.trim()).toBe('origin')
  })
  
  it('gitRemoteSync should execute remote command', async () => {
    await manager.prepare(1)
    
    await gitRemoteAdd('origin', remoteDir1)
    
    const result = gitRemoteSync([])
    expect(result?.trim()).toBe('origin')
  })
  
  it('gitRemoteAdd should add remote', async () => {
    await manager.prepare(1)
    
    await gitRemoteAdd('origin', remoteDir1)
    
    expect(tool.exec('git remote').trim()).toBe('origin')
  })
  
  it('gitRemoteRename should rename remote', async () => {
    await manager.prepare(2)
    
    await gitRemoteRename('upstream', 'upstream-new')
    
    expect(tool.exec('git remote').trim()).toContain('upstream-new')
  })
  
  it('gitRemoteRemove should remove remote', async () => {
    await manager.prepare(2)
    
    await gitRemoteRemove('upstream')
    
    expect(tool.exec('git remote').trim()).toBe('')
  })
  
  it('getRemoteNames should return all remote names', async () => {
    await manager.prepare(1)
    
    await gitRemoteAdd('origin', remoteDir1)
    await gitRemoteAdd('upstream', remoteDir2)
    
    expect(await getRemoteNames()).toEqual([
      'origin',
      'upstream',
    ])
  })
  
  it('getRemoteUrl should return remote url', async () => {
    await manager.prepare(1)
    
    await gitRemoteAdd('origin', remoteDir1)
    
    expect(await getRemoteUrl('origin')).toContain(remoteDir1)
  })
  
  it('getRemoteUrl should support custom remote', async () => {
    await manager.prepare(1)
    
    await gitRemoteAdd('upstream', remoteDir2)
    
    expect(await getRemoteUrl('upstream'))
      .toContain(remoteDir2)
  })
  
  it('getRemoteList should return name and url', async () => {
    await manager.prepare(1)
    
    await gitRemoteAdd('origin', remoteDir1)
    await gitRemoteAdd('upstream', remoteDir2)
    
    expect(await getRemoteList()).toEqual([
      {
        name: 'origin',
        url: expect.stringContaining('remote-origin.git'),
      },
      {
        name: 'upstream',
        url: expect.stringContaining('remote-upstream.git'),
      },
    ])
  })
  
  it('getRemoteNames should return empty array when no remote exists', async () => {
    await manager.prepare(1)
    
    expect(await getRemoteNames()).toEqual([])
  })
  
  it('getRemoteList should return empty array when no remote exists', async () => {
    await manager.prepare(1)
    
    expect(await getRemoteList()).toEqual([])
  })
  
  it('gitRemoteSetUrl should get remote url', async () => {
    await manager.prepare(1)
    
    tool.exec(`git remote add origin ${ remoteDir1 }`)
    const remote = await gitRemoteGetUrl([ 'origin' ])
    expect(remote).toBe(remoteDir1)
  })
  
  it('gitRemoteGetUrl should set push remote url', async () => {
    await manager.prepare(2)
    
    await gitRemoteSetUrl([ '--push', 'upstream', remoteDir1 ])
    
    expect(tool.exec(`git remote get-url --push upstream`).trim()).toBe(remoteDir1)
  })
})
