type EventKey = keyof WindowEventMap | keyof DocumentEventMap


export const DEFAULT_TIMEOUT: number = 30 * 60 * 1000
export const DEFAULT_EVENTS: EventKey[] = [ 'mousemove', 'keydown', 'scroll', 'click' ]


export class InactivityTimer {
  protected timerId: number | null = null
  protected readonly disposers: (() => void)[] = []
  protected lastActiveTime: number = Date.now()
  protected isDestroyed: boolean = false
  protected idle: boolean = false
  protected paused: boolean = false
  protected remainingTime = 0
  
  constructor(
    protected readonly onIdle: () => void,
    protected readonly onActive?: () => void,
    protected readonly timeout: number = DEFAULT_TIMEOUT,
    protected readonly events: EventKey[] = DEFAULT_EVENTS,
  ) {
    this.setupEventListeners()
  }
  
  public get isIdle(): boolean {
    return this.idle
  }
  
  public getRemainingTime(): number {
    return Math.max(0, this.timeout - this.getInactiveDuration())
  }
  
  public getInactiveDuration(): number {
    return Date.now() - this.lastActiveTime
  }
  
  public start(): void {
    if (this.isDestroyed) return
    
    this.lastActiveTime = Date.now()
    
    this.leaveIdle()
    this.clearTimer()
    
    this.timerId = window.setTimeout(() => this.enterIdle(), this.timeout)
  }
  
  public pause(): void {
    if (this.isDestroyed || this.isIdle || this.paused) return
    
    this.remainingTime = this.getRemainingTime()
    
    this.paused = true
    this.clearTimer()
  }
  
  public resume(): void {
    if (this.isDestroyed || this.isIdle || !this.paused) return
    
    this.paused = false
    this.clearTimer()
    
    this.timerId = window.setTimeout(() => this.enterIdle(), this.remainingTime)
  }
  
  public destroy(): void {
    if (this.isDestroyed) return
    
    this.isDestroyed = true
    this.clearTimer()
    
    this.disposers.forEach(f => f())
    this.disposers.length = 0
  }
  
  [Symbol.dispose](): void {
    this.destroy()
  }
  
  protected clearTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }
  
  protected enterIdle(): void {
    this.clearTimer()
    
    this.idle = true
    
    this.onIdle()
  }
  
  protected leaveIdle(): void {
    if (!this.idle) return
    
    this.idle = false
    
    this.onActive?.()
  }
  
  protected setupEventListeners(): void {
    const handler = () => this.start()
    this.events.forEach(eventType => {
      window.addEventListener(eventType, handler, { passive: true })
      
      this.disposers.push(() => {
        window.removeEventListener(eventType, handler)
      })
    })
    
    const vHandler = () => this.onVisibilityChange()
    document.addEventListener('visibilitychange', vHandler)
    this.disposers.push(() => {
      document.removeEventListener('visibilitychange', vHandler)
    })
  }
  
  protected onVisibilityChange(): void {
    if (document.visibilityState !== 'visible') {
      this.pause()
    } else {
      this.resume()
    }
  }
}
