import { expect, it } from 'vitest'
import { arrayEquals, equals, notEquals } from '../../src/index.js'


it('equals ', () => {
  expect(equals(5, 5)).toBe(true)
  expect(equals(5, '5')).toBe(false)
  expect(equals(5, undefined)).toBe(false)
})

it('notEquals ', () => {
  expect(notEquals(5, 5)).toBe(false)
  expect(notEquals(5, '5')).toBe(true)
  expect(notEquals(5, undefined)).toBe(true)
})

it('arrayEquals ', () => {
  const a = [ 2, 10, 1 ]
  const b = [ 10, 1, 2 ]
  const c = [ { id: 2 }, { id: 1 } ]
  const d = [ { id: 1 }, { id: 2 } ]
  
  expect(arrayEquals(a, b)).toBe(false)
  expect(arrayEquals(a, b, k => k)).toBe(true)
  expect(arrayEquals(c, d)).toBe(false)
  expect(arrayEquals(c, d, k => k.id)).toBe(true)
  expect(arrayEquals(c, d, k => String(k.id))).toBe(true)
  expect(arrayEquals(c, d, k => Number(k.id))).toBe(true)
  
  expect(arrayEquals([ 1, 2 ], [ 1, 2 ])).toBe(true)
  expect(arrayEquals([ 1, 2 ], [ 2, 1 ])).toBe(false)
  expect(arrayEquals([ 1, 2 ], [ 1, 2, 3 ])).toBe(false)
  expect(arrayEquals([], [])).toBe(true)
  expect(arrayEquals([ NaN ], [ NaN ])).toBe(true)
  expect(arrayEquals([ null ], [ null ])).toBe(true)
  expect(arrayEquals([ NaN ], [ undefined ])).toBe(false)
  expect(arrayEquals([ -0 ], [ 0 ])).toBe(false)
  
  expect(
    arrayEquals(
      [ { id: 1 }, { id: 1 } ],
      [ { id: 1 }, { id: 2 } ],
      k => k.id,
    ),
  ).toBe(false)
})
