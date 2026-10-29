import { createTempWorkspace, GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  coloredStatus,
  countCommitsSince,
  createUnbornBranch,
  fetchAllPrune,
  getFullHash,
  getLogSince,
  getShortHash,
  getShortStatus,
  gitDeleteHeadRef,
  gitSetHeadBranch,
  hasUpstream,
  initBareRepo,
  initRepo,
  isGitBareRepo,
  isGitRepo,
  isRemoteName,
  isWorkingTreeClean,
  resolveChangelogRange,
  shell,
} from '../../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.init()
      tool.initBare(remoteDir)
      tool.exec(`git remote add origin ${ remoteDir }`)
      
      tool.writeFileSync('./package.json', '{"version": "1.0.0"}')
      tool.stage()
      tool.commit('feat: first commit')
    },
    () => { // 2
      tool.exec(`git push origin master`)
    },
    () => { // 3
      tool.exec(`git branch --set-upstream-to=origin/master`)
    },
    () => { // 4
      tool.exec('git checkout -b feature')
      tool.exec('git push -u origin feature')
      tool.exec('git checkout master')
    },
    () => { // 5
      tool.exec(`git clone ${ remoteDir } ${ CLONE_DIR }`)
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

const remoteDir = join(TEMP_DIR, '..', 'test-misc-remote.git')
const { path: CLONE_DIR, remove: removeClone } = createTempWorkspace()


shell.configure({
  cwd: TEMP_DIR,
})


describe('git misc integration', () => {
  describe('repository', () => {
    it('isGitRepo should return false for normal directory', async () => {
      await manager.prepare(1)
      
      expect(await isGitRepo('C:/TEMP-NORMAL')).toBe(false)
    })
    
    it('isGitRepo should return true for git repository', async () => {
      await manager.prepare(1)
      
      tool.mkdirSync('a/b', { recursive: true })
      tool.writeFileSync('a/b/a.txt', 'aaa')
      
      expect(await isGitRepo(TEMP_DIR)).toBe(true)
      expect(await isGitRepo(`${ TEMP_DIR }/a`)).toBe(true)
    })
    
    it('isGitBareRepo should return false for normal directory', async () => {
      await manager.prepare(1)
      
      expect(await isGitBareRepo(TEMP_DIR)).toBe(false)
    })
    
    it('isGitBareRepo should return true for bare git repository', async () => {
      await manager.prepare(1)
      
      expect(await isGitBareRepo(remoteDir)).toBe(true)
    })
  })
  
  describe('upstream', () => {
    it('should return false when the current branch has no upstream', async () => {
      await manager.prepare(2)
      
      expect(await hasUpstream()).toBe(false)
    })
    
    it('should return true when the current branch has an upstream', async () => {
      await manager.prepare(3)
      
      expect(await hasUpstream('master')).toBe(true)
      expect(await hasUpstream('master')).toBe(await hasUpstream())
      expect(await hasUpstream()).toBe(true)
    })
  })
  
  describe('hash', () => {
    it('getFullHash should resolve HEAD to full hash', async () => {
      await manager.prepare(1)
      
      const hash = await getFullHash('HEAD')
      
      expect(hash).toMatch(/^[0-9a-f]{40}$/)
    })
    
    it('getShortHash should resolve HEAD to short hash', async () => {
      await manager.prepare(1)
      
      const hash = await getShortHash('HEAD')
      
      expect(hash).toMatch(/^[0-9a-f]{7,}$/)
      expect(hash!.length).toBeLessThan(40)
    })
    
    it('getShortHash should shorten a full hash', async () => {
      await manager.prepare(1)
      
      const full = await getFullHash('HEAD')
      const short = await getShortHash(full!)
      
      expect(full).toMatch(/^[0-9a-f]{40}$/)
      expect(short).toMatch(/^[0-9a-f]{7,}$/)
      expect(full!.startsWith(short!)).toBe(true)
    })
    
    it('getFullHash should expand a short hash', async () => {
      await manager.prepare(1)
      
      const full = await getFullHash('HEAD')
      const short = await getShortHash('HEAD')
      const expanded = await getFullHash(short!)
      
      expect(expanded).toBe(full)
    })
  })
  
  describe('fetch', () => {
    it('fetchAllPrune should execute successfully', async () => {
      await manager.prepare(3)
      
      await expect(fetchAllPrune()).resolves.toBeUndefined()
    })
    
    it('should remove stale remote-tracking refs via prune after remote deletion', async () => {
      await manager.prepare(5)
      
      tool.cwd = CLONE_DIR
      shell.configure({
        cwd: CLONE_DIR,
      })
      
      tool.exec('git fetch origin')
      
      // expect(tool.exec('git show-ref --verify refs/remotes/origin/master')).toBeDefined()
      
      tool.exec('git push origin --delete feature')
      
      await fetchAllPrune()
      
      expect(() => tool.exec('git show-ref --verify refs/remotes/origin/feature')).toThrow()
      expect(tool.exec('git show-ref --verify refs/remotes/origin/master')).toBeDefined()
      
      tool.cwd = TEMP_DIR
      shell.configure({
        cwd: TEMP_DIR,
      })
      removeClone()
    })
  })
  
  describe('getShortStatus', () => {
    it('should return empty string for clean working tree', async () => {
      await manager.prepare(1)
      
      expect(await getShortStatus()).toBe('')
    })
    
    it('should return modified tracked file', async () => {
      await manager.prepare(1)
      
      tool.writeFileSync('package.json', '{"version":"2.0.0"}')
      
      expect(await getShortStatus()).toBe(' M package.json')
    })
    
    it('should return staged file', async () => {
      await manager.prepare(1)
      
      tool.writeFileSync('package.json', '{"version":"2.0.0"}')
      tool.exec('git add package.json')
      
      expect(await getShortStatus()).toBe('M  package.json')
    })
    
    it('should ignore untracked files', async () => {
      await manager.prepare(1)
      
      tool.writeFileSync('new.txt', 'hello')
      
      expect(await getShortStatus()).toBe('?? new.txt')
    })
    
    it('should return both staged and unstaged status', async () => {
      await manager.prepare(1)
      
      tool.writeFileSync('package.json', '{"version":"2.0.0"}')
      tool.exec('git add package.json')
      tool.writeFileSync('package.json', '{"version":"3.0.0"}')
      
      expect(await getShortStatus()).toBe('MM package.json')
    })
  })
  
  it('coloredStatus()', async () => {
    await manager.prepare(1)
    
    tool.writeFileSync('package.json', '{"version":"2.0.0"}')
    tool.writeFileSync('a.txt', '1')
    tool.writeFileSync('c.txt', '2')
    tool.stage()
    tool.writeFileSync('b.txt', '2')
    tool.rmSync('c.txt')
    
    const changeset = coloredStatus((await getShortStatus())!).split('\n')
    expect(changeset).toEqual([
      '\x1B[32mA\x1B[39m  \x1B[2ma.txt\x1B[22m',
      '\x1B[32mA\x1B[39m\x1B[31mD\x1B[39m \x1B[2mc.txt\x1B[22m',
      '\x1B[33mM\x1B[39m  \x1B[2mpackage.json\x1B[22m',
      '\x1B[34m?\x1B[39m\x1B[34m?\x1B[39m \x1B[2mb.txt\x1B[22m',
    ])
  })
  
  it('resolveChangelogRange', async () => {
    await manager.prepare(1)
    
    expect(await resolveChangelogRange()).toMatchObject({ from: '', to: 'HEAD' })
    
    tool.exec('git tag v1.0.0')
    
    expect(await resolveChangelogRange()).toMatchObject({ from: 'v1.0.0', to: 'HEAD' })
    
    tool.commit('feta: second commit')
    tool.exec('git tag v2.0.0')
    
    tool.commit('feta: third commit')
    tool.exec('git tag v3.0.0')
    
    expect(await resolveChangelogRange(false)).toMatchObject({ from: 'v2.0.0', to: 'v3.0.0^1' })
  })
  
  it('isWorkingTreeClean', async () => {
    await manager.prepare(1)
    
    tool.writeFileSync('a.txt', '1')
    
    expect(await isWorkingTreeClean()).toBe(false)
    
    tool.stage()
    
    expect(await isWorkingTreeClean()).toBe(false)
  })
  
  it('countCommitsSince', async () => {
    await manager.prepare(1)
    
    tool.exec('git tag v1.0.0')
    
    expect(await countCommitsSince('v1.0.0')).toBe(0)
    expect(await countCommitsSince()).toBe(1)
    
    tool.commit('feta: second commit')
    tool.exec('git tag v2.0.0')
    
    expect(await countCommitsSince('v1.0.0')).toBe(1)
    expect(await countCommitsSince()).toBe(2)
    expect(await countCommitsSince('v3.0.0')).toBe(0)
  })
  
  it('should isRemoteName', async () => {
    await manager.prepare(4)
    
    expect(await isRemoteName('master')).toBe(false)
    expect(await isRemoteName('origin/master')).toBe(true)
    expect(await isRemoteName('feature')).toBe(false)
    expect(await isRemoteName('origin/feature')).toBe(true)
  })
  
  it('getLogSince', async () => {
    await manager.prepare(1)
    
    const log = await getLogSince('', 'HEAD', '.')
    expect(log?.split('\n').length).toBe(1)
    
    const head = tool.headHash()
    tool.commit('feta: second commit')
    
    tool.mkdirSync('a', { recursive: true })
    tool.writeFileSync('a/a.txt', '1')
    tool.stage()
    tool.commit('feta: third commit')
    
    const logFrom = await getLogSince(head)
    expect(logFrom?.split('\n').length).toBe(2)
    
    const logScope = await getLogSince('', 'HEAD', 'a/')
    expect(logScope?.split('\n').length).toBe(1)
    
    const logNoScope = await getLogSince('', 'HEAD')
    expect(logNoScope?.split('\n').length).toBe(3)
  })
  
  it('initBareRepo/initRepo', async () => {
    const { path: DIR } = createTempWorkspace()
    const remote = join(DIR, '..', 'remote-init.git')
    
    const cwd = process.cwd()
    
    process.chdir(DIR)
    await initRepo()
    await initBareRepo(remote)
    
    expect(await isGitRepo(DIR)).toBe(true)
    expect(await isGitBareRepo(remote)).toBe(true)
    
    process.chdir(cwd)
    rmSync(DIR, { recursive: true })
    rmSync(remote, { recursive: true })
  })
  
  it('gitSetHeadBranch', async () => {
    await manager.prepare(1)
    
    await gitSetHeadBranch('feature')
    
    const head = tool.exec('git symbolic-ref HEAD').trim()
    expect(head).toBe('refs/heads/feature')
  })
  
  it('gitDeleteHeadRef', async () => {
    await manager.prepare(1)
    
    expect(tool.commitCount()).toBe('1')
    
    await gitDeleteHeadRef()
    
    expect(() => tool.commitCount()).toThrow()
  })
  
  describe('createUnbornBranch', () => {
    it('should create unborn branch', async () => {
      await manager.prepare(1)
      
      tool.exec('git branch feature-a')
      
      await createUnbornBranch('feature-a')
      
      const head = tool.exec('git symbolic-ref HEAD').trim()
      expect(head).toBe('refs/heads/feature-a')
      
      const count = tool.exec('git rev-list --count HEAD 2>/dev/null || echo 0').trim()
      expect(Number(count)).toBe(0)
    })
    
    it('should stage existing index as additions', async () => {
      await manager.prepare(1)
      
      await createUnbornBranch('dev')
      
      const status = tool.exec('git status --short')
      expect(status).not.toBe('')
      
      expect(() => tool.headHash()).toThrow()
      expect(() => tool.commitCount()).toThrow()
    })
  })
})
