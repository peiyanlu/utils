import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTempWorkspace, GitTool } from '../src/index.js'


let tool: GitTool
let cwd: string
let origin: string
let origin1: string

beforeEach(() => {
  ({ path: cwd } = createTempWorkspace())
  
  tool = new GitTool(cwd, {
    GIT_AUTHOR_NAME: 'test',
    GIT_AUTHOR_EMAIL: 'test@test.com',
    GIT_COMMITTER_NAME: 'test',
    GIT_COMMITTER_EMAIL: 'test@test.com',
  })
  
  origin = tool.resolve('../remote.git')
  origin1 = tool.resolve('../remote1.git')
})

afterEach(() => {
  tool?.cleanup()
  if (tool.existsSync(origin)) {
    tool?.rmSync(origin, { recursive: true })
  }
  if (tool.existsSync(origin1)) {
    tool?.rmSync(origin1, { recursive: true })
  }
})


describe('Repository', () => {
  it('init should initialize repository', () => {
    tool.init()
    
    expect(tool.currentBranch()).toBe('master')
  })
  
  it('init should support custom branch', () => {
    tool.init('main')
    
    expect(tool.currentBranch()).toBe('main')
  })
  
  it('initBare should create bare repository', () => {
    tool.init()
    tool.initBare(origin)
    
    const result = tool.exec(`git --git-dir=${ origin } rev-parse --is-bare-repository`)
    expect(result).toBe('true')
  })
  
  it('clone should work', () => {
    tool.initBare(origin)
    
    const { path, remove } = createTempWorkspace()
    expect(tool.clone(origin, path)).toBeDefined()
    expect(() => tool.clone('remote-unexist.git')).toThrow()
    
    remove()
  })
})

describe('Config', () => {
  it('config/globalConfig', () => {
    const { path: cwd } = createTempWorkspace()
    
    const config = '../.gitconfig'
    const tool = new GitTool(cwd, {
      GIT_CONFIG_GLOBAL: config,
    })
    
    tool.init()
    
    tool.globalConfig('user.name', 'gTester')
    expect(tool.globalConfig('user.name')).toBe('gTester')
    expect(tool.readFileSync(config, 'utf-8')).toContain('gTester')
    
    tool.config('user.name', 'lTester')
    expect(tool.config('user.name')).toBe('lTester')
    expect(tool.readFileSync('.git/config', 'utf-8')).toContain('lTester')
    
    tool.cleanup()
    tool.rmSync(config)
  })
})

describe('Remote', () => {
  it('addRemote should add remote url', () => {
    tool.init()
    tool.initBare(origin)
    tool.addRemote('origin', origin)
    tool.initBare(origin1)
    tool.addRemote('origin1', origin1)
    
    expect(tool.exec('git remote')).toContain('origin')
  })
  
  it('removeRemote should remove remote', () => {
    tool.init()
    tool.initBare(origin)
    tool.addRemote('origin', origin)
    tool.initBare(origin1)
    tool.addRemote('origin1', origin1)
    
    const remotes = tool.exec('git remote')
    expect(remotes.split('\n')).toStrictEqual([ 'origin', 'origin1' ])
    
    tool.removeRemote('origin1')
    const remotes1 = tool.exec('git remote')
    expect(remotes1.split('\n')).toStrictEqual([ 'origin' ])
  })
  
  it('upstream should return the current branch upstream', () => {
    tool.init()
    tool.initBare(origin)
    tool.addRemote('origin', origin)
    tool.commit('commit msg')
    tool.pushSetUpstream('origin')
    
    const up = tool.upstream()
    expect(up).toBe('origin/master')
  })
  
  it('push should push the current branch', () => {
    tool.init('master')
    tool.initBare(origin)
    tool.addRemote('origin', origin)
    tool.commit('commit msg')
    tool.push('origin')
    tool.fetch('origin')
    
    expect(tool.exec(`git --git-dir=${ origin } show-ref --verify refs/heads/master`)).toContain('refs/heads/master')
    expect(() => tool.upstream()).toThrow()
  })
  
  it('pushSetUpstream should ', () => {
    tool.init('master')
    tool.initBare(origin)
    tool.addRemote('origin', origin)
    tool.commit('commit msg')
    tool.pushSetUpstream('origin')
    
    expect(tool.upstream()).toBe('origin/master')
    expect(tool.upstream('master')).toBe('origin/master')
  })
  
  it('fetch should fetch tag', () => {
    tool.init()
    tool.commit('first commit')
    tool.tag('v0.0.1')
    tool.initBare(origin)
    tool.addRemote('origin', origin)
    tool.push('origin', 'v0.0.1')
    tool.deleteTag('v0.0.1')
    
    expect(tool.hasTag('v0.0.1')).toBe(false)
    
    tool.fetch('origin')
    
    expect(tool.hasTag('v0.0.1')).toBe(true)
  })
})

