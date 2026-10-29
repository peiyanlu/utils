import { expect, it, vi } from 'vitest'
import { isAndroid, isBrowser, isIOS, isMobile } from '../src/platform.js'


it('isBrowser should return true in browser environment', () => {
  expect(isBrowser()).toBe(true)
})

it('isBrowser should return false without window', () => {
  vi.stubGlobal('window', undefined)
  
  expect(isBrowser()).toBe(false)
})

it('isMobile should detect Android', () => {
  vi.stubGlobal(
    'navigator',
    {
      userAgent: 'Mozilla/5.0 Android',
    },
  )
  
  expect(isMobile()).toBe(true)
  expect(isAndroid()).toBe(true)
  expect(isIOS()).toBe(false)
})

it('isMobile should detect iPhone', () => {
  vi.stubGlobal(
    'navigator',
    {
      userAgent: 'Mozilla/5.0 iPhone',
    },
  )
  
  expect(isMobile()).toBe(true)
  expect(isIOS()).toBe(true)
  expect(isAndroid()).toBe(false)
})

it('isMobile should return false on desktop', () => {
  vi.stubGlobal(
    'navigator',
    {
      userAgent: 'Mozilla/5.0 Windows NT 10.0',
    },
  )
  
  expect(isMobile()).toBe(false)
  expect(isIOS()).toBe(false)
  expect(isAndroid()).toBe(false)
})
