import { describe, expect, it } from 'vitest'
import { isNpm, isPnpm, isYarn, parsePackageManagerUserAgent } from '../src/package-manager.ts'


describe('parsePackageManagerUserAgent', () => {
  it('should parses package manager name and version', () => {
    expect(parsePackageManagerUserAgent('pnpm/11.10.0 npm/? node/v24.15.0 win32 x64')).toEqual({
      name: 'pnpm',
      version: '11.10.0',
    })
  })
  
  it('should returns {} for invalid user agent', () => {
    expect(parsePackageManagerUserAgent('pnpm11.10.0')).toEqual({})
  })
  
  it('should returns {} for empty user agent', () => {
    expect(parsePackageManagerUserAgent('')).toEqual({})
  })
})

describe('package manager is', () => {
  it('isNpm', () => {
    expect(isNpm('npm')).toBe(true)
    expect(isNpm('pnpm')).toBe(false)
  })
  
  it('isPnpm', () => {
    expect(isPnpm('pnpm')).toBe(true)
    expect(isPnpm('npm')).toBe(false)
  })
  
  it('isYarn', () => {
    expect(isYarn('yarn')).toBe(true)
    expect(isYarn('npm')).toBe(false)
  })
})
