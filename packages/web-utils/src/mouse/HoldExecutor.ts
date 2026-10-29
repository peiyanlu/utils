import type { AbstractClass } from '@peiyanlu/ts-utils'


export type InputEvent = PointerEvent | MouseEvent | KeyboardEvent
export type HoldCallback = (event: InputEvent) => void


export class HoldExecutor {
  protected intervalId: number | null = null
  protected timeoutId: number | null = null
  protected keyPressTime: number = 0
  protected mousePressTime: number = 0
  protected isLongPress: boolean = false
  
  constructor(
    protected onHold: HoldCallback,
    protected onClick: HoldCallback = onHold,
    protected interval: number = 100,
    protected threshold: number = 300,
    protected keys: string[] = [],
  ) {}
  
  public bindPointerEvents(target: HTMLElement | Document): void {
    target.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('blur', this.onAbort)
  }
  
  public unbindPointerEvents(target: HTMLElement | Document): void {
    target.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('blur', this.onAbort)
  }
  
  public bindMouseEvents(target: HTMLElement | Document): void {
    target.addEventListener('mousedown', this.onMouseDown)
    window.addEventListener('blur', this.onAbort)
  }
  
  public unbindMouseEvents(target: HTMLElement | Document): void {
    target.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('blur', this.onAbort)
  }
  
  public bindKeyboardEvents(target: HTMLElement | Document): void {
    target.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('blur', this.onAbort)
  }
  
  public unbindKeyboardEvents(target: HTMLElement | Document): void {
    target.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('blur', this.onAbort)
  }
  
  protected onPointerDown = (event: Event): void => {
    this.handleMousePress(event)
    event.target?.addEventListener('pointerup', this.onPointerUp, { once: true })
  }
  
  protected onPointerUp = (event: Event): void => {
    this.handleRelease(event)
  }
  
  protected onMouseDown = (event: Event): void => {
    this.handleMousePress(event)
    
    event.target?.addEventListener('mouseup', this.onMouseUp, { once: true })
    event.target?.addEventListener('mouseleave', this.onAbort, { once: true })
  }
  
  protected onMouseUp = (event: Event): void => {
    this.handleRelease(event)
  }
  
  protected onKeyDown = (event: Event): void => {
    const evt = event as KeyboardEvent
    if (this.allowKeyboard(evt)) {
      this.handleKeyPress(evt)
    }
    
    evt.target?.addEventListener('keyup', this.onKeyUp, { once: true })
    evt.target?.addEventListener('blur', this.onAbort, { once: true })
  }
  
  protected onKeyUp = (event: Event): void => {
    const evt = event as KeyboardEvent
    if (this.allowKeyboard(evt)) {
      this.handleRelease(event)
    }
  }
  
  protected onAbort = (): void => {
    this.stopLongPress()
  }
  
  protected allowKeyboard(event: KeyboardEvent): boolean {
    return !event.repeat && (this.keys.length === 0 || this.keys.includes(event.key))
  }
  
  protected startLongPress(event: InputEvent): void {
    this.isLongPress = false
    this.stopLongPress()
    
    this.timeoutId = window.setTimeout(() => {
      this.isLongPress = true
      
      this.onHold(event)
      
      this.intervalId = window.setInterval(() => {
        this.onHold(event)
      }, this.interval)
    }, this.threshold)
  }
  
  protected stopLongPress(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
  
  protected handleKeyPress(e: Event): void {
    const event = e as KeyboardEvent
    this.keyPressTime = Date.now()
    this.startLongPress(event)
  }
  
  protected handleMousePress(e: Event): void {
    const event = e as MouseEvent
    this.mousePressTime = Date.now()
    this.startLongPress(event)
  }
  
  protected handleRelease(event: Event): void {
    this.stopLongPress()
    
    if (!this.isLongPress) {
      this.onClick(event as InputEvent)
    }
    
    this.isLongPress = false
  }
}


export const eventOnly = <T extends Event>(ctor: AbstractClass<T>, handler: (e: T) => void): (e: Event) => void => {
  return (e: Event) => {
    if (e instanceof ctor) {
      handler(e)
    }
  }
}

export const keyboardOnly = (handler: (e: KeyboardEvent) => void): (e: Event) => void => {
  return eventOnly(KeyboardEvent, handler)
}

export const mouseOnly = (handler: (e: MouseEvent) => void): (e: Event) => void => {
  return eventOnly(MouseEvent, handler)
}

export const pointerOnly = (handler: (e: PointerEvent) => void): (e: Event) => void => {
  return eventOnly(PointerEvent, handler)
}