describe('References', () => {
  it('branch()', () => {
    tool.init()
    tool.commit('first commit')
    tool.branch('feature')
    
    expect(tool.exec('git branch --list feature')).toContain('feature')
  })
  
  it('deleteBranch()', () => {
    tool.init()
    tool.commit('first commit')
    tool.branch('feature')
    tool.branch('main')
    tool.branch('fix')
    
    expect(tool.branches().split('\n'))
      .toEqual(expect.arrayContaining([
        'master',
        'feature',
        'main',
        'fix',
      ]))
    
    tool.deleteBranch('feature')
    tool.deleteBranch('main')
    tool.deleteBranch('fix')
    
    expect(tool.branches().split('\n'))
      .toEqual(expect.arrayContaining([
        'master',
      ]))
  })
  
  it('checkout()', () => {
    tool.init()
    tool.commit('first commit')
    tool.branch('feature')
    tool.checkout('feature')
    
    expect(tool.currentBranch()).toBe('feature')
  })
  
  it('merge()', () => {
    tool.init()
    tool.commit('first commit')
    tool.branch('feature')
    tool.checkout('feature')
    tool.commit('feature commit')
    tool.checkout('master')
    tool.merge('feature')
    
    expect(tool.logOne()).toBe('feature commit')
  })
  
  it('tag()', () => {
    tool.init()
    tool.commit('first commit')
    tool.tag('v1.0.0')
    
    expect(tool.exec('git tag --list v1.0.0')).toContain('v1.0.0')
  })
  
  it('deleteTag()', () => {
    tool.init()
    tool.commit('commit msg')
    tool.tag('v1.0.0')
    tool.tag('v1.0.1')
    tool.tag('v1.0.2')
    
    expect(tool.tags().split('\n'))
      .toEqual(expect.arrayContaining([
        'v1.0.0',
        'v1.0.1',
        'v1.0.2',
      ]))
    
    tool.deleteTag('v1.0.1')
    
    expect(tool.tags().split('\n'))
      .toEqual(expect.arrayContaining([
        'v1.0.0',
        'v1.0.2',
      ]))
  })
  
  it('hasRef', () => {
    tool.init()
    tool.commit('first commit')
    
    expect(tool.hasRef('refs/heads/master')).toBe(true)
    expect(tool.hasRef('refs/heads/feature')).toBe(false)
  })
  
  // -----------------------
  
  it('currentBranch()', () => {
    tool.init()
    expect(tool.currentBranch()).toBe('master')
  })
  
  it('branches()', () => {
    tool.init()
    tool.commit('commit msg')
    tool.branch('feature')
    tool.branch('main')
    tool.branch('fix')
    
    expect(tool.branches().split('\n'))
      .toEqual(expect.arrayContaining([
        'master',
        'feature',
        'main',
        'fix',
      ]))
  })
  
  it('tags()', () => {
    tool.init()
    tool.commit('commit msg')
    tool.tag('v1.0.0')
    tool.tag('v1.0.1')
    tool.tag('v1.0.2')
    
    expect(tool.tags().split('\n'))
      .toEqual(expect.arrayContaining([
        'v1.0.0',
        'v1.0.1',
        'v1.0.2',
      ]))
  })
  
  it('revParse()', () => {
    tool.init()
    
    tool.commit('first')
    expect(tool.revParse('HEAD')).toBe(tool.headHash())
  })
  
  it('deleteHeadRef()', () => {
    tool.init()
    tool.commit('first commit')
    expect(tool.commitCount()).toBe('1')
    
    tool.deleteHeadRef()
    expect(() => tool.commitCount()).toThrow()
  })
})

describe('History', () => {
  it('commit should create commit', () => {
    tool.init()
    tool.commit('first commit')
    
    expect(tool.logOne()).toBe('first commit')
  })
  
  it('commit should allow empty commit', () => {
    tool.init()
    tool.commit('empty commit')
    
    expect(tool.commitCount()).toBe('1')
  })
  
  it('logOne()', () => {
    tool.init()
    tool.commit('first commit')
    
    expect(tool.logOne()).toBe('first commit')
  })
  
  it('commitCount()', () => {
    tool.init()
    
    expect(() => tool.commitCount()).toThrow()
    
    tool.commit('first')
    expect(tool.commitCount()).toBe('1')
    
    tool.commit('second')
    expect(tool.commitCount()).toBe('2')
  })
})

