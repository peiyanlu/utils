import { describe, expect, it, vi } from 'vitest'
import { fetchWithTimeout } from '../src/fetch.js'


describe('fetchWithTimeout', () => {
  it('should return json data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            name: 'test',
          }),
        ),
      ),
    )
    
    const result = await fetchWithTimeout<{
      name: string
    }>(
      '/api/test',
    )
    
    expect(result).toEqual({
      name: 'test',
    })
  })
  
  it('should return text data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('hello world'),
      ),
    )
    
    const result = await fetchWithTimeout<string>(
      '/api/test',
      {},
      1000,
      'text',
    )
    
    expect(result).toBe('hello world')
  })
  
  it('should return blob data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('blob content'),
      ),
    )
    
    const result = await fetchWithTimeout<Blob>(
      '/api/test',
      {},
      1000,
      'blob',
    )
    
    expect(result).toBeInstanceOf(Blob)
    expect(await result?.text()).toBe('blob content')
  })
  
  it('should return arrayBuffer data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('hello'),
      ),
    )
    
    const result = await fetchWithTimeout<ArrayBuffer>(
      '/api/test',
      {},
      1000,
      'arrayBuffer',
    )
    
    expect(result).toBeInstanceOf(ArrayBuffer)
    
    const text = new TextDecoder()
      .decode(result)
    
    expect(text).toBe('hello')
  })
  
  it('should return bytes data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('hello'),
      ),
    )
    
    const result = await fetchWithTimeout<Uint8Array>(
      '/api/test',
      {},
      1000,
      'bytes',
    )
    
    expect(result).toBeInstanceOf(Uint8Array)
    
    const text = new TextDecoder()
      .decode(result)
    
    expect(text).toBe('hello')
  })
  
  it('should return formData data', async () => {
    const formData = new FormData()
    
    formData.append('name', 'test')
    
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        formData: vi.fn().mockResolvedValue(formData),
      }),
    )
    
    const result = await fetchWithTimeout<FormData>(
      '/api/test',
      {},
      1000,
      'formData',
    )
    
    expect(result).toBe(formData)
    expect(result?.get('name')).toBe('test')
  })
  
  it('should return undefined when fetch throws error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(
        new Error('network error'),
      ),
    )
    
    const result = await fetchWithTimeout(
      '/api/test',
    )
    
    expect(result)
      .toBeUndefined()
  })
  
  it('should abort request when timeout', async () => {
    vi.useFakeTimers()
    
    const fetchMock = vi.fn(
      (
        _url: string,
        options?: RequestInit,
      ) => {
        return new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener(
            'abort',
            () => {
              reject(
                new DOMException(
                  'Aborted',
                  'AbortError',
                ),
              )
            },
          )
        })
      },
    )
    
    vi.stubGlobal(
      'fetch',
      fetchMock,
    )
    
    const promise = fetchWithTimeout(
      '/api/test',
      {},
      1000,
    )
    
    await vi.advanceTimersByTimeAsync(1000)
    
    const result = await promise
    
    expect(result)
      .toBeUndefined()
    
    expect(fetchMock)
      .toHaveBeenCalledTimes(1)
  })
  
  it('should pass abort signal to fetch', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValue(
        new Response('{}'),
      )
    
    vi.stubGlobal(
      'fetch',
      fetchMock,
    )
    
    await fetchWithTimeout(
      '/api/test',
    )
    
    const [ , options ] = fetchMock.mock.calls[0]
    
    expect(options.signal)
      .toBeInstanceOf(AbortSignal)
  })
  
  it('should clear timeout after success', async () => {
    vi.useFakeTimers()
    
    const clearTimeoutSpy = vi.spyOn(
      globalThis,
      'clearTimeout',
    )
    
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('{}'),
      ),
    )
    
    await fetchWithTimeout(
      '/api/test',
    )
    
    expect(clearTimeoutSpy)
      .toHaveBeenCalledTimes(1)
  })
  
  it('should clear timeout after error', async () => {
    vi.useFakeTimers()
    
    const clearTimeoutSpy = vi.spyOn(
      globalThis,
      'clearTimeout',
    )
    
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(
        new Error(),
      ),
    )
    
    await fetchWithTimeout(
      '/api/test',
    )
    
    expect(clearTimeoutSpy)
      .toHaveBeenCalledTimes(1)
  })
})
