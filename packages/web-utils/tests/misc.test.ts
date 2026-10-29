import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCanvasContext, getCanvasFont, getDomOffset, getTextWidth, lazyLoadImg } from '../src/misc.js'


describe('lazyLoadImg', () => {
  it('should load image when intersecting', () => {
    let callback: IntersectionObserverCallback
    
    const observe = vi.fn()
    const unobserve = vi.fn()
    
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (cb: IntersectionObserverCallback) {
        callback = cb
        
        return {
          observe,
          unobserve,
        }
      }),
    )
    
    const img = document.createElement('img')
    
    img.dataset.src = '/test.png'
    
    lazyLoadImg(img)
    
    expect(observe).toHaveBeenCalledWith(img)
    
    callback!([
      {
        target: img,
        isIntersecting: true,
      },
    ] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver)
    
    expect(img.src).toContain('/test.png')
    expect(img.dataset.src).toBeUndefined()
    expect(unobserve).toHaveBeenCalledWith(img)
  })
  
  it('should not load image when intersecting is false', () => {
    let callback: IntersectionObserverCallback
    
    const observe = vi.fn()
    const unobserve = vi.fn()
    
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (cb: IntersectionObserverCallback) {
        callback = cb
        
        return {
          observe,
          unobserve,
        }
      }),
    )
    
    const img = document.createElement('img')
    
    img.dataset.src = '/test.png'
    
    lazyLoadImg(img)
    
    expect(observe).toHaveBeenCalledWith(img)
    
    callback!([
      {
        target: img,
        isIntersecting: false,
      },
    ] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver)
    
    expect(img.dataset.src).toContain('/test.png')
    expect(img.src).toBe('')
    expect(unobserve).not.toHaveBeenCalledWith(img)
  })
  
  it('should not load image when data-src unset', () => {
    let callback: IntersectionObserverCallback
    
    const observe = vi.fn()
    const unobserve = vi.fn()
    
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(function (cb: IntersectionObserverCallback) {
        callback = cb
        
        return {
          observe,
          unobserve,
        }
      }),
    )
    
    const img = document.createElement('img')
    
    img.dataset.src = ''
    
    lazyLoadImg(img)
    
    expect(observe).toHaveBeenCalledWith(img)
    
    callback!([
      {
        target: img,
        isIntersecting: true,
      },
    ] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver)
    
    expect(img.dataset.src).toContain('')
    expect(img.src).toBe('')
    expect(unobserve).toHaveBeenCalledWith(img)
  })
})

describe('getDomOffset', () => {
  it('should calculate offset from offsetParent chain', () => {
    const parent = document.createElement('div')
    const child = document.createElement('div')
    
    Object.defineProperty(parent, 'offsetLeft', {
      value: 100,
    })
    
    Object.defineProperty(parent, 'offsetTop', {
      value: 50,
    })
    
    Object.defineProperty(child, 'offsetLeft', {
      value: 20,
    })
    
    Object.defineProperty(child, 'offsetTop', {
      value: 30,
    })
    
    Object.defineProperty(child, 'offsetParent', {
      value: parent,
    })
    
    Object.defineProperty(parent, 'offsetParent', {
      value: null,
    })
    
    expect(getDomOffset(child))
      .toEqual({
        left: 120,
        top: 80,
      })
  })
})

describe('ctx', () => {
  beforeEach(() => {
    Object.defineProperty(
      HTMLCanvasElement.prototype,
      'getContext',
      {
        value() {
          return {
            font: '',
            measureText(text: string) {
              return {
                width: text.length * 10,
              }
            },
          }
        },
      },
    )
  })
  
  it('createCanvasContext', () => {
    const ctx = createCanvasContext()
    expect(ctx).toBeTruthy()
  })
  
  it('getCanvasFont', () => {
    expect(getCanvasFont()).toBe('normal normal medium depends on user agent')
    
    const dom = document.createElement('div')
    dom.style.font = '20px Arial'
    expect(getCanvasFont(dom)).toBe('normal normal 20px Arial')
  })
  
  it('getTextWidth use default params', () => {
    expect(getTextWidth('hello')).toBe(50)
  })
  
  it('getTextWidth use custom params', () => {
    const dom = document.createElement('div')
    dom.style.font = '20px Arial'
    
    const ctx = createCanvasContext()
    
    expect(getTextWidth('hello', dom, ctx)).toBe(50)
    expect(ctx.font).toBe('normal normal 20px Arial')
  })
})
