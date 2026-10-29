import { describe, expect, it } from 'vitest'
import { isFileUrl, isHttpUrl, isInternalRoute, isLocalhost } from '../../src/index.js'


describe('isHttpUrl', () => {
  it('should match http and https urls', () => {
    expect(isHttpUrl('http://example.com')).toBe(true)
    expect(isHttpUrl('https://example.com')).toBe(true)
  })
  
  it('should ignore case', () => {
    expect(isHttpUrl('HTTP://example.com')).toBe(true)
    expect(isHttpUrl('HTTPS://example.com')).toBe(true)
  })
  
  it('should reject other protocols', () => {
    expect(isHttpUrl('ftp://example.com')).toBe(false)
    expect(isHttpUrl('file:///test.txt')).toBe(false)
    expect(isHttpUrl('//example.com')).toBe(false)
  })
  
  it('should reject invalid http prefix', () => {
    expect(isHttpUrl('http')).toBe(false)
    expect(isHttpUrl('http:/example.com')).toBe(false)
    expect(isHttpUrl('example.com')).toBe(false)
  })
})


describe('isFileUrl', () => {
  it('should match file urls', () => {
    expect(isFileUrl('file:///test.txt')).toBe(true)
    expect(isFileUrl('file:///C:/test.txt')).toBe(true)
  })
  
  it('should ignore case', () => {
    expect(isFileUrl('FILE:///test.txt')).toBe(true)
    expect(isFileUrl('File:///test.txt')).toBe(true)
  })
  
  it('should reject other urls', () => {
    expect(isFileUrl('http://example.com')).toBe(false)
    expect(isFileUrl('https://example.com')).toBe(false)
    expect(isFileUrl('/test.txt')).toBe(false)
  })
})


describe('isInternalRoute', () => {
  it('should match slash routes', () => {
    expect(isInternalRoute('/')).toBe(true)
    expect(isInternalRoute('/page')).toBe(true)
    expect(isInternalRoute('/page/detail')).toBe(true)
  })
  
  it('should match hash routes', () => {
    expect(isInternalRoute('#/')).toBe(true)
    expect(isInternalRoute('#/page')).toBe(true)
    expect(isInternalRoute('#/page/detail')).toBe(true)
  })
  
  it('should ignore case', () => {
    expect(isInternalRoute('#/')).toBe(true)
    expect(isInternalRoute('#/PAGE')).toBe(true)
    expect(isInternalRoute('#/page/DETAIL')).toBe(true)
  })
  
  it('should reject protocol relative urls', () => {
    expect(isInternalRoute('//example.com')).toBe(false)
    expect(isInternalRoute('//localhost:3000')).toBe(false)
  })
  
  it('should reject external urls', () => {
    expect(isInternalRoute('http://example.com')).toBe(false)
    expect(isInternalRoute('https://example.com')).toBe(false)
    expect(isInternalRoute('file:///test.txt')).toBe(false)
  })
  
  it('should reject invalid hash routes', () => {
    expect(isInternalRoute('#page')).toBe(false)
    expect(isInternalRoute('#')).toBe(false)
  })
})

describe('isLocalhost', () => {
  it('should match localhost', () => {
    expect(isLocalhost('http://localhost')).toBe(true)
    expect(isLocalhost('https://localhost')).toBe(true)
  })
  
  it('should match localhost with port', () => {
    expect(isLocalhost('http://localhost:3000')).toBe(true)
    expect(isLocalhost('https://localhost:8080')).toBe(true)
  })
  
  it('should match localhost with path', () => {
    expect(isLocalhost('http://localhost/')).toBe(true)
    expect(isLocalhost('http://localhost:3000/api')).toBe(true)
  })
  
  it('should match IPv4 localhost', () => {
    expect(isLocalhost('http://127.0.0.1')).toBe(true)
    expect(isLocalhost('http://127.0.0.1:5173')).toBe(true)
    expect(isLocalhost('https://127.0.0.1/test')).toBe(true)
  })
  
  it('should match IPv6 localhost', () => {
    expect(isLocalhost('http://[::1]')).toBe(true)
    expect(isLocalhost('http://[::1]:3000')).toBe(true)
    expect(isLocalhost('http://::1')).toBe(false)
  })
  
  it('should ignore case', () => {
    expect(isLocalhost('HTTP://LOCALHOST')).toBe(true)
    expect(isLocalhost('HTTPS://LocalHost:3000')).toBe(true)
  })
  
  it('should reject non-http protocols', () => {
    expect(isLocalhost('file://localhost')).toBe(false)
    expect(isLocalhost('ftp://localhost')).toBe(false)
  })
  
  it('should reject non-localhost urls', () => {
    expect(isLocalhost('https://example.com')).toBe(false)
    expect(isLocalhost('https://192.168.1.1')).toBe(false)
    expect(isLocalhost('https://localhost.com')).toBe(false)
  })
  
  it('should reject localhost prefix match', () => {
    expect(isLocalhost('https://localhost.test')).toBe(false)
    expect(isLocalhost('https://localhost123')).toBe(false)
  })
  
  it('should reject protocol relative url', () => {
    expect(isLocalhost('//localhost')).toBe(false)
    expect(isLocalhost('//127.0.0.1:3000')).toBe(false)
  })
})
