import { describe, expect, it } from 'vitest'
import {
  asInstanceOf,
  cloneInstance,
  deleteProperty,
  get,
  getProperty,
  getTag,
  mapObject,
  omit,
  pathToKeys,
  pick,
  set,
  setProperty,
  toRawString,
  toString,
  typedEntries,
  unset,
} from '../../src/index.js'


class Foo {}

it('asInstanceOf', () => {
  const foo = new Foo()
  expect(asInstanceOf(foo, Foo)).toBe(foo)
  expect(asInstanceOf({}, Foo)).toBeUndefined()
})

it('omit', () => {
  const result = omit({ a: 1, b: 2 }, [ 'b' ])
  expect(result).toEqual({ a: 1 })
})

it('pick', () => {
  const result = pick({ a: 1, b: 2 }, [ 'b' ])
  expect(result).toEqual({ b: 2 })
})

it('toString', () => {
  expect(toString([])).toBe('[object Array]')
  expect(toString({})).toBe('[object Object]')
  expect(toString(() => {})).toBe('[object Function]')
})

it('toRawString', () => {
  expect(toRawString([])).toBe('[object Array]')
  expect(toRawString({})).toBe('[object Object]')
  expect(toRawString(() => {})).toBe('[object Function]')
})

it('getTag', () => {
  expect(getTag([])).toBe('Array')
  expect(getTag({})).toBe('Object')
  expect(getTag(() => {})).toBe('Function')
})

it('typedEntries', () => {
  const id = Symbol('id')
  const obj = {
    name: 'hello',
    age: 10,
    enabled: true,
  }
  const objSymbol = {
    ...obj,
    [id]: '001',
  }
  
  expect(typedEntries(obj)).toEqual([
    [ 'name', 'hello' ],
    [ 'age', 10 ],
    [ 'enabled', true ],
  ])
  expect(typedEntries(objSymbol)).toEqual([
    [ 'name', 'hello' ],
    [ 'age', 10 ],
    [ 'enabled', true ],
  ])
  expect(typedEntries({})).toEqual([])
})

it('mapObject', () => {
  const obj = { a: 1, b: 2 }
  
  expect(
    mapObject(obj, (k, v) => [ k, v ]),
  ).toEqual(obj)
  
  expect(
    mapObject({}, (k, v) => [ k, v ]),
  ).toEqual({})
  
  expect(
    mapObject(obj, (k, v) => [ k, v ], [ 'a' ]),
  ).toEqual({ a: 1 })
  
  expect(
    mapObject(obj, (k, v) => [ k, v.toString() ], [ 'a' ]),
  ).toEqual({ a: '1' })
  
  expect(
    mapObject(obj, (k, v) => [ k.toUpperCase(), v ], [ 'a' ]),
  ).toEqual({ A: 1 })
})

it('pathToKeys', () => {
  expect(pathToKeys('a')).toStrictEqual([ 'a' ])
  expect(pathToKeys('.a')).toStrictEqual([ '', 'a' ])
  expect(pathToKeys('a.')).toStrictEqual([ 'a', '' ])
  expect(pathToKeys('a.b')).toStrictEqual([ 'a', 'b' ])
  expect(pathToKeys('a..b')).toStrictEqual([ 'a', '', 'b' ])
  expect(pathToKeys('a\.b')).toStrictEqual([ 'a', 'b' ])
  expect(pathToKeys('a\\.b')).toStrictEqual([ 'a.b' ])
  expect(pathToKeys('a\\\\.b')).toStrictEqual([ 'a\\', 'b' ])
  expect(pathToKeys('a\\')).toStrictEqual([ 'a\\' ])
})

it('deleteProperty', () => {
  const obj = () => ({ a: 1, b: 2, c: { d: 1 } })
  
  expect(deleteProperty(obj(), [ 'a' ])).toBe(true)
  expect(deleteProperty(obj(), [ 'b', 'c' ])).toBe(false)
  expect(deleteProperty(obj(), [])).toBe(false)
  expect(deleteProperty(obj(), [ 'c', 'd' ])).toBe(true)
  
  const obj1 = { c: { d: 5 }, a: [ '0' ] }
  expect(deleteProperty(obj1, [ 'a', '[0]' ])).toBe(true)
  expect(obj1).toMatchObject({ c: { d: 5 }, a: Array(1) })
  expect(deleteProperty(obj1, [ 'a', '0' ])).toBe(true)
  expect(obj1).toMatchObject({ c: { d: 5 }, a: Array(1) })
  
  const obj2 = { c: { d: 5 }, a: { '0': '0' } }
  expect(deleteProperty(obj2, [ 'a', '[0]' ])).toBe(true)
  expect(obj2).toMatchObject({ c: { d: 5 }, a: {} })
  expect(deleteProperty(obj2, [ 'a', '0' ])).toBe(true)
  expect(obj2).toMatchObject({ c: { d: 5 }, a: {} })
})

