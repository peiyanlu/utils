import { existsSync } from 'fs'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createTempWorkspace, createTempDirectory } from '../src/index.js'


describe('createTempWorkspace', () => {
  it('should create temp dir', () => {
    const { path, name, remove } = createTempWorkspace()
    
    expect(name).toMatch(/temp-/)
    expect(path.endsWith(name)).toBe(true)
    expect(existsSync(path)).toBe(true)
    
    remove()
    
    expect(existsSync(path)).toBe(false)
  })
  
  it('should create temp dir with parent', () => {
    const { path, name, remove } = createTempWorkspace('.')
    
    expect(name).toMatch(/temp-/)
    expect(path.endsWith(name)).toBe(true)
    expect(existsSync(path)).toBe(true)
    
    remove()
  })
  
  it('should not throw error when path is removed', () => {
    const { path, remove, empty } = createTempWorkspace()
    
    rmSync(path, { recursive: true })
    
    expect(existsSync(path)).toBe(false)
    expect(() => remove()).not.toThrow()
    expect(() => empty()).not.toThrow()
    
    remove()
  })
  
  it('should empty dir', () => {
    const { path, remove, empty } = createTempWorkspace()
    
    writeFileSync(join(path, 'test.txt'), 'test')
    expect(existsSync(join(path, 'test.txt'))).toBe(true)
    
    empty()
    
    expect(existsSync(join(path, 'test.txt'))).toBe(false)
    
    remove()
  })
})

it('createTempDirectory should create dir', () => {
  const dir = createTempDirectory()
  
  expect(dir).toMatch(/temp-/)
  expect(existsSync(dir)).toBe(true)
  
  rmSync(dir, { recursive: true })
})
