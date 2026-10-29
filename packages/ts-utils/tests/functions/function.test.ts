import { describe, expect, it } from 'vitest'
import { isSuccess, isSuccessSync, once, onceAsync, promisify, tryCall, tryCallSync } from '../../src/index.js'


describe('once', () => {
  it('once', () => {
    let count = 0
    
    const fn = once((value: number) => {
      count++
      return value
    })
    
    expect(fn(1)).toBe(1)
    expect(fn(2)).toBe(1)
    expect(fn(3)).toBe(1)
    
    expect(count).toBe(1)
  })
  
  it('once returns first result', () => {
    const fn = once((value: number) => value)
    
    expect(fn(1)).toBe(1)
    expect(fn(2)).toBe(1)
  })
  
  it('once uses first arguments', () => {
    let args: number[] = []
    
    const fn = once((...values: number[]) => {
      args = values
      return values.length
    })
    
    fn(1, 2)
    fn(3, 4, 5)
    
    expect(args).toStrictEqual([ 1, 2 ])
  })
  
  it('once retry after throw', () => {
    let count = 0
    
    const fn = once(() => {
      count++
      
      if (count === 1) {
        throw new Error('error')
      }
      
      return 123
    })
    
    expect(() => fn()).toThrow('error')
    expect(fn()).toBe(123)
    expect(count).toBe(2)
  })
})

describe('onceAsync', () => {
  it('onceAsync', async () => {
    let count = 0
    
    const fn = onceAsync(async (value: number) => {
      count++
      return value
    })
    
    const [ a, b, c ] = await Promise.all([
      fn(1),
      fn(2),
      fn(3),
    ])
    
    expect(a).toBe(1)
    expect(b).toBe(1)
    expect(c).toBe(1)
    
    expect(count).toBe(1)
  })
  
  it('onceAsync returns first result', async () => {
    const fn = onceAsync(async (value: number) => value)
    
    expect(await fn(1)).toBe(1)
    expect(await fn(2)).toBe(1)
  })
  
  it('onceAsync uses first arguments', async () => {
    let args: number[] = []
    
    const fn = onceAsync(async (...values: number[]) => {
      args = values
      return values.length
    })
    
    await fn(1, 2)
    await fn(3, 4, 5)
    
    expect(args).toStrictEqual([ 1, 2 ])
    expect(await fn()).toBe(2)
  })
  
  it('onceAsync retry after reject', async () => {
    let count = 0
    
    const fn = onceAsync(async () => {
      count++
      if (count === 1) {
        throw new Error('error')
      }
      return 123
    })
    
    await expect(fn()).rejects.toThrow('error')
    expect(await fn()).toBe(123)
    expect(count).toBe(2)
  })
  
  it('onceAsync returns same promise', () => {
    const fn = onceAsync(async () => 1)
    
    const p1 = fn()
    const p2 = fn()
    
    expect(p1).toBe(p2)
  })
})

describe('promisify', () => {
  it('promisify sync', async () => {
    const fn = promisify((a: number, b: number) => a + b)
    
    await expect(fn(1, 2)).resolves.toBe(3)
  })
  
  it('promisify sync throw', async () => {
    const fn = promisify(() => {
      throw new Error('error')
    })
    
    await expect(fn()).rejects.toThrow('error')
  })
  
  it('promisify async', async () => {
    const fn = promisify(async (value: number) => value)
    
    await expect(fn(1)).resolves.toBe(1)
  })
  
  it('promisify async reject', async () => {
    const fn = promisify(async () => {
      throw new Error('error')
    })
    
    await expect(fn()).rejects.toThrow('error')
  })
})

describe('tryCall/tryCallSync', async () => {
  const log = (value: number) => value
  const asyncLog = async (value: number) => value
  const error = () => {throw new Error('error')}
  const asyncError = async () => {throw new Error('error')}
  
  it('tryCall', async () => {
    expect(await tryCall(() => log(1), undefined)).toBe(1)
    expect(await tryCall(() => asyncLog(1), undefined)).toBe(1)
    
    expect(await tryCall(() => error(), undefined)).toBe(undefined)
    expect(await tryCall(() => asyncError(), () => undefined)).toBe(undefined)
  })
  
  it('tryCallSync', async () => {
    expect(tryCallSync(() => log(1), undefined)).toBe(1)
    expect(tryCallSync(() => error(), null)).toBe(null)
    expect(tryCallSync(() => error(), () => undefined)).toBe(undefined)
  })
})

describe('isSuccess/isSuccessSync', async () => {
  const log = (value: number) => value
  const asyncLog = async (value: number) => value
  const error = () => {throw new Error('error')}
  const asyncError = async () => {throw new Error('error')}
  
  it('isSuccess', async () => {
    expect(await isSuccess(() => log(1))).toBe(true)
    expect(await isSuccess(() => asyncLog(1))).toBe(true)
    
    expect(await isSuccess(() => error())).toBe(false)
    expect(await isSuccess(() => asyncError())).toBe(false)
  })
  
  it('isSuccessSync', () => {
    expect(isSuccessSync(() => log(1))).toBe(true)
    expect(isSuccessSync(() => error())).toBe(false)
  })
})
