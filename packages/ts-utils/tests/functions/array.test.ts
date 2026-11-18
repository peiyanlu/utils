import { describe, expect, it } from 'vitest'
import {
  castArray,
  chunk,
  nonNull,
  nonNullable,
  nonUndefined,
  partition,
  replaceEvery,
  unique,
  uniqueBy,
  unless,
  when,
} from '../../src/index.ts'


it('castArray', () => {
  expect(castArray(5)).toEqual([ 5 ])
  expect(castArray([ 5 ])).toEqual([ 5 ])
})

it('nonUndefined', () => {
  expect(nonUndefined([ 1, undefined, 3, undefined, 5 ])).toEqual([ 1, 3, 5 ])
  expect(nonUndefined([ 1, null, 3, null, 5 ])).toEqual([ 1, null, 3, null, 5 ])
})

it('nonNull', () => {
  expect(nonNull([ 1, null, 3, null, 5 ])).toEqual([ 1, 3, 5 ])
  expect(nonNull([ 1, undefined, 3, undefined, 5 ])).toEqual([ 1, undefined, 3, undefined, 5 ])
})

it('nonNullable', () => {
  expect(nonNullable([ 1, null, 3, undefined, 5 ])).toEqual([ 1, 3, 5 ])
})

it('chunk', () => {
  const arr = [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5 ]
  expect(chunk(arr, 2)).toStrictEqual([ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ], [ 5, 5 ] ])
  expect(chunk(arr, arr.length)).toStrictEqual([ [ ...arr ] ])
  expect(chunk(arr, arr.length + 100)).toStrictEqual([ [ ...arr ] ])
  expect(chunk(arr, 0)).toStrictEqual([])
  expect(chunk(arr, -1)).toStrictEqual([])
})

it('replaceEvery', () => {
  const arr = [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5 ]
  expect(replaceEvery(arr, 2, 1)).toStrictEqual([ 1, 1, 2, 1, 3, 1, 4, 1, 5, 1 ])
  expect(replaceEvery(arr, 2, '1')).toStrictEqual([ 1, '1', 2, '1', 3, '1', 4, '1', 5, '1' ])
  expect(replaceEvery(arr, arr.length, 1)).toStrictEqual([ 1, 1, 2, 2, 3, 3, 4, 4, 5, 1 ])
  expect(replaceEvery(arr, arr.length + 100, 1)).toStrictEqual([ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5 ])
  expect(replaceEvery(arr, 0, 1)).toStrictEqual([])
  expect(replaceEvery(arr, -1, 1)).toStrictEqual([])
})

it('partition', () => {
  const arr = [ 1, 2, 2, 3, 4, 4, 5, 5 ]
  
  expect(partition(arr, v => v % 2 === 0))
    .toStrictEqual(expect.arrayContaining([ [ 2, 2, 4, 4 ], [ 1, 3, 5, 5 ] ]))
  expect(partition(arr, v => v > 3))
    .toStrictEqual(expect.arrayContaining([ [ 4, 4, 5, 5 ], [ 1, 2, 2, 3 ] ]))
})

it('when', () => {
  expect(when(true, 'a', 'b', 'c')).toStrictEqual([ 'a', 'b', 'c' ])
  expect(when(false, 'a', 'b', 'c')).toStrictEqual([])
})

it('unless', () => {
  expect(unless(false, 'a', 'b', 'c')).toStrictEqual([ 'a', 'b', 'c' ])
  expect(unless(true, 'a', 'b', 'c')).toStrictEqual([])
})

it('unique', () => {
  expect(unique([ 1, '1', true, null, undefined, 1, '1', true, null, undefined ]))
    .toEqual([ 1, '1', true, null, undefined ])
  expect(unique([ 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4, 5, 6 ]))
    .toEqual([ 1, 2, 3, 4, 5, 6 ])
})

describe('uniqueBy', () => {
  it('should remove duplicate elements by key', () => {
    const array = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' }, // Duplicate by id
      { id: 3, name: 'Charlie' },
      { id: 2, name: 'Bob' }, // Duplicate by id
    ]
    const uniqueArray = uniqueBy(array, 'id')
    expect(uniqueArray).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ])
  })
  
  it('should handle empty array', () => {
    const array: any[] = []
    const uniqueArray = uniqueBy(array, 'id')
    expect(uniqueArray).toEqual([])
  })
  
  it('should handle array with one element', () => {
    const array = [ { id: 1, name: 'Alice' } ]
    const uniqueArray = uniqueBy(array, 'id')
    expect(uniqueArray).toEqual(array)
  })
})
