import { describe, expect, it } from 'vitest'
import {
  arrayBufferToFIle,
  blobToFile,
  fileToArrayBuffer,
  fileToJson,
  fileToText,
  fileToUint8,
  textToFile,
  uint8ToFile,
} from '../../src/binary/file.js'


describe('fileToArrayBuffer', () => {
  it('should convert File to ArrayBuffer', async () => {
    const source = new File(
      [ new Uint8Array([ 1, 2, 3 ]) ],
      'test.bin',
      {
        type: 'application/octet-stream',
      },
    )
    
    const result = await fileToArrayBuffer(source)
    
    expect(new Uint8Array(result))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
    
    const uint8 = new Uint8Array(result)
    uint8[0] = 9
    
    expect(uint8)
      .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
    
    expect(new Uint8Array(await source.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  })
})

describe('arrayBufferToFIle', () => {
  it('should convert ArrayBuffer to File', async () => {
    const source = new Uint8Array([ 1, 2, 3 ]).buffer
    
    const result = arrayBufferToFIle(
      source,
      'test.bin',
      'application/octet-stream',
    )
    
    expect(result.name)
      .toBe('test.bin')
    
    expect(result.type)
      .toBe('application/octet-stream')
    
    expect(new Uint8Array(await result.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
    
    const uint8 = new Uint8Array(source)
    uint8[0] = 9
    
    expect(new Uint8Array(await result.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  })
})

describe('fileToUint8', () => {
  it('should convert File to Uint8Array', async () => {
    const source = new File(
      [ new Uint8Array([ 1, 2, 3 ]) ],
      'test.bin',
    )
    
    const result = await fileToUint8(source)
    
    expect(result)
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
    
    result[0] = 9
    
    expect(result)
      .toStrictEqual(new Uint8Array([ 9, 2, 3 ]))
    
    expect(new Uint8Array(await source.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  })
})

describe('uint8ToFile', () => {
  it('should convert Uint8Array to File', async () => {
    const source = new Uint8Array([ 1, 2, 3 ])
    
    const result = uint8ToFile(
      source,
      'test.bin',
      'application/octet-stream',
    )
    
    expect(result.name)
      .toBe('test.bin')
    
    expect(result.type)
      .toBe('application/octet-stream')
    
    expect(new Uint8Array(await result.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
    
    source[0] = 9
    
    expect(new Uint8Array(await result.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  })
})

describe('blobToFile', () => {
  it('should convert Blob to File', async () => {
    const source = new Blob(
      [ new Uint8Array([ 1, 2, 3 ]) ],
      {
        type: 'application/octet-stream',
      },
    )
    
    const result = blobToFile(source, 'test.bin')
    
    expect(result.name)
      .toBe('test.bin')
    
    expect(result.type)
      .toBe('application/octet-stream')
    
    expect(new Uint8Array(await result.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  })
  
  it('should specify type when blob has no type', async () => {
    const source = new Blob([ new Uint8Array([ 1, 2, 3 ]) ])
    
    const result = blobToFile(source, 'test.bin', 'application/octet-stream')
    
    expect(result.name).toBe('test.bin')
    expect(result.type).toBe('application/octet-stream')
    
    expect(new Uint8Array(await result.arrayBuffer()))
      .toStrictEqual(new Uint8Array([ 1, 2, 3 ]))
  })
})


describe('textToFile', () => {
  it('should convert Text to File', async () => {
    const result = textToFile('123', 'test.txt')
    
    expect(result.name).toBe('test.txt')
    expect(result.type).toBe('text/plain')
    
    expect(await result.text())
      .toStrictEqual('123')
  })
})

describe('fileToText', () => {
  it('should convert File to Text', async () => {
    const source = new File(
      [ new Blob([ '123' ]) ],
      'test.txt',
    )
    
    const result = await fileToText(source)
    
    expect(result).toBe('123')
  })
})

describe('fileToJson', () => {
  it('should convert File to JSON', async () => {
    const json = {
      name: 'test',
      version: '1.0.0',
    }
    const source = new File(
      [ new Blob([ JSON.stringify(json) ]) ],
      'test.json',
    )
    
    const result = await fileToJson<typeof json>(source)
    
    expect(result).toMatchObject(json)
  })
})
