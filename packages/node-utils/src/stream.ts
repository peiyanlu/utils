import { isEmptyObject, isRegExp, isString, toArray } from '@peiyanlu/ts-utils'
import { Readable } from 'node:stream'
import { StringDecoder } from 'node:string_decoder'


/** 将异步迭代中的所有 Buffer 块合并到一个 Buffer */
export async function concatBufferStream(iterable: AsyncIterable<Buffer>): Promise<Buffer> {
  return Buffer.concat(await toArray(iterable))
}

/** 将异步迭代中的所有 String 块合并到一个 String */
export async function concatStringStream(iterable: AsyncIterable<string>): Promise<string> {
  return (await toArray(iterable)).join('')
}


export async function* decodeUtf8(stream: AsyncIterable<string | Buffer>): AsyncGenerator<string> {
  const decoder = new StringDecoder('utf-8')
  let chunk: string | Buffer
  
  for await (chunk of stream) {
    if (isString(chunk)) {
      const pending = decoder.end()
      if (pending) yield pending
      
      yield chunk
    } else {
      const decoded = decoder.write(chunk)
      if (decoded) yield decoded
    }
  }
  
  const pending = decoder.end()
  if (pending) yield pending
}


export interface MergedReadableChunk<K extends string, T = Buffer> {
  source: K
  chunk: T
}


export const mergeReadable = <K extends string, T = Buffer>(streams: Record<K, Readable>): Readable & AsyncIterable<MergedReadableChunk<K, T>> => {
  const mergedStream = new Readable({
    objectMode: true,
    read() { /* no-op */ },
  })
  
  if (isEmptyObject(streams)) {
    mergedStream.push(null)
    return mergedStream
  }
  
  let ended = 0
  Object
    .entries(streams as Record<string, Readable>)
    .forEach(([ source, stream ], _i, entries) => {
      const onEnd = () => {
        ended += 1
        
        if (ended === entries.length) {
          mergedStream.push(null)
        }
      }
      
      if (stream.readableEnded) {
        return onEnd()
      }
      
      stream
        .on('data', (chunk: Buffer) => mergedStream.push({ source, chunk }))
        .on('end', () => onEnd())
        .on('error', err => mergedStream.destroy(err))
    })
  
  return mergedStream
}


export async function* splitStream(
  stream: AsyncIterable<string | Buffer>,
  separator: string | RegExp,
): AsyncGenerator<string> {
  let payload: string[]
  let buffer = ''
  
  for await (const chunk of decodeUtf8(stream)) {
    buffer += chunk
    
    const canSplit = isRegExp(separator)
      ? separator.test(buffer)
      : buffer.includes(separator)
    
    if (canSplit) {
      payload = buffer.split(separator)
      // 取出最后一段，放回 buffer，因为它可能还没收完整
      buffer = payload.pop() ?? ''
      
      yield* payload
    }
  }
  
  if (buffer) {
    yield buffer
  }
}


export async function* parseJsonStream<T>(
  stream: AsyncIterable<string | Buffer>,
  delimiter: RegExp = /\r?\n/,
): AsyncGenerator<T> {
  for await (const chunk of splitStream(stream, delimiter)) {
    yield JSON.parse(chunk) as T
  }
}
