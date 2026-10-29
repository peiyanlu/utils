import { describe, expect, it } from 'vitest'
import { firstFromIterable, toArray } from '../../src/index.js'


async function* empty() {
  
}

async function* nums() {
  yield* [ 1, 3, 5, 7, 9 ]
}


describe('toArray', () => {
  it('should return empty array for empty AsyncIterable', async () => {
    expect(await toArray(empty())).toEqual([])
  })
  
  it('should return array for AsyncIterable', async () => {
    expect(await toArray(nums())).toEqual([ 1, 3, 5, 7, 9 ])
  })
})

describe('firstFromIterable', () => {
  it('should return undefined for empty AsyncIterable', async () => {
    expect(await firstFromIterable(empty())).toBe(undefined)
  })
  
  it('should return the first value from AsyncIterable', async () => {
    expect(await firstFromIterable(nums())).toBe(1)
  })
})
