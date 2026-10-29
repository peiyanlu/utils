import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, describe, expect, it } from 'vitest'
import {
  gitRestoreAll,
  gitRestoreAllFrom,
  gitRestoreFile,
  gitRestoreFileFrom,
  gitRestoreIndexAllFrom,
  gitRestoreIndexFileFrom,
  gitRestoreWorktreeAllFrom,
  gitRestoreWorktreeFileFrom,
  shell,
  splitLines,
} from '../../src/index.js'


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
    () => { // 4
      tool.writeFileSync('a.txt', '11')
      tool.writeFileSync('b.txt', '22')
      tool.stage()
    },
    () => { // 5
      tool.commit('feat: third commit')
    },
  ],
  afterAll,
)

shell.configure({
  cwd: TEMP_DIR,
})


describe('git undo.restore integration', () => {
  it('gitRestoreFile should discard unstaged changes', async () => {
    await manager.prepare(2)
    
    tool.writeFileSync('a.txt', 'modified')
    
    await gitRestoreFile('a.txt')
    
    const content = tool.readFileSync('a.txt', 'utf8')
    expect(content).toBe('1')
  })
  
  it('gitRestoreAll should discard all unstaged changes', async () => {
    await manager.prepare(2)
    
    tool.writeFileSync('a.txt', 'a')
    tool.writeFileSync('b.txt', 'b')
    
    await gitRestoreAll()
    
    expect(tool.readFileSync('a.txt', 'utf8')).toBe('1')
    expect(tool.readFileSync('b.txt', 'utf8')).toBe('2')
  })
  
  describe('gitRestoreWorktreeFrom', () => {
    it('gitRestoreWorktreeFileFrom should restore file from specified commit', async () => {
      await manager.prepare(5)
      
      tool.writeFileSync('a.txt', 'changed')
      
      await gitRestoreWorktreeFileFrom('HEAD~1', 'a.txt')
      
      expect(tool.readFileSync('a.txt', 'utf8')).toBe('1')
    })
    
    it('gitRestoreWorktreeAllFrom should restore all files from specified commit', async () => {
      await manager.prepare(5)
      
      tool.writeFileSync('a.txt', 'changed')
      tool.writeFileSync('b.txt', 'changed')
      
      await gitRestoreWorktreeAllFrom('HEAD~1')
      
      expect(tool.readFileSync('a.txt', 'utf8')).toBe('1')
      expect(tool.readFileSync('b.txt', 'utf8')).toBe('2')
    })
  })
  
  describe('gitRestoreIndexFrom', () => {
    it('gitRestoreIndexFileFrom should restore file index from source', async () => {
      await manager.prepare(5)
      
      await gitRestoreIndexFileFrom('HEAD~1', 'a.txt')
      
      expect(tool.stagedFiles()).toBe('a.txt')
      expect(tool.unstagedFiles()).toBe('a.txt')
      expect(tool.exec('git show :a.txt')).toContain('1')
      expect(tool.readFileSync('a.txt', 'utf8')).toContain('11')
    })
    
    it('gitRestoreIndexAllFrom should restore index from source', async () => {
      await manager.prepare(5)
      
      await gitRestoreIndexAllFrom('HEAD~1')
      
      expect(splitLines(tool.stagedFiles())).toEqual([ 'a.txt', 'b.txt' ])
      expect(splitLines(tool.unstagedFiles())).toEqual([ 'a.txt', 'b.txt' ])
      expect(tool.exec('git show :a.txt')).toContain('1')
      expect(tool.readFileSync('a.txt', 'utf8')).toContain('11')
    })
  })
  
  describe('gitRestoreFrom', () => {
    it('gitRestoreFileFrom should discard file staged and unstaged changes from source', async () => {
      await manager.prepare(5)
      
      await gitRestoreFileFrom('HEAD~1', 'a.txt')
      // await gitRestoreFileFrom('HEAD~1', 'b.txt')
      await gitRestoreFileFrom('HEAD', 'b.txt')
      
      expect(tool.exec('git status --short')).not.toBe('')
      expect(tool.exec('git show :a.txt')).toBe('1')
      expect(tool.readFileSync('a.txt', 'utf-8')).toBe('1')
      
      expect(tool.exec('git show :b.txt')).toBe('22')
      expect(tool.readFileSync('b.txt', 'utf-8')).toBe('22')
    })
    
    it('gitRestoreAllFrom should discard all changes from source', async () => {
      await manager.prepare(5)
      
      await gitRestoreAllFrom('HEAD~1')
      
      expect(tool.exec('git status --short')).not.toBe('')
      expect(tool.exec('git show :a.txt')).toBe('1')
      expect(tool.readFileSync('a.txt', 'utf-8')).toBe('1')
    })
    
    it('gitRestoreAllFrom should discard all changes from HEAD', async () => {
      await manager.prepare(5)
      
      await gitRestoreAllFrom('HEAD')
      
      console.log(tool.exec('git diff --cached --name-only'))
      
      expect(tool.exec('git status --short')).toBe('')
      expect(tool.exec('git show :a.txt')).toBe('11')
      expect(tool.readFileSync('a.txt', 'utf-8')).toBe('11')
    })
  })
})
