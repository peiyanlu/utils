import { createTempWorkspace } from '@peiyanlu/test-tools'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { copyDirAsync, editFile, editJsonFile, emptyDir, isEmpty, readJsonFile, readSubDirs } from '../src/index.js'


const { path: TEMP_DIR } = createTempWorkspace()


afterEach(async () => {
  await rm(TEMP_DIR, { recursive: true })
  await mkdir(TEMP_DIR, { recursive: true })
})

afterAll(async () => {
  await rm(TEMP_DIR, { recursive: true })
})


describe('dir', () => {
  it('emptyDir returns false when directory does not exist', async () => {
    expect(await emptyDir(join(TEMP_DIR, 'not-exist'))).toBe(false)
  })
  
  it('emptyDir removes files except ignored', async () => {
    await writeFile(join(TEMP_DIR, 'a.txt'), 'a')
    await writeFile(join(TEMP_DIR, 'b.txt'), 'b')
    
    await emptyDir(TEMP_DIR, [ 'b.txt' ])
    
    const files = await readdir(TEMP_DIR)
    expect(files).toEqual([ 'b.txt' ])
  })
  
  it('isEmpty respects ignore', async () => {
    await writeFile(join(TEMP_DIR, '.gitkeep'), '')
    expect(await isEmpty(TEMP_DIR, [ '.gitkeep' ])).toBe(true)
  })
  
  it('isEmpty returns false when non-ignored files exist', async () => {
    await writeFile(join(TEMP_DIR, '.gitkeep'), '')
    await writeFile(join(TEMP_DIR, 'a.txt'), 'a')
    
    expect(await isEmpty(TEMP_DIR, [ '.gitkeep' ])).toBe(false)
  })
  
  it('readSubDirs returns sub directories except ignored names', async () => {
    await mkdir(join(TEMP_DIR, 'packages'), { recursive: true })
    await mkdir(join(TEMP_DIR, 'node_modules'), { recursive: true })
    await writeFile(join(TEMP_DIR, 'package.json'), '{}')
    
    expect(await readSubDirs(TEMP_DIR, [ 'node_modules' ])).toEqual([ 'packages' ])
  })
  
  it('readSubDirs returns all sub directories', async () => {
    await mkdir(join(TEMP_DIR, 'packages'), { recursive: true })
    await mkdir(join(TEMP_DIR, 'node_modules'), { recursive: true })
    await writeFile(join(TEMP_DIR, 'package.json'), '{}')
    
    expect(await readSubDirs(TEMP_DIR)).toEqual([ 'node_modules', 'packages' ])
  })
  
  it('copyDirAsync copies directory with rename & skip rules', async () => {
    const src = join(TEMP_DIR, 'src')
    const dest = join(TEMP_DIR, 'dest')
    
    await mkdir(join(src, 'sub'), { recursive: true })
    await writeFile(join(src, 'a.txt'), 'a')
    await writeFile(join(src, '_gitignore'), 'git')
    
    await copyDirAsync(src, dest, {
      rename: {
        _gitignore: '.gitignore',
      },
      skips: [
        (name) => name === 'a.txt',
      ],
    })
    
    const files = await readdir(dest)
    expect(files).toContain('.gitignore')
    expect(files).not.toContain('a.txt')
  })
  
  it('copyDirAsync copies directory with default behavior', async () => {
    const src = join(TEMP_DIR, 'src')
    const dest = join(TEMP_DIR, 'dest')
    
    await mkdir(join(src, 'sub'), { recursive: true })
    await writeFile(join(src, 'a.txt'), 'a')
    await writeFile(join(src, '_gitignore'), 'git')
    
    await copyDirAsync(src, dest)
    
    const files = await readdir(dest)
    expect(files).toContain('sub')
    expect(files).toContain('_gitignore')
    expect(files).toContain('a.txt')
  })
  
  it('copyDirAsync copies nested directories and can skip directories', async () => {
    const src = join(TEMP_DIR, 'src')
    const dest = join(TEMP_DIR, 'dest')
    
    await mkdir(join(src, 'sub'), { recursive: true })
    await mkdir(join(src, 'ignored'), { recursive: true })
    await writeFile(join(src, 'sub', 'a.txt'), 'a')
    await writeFile(join(src, 'ignored', 'b.txt'), 'b')
    
    await copyDirAsync(src, dest, {
      skips: [
        (name, isDir) => isDir && name === 'ignored',
      ],
    })
    
    expect(await readFile(join(dest, 'sub', 'a.txt'), 'utf-8')).toBe('a')
    expect(existsSync(join(dest, 'ignored'))).toBe(false)
  })
})


describe('file', () => {
  it('editFile skips missing file', async () => {
    const file = join(TEMP_DIR, 'missing.txt')
    
    await editFile(file, () => 'created')
    
    expect(existsSync(file)).toBe(false)
  })
  
  it('editFile edits text file', async () => {
    const file = join(TEMP_DIR, 'a.txt')
    await writeFile(file, 'hello')
    
    await editFile(file, c => c.toUpperCase())
    const content = await readFile(file, 'utf-8')
    
    expect(content).toBe('HELLO')
  })
  
  it('editJsonFile edits json safely', async () => {
    const file = join(TEMP_DIR, 'a.json')
    await writeFile(file, JSON.stringify({ a: 1 }, null, 2))
    
    await editJsonFile(file, json => {
      json.a = 2
    })
    
    const content = JSON.parse(await readFile(file, 'utf-8'))
    expect(content.a).toBe(2)
  })
  
  it('editJsonFile keeps invalid json unchanged', async () => {
    const file = join(TEMP_DIR, 'invalid.json')
    const content = '{ invalid json }'
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    await writeFile(file, content)
    await editJsonFile(file, json => {
      json.a = 2
    })
    
    expect(await readFile(file, 'utf-8')).toBe(content)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
  
  it('readJsonFile reads and parses json file', async () => {
    const file = join(TEMP_DIR, 'data.json')
    await writeFile(file, JSON.stringify({ a: 1, b: 'x' }))
    
    const res = readJsonFile<{ a: number; b: string }>(file)
    
    expect(res).toEqual({ a: 1, b: 'x' })
  })
  
  it('readJsonFile return {} if json is invalid', async () => {
    const file = join(TEMP_DIR, 'data.json')
    await writeFile(file, '{ invalid json }')
    
    expect(readJsonFile(file)).toEqual({})
  })
  
  it('readJsonFile return {} if file does not exist', () => {
    const notExist = join(TEMP_DIR, '404.json')
    
    expect(readJsonFile(notExist)).toEqual({})
  })
})