it('unset', () => {
  const obj = () => ({ a: 1, b: 2, c: { d: 1 } })
  
  expect(unset(obj(), '')).toBe(true)
  expect(unset(obj(), 'a')).toBe(true)
  expect(unset(obj(), 'b.c')).toBe(false)
  expect(unset(obj(), 'c.d')).toBe(true)
  
  const obj1 = { c: { d: 5 }, a: [ '0' ] }
  expect(unset(obj1, 'a[0]')).toBe(true)
  expect(obj1).toMatchObject({ c: { d: 5 }, a: Array(1) })
  expect(unset(obj1, 'a.0')).toBe(true)
  expect(obj1).toMatchObject({ c: { d: 5 }, a: Array(1) })
  
  const obj2 = { c: { d: 5 }, a: { '0': '0' } }
  expect(unset(obj2, 'a[0]')).toBe(true)
  expect(obj2).toMatchObject({ c: { d: 5 }, a: {} })
  expect(unset(obj2, 'a.0')).toBe(true)
  expect(obj2).toMatchObject({ c: { d: 5 }, a: {} })
  expect(unset(obj2, 'c.d')).toBe(true)
  expect(obj2).toMatchObject({ c: {}, a: {} })
  
  const obj3 = { a: [ { b: 1 } ] }
  expect(unset(obj3, 'a[0].b')).toBe(true)
  expect(obj3).toMatchObject({ a: [ {} ] })
  
  const obj4 = { a: [ { b: 1 } ] }
  expect(unset(obj4, 'a.0.b')).toBe(true)
  expect(obj4).toMatchObject({ a: [ {} ] })
})

it('setProperty', () => {
  const obj = () => ({ c: { d: 5 } })
  
  expect(setProperty(obj(), [], 1)).toBe(false)
  expect(setProperty(obj(), [ 'a' ], 1)).toBe(true)
  expect(setProperty(obj(), [ 'a', 'b' ], 1)).toBe(true)
  
  const obj1 = obj()
  expect(setProperty(obj1, [ 'a', '[0]' ], '0')).toBe(true)
  expect(obj1).toMatchObject({ c: { d: 5 }, a: [ '0' ] })
  
  const obj2 = obj()
  expect(setProperty(obj2, [ 'a', '0' ], '0')).toBe(true)
  expect(obj2).toMatchObject({ c: { d: 5 }, a: { '0': '0' } })
})

it('set', () => {
  const obj = () => ({ c: { d: 5 } })
  
  expect(set(obj(), '', 0)).toBe(true)
  expect(set(obj(), 'a', 0)).toBe(true)
  
  const obj1 = obj()
  expect(set(obj1, 'a[0]', '0')).toBe(true)
  expect(obj1).toMatchObject({ c: { d: 5 }, a: [ '0' ] })
  
  const obj2 = obj()
  expect(set(obj2, 'a.0', '0')).toBe(true)
  expect(obj2).toMatchObject({ c: { d: 5 }, a: { '0': '0' } })
  
  expect(set(obj(), 'b.c', 0)).toBe(true)
  expect(set(obj(), 'c.d', 0)).toBe(true)
})

it('getProperty', () => {
  const obj = () => ({ a: 1, b: 2, c: { d: 1 } })
  
  expect(getProperty(obj(), [])).toBeUndefined()
  expect(getProperty(obj(), [ 'b' ])).toBe(2)
  expect(getProperty(obj(), [ 'a', 'b' ])).toBeUndefined()
  expect(getProperty(obj(), [ 'c', 'd' ])).toBe(1)
  expect(getProperty(obj(), [ 'c', 'd', 'e' ])).toBeUndefined()
  
  const obj1 = { c: { d: 5 }, a: [ '0' ] }
  expect(getProperty(obj1, [ 'a', '[0]' ])).toBe('0')
  expect(getProperty(obj1, [ 'a', '0' ])).toBe('0')
  
  const obj2 = { c: { d: 5 }, a: { '0': '0' } }
  expect(getProperty(obj2, [ 'a', '[0]' ])).toBe('0')
  expect(getProperty(obj2, [ 'a', '0' ])).toBe('0')
})

it('get', () => {
  const obj = () => ({ a: 1, b: 2, c: { d: 1 } })
  
  expect(get(obj(), '')).toBeUndefined()
  expect(get(obj(), 'b')).toBe(2)
  expect(get(obj(), 'a.b')).toBeUndefined()
  expect(get(obj(), 'c.d')).toBe(1)
  expect(get(obj(), 'c.d.e')).toBeUndefined()
  
  const obj1 = { c: { d: 5 }, a: [ '0' ] }
  expect(get(obj1, 'a[0]')).toBe('0')
  expect(get(obj1, 'a.0')).toBe('0')
  expect(get(obj1, 'c.d')).toBe(5)
  
  const obj2 = { c: { d: 5 }, a: { '0': '0' } }
  expect(get(obj2, 'a[0]')).toBe('0')
  expect(get(obj2, 'a.0')).toBe('0')
  expect(get(obj2, 'c.d')).toBe(5)
  
  const obj3 = { a: [ { b: 1 } ] }
  expect(get(obj3, 'a.0.b')).toBe(1)
  expect(get(obj3, 'a[0].b')).toBe(1)
})

describe('cloneInstance', () => {
  class Animal {
    walk() {
      return 'walk'
    }
    
    run() {
      return 'run'
    }
  }
  
  const animal = new Animal()
  
  it('should clone all', () => {
    expect(cloneInstance(animal).run()).toBe('run')
    expect(cloneInstance(animal).walk()).toBe('walk')
  })
})
