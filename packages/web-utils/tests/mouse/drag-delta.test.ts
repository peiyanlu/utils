import { describe, expect, it, vi } from 'vitest'
import { mouseDragDelta, pointerDragDelta } from '../../src/mouse/drag-delta.js'


const testDrag = (
  name: string,
  drag: typeof mouseDragDelta,
  downEvent: Event,
  moveEvent: (x: number, y: number) => Event,
  upEvent: Event,
  otherDownEvent: Event,
) => {
  describe(name, () => {
    it('should call callback with delta', () => {
      const element = document.createElement('div')
      const callback = vi.fn()
      
      drag(element, callback)
      
      element.dispatchEvent(downEvent)
      element.dispatchEvent(moveEvent(110, 120))
      element.dispatchEvent(moveEvent(120, 150))
      window.dispatchEvent(upEvent)
      
      expect(callback).toHaveBeenNthCalledWith(1, 10, 20)
      expect(callback).toHaveBeenNthCalledWith(2, 10, 30)
    })
    
    it('should not call callback when not dragging', () => {
      const element = document.createElement('div')
      const callback = vi.fn()
      
      drag(element, callback)
      
      element.dispatchEvent(moveEvent(100, 100))
      
      expect(callback).not.toHaveBeenCalled()
    })
    
    it('should ignore non left button', () => {
      const element = document.createElement('div')
      const callback = vi.fn()
      
      drag(element, callback)
      
      element.dispatchEvent(otherDownEvent)
      element.dispatchEvent(moveEvent(120, 120))
      
      expect(callback).not.toHaveBeenCalled()
    })
    
    it('should cleanup listeners', () => {
      const element = document.createElement('div')
      const callback = vi.fn()
      
      const dispose = drag(element, callback)
      
      dispose()
      
      element.dispatchEvent(downEvent)
      element.dispatchEvent(moveEvent(120, 120))
      
      expect(callback).not.toHaveBeenCalled()
    })
    
    it('should allow click before dragging', () => {
      const element = document.createElement('div')
      const callback = vi.fn()
      
      drag(element, callback)
      
      element.dispatchEvent(downEvent)
      element.dispatchEvent(moveEvent(101, 101))
      
      expect(callback).toHaveBeenCalledWith(1, 1)
      
      window.dispatchEvent(upEvent)
      
      const click = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
      
      const stop = vi.spyOn(click, 'stopImmediatePropagation')
      
      element.dispatchEvent(click)
      
      expect(click.defaultPrevented).toBe(false)
      expect(stop).not.toHaveBeenCalled()
    })
    
    it('should prevent click after dragging', () => {
      const element = document.createElement('div')
      const callback = vi.fn()
      
      drag(element, callback)
      
      element.dispatchEvent(downEvent)
      element.dispatchEvent(moveEvent(10, 10))
      window.dispatchEvent(upEvent)
      
      const click = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
      
      const stop = vi.spyOn(click, 'stopImmediatePropagation')
      
      element.dispatchEvent(click)
      
      expect(click.defaultPrevented).toBe(true)
      expect(stop).toHaveBeenCalled()
    })
    
    it('should stop dragging when window blur', () => {
      const element = document.createElement('div')
      const callback = vi.fn()
      
      drag(element, callback)
      
      element.dispatchEvent(downEvent)
      element.dispatchEvent(moveEvent(110, 120))
      
      expect(callback).toHaveBeenCalledWith(10, 20)
      
      window.dispatchEvent(new FocusEvent('blur'))
      element.dispatchEvent(moveEvent(120, 140))
      
      expect(callback).toHaveBeenNthCalledWith(1, 10, 20)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })
}


testDrag(
  'mouseDragDelta',
  mouseDragDelta,
  new MouseEvent('mousedown', {
    button: 0,
    clientX: 100,
    clientY: 100,
  }),
  (x, y) => new MouseEvent('mousemove', {
    clientX: x,
    clientY: y,
  }),
  new MouseEvent('mouseup'),
  new MouseEvent('mousedown', {
    button: 2,
    clientX: 100,
    clientY: 100,
  }),
)


testDrag(
  'pointerDragDelta',
  pointerDragDelta,
  new PointerEvent('pointerdown', {
    button: 0,
    clientX: 100,
    clientY: 100,
    pointerId: 1,
  }),
  (x, y) => new PointerEvent('pointermove', {
    clientX: x,
    clientY: y,
    pointerId: 1,
  }),
  new PointerEvent('pointerup', {
    pointerId: 1,
  }),
  new PointerEvent('pointerdown', {
    button: 2,
    clientX: 100,
    clientY: 100,
  }),
)
