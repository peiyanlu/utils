import { describe, expect, it } from 'vitest'
import {
  buildUrl,
  getQueryParam,
  getQueryParams,
  hasQueryParam,
  mergeQueryParams,
  parseQueryParams,
  removeQueryParam,
  setQueryParam,
  setQueryParamValues,
  toQueryString,
} from '../src/url.js'


describe('toQueryString', () => {
  it('should convert object to query string', () => {
    expect(
      toQueryString({
        page: 1,
        keyword: 'test',
        enabled: true,
      }),
    ).toBe('?page=1&keyword=test&enabled=true')
  })
  
  it('should support array values', () => {
    expect(
      toQueryString({
        tag: [ 'vue', 'ts' ],
      }),
    ).toBe('?tag=vue&tag=ts')
  })
  
  it('should support nullable values', () => {
    expect(toQueryString({})).toBe('')
  })
})


describe('buildUrl', () => {
  it('should build url with query', () => {
    expect(
      buildUrl('/users', {
        page: 1,
        size: 20,
      }),
    ).toBe('/users?page=1&size=20')
  })
  
  it('should keep hash', () => {
    expect(
      buildUrl('/users#list', {
        page: 1,
      }),
    ).toBe('/users?page=1#list')
  })
  
  it('should support array query', () => {
    expect(
      buildUrl('/users', {
        id: [ 1, 2, 3 ],
      }),
    ).toBe('/users?id=1&id=2&id=3')
  })
})


describe('parseQueryParams', () => {
  it('should parse query params', () => {
    expect(parseQueryParams('/users?page=1&name=test')).toStrictEqual({
      page: '1',
      name: 'test',
    })
  })
  
  it('should ignore hash query', () => {
    expect(parseQueryParams('/users?page=1#page=2')).toStrictEqual({
      page: '1',
    })
  })
  
  it('should support values', () => {
    expect(parseQueryParams('/list?page=1&tag=vue&tag=ts')).toStrictEqual({
      page: '1',
      tag: [ 'vue', 'ts' ],
    })
  })
})


describe('hasQueryParam', () => {
  it('should check query param exists', () => {
    expect(
      hasQueryParam('/users?page=1', 'page'),
    ).toBe(true)
    
    expect(
      hasQueryParam('/users?page=1', 'size'),
    ).toBe(false)
  })
})


describe('getQueryParam', () => {
  it('should get query param', () => {
    expect(getQueryParam('/users?page=1', 'page')).toBe('1')
    
    expect(getQueryParam('/users', 'page')).toBeNull()
  })
})


describe('getQueryParams', () => {
  it('should get all values', () => {
    expect(
      getQueryParams(
        '/users?id=1&id=2&id=3',
        'id',
      ),
    ).toStrictEqual([
      '1',
      '2',
      '3',
    ])
  })
  
  it('should return empty array', () => {
    expect(
      getQueryParams('/users', 'id'),
    ).toStrictEqual([])
  })
})


describe('setQueryParam', () => {
  it('should replace existing value', () => {
    expect(
      setQueryParam('/users?page=1', 'page', '2'),
    ).toBe('/users?page=2')
  })
  
  it('should add new value', () => {
    expect(
      setQueryParam('/users', 'page', '1'),
    ).toBe('/users?page=1')
  })
  
  it('should keep hash', () => {
    expect(
      setQueryParam('/users#top', 'page', '1'),
    ).toBe('/users?page=1#top')
  })
})


describe('setQueryParamValues', () => {
  it('should set multiple values', () => {
    expect(
      setQueryParamValues(
        '/users?id=old',
        'id',
        [ '1', '2' ],
      ),
    ).toBe('/users?id=1&id=2')
  })
  
  it('should remove param when values are empty', () => {
    expect(
      setQueryParamValues(
        '/users?id=1',
        'id',
        [],
      ),
    ).toBe('/users')
  })
})


describe('removeQueryParam', () => {
  it('should remove query param', () => {
    expect(
      removeQueryParam('/users?page=1&size=20', 'page'),
    ).toBe('/users?size=20')
  })
  
  it('should keep hash', () => {
    expect(
      removeQueryParam('/users?page=1#top', 'page'),
    ).toBe('/users#top')
  })
})


describe('mergeQueryParams', () => {
  it('should merge params', () => {
    expect(
      mergeQueryParams('/users?page=1', {
        size: 20,
        sort: 'name',
      }),
    ).toBe('/users?page=1&size=20&sort=name')
  })
  
  it('should override existing params', () => {
    expect(
      mergeQueryParams('/users?page=1', {
        page: 2,
      }),
    ).toBe('/users?page=2')
  })
  
  it('should remove nullable params', () => {
    expect(
      mergeQueryParams('/users?page=1&size=20', {
        page: null,
        size: undefined,
      }),
    ).toBe('/users')
  })
})


describe('absolute URLs', () => {
  const base = 'https://example.com'
  
  it('buildUrl should preserve absolute URL', () => {
    expect(
      buildUrl(`${ base }/users`, {
        page: 1,
        size: 20,
      }),
    ).toBe(`${ base }/users?page=1&size=20`)
  })
  
  it('setQueryParam should preserve absolute URL', () => {
    expect(
      setQueryParam(`${ base }/users?page=1`, 'page', '2'),
    ).toBe(`${ base }/users?page=2`)
  })
  
  it('setQueryParamValues should preserve absolute URL', () => {
    expect(
      setQueryParamValues(`${ base }/users?id=old`, 'id', [ '1', '2' ]),
    ).toBe(`${ base }/users?id=1&id=2`)
  })
  
  it('removeQueryParam should preserve absolute URL', () => {
    expect(
      removeQueryParam(`${ base }/users?page=1&size=20`, 'page'),
    ).toBe(`${ base }/users?size=20`)
  })
  
  it('mergeQueryParams should preserve absolute URL', () => {
    expect(
      mergeQueryParams(`${ base }/users?page=1`, {
        size: 20,
        sort: 'name',
      }),
    ).toBe(`${ base }/users?page=1&size=20&sort=name`)
  })
})
