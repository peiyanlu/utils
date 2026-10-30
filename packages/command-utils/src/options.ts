import { AsyncLocalStorage } from 'node:async_hooks'


export class Options<Opts extends object> {
  private defaultOptions: Partial<Opts> = {}
  private storage = new AsyncLocalStorage<Partial<Opts>>()
  
  private get inheritedOptions(): Partial<Opts> {
    return this.storage.getStore() ?? {}
  }
  
  configure(defaultOptions: Partial<Opts>): void {
    Object.assign(this.defaultOptions, defaultOptions)
  }
  
  resolve<T extends Opts>(callOptions?: T): Partial<Opts> & T {
    return {
      ...this.defaultOptions,
      ...this.inheritedOptions,
      ...callOptions,
    } as Partial<Opts> & T
  }
  
  run<R>(scopeOptions: Partial<Opts>, callback: () => R): R {
    return this.storage.run(
      {
        ...this.inheritedOptions,
        ...scopeOptions,
      },
      callback,
    ) as R
  }
}
