import { describe, expect, it } from 'vitest'
import { joinUrl } from '../src/index.js'


describe('joinUrl', () => {
  it('should return empty string', () => {
    expect(joinUrl()).toBe('')
    expect(joinUrl([])).toBe('')
  })
  
  describe('normal join', () => {
    it('should join segments', () => {
      expect(joinUrl('a', 'b', 'c')).toBe('a/b/c')
    })
    
    it('should accept array', () => {
      expect(joinUrl([ 'a', 'b', 'c' ])).toBe('a/b/c')
    })
    
    it('should ignore empty segment', () => {
      expect(joinUrl('a', '', 'b')).toBe('a/b')
    })
    
    it('should keep trailing slash', () => {
      expect(joinUrl('a', 'b/')).toBe('a/b/')
    })
    
    it('should remove duplicate slashes', () => {
      expect(joinUrl('a//', '//b//', 'c')).toBe('a/b/c')
    })
  })
  
  describe('http protocol', () => {
    it('should normalize protocol', () => {
      expect(joinUrl('https://', 'example.com')).toBe('https://example.com')
    })
    
    it('should support separated protocol', () => {
      expect(joinUrl('https:', 'example.com')).toBe('https://example.com')
    })
    
    it('should normalize duplicated slashes', () => {
      expect(joinUrl('https:////', 'example.com')).toBe('https://example.com')
    })
    
    it('should join url path', () => {
      expect(
        joinUrl('https://example.com/', '/foo/', '/bar'),
      ).toBe('https://example.com/foo/bar')
    })
    
    it('should preserve trailing slash', () => {
      expect(
        joinUrl('https://example.com', 'foo/'),
      ).toBe('https://example.com/foo/')
    })
  })
  
  describe('file protocol', () => {
    it('should normalize file protocol', () => {
      expect(
        joinUrl('file://', 'C:/foo/bar'),
      ).toBe('file:///C:/foo/bar')
    })
    
    it('should support separated file protocol', () => {
      expect(
        joinUrl('file:', 'C:/foo/bar'),
      ).toBe('file:///C:/foo/bar')
    })
    
    it('should normalize duplicated file slashes', () => {
      expect(
        joinUrl('file://////', 'C:/foo/bar'),
      ).toBe('file:///C:/foo/bar')
    })
  })
  
  describe('query', () => {
    it('should remove slash before query', () => {
      expect(
        joinUrl('https://example.com', 'foo', '?a=1'),
      ).toBe('https://example.com/foo?a=1')
    })
    
    it('should merge multiple queries', () => {
      expect(
        joinUrl(
          'https://example.com',
          '?a=1',
          '?b=2',
          '?c=3',
        ),
      ).toBe('https://example.com?a=1&b=2&c=3')
    })
    
    it('should support query after path', () => {
      expect(
        joinUrl(
          'https://example.com',
          'foo',
          '?a=1',
          '?b=2',
        ),
      ).toBe('https://example.com/foo?a=1&b=2')
    })
  })
  
  describe('hash', () => {
    it('should remove slash before hash', () => {
      expect(
        joinUrl('https://example.com', 'foo', '#bar'),
      ).toBe('https://example.com/foo#bar')
    })
    
    it('should preserve hashbang', () => {
      expect(
        joinUrl('https://example.com', '#!/foo'),
      ).toBe('https://example.com/#!/foo')
    })
  })
  
  describe('mixed', () => {
    it('should normalize everything', () => {
      expect(
        joinUrl(
          'https:',
          'example.com/',
          '/foo/',
          '/bar/',
          '?a=1',
          '?b=2',
        ),
      ).toBe('https://example.com/foo/bar?a=1&b=2')
    })
    
    it('should work with file url', () => {
      expect(
        joinUrl(
          'file:',
          'C:/Users/',
          '/test/',
          'a.txt',
        ),
      ).toBe('file:///C:/Users/test/a.txt')
    })
  })
})
