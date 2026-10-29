import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  getLatestTag,
  getLocalTags,
  getPreviousTag,
  getRemoteTags,
  gitPushTag,
  gitTag,
  gitTagAnnotated,
  gitTagDelete,
  gitTagDeleteSync,
  gitTagLightweight,
  gitTagSync,
  shell,
} from '../../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.init()
      tool.exec(`git init --bare ${ remoteDir }`)
      tool.exec(`git remote add origin ${ remoteDir }`)
      
      tool.writeFileSync('./package.json', '{"version": "1.0.0"}')
      tool.stage()
      tool.commit('feat: first commit')
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
  },
)

const remoteDir = join(TEMP_DIR, '..', 'test-tag-remote.git')

shell.configure({
  cwd: TEMP_DIR,
})


describe('git tag integration', () => {
  it('gitTag should create lightweight tag', async () => {
    await manager.prepare(1)
    
    await gitTag([ 'v1.0.0' ])
    
    expect(tool.exec('git tag').trim()).toBe('v1.0.0')
  })
  
  it('gitTagSync should create lightweight tag', async () => {
    await manager.prepare(1)
    
    gitTagSync([ 'v1.0.0' ])
    
    expect(tool.exec('git tag').trim()).toBe('v1.0.0')
  })
  
  it('gitTagDelete should delete local tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagDelete('v1.0.0')
    
    expect(tool.exec('git tag')).toBe('')
  })
  
  it('deleteTagSync should delete local tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    gitTagDeleteSync('v1.0.0')
    
    expect(tool.exec('git tag')).toBe('')
  })
  
  it('gitTagLightweight should create lightweight tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    
    expect(tool.exec('git tag').trim()).toBe('v1.0.0')
    expect(tool.exec('git cat-file -t refs/tags/v1.0.0').trim()).toBe('commit')
  })
  
  it('gitTagAnnotated should create annotated tag', async () => {
    await manager.prepare(1)
    
    await gitTagAnnotated('v1.0.0', 'release')
    
    expect(tool.exec('git tag').trim()).toBe('v1.0.0')
    expect(tool.exec('git cat-file -t refs/tags/v1.0.0').trim()).toBe('tag')
    expect(tool.exec('git tag -n99 v1.0.0').trim()).toContain('release')
  })
  
  it('getLocalTags should return empty array', async () => {
    await manager.prepare(1)
    
    expect(await getLocalTags()).toEqual([])
  })
  
  it('getLocalTags should return tags sorted by version', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v1.1.0')
    await gitTagLightweight('v2.0.0')
    await gitTagLightweight('v1.0.0-beta.1')
    
    expect(await getLocalTags('*', '*beta*')).toEqual([
      'v2.0.0',
      'v1.1.0',
      'v1.0.0',
    ])
  })
  
  it('getLocalTags should support match', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('test-1')
    
    expect(await getLocalTags('v*')).toEqual([
      'v1.0.0',
    ])
  })
  
  it('getLocalTags should support exclude', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v1.0.0-beta.1')
    
    expect(await getLocalTags('*', '*-beta.*')).toEqual([
      'v1.0.0',
    ])
  })
  
  it('getLocalTags should support count', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1')
    await gitTagLightweight('v2')
    await gitTagLightweight('v3')
    
    expect(
      await getLocalTags('*', '*-beta.*', '-v:refname', 2),
    ).toEqual([
      'v3',
      'v2',
    ])
  })
  
  it('getLatestTag should return latest tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v2.0.0')
    
    expect(await getLatestTag()).toBe('v2.0.0')
  })
  
  it('getLatestTag should ignore beta tags', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v2.0.0-beta.1')
    
    expect(await getLatestTag()).toBe('v1.0.0')
  })
  
  it('getLatestTag should return undefined when no tag exists', async () => {
    await manager.prepare(1)
    
    expect(await getLatestTag()).toBeUndefined()
  })
  
  it('getPreviousTag should return previous tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v2.0.0')
    await gitTagLightweight('v3.0.0')
    
    expect(await getPreviousTag('v3.0.0')).toBe('v2.0.0')
  })
  
  it('getPreviousTag should return undefined for oldest tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    
    expect(await getPreviousTag('v1.0.0')).toBeUndefined()
  })
  
  it('getRemoteTags should return empty array when remote has no tags', async () => {
    await manager.prepare(1)
    
    expect(await getRemoteTags()).toEqual([])
  })
  
  it('getRemoteTags should return remote tags sorted by version', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v2.0.0')
    
    await gitPushTag('origin', 'v1.0.0')
    await gitPushTag('origin', 'v2.0.0')
    
    expect(await getRemoteTags()).toEqual([
      'v2.0.0',
      'v1.0.0',
    ])
  })
})
