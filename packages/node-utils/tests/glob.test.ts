import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { resolve } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { createMatcher, scanFiles } from '../src/glob.js'


const { manager, tool } = useToolWithManager(
  GitTool,
  [
    () => {
      tool.writeFileSync('a.txt', 'a')
      tool.writeFileSync('a.json', '{"version": "1.0.1"}')
      tool.writeFileSync('b.json', '{ invalid json }')
    },
    () => {
      tool.mkdirSync('packages')
      tool.mkdirSync('node_modules')
    },
  ],
  afterAll,
)


describe('scanFiles', () => {
  it('should scan matched files', async () => {
    await manager.prepare(1)
    
    const result = scanFiles([ tool.cwd ], [ '**/*.json' ])
    
    expect(result).toHaveLength(2)
    
    expect(result.map(item => resolve(item.file)))
      .toEqual([
        tool.resolve('a.json'),
        tool.resolve('b.json'),
      ])
    
    expect(result[0].dir).toBe(tool.cwd)
  })
  
  it('should support dot files', async () => {
    await manager.prepare(1)
    tool.writeFileSync('.a.json', '{}')
    
    const result = scanFiles([ tool.cwd ], [ '**/*.json' ])
    
    expect(result).toHaveLength(3)
    
    expect(result.map(item => resolve(item.file)))
      .toEqual([
        tool.resolve('.a.json'),
        tool.resolve('a.json'),
        tool.resolve('b.json'),
      ])
    
    expect(result[0].dir).toBe(tool.cwd)
  })
  
  it('should ignore unmatched files', async () => {
    await manager.prepare(1)
    
    const result = scanFiles([ tool.cwd ], [ '**/*.png' ])
    
    expect(result).toEqual([])
  })
})

describe('createMatcher', () => {
  it('should support literal string', () => {
    const matcher = createMatcher('literal-string')
    
    expect(matcher('literal string')).toBe(false)
    expect(matcher('literal-string')).toBe(true)
  })
  
  it('should support regexp', () => {
    const matcher = createMatcher(/README\.[\w-]+\.md/)
    
    expect(matcher('README.md')).toBe(false)
    expect(matcher('README.en.md')).toBe(true)
    expect(matcher('README.zh.md')).toBe(true)
  })
  
  it('should support glob', () => {
    const matcher = createMatcher('*.config.{ts,cts,mts}')
    
    expect(matcher('tsdown.config.mts')).toBe(true)
    expect(matcher('vitest.config.mts')).toBe(true)
    expect(matcher('vitestconfig.mts')).toBe(false)
  })
})
