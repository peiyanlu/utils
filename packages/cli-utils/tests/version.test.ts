import { describe, expect, it } from 'vitest'
import { cleanVersion, isPrerelease, isValidVersion, parseVersion } from '../src/index.ts'


it('isPrerelease', () => {
  expect(isPrerelease('1.0.2')).toBe(false)
  expect(isPrerelease('1.0.2-beta.0')).toBe(true)
  expect(isPrerelease('1.0.2-alpha.0')).toBe(true)
  expect(isPrerelease('1.0.2-alpha.1')).toBe(true)
  expect(isPrerelease('v1.0.2-alpha.1')).toBe(true)
  expect(isPrerelease('a1.0.2-alpha.1')).toBe(false)
  expect(isPrerelease('undefined')).toBe(false)
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


describe('parseVersion', () => {
  it('should return {} for invalid version', () => {
    expect(parseVersion('undefined')).toMatchObject({})
  })
  
  it('should coerce invalid version', () => {
    expect(parseVersion('a1.0.2-alpha.1')).toMatchObject({
      version: '1.0.2',
      isPrerelease: false,
      preId: undefined,
      preBase: undefined,
    })
  })
  
  it('should support release version', () => {
    expect(parseVersion('1.0.2')).toMatchObject({
      version: '1.0.2',
      isPrerelease: false,
      preId: undefined,
      preBase: undefined,
    })
  })
  
  it('should support pre-release version', () => {
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
    expect(parseVersion('1.2.3-beta')).toMatchObject({
      version: '1.2.3-beta',
      isPrerelease: true,
      preId: 'beta',
      preBase: false,
    })
    expect(parseVersion('1.2.3-0')).toMatchObject({
      version: '1.2.3-0',
      isPrerelease: true,
      preId: '',
      preBase: '0',
    })
  })
})
