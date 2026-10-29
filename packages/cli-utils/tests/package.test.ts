import { createTempWorkspace } from '@peiyanlu/test-tools'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import {
  getPackageInfo,
  isScopedPackageName,
  isValidPackageName,
  pkgFromUserAgent,
  toValidPackageName,
  toValidProjectName,
} from '../src/index.js'


const { path: TEMP_DIR, remove } = createTempWorkspace()


beforeEach(async () => {
  await rm(TEMP_DIR, { recursive: true })
  await mkdir(TEMP_DIR, { recursive: true })
})

afterAll(() => {
  remove()
})


describe('package name utils', () => {
  it('isValidPackageName', () => {
    expect(isValidPackageName('foo')).toBe(true)
    expect(isValidPackageName('@scope/foo')).toBe(true)
    expect(isValidPackageName('Foo Bar')).toBe(false)
    expect(isValidPackageName('scope/foo')).toBe(false)
    expect(isValidPackageName('@scopefoo')).toBe(false)
  })
  
  it('isScopedPackageName', () => {
    expect(isScopedPackageName('foo')).toBe(false)
    expect(isScopedPackageName('@scope/foo')).toBe(true)
    expect(isScopedPackageName('scope/foo')).toBe(false)
    expect(isScopedPackageName('@scopefoo')).toBe(false)
    expect(isScopedPackageName('Foo Bar')).toBe(false)
  })
  
  it('toValidPackageName', () => {
    expect(toValidPackageName('Foo Bar')).toBe('foo-bar')
    expect(toValidPackageName('_test')).toBe('test')
  })
  
  it('toValidProjectName', () => {
    expect(toValidProjectName('demo///')).toBe('demo')
    expect(toValidProjectName('demo/demo-1')).toBe('demo/demo-1')
    expect(toValidProjectName('<demo>/demo-2')).toBe('demo/demo-2')
    expect(toValidProjectName('"demo"/demo-3')).toBe('demo/demo-3')
    expect(toValidProjectName('demo\\|?*:"/demo-3')).toBe('demo/demo-3')
  })
})

describe('package info utils', () => {
  it('getPackageInfo reads package metadata and resolved paths', async () => {
    const pkgDir = join(TEMP_DIR, 'pkg')
    await mkdir(pkgDir, { recursive: true })
    await writeFile(join(pkgDir, 'package.json'), JSON.stringify({
      name: '@scope/pkg',
      version: '1.2.3',
      private: true,
    }))
    
    expect(getPackageInfo('@scope/pkg', () => pkgDir)).toMatchObject({
      pkg: {
        name: '@scope/pkg',
        version: '1.2.3',
        private: true,
      },
      pkgDir,
      pkgPath: join(pkgDir, 'package.json'),
    })
  })
  
  it('pkgFromUserAgent parses package manager name and version', () => {
    expect(pkgFromUserAgent('pnpm/11.10.0 npm/? node/v24.15.0 win32 x64')).toEqual({
      name: 'pnpm',
      version: '11.10.0',
    })
  })
  
  it('pkgFromUserAgent returns undefined for empty user agent', () => {
    expect(pkgFromUserAgent(undefined)).toBeUndefined()
  })
})
