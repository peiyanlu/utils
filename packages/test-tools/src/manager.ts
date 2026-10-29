import { assert, type Dict, type MaybePromise, once } from '@peiyanlu/ts-utils'


export type Context = Dict
export type SetupFn<T extends Context> = (context: T) => MaybePromise<void>
export type TeardownFn = () => MaybePromise<void>


export class SetupManager<T extends Context> {
  protected setupFns: SetupFn<T>[] = []
  protected onceSetups: SetupFn<T>[] = []
  protected teardown?: TeardownFn
  protected preparedLevel = 0
  protected context = {} as T
  
  get setupCount(): number {
    return this.setupFns.length
  }
  
  get onceSetupCount(): number {
    return this.onceSetups.length
  }
  
  setSetup(fns: SetupFn<T>[]): void {
    this.setupFns = [ ...fns ]
    this.onceSetups = fns.map(once)
  }
  
  async prepare(level: number, strict = true): Promise<Readonly<T>> {
    const shouldReset = strict
      ? this.preparedLevel >= level
      : this.preparedLevel > level
    
    if (shouldReset) {
      assert(this.teardown, 'Missing teardown. Call `setTeardown()`.')
      
      await this.teardown()
      this.reset()
    }
    
    const n = Math.min(this.onceSetupCount, level)
    for (let i = 0; i < n; i++) {
      await this.onceSetups[i](this.context)
    }
    
    this.preparedLevel = level
    
    return Object.freeze({ ...this.context })
  }
  
  setTeardown(fn: TeardownFn): void {
    this.teardown = fn
  }
  
  protected reset(): void {
    this.onceSetups = this.setupFns.map(once)
    this.context = {} as T
    this.preparedLevel = 0
  }
}
