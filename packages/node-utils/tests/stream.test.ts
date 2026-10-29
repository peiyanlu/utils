import { PassThrough, Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import {
  concatBufferStream,
  concatStringStream,
  decodeUtf8,
  mergeReadable,
  parseJsonStream,
  splitStream,
} from '../src/stream.js'


const collect = async <T>(iterable: AsyncIterable<T>): Promise<T[]> => {
  const result: T[] = []
  for await (const value of iterable) result.push(value)
  return result
}



describe('stream concatenation', () => {
  it('should concatenate buffer chunks', async () => {
    await expect(concatBufferStream(Readable.from([
      Buffer.from('hello '),
      Buffer.from('world'),
    ]))).resolves.toEqual(Buffer.from('hello world'))
  })
  
  it('should concatenate string chunks', async () => {
    await expect(concatStringStream(Readable.from([ 'hello ', 'world' ])))
      .resolves.toBe('hello world')
  })
})

describe('decodeUtf8', () => {
  it('should flush pending bytes before a string chunk', async () => {
    const chunks = Readable.from([ Buffer.from([ 0xE4 ]), 'text' ])
    
    await expect(collect(decodeUtf8(chunks))).resolves.toEqual([ '�', 'text' ])
  })
  
  it('should flush pending bytes at the end of the stream', async () => {
    const chunks = Readable.from([ Buffer.from([ 0xE4 ]) ])
    
    await expect(collect(decodeUtf8(chunks))).resolves.toEqual([ '�' ])
  })
})

describe('mergeReadable', () => {
  it('should preserve source names and chunks', async () => {
    const merged = mergeReadable({
      first: Readable.from([ Buffer.from('a') ]),
      second: Readable.from([ Buffer.from('b') ]),
    })
    
    const result = await collect(merged)
    expect(result.map(({ source, chunk }) => [ source, chunk.toString() ])).toEqual([
      [ 'first', 'a' ],
      [ 'second', 'b' ],
    ])
  })
  
  it('should end immediately when there are no input streams', async () => {
    await expect(collect(mergeReadable({}))).resolves.toEqual([])
  })
  
  it('should end when all input streams have already ended', async () => {
    const ended = Readable.from([ Buffer.from('consumed') ])
    for await (const _chunk of ended) { /* consume it */ }
    
    await expect(collect(mergeReadable({ ended }))).resolves.toEqual([])
  })

  it('should propagate input stream errors', async () => {
    const source = new PassThrough()
    const merged = mergeReadable({ source })
    const error = new Error('source failed')
    const mergedError = new Promise<Error>(resolve => merged.once('error', resolve))

    source.destroy(error)

    await expect(mergedError).resolves.toBe(error)
  })
})

describe('splitStream', () => {
  it('should split delimiters across chunk boundaries', async () => {
    const chunks = Readable.from([ 'one<', '>two<>three' ])
    
    await expect(collect(splitStream(chunks, '<>')))
      .resolves.toEqual([ 'one', 'two', 'three' ])
  })

  it('should handle an empty chunk with an empty separator', async () => {
    await expect(collect(splitStream(Readable.from([ '' ]), '')))
      .resolves.toEqual([])
  })
  
  it('should preserve UTF-8 characters split across buffer chunks', async () => {
    const bytes = Buffer.from('你好')
    const chunks = Readable.from([
      bytes.subarray(0, 1),
      bytes.subarray(1, 4),
      bytes.subarray(4),
    ])
    
    await expect(collect(splitStream(chunks, '\n'))).resolves.toEqual([ '你好' ])
  })
  
  it('should support RegExp delimiter', async () => {
    const chunks = Readable.from([ '1\n2\r\n3\n' ])
    
    await expect(collect(splitStream(chunks, /\r?\n/g)))
      .resolves.toEqual([ '1', '2', '3' ])
  })
})

describe('parseJsonStream', () => {
  it('should parse newline-delimited JSON across chunk boundaries', async () => {
    const chunks = Readable.from([ '{"n":1}\n{"n"', ':2}\n' ])
    
    await expect(collect(parseJsonStream<{ n: number }>(chunks)))
      .resolves.toEqual([ { n: 1 }, { n: 2 } ])
  })
  
  it('should not treat captured delimiter groups as JSON records', async () => {
    const chunks = Readable.from([ '{"n":1}\n{"n":2}\n' ])
    
    await expect(collect(parseJsonStream<{ n: number }>(chunks, /\r?\n/g)))
      .resolves.toEqual([ { n: 1 }, { n: 2 } ])
    
    const chunks1 = Readable.from([ '{"n":1}\n{"n":2}\n' ])
    
    await expect(collect(parseJsonStream<{ n: number }>(chunks1, /(\r?\n)/g)))
      .rejects.toThrow()
  })
  
  it('should parse stream of json objects', async () => {
    const stream = Readable.from([
      '[1]\n[2]\n',
      '[3]\n',
      '[4]\n[5]\n[6]',
    ])
    const result = await collect(parseJsonStream(stream))
    
    expect(result).toEqual([
      [ 1 ],
      [ 2 ],
      [ 3 ],
      [ 4 ],
      [ 5 ],
      [ 6 ],
    ])
  })
})
