import { type Class, isNewable } from '@peiyanlu/ts-utils'
import { type Context, type SetupFn, SetupManager } from './manager.js'
import { Tool } from './tools/index.js'
import { createTempWorkspace } from './utils.js'


type ToolFactory<T extends Tool> = Class<T> | ((tempDir: string, env: NodeJS.ProcessEnv) => T)


const createTool = <T extends Tool>(factory: ToolFactory<T>, tempDir: string, env: NodeJS.ProcessEnv): T => {
  return isNewable(factory) ? new factory(tempDir, env) : factory(tempDir, env)
}


export const useTool = <T extends Tool = Tool>(
  factory: ToolFactory<T>,
  options?: {
    env?: NodeJS.ProcessEnv;
  },
): {
  tool: T;
  tempDir: string;
  tempDirName: string;
} => {
  const { env = {} } = options ?? {}
  
  const { path: tempDir, name: tempDirName } = createTempWorkspace()
  const tool = createTool(factory, tempDir, env)
  
  return { tool, tempDir, tempDirName }
}


export const useToolWithManager = <
  T extends Tool = Tool,
  Ctx extends Context = Context
>(
  factory: ToolFactory<T>,
  setups: SetupFn<Ctx>[],
  afterAll: (fn: () => void) => void,
  options?: {
    env?: NodeJS.ProcessEnv;
    onTeardown?: () => void;
    onAfterAll?: () => void;
  },
): {
  manager: SetupManager<Ctx>;
  tool: T;
  tempDir: string;
  tempDirName: string;
} => {
  const { env = {}, onTeardown, onAfterAll } = options ?? {}
  
  const { tool, tempDir, tempDirName } = useTool(factory, { env })
  const manager = new SetupManager<Ctx>()
  
  manager.setSetup(setups)
  manager.setTeardown(() => {
    tool.cleanup(true)
    onTeardown?.()
  })
  afterAll(() => {
    tool.cleanup()
    onAfterAll?.()
  })
  
  return {
    manager,
    tool,
    tempDir,
    tempDirName,
  }
}
