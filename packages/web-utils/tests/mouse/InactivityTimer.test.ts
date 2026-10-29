import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { InactivityTimer } from '../../src/mouse/InactivityTimer.js'


beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

it('should enter idle after timeout', () => {
  vi.setSystemTime(10000)
  
  const onIdle = vi.fn()
  
  const timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
  )
  timer.start()
  
  vi.advanceTimersByTime(1000)
  
  expect(onIdle).toHaveBeenCalledTimes(1)
  expect(timer.isIdle).toBe(true)
  
  timer.destroy()
})

it('should reset timer when activity event fired', () => {
  const onIdle = vi.fn()
  
  const timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
    [ 'mousemove' ],
  )
  timer.start()
  
  vi.advanceTimersByTime(500)
  
  window.dispatchEvent(new Event('mousemove'))
  
  vi.advanceTimersByTime(500)
  
  expect(onIdle).not.toHaveBeenCalled()
  
  vi.advanceTimersByTime(500)
  
  expect(onIdle).toHaveBeenCalledTimes(1)
  
  timer.destroy()
})

it('should call onActive when leaving idle', () => {
  vi.setSystemTime(10000)
  
  const onIdle = vi.fn()
  const onActive = vi.fn()
  
  const timer = new InactivityTimer(
    onIdle,
    onActive,
    1000,
    [ 'mousemove' ],
  )
  timer.start()
  
  vi.advanceTimersByTime(1000)
  
  expect(timer.isIdle).toBe(true)
  
  window.dispatchEvent(new Event('mousemove'))
  
  expect(timer.isIdle).toBe(false)
  expect(onActive).toHaveBeenCalledTimes(1)
  
  timer.destroy()
})

it('should pause timer', () => {
  const onIdle = vi.fn()
  
  const timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
  )
  
  timer.pause()
  
  vi.advanceTimersByTime(2000)
  
  expect(onIdle).not.toHaveBeenCalled()
  expect(timer.isIdle).toBe(false)
  
  timer.destroy()
})

it('should resume remaining time', () => {
  const onIdle = vi.fn()
  
  const timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
  )
  timer.start()
  
  vi.advanceTimersByTime(400)
  
  timer.pause()
  
  vi.advanceTimersByTime(1000)
  
  expect(onIdle).not.toHaveBeenCalled()
  
  timer.resume()
  
  vi.advanceTimersByTime(599)
  
  expect(onIdle).not.toHaveBeenCalled()
  
  vi.advanceTimersByTime(1)
  
  expect(onIdle).toHaveBeenCalledTimes(1)
  
  timer.destroy()
})

it('should enter idle immediately when remaining time is zero', () => {
  const onIdle = vi.fn()
  
  const timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
  )
  timer.start()
  
  vi.advanceTimersByTime(1000)
  
  timer.pause()
  
  expect(timer.isIdle).toBe(true)
  
  timer.resume()
  
  expect(onIdle).toHaveBeenCalledTimes(1)
  
  timer.destroy()
})

it('should cleanup after destroy', () => {
  const onIdle = vi.fn()
  
  const timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
  )
  timer.start()
  
  timer.destroy()
  
  vi.advanceTimersByTime(2000)
  
  expect(onIdle).not.toHaveBeenCalled()
  
  timer.destroy()
})

it('should pause when document hidden', () => {
  const onIdle = vi.fn()
  
  const timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
  )
  timer.start()
  
  Object.defineProperty(
    document,
    'visibilityState',
    {
      configurable: true,
      value: 'hidden',
    },
  )
  
  document.dispatchEvent(new Event('visibilitychange'))
  
  vi.advanceTimersByTime(2000)
  
  expect(onIdle).not.toHaveBeenCalled()
  
  timer.destroy()
})

it('should resume when document becomes visible', () => {
  vi.setSystemTime(10000)
  
  const onIdle = vi.fn()
  
  const timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
  )
  timer.start()
  
  vi.advanceTimersByTime(500)
  
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: 'hidden',
  })
  document.dispatchEvent(new Event('visibilitychange'))
  
  expect(onIdle).not.toHaveBeenCalled()
  
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: 'visible',
  })
  document.dispatchEvent(new Event('visibilitychange'))
  
  vi.advanceTimersByTime(500)
  
  expect(onIdle).toHaveBeenCalledTimes(1)
  
  timer.destroy()
})

it('should calculate remaining time', () => {
  vi.setSystemTime(10000)
  
  const timer = new InactivityTimer(
    vi.fn(),
    undefined,
    1000,
  )
  timer.start()
  
  vi.setSystemTime(10500)
  
  expect(timer.getInactiveDuration())
    .toBe(500)
  
  expect(timer.getRemainingTime())
    .toBe(500)
  
  timer.destroy()
})

it('should not restart after destroy', () => {
  const onIdle = vi.fn()
  const timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
  )
  timer.destroy()
  
  timer.start()
  
  vi.advanceTimersByTime(2000)
  
  expect(onIdle).toHaveBeenCalledTimes(0)
  
  timer.destroy()
  
  expect(() => timer.destroy()).not.toThrow()
  
  timer.destroy()
})


it('should support Symbol.dispose', () => {
  const onIdle = vi.fn()
  using timer = new InactivityTimer(
    onIdle,
    undefined,
    1000,
  )
  timer.start()
  
  vi.advanceTimersByTime(2000)
  
  expect(onIdle).toHaveBeenCalledTimes(1)
})