describe('Working Tree & Index', () => {
  it('stage should add file', () => {
    tool.init()
    tool.writeFileSync('a.txt', 'hello')
    tool.stage()
    
    expect(tool.stagedFiles()).toBe('a.txt')
  })
  
  it('stage should add specified file', () => {
    tool.init()
    tool.writeFileSync('a.txt', 'a')
    tool.writeFileSync('b.txt', 'b')
    tool.stage('a.txt')
    
    const output = tool.stagedFiles().split('\n')
    
    expect(output).toEqual([ 'a.txt' ])
  })
  
  it('status()', () => {
    tool.init()
    tool.writeFileSync('a.txt', 'a')
    
    expect(tool.status()).toBe('?? a.txt')
  })
  
  it('stagedFiles()', () => {
    tool.init()
    tool.writeFileSync('a.txt', 'a')
    tool.writeFileSync('b.txt', 'b')
    
    expect(tool.stagedFiles()).toBe('')
    
    tool.stage('a.txt')
    
    expect(tool.stagedFiles()).toBe('a.txt')
    
    tool.stage('b.txt')
    
    expect(tool.stagedFiles().split('\n')).toEqual([
      'a.txt',
      'b.txt',
    ])
  })
  
  it('unstagedFiles()', () => {
    tool.init()
    tool.writeFileSync('a.txt', 'a')
    tool.stage('a.txt')
    tool.commit('empty')
    
    expect(tool.unstagedFiles()).toBe('')
    
    tool.writeFileSync('a.txt', 'changed')
    
    expect(tool.unstagedFiles()).toBe('a.txt')
  })
  
  it('untrackedFiles()', () => {
    tool.init()
    tool.writeFileSync('a.txt', 'a')
    
    expect(tool.untrackedFiles()).toBe('a.txt')
  })
  
  it('resetHard', () => {
    tool.init()
    tool.writeFileSync('a.txt', 'a')
    tool.stage('a.txt')
    tool.commit('first commit')
    
    tool.writeFileSync('b.txt', 'b')
    tool.stage('b.txt')
    tool.writeFileSync('a.txt', 'update')
    tool.writeFileSync('c.txt', 'c')
    expect(tool.stagedFiles()).toBe('b.txt')
    expect(tool.unstagedFiles()).toBe('a.txt')
    expect(tool.untrackedFiles()).toBe('c.txt')
    
    tool.resetHard()
    expect(tool.status()).toBe('?? c.txt')
  })
})

describe('Syntactic sugar', () => {
  it('headHash()', () => {
    tool.init()
    tool.commit('first')
    
    const first = tool.headHash()
    
    tool.commit('second')
    
    const second = tool.headHash()
    
    expect(first).not.toBe(second)
  })
  
  it('lastAuthor/lastEmail', () => {
    const { path: cwd } = createTempWorkspace()
    using tool = new GitTool(cwd)
    
    tool.init()
    tool.exec('git config user.name tester')
    tool.exec('git config user.email test@email.com')
    
    tool.writeFileSync('a.txt', 'a')
    tool.stage('a.txt')
    tool.commit('first commit')
    
    expect(tool.lastAuthor()).toBe('tester')
    expect(tool.lastEmail()).toBe('test@email.com')
  })
  
  it('hasBranch', () => {
    tool.init()
    tool.commit('first commit')
    
    expect(tool.hasBranch('master')).toBe(true)
    expect(tool.hasBranch('feature')).toBe(false)
  })
  
  it('hasRemoteTrackingBranch', () => {
    tool.init()
    tool.commit('first commit')
    tool.initBare(origin)
    tool.addRemote('origin', origin)
    tool.push('origin')
    tool.fetch('origin')
    
    expect(tool.hasRemoteTrackingBranch('origin', 'master')).toBe(true)
    expect(tool.hasRemoteTrackingBranch('origin', 'feature')).toBe(false)
  })
  
  it('hasTag', () => {
    tool.init()
    tool.commit('first commit')
    tool.tag('v0.0.1')
    
    expect(tool.hasTag('v0.0.1')).toBe(true)
    
    tool.initBare(origin)
    tool.addRemote('origin', origin)
    tool.tag('v0.0.2')
    
    tool.push('origin', 'v0.0.2')
    
    tool.exec('git tag --delete v0.0.2')
    tool.exec('git fetch origin --tags')
    
    expect(tool.hasTag('v0.0.2')).toBe(true)
  })
})
