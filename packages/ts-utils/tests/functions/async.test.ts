import { expect, it, vi } from 'vitest'
import { sleep } from '../../src/index.js'


it('sleep', async () => {
  vi.useFakeTimers()
  
  const fn = vi.fn()
  
  const task = async () => {
    await sleep(500)
    fn(1)
    
    await sleep(1000)
    fn(2)
  }
  
  const promise = task()
  
  await vi.advanceTimersByTimeAsync(500)
  
  expect(fn).toHaveBeenCalledTimes(1)
  expect(fn).toHaveBeenCalledWith(1)
  
  await vi.advanceTimersByTimeAsync(1000)
  
  expect(fn).toHaveBeenCalledTimes(2)
  expect(fn).toHaveBeenCalledWith(2)
  
  await promise
  
  vi.useRealTimers()
})
