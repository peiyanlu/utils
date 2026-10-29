import { expect, it } from 'vitest'
import { castArray, chunk, nonNull, nonNullable, nonUndefined, partition, replaceEvery } from '../../src/index.js'


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
