import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { eventOnly, HoldExecutor, keyboardOnly, mouseOnly, pointerOnly } from '../../src/mouse/HoldExecutor.js'


beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})


describe('PointerEvent', () => {
  it('should call onClick when pointer released before threshold', () => {
    const hold = vi.fn()
    const click = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      click,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindPointerEvents(element)
    element.dispatchEvent(new PointerEvent('pointerdown'))
    element.dispatchEvent(new PointerEvent('pointerup'))
    
    expect(click).toHaveBeenCalledTimes(1)
    expect(hold).not.toHaveBeenCalled()
  })
  
  it('should not call onClick when pointer released after threshold', () => {
    const hold = vi.fn()
    const click = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      click,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindPointerEvents(element)
    element.dispatchEvent(new PointerEvent('pointerdown'))
    
    vi.advanceTimersByTime(500)
    
    element.dispatchEvent(new PointerEvent('pointerup'))
    
    expect(click).toHaveBeenCalledTimes(0)
    expect(hold).toHaveBeenCalled()
  })
  
  it('should call onHold after pointer hold', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindPointerEvents(element)
    element.dispatchEvent(new PointerEvent('pointerdown'))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(1)
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(4)
  })
  
  it('should stop event when window blur', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindPointerEvents(element)
    element.dispatchEvent(new PointerEvent('pointerdown'))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(1)
    
    vi.advanceTimersByTime(5_00)
    
    window.dispatchEvent(new FocusEvent('blur'))
    
    vi.advanceTimersByTime(5_00)
    
    expect(hold).toHaveBeenCalledTimes(6)
  })
})

describe('MouseEvent', () => {
  it('should call onClick when mouse released before threshold', () => {
    const hold = vi.fn()
    const click = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      click,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindMouseEvents(element)
    element.dispatchEvent(new MouseEvent('mousedown'))
    element.dispatchEvent(new MouseEvent('mouseup'))
    
    expect(click).toHaveBeenCalledTimes(1)
    expect(hold).not.toHaveBeenCalled()
  })
  
  it('should not call onClick when mouse released after threshold', () => {
    const hold = vi.fn()
    const click = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      click,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindMouseEvents(element)
    element.dispatchEvent(new MouseEvent('mousedown'))
    
    vi.advanceTimersByTime(500)
    
    element.dispatchEvent(new MouseEvent('mouseup'))
    
    expect(click).toHaveBeenCalledTimes(0)
    expect(hold).toHaveBeenCalled()
  })
  
  it('should call onHold after mouse hold', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindMouseEvents(element)
    element.dispatchEvent(new MouseEvent('mousedown'))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(1)
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(4)
  })
  
  it('should stop event when window blur', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindMouseEvents(element)
    element.dispatchEvent(new MouseEvent('mousedown'))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(1)
    
    vi.advanceTimersByTime(5_00)
    
    window.dispatchEvent(new FocusEvent('blur'))
    
    vi.advanceTimersByTime(5_00)
    
    expect(hold).toHaveBeenCalledTimes(6)
  })
})

describe('KeyboardEvent', () => {
  it('should support keyboard click', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
      [ 'a' ],
    )
    
    const element = document.createElement('div')
    executor.bindKeyboardEvents(element)
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    element.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }))
    
    expect(hold).toHaveBeenCalled()
    
    hold.mockClear()
    
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
    element.dispatchEvent(new KeyboardEvent('keyup', { key: 'b' }))
    
    expect(hold).not.toHaveBeenCalled()
  })
  
  it('should support keyboard hold', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
      [ 'a' ],
    )
    
    const element = document.createElement('div')
    executor.bindKeyboardEvents(element)
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalled()
  })
  
  it('should ignore repeated keydown', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(hold)
    
    const element = document.createElement('div')
    
    executor.bindKeyboardEvents(element)
    
    element.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'a',
      repeat: true,
    }))
    
    vi.advanceTimersByTime(500)
    
    expect(hold).not.toHaveBeenCalled()
  })
  
  it('should stop event when element blur', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindKeyboardEvents(element)
    element.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'a',
      repeat: false,
    }))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(1)
    
    vi.advanceTimersByTime(5_00)
    
    element.dispatchEvent(new FocusEvent('blur'))
    
    vi.advanceTimersByTime(5_00)
    
    expect(hold).toHaveBeenCalledTimes(6)
  })
  
  it('should stop event when window blur', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindKeyboardEvents(element)
    element.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'a',
      repeat: false,
    }))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(1)
    
    vi.advanceTimersByTime(5_00)
    
    window.dispatchEvent(new FocusEvent('blur'))
    
    vi.advanceTimersByTime(5_00)
    
    expect(hold).toHaveBeenCalledTimes(6)
  })
})


describe('unbind events', () => {
  it('should support unbind mouse events', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindMouseEvents(element)
    element.dispatchEvent(new MouseEvent('mousedown'))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(1)
    
    executor.unbindMouseEvents(element)
    element.dispatchEvent(new MouseEvent('mousedown'))
    
    expect(hold).toHaveBeenCalledTimes(1)
  })
  
  it('should support unbind pointer events', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindPointerEvents(element)
    element.dispatchEvent(new PointerEvent('pointerdown'))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(1)
    
    executor.unbindPointerEvents(element)
    element.dispatchEvent(new PointerEvent('pointerdown'))
    
    expect(hold).toHaveBeenCalledTimes(1)
  })
  
  it('should support unbind keyboard events', () => {
    const hold = vi.fn()
    
    const executor = new HoldExecutor(
      hold,
      hold,
      100,
      300,
    )
    
    const element = document.createElement('div')
    executor.bindKeyboardEvents(element)
    
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    
    vi.advanceTimersByTime(300)
    
    expect(hold).toHaveBeenCalledTimes(1)
    
    executor.unbindKeyboardEvents(element)
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    
    expect(hold).toHaveBeenCalledTimes(1)
  })
})


describe('eventOnly', () => {
  it('eventOnly should filter event type', () => {
    const handler = vi.fn()
    
    const listener = eventOnly(PointerEvent, handler)
    listener(new Event('click'))
    expect(handler).not.toHaveBeenCalled()
    
    const listener1 = eventOnly(PointerEvent, handler)
    listener1(new PointerEvent('pointerdown'))
    expect(handler).toHaveBeenCalled()
  })
  
  it('should ', () => {
    const handler = vi.fn()
    const listener = keyboardOnly(handler)
    listener(new KeyboardEvent('keydown', { key: 'a' }))
    expect(handler).toHaveBeenCalled()
  })
  
  it('should ', () => {
    const handler = vi.fn()
    const listener = mouseOnly(handler)
    listener(new MouseEvent('mousedown'))
    expect(handler).toHaveBeenCalled()
  })
  
  it('should ', () => {
    const handler = vi.fn()
    const listener = pointerOnly(handler)
    listener(new PointerEvent('pointerdown'))
    expect(handler).toHaveBeenCalled()
  })
})
