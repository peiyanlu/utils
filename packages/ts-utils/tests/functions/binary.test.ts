import { expect, it } from 'vitest'
import { arrayBufferToUint8, safeUint8, uint8ToArrayBuffer } from '../../src/index.js'


it('uint8ToArrayBuffer', () => {
  const source = new Uint8Array([ 1, 2, 3 ])
  
  const buffer = uint8ToArrayBuffer(source)
  
  expect(new Uint8Array(buffer)).toStrictEqual(source)
  expect(buffer).not.toBe(source.buffer)
  
  // 修改生成的 ArrayBuffer
  const uint8 = new Uint8Array(buffer)
  uint8[0] = 9
  
  // 生成的 ArrayBuffer 已经变化
  expect(uint8)
    .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
  
  // 原始 Uint8Array 不应该变化
  expect(source)
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
})

it('uint8ToArrayBuffer handles offset', () => {
  const origin = new Uint8Array([ 0, 1, 2, 3 ])
  const source = origin.subarray(1, 3)
  
  const buffer = uint8ToArrayBuffer(source)
  
  expect(new Uint8Array(buffer)).toStrictEqual(source)
  expect(buffer).not.toBe(source.buffer)
  
  // 修改生成的 ArrayBuffer
  const uint8 = new Uint8Array(buffer)
  uint8[0] = 9
  
  // 生成的 ArrayBuffer 已经变化
  expect(uint8)
    .toStrictEqual(new Uint8Array([ 9, 2 ]))
  
  // 原始 Uint8Array 不应该变化
  expect(source)
    .toStrictEqual(new Uint8Array([ 1, 2 ]))
})

it('arrayBufferToUint8', () => {
  const source = new Uint8Array([ 1, 2, 3 ]).buffer
  
  const result = arrayBufferToUint8(source)
  
  expect(result)
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  expect(result.buffer).not.toBe(source)
  
  // 修改生成的 Uint8Array
  result[0] = 9
  
  // 生成的 Uint8Array 已经变化
  expect(result)
    .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
  
  // 原始 ArrayBuffer 不应该变化
  expect(new Uint8Array(source))
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
})

it('safeUint8 from ArrayBuffer', () => {
  const source = new Uint8Array([ 1, 2, 3 ]).buffer
  
  const result = safeUint8(source)
  
  expect(result)
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  expect(result.buffer).not.toBe(source)
  
  // 修改生成的 Uint8Array
  result[0] = 9
  
  // 生成的 Uint8Array 已经变化
  expect(result)
    .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
  
  // 原始 ArrayBuffer 不应该变化
  expect(new Uint8Array(source))
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
})

it('safeUint8 from Uint8Array', () => {
  const source = new Uint8Array([ 1, 2, 3 ])
  
  const result = safeUint8(source)
  
  expect(result).toStrictEqual(source)
  expect(result.buffer).not.toBe(source.buffer)
  
  // 修改生成的 Uint8Array
  result[0] = 9
  
  // 生成的 Uint8Array 已经变化
  expect(result)
    .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
  
  // 原始 Uint8Array 不应该变化
  expect(source)
    .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
})

it('safeUint8 from empty Uint8Array', () => {
  const source = new Uint8Array()
  
  const result = safeUint8(source)
  
  expect(result).toStrictEqual(source)
  expect(result.buffer).not.toBe(source.buffer)
  
  expect(result.length).toBe(0)
  expect(source.length).toBe(0)
})
