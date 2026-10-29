import { describe, expect, it } from 'vitest'
import {
  arrayBufferToBlob,
  blobToArrayBuffer,
  blobToJson,
  blobToText,
  blobToUint8,
  textToBlob,
  uint8ToBlob,
} from '../../src/binary/blob.js'


describe('blobToArrayBuffer', () => {
  it('should convert Blob to ArrayBuffer', async () => {
    const source = new Blob([ new Uint8Array([ 1, 2, 3 ]) ], {
      type: 'application/octet-stream',
    })
    
    const result = await blobToArrayBuffer(source)
    
    expect(new Uint8Array(result))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
    
    const uint8 = new Uint8Array(result)
    uint8[0] = 9
    
    expect(new Uint8Array(result))
      .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
    
    expect(await source.arrayBuffer())
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]).buffer)
  })
})

describe('arrayBufferToBlob', () => {
  it('should convert ArrayBuffer to Blob', async () => {
    const source = new Uint8Array([ 1, 2, 3 ]).buffer
    
    const result = arrayBufferToBlob(source, 'application/octet-stream')
    
    expect(result.type)
      .toBe('application/octet-stream')
    
    expect(new Uint8Array(await result.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  })
})

describe('blobToUint8', () => {
  it('should convert Blob to Uint8Array', async () => {
    const source = new Blob([ new Uint8Array([ 1, 2, 3 ]) ])
    
    const result = await blobToUint8(source)
    
    expect(result)
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
    
    result[0] = 9
    
    expect(result)
      .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
    
    expect(new Uint8Array(await source.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  })
})

describe('uint8ToBlob', () => {
  it('should convert Uint8Array to Blob', async () => {
    const source = new Uint8Array([ 1, 2, 3 ])
    
    const result = uint8ToBlob(source, 'application/octet-stream')
    
    expect(result.type)
      .toBe('application/octet-stream')
    
    expect(new Uint8Array(await result.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
    
    source[0] = 9
    
    expect(new Uint8Array(await result.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  })
})


describe('textToBlob', () => {
  it('should convert Text to Blob', async () => {
    const result = textToBlob('123')
    
    expect(result.type).toBe('text/plain')
    
    expect(await result.text())
      .toStrictEqual('123')
  })
})

describe('blobToText', () => {
  it('should convert Blob to Text', async () => {
    const source = new Blob([ '123' ])
    
    const result = await blobToText(source)
    
    expect(result).toBe('123')
  })
})

describe('blobToJson', () => {
  it('should convert Blob to JSON', async () => {
    const json = {
      name: 'test',
      version: '1.0.0',
    }
    const source = new Blob([ JSON.stringify(json) ])
    
    const result = await blobToJson<typeof json>(source)
    
    expect(result).toMatchObject(json)
  })
})
