import { expect, it } from 'vitest'
import { createRandom, isBetween, randomInt, round } from '../../src/index.js'


it('createRandom', () => {
  const random = createRandom()
  const value = random(1, 3)
  expect(value).toBeGreaterThanOrEqual(1)
  expect(value).toBeLessThanOrEqual(3)
  
  expect(
    Array
      .from(
        { length: 100 },
        () => random(1, 3),
      )
      .every(i => isBetween(i, 1, 3)),
  ).toBe(true)
  
  expect(createRandom(() => .3)(1, 3)).toBe(1)
  expect(createRandom(() => .5)(1, 3)).toBe(2)
  expect(createRandom(() => .7)(1, 3)).toBe(3)
})

it('randomInt', () => {
  const value = randomInt(1, 3)
  
  expect(value).toBeGreaterThanOrEqual(1)
  expect(value).toBeLessThanOrEqual(3)
  
  const value1 = randomInt(3, 1)
  
  expect(value1).toBeGreaterThanOrEqual(1)
  expect(value1).toBeLessThanOrEqual(3)
})

it('round', () => {
  expect(round(1.2345, 2)).toBe(1.23)
  expect(round(1.2345, 4)).toBe(1.2345)
  expect(round(1.2345, 5)).toBe(1.2345)
  expect(round(1.4567, 2)).toBe(1.46)
  expect(round(1.4567, 3)).toBe(1.457)
  expect(round(1.005, 2)).toBe(1.01)
  expect(round(1.500, 2)).toBe(1.5)
})

it('isBetween', () => {
  const value = randomInt(1, 3)
  expect(isBetween(value, 1, 3))
  
  const value1 = randomInt(3, 1)
  expect(isBetween(value1, 3, 1))
  
  const value2 = randomInt(1, 3)
  expect(isBetween(value2, ...[ 1, 3 ]))
})
