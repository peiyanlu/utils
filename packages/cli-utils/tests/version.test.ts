import { describe, expect, it } from 'vitest'
import { cleanVersion, isPrerelease, isValidVersion, parseVersion } from '../src/index.js'


describe('npm version', () => {
  it('isPrerelease', () => {
    expect(isPrerelease('1.0.2')).toBe(false)
    expect(isPrerelease('1.0.2-beta.0')).toBe(true)
    expect(isPrerelease('1.0.2-alpha.0')).toBe(true)
    expect(isPrerelease('1.0.2-alpha.1')).toBe(true)
    expect(isPrerelease('v1.0.2-alpha.1')).toBe(true)
    expect(isPrerelease('a1.0.2-alpha.1')).toBe(false)
  })
  
  it('isValidVersion', () => {
    expect(isValidVersion('1.0.2')).toBe(true)
    expect(isValidVersion('1.0.2-beta.0')).toBe(true)
    expect(isValidVersion('1.0.2-alpha.1')).toBe(true)
    expect(isValidVersion('v1.0.2-alpha.1')).toBe(true)
    expect(isValidVersion('a1.0.2-alpha.1')).toBe(false)
    expect(isValidVersion('undefined')).toBe(false)
  })
  
  it('cleanVersion', () => {
    expect(cleanVersion('v1.0.2')).toBe('1.0.2')
    expect(cleanVersion('v1.0.2-beta.0')).toBe('1.0.2-beta.0')
    expect(cleanVersion('a1.0.2-beta.0')).toBe('a1.0.2-beta.0')
    expect(cleanVersion('undefined')).toBe('undefined')
  })
  
  it('parseVersion', () => {
    expect(parseVersion('undefined')).toMatchObject({})
    expect(parseVersion('1.0.2-beta.0')).toMatchObject({
      version: '1.0.2-beta.0',
      isPrerelease: true,
      preId: 'beta',
      preBase: '0',
    })
    expect(parseVersion('1.0.2-alpha.1')).toMatchObject({
      version: '1.0.2-alpha.1',
      isPrerelease: true,
      preId: 'alpha',
      preBase: '1',
    })
    expect(parseVersion('v1.0.2-alpha.1')).toMatchObject({
      version: 'v1.0.2-alpha.1',
      isPrerelease: true,
      preId: 'alpha',
      preBase: '1',
    })
    expect(parseVersion('a1.0.2-alpha.1')).toMatchObject({
      isPrerelease: false,
      preBase: undefined,
      preId: undefined,
      version: '1.0.2',
    })
  })
})
