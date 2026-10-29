import { Stats } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTempWorkspace, Tool } from '../src/index.js'


describe('Tool', () => {
  let tool: Tool
  let cwd: string
  
  beforeEach(() => {
    ({ path: cwd } = createTempWorkspace())
    tool = new Tool(cwd)
  })
  
  afterEach(() => {
    tool.cleanup()
  })
  
  it('mkdirSync should create directory', () => {
    tool.mkdirSync('a/b', { recursive: true })
    
    expect(tool.existsSync('a/b')).toBe(true)
  })
  
  it('rmSync should remove file', () => {
    tool.writeFileSync('test.txt', 'hello')
    
    tool.rmSync('test.txt')
    
    expect(tool.existsSync('test.txt')).toBe(false)
  })
  
  it('writeFileSync/readFileSync/existsSync should work', () => {
    tool.writeFileSync('test.txt', 'hello')
    
    expect(tool.existsSync('test.txt')).toBe(true)
    expect(tool.readFileSync('test.txt', 'utf8')).toBe('hello')
    expect(tool.readFileSync('test.txt')).toBeInstanceOf(Buffer)
  })
  
  it('isDirSync/isFileSync should work', () => {
    tool.mkdirSync('a/b', { recursive: true })
    tool.writeFileSync('test.txt', 'hello')
    
    expect(tool.statSync('a/b')).toBeInstanceOf(Stats)
    
    expect(tool.isDirSync('a/b')).toBe(true)
    expect(tool.isFileSync('a/b')).toBe(false)
    
    expect(tool.isFileSync('test.txt')).toBe(true)
    expect(tool.isDirSync('test.txt')).toBe(false)
  })
  
  it('exec should execute in cwd', () => {
    tool.writeFileSync('a.txt', 'hello')
    
    const output = tool.exec('git ls-files 2>/dev/null || echo ok')
    expect(typeof output).toBe('string')
  })
  
  it('execRaw should execute in cwd', () => {
    tool.writeFileSync('a.txt', 'hello')
    
    expect(tool.exec('echo ok')).toBe('ok')
    expect(tool.execRaw('echo ok')).toMatch(/ok\r?\n/)
  })
  
  it('cleanup should remove cwd', () => {
    tool.writeFileSync('a.txt', 'hello')
    
    tool.cleanup()
    
    expect(tool.existsSync(cwd)).toBe(false)
  })
  
  it('cleanup(true) should recreate cwd', () => {
    tool.writeFileSync('a.txt', 'hello')
    
    tool.cleanup(true)
    
    expect(tool.existsSync(cwd)).toBe(true)
  })
})

describe('Tool [Symbol.dispose]', () => {
  it('mkdirSync should create directory', () => {
    const { path: cwd } = createTempWorkspace()
    using tool = new Tool(cwd)
    
    tool.mkdirSync('a/b', { recursive: true })
    
    expect(tool.existsSync('a/b')).toBe(true)
  })
})
