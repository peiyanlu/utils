import { expect, it } from 'vitest'
import { merge } from '../../src/index.ts'


it('merge arrays by concatenating them', () => {
  expect(merge([ 1, 2 ], [ 2, 3 ])).toEqual([ 1, 2, 2, 3 ])
  expect(merge(undefined, [ 1 ])).toEqual([ 1 ])
  expect(merge([ 1 ], undefined)).toBeUndefined()
})

it('merge sets by combining their values', () => {
  expect(merge(new Set([ 1, 2 ]), new Set([ 2, 3 ]))).toEqual(new Set([ 1, 2, 3 ]))
  expect(merge(undefined, new Set([ 1 ]))).toEqual(new Set([ 1 ]))
})

it('merge plain objects recursively and update the target', () => {
  const target = {
    nested: { keep: true, replace: 'target' },
    list: [ 1 ],
    untouched: 'value',
  }
  const source = {
    nested: { replace: 'source', add: true },
    list: [ 2 ],
  }
  
  const result = merge(target, source)
  
  expect(result).toBe(target)
  expect(result).toEqual({
    nested: { keep: true, replace: 'source', add: true },
    list: [ 1, 2 ],
    untouched: 'value',
  })
  expect(merge(undefined, source)).toEqual(source)
})

it('merge maps recursively by key', () => {
  const target = new Map<unknown, unknown>([
    [ 'nested', { keep: true, replace: 'target' } ],
    [ 'untouched', 1 ],
  ])
  const source = new Map<unknown, unknown>([
    [ 'nested', { replace: 'source', add: true } ],
    [ 'added', 2 ],
  ])
  
  const result = merge(target, source) as Map<unknown, unknown>
  
  expect(result).not.toBe(target)
  expect(result).toEqual(new Map<unknown, unknown>([
    [ 'nested', { keep: true, replace: 'source', add: true } ],
    [ 'untouched', 1 ],
    [ 'added', 2 ],
  ]))
  expect(target.get('nested')).toEqual({ keep: true, replace: 'source', add: true })
  expect(merge(undefined, source)).toEqual(new Map<unknown, unknown>([
    [ 'nested', { replace: 'source', add: true } ],
    [ 'added', 2 ],
  ]))
})

it('replace the target when the source is not a mergeable collection', () => {
  expect(merge({ value: 1 }, null)).toBeNull()
  expect(merge(1, 'source')).toBe('source')
})
