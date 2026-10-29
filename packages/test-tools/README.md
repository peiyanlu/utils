# @peiyanlu/test-tools


[![module](https://img.shields.io/badge/package-ESM--only-FFE536.svg?logo=npm)](https://nodejs.org/api/esm.html)
[![npm](https://img.shields.io/npm/v/@peiyanlu/test-tools.svg)](https://npmjs.com/package/@peiyanlu/test-tools)
[![license](https://img.shields.io/npm/l/@peiyanlu/test-tools.svg)](https://npmjs.com/package/@peiyanlu/test-tools)
[![downloads](https://img.shields.io/npm/dm/@peiyanlu/test-tools.svg)](https://npmjs.com/package/@peiyanlu/test-tools)
[![node](https://img.shields.io/node/v/@peiyanlu/test-tools.svg)](https://nodejs.org)
[![size](https://packagephobia.com/badge?p=@peiyanlu/test-tools)](https://packagephobia.com/result?p=@peiyanlu/test-tools)
[![deps](https://img.shields.io/librariesio/release/npm/@peiyanlu/test-tools)](https://libraries.io/npm/%40peiyanlu%2Ftest-tools)

Lightweight Node.js testing toolkit for isolated filesystem, Git, and setup lifecycle management.

## Features

* 📁 Temporary file system utilities
* ⚙️ Process execution in isolated cwd
* 🧪 Git helpers for test scenarios
* 🧩 Setup lifecycle manager (multi-level)
* 📦 Temp directory utilities
* 🧹 Auto cleanup (Symbol.dispose support)

## Installation

```shell
pnpm add -D @peiyanlu/test-tools
```

## Quick Start

### File + process tool

```ts
import { Tool } from '@peiyanlu/test-tools'


describe('Tool', () => {
  let tool: Tool
  let cwd: string
  
  beforeEach(() => {
    cwd = createTempDir()
    tool = new Tool(cwd)
  })
  
  afterEach(() => {
    tool.cleanup()
  })
  
  it('mkdirSync should create directory', () => {
    tool.mkdirSync('a/b', { recursive: true })
    
    expect(existsSync(resolve(cwd, 'a/b'))).toBe(true)
  })
})
```

### Git tool

```ts
import { GitTool } from '@peiyanlu/test-tools'


describe('GitTool', () => {
  let tool: GitTool
  let cwd: string
  
  beforeEach(() => {
    cwd = createTempDir()
    tool = new GitTool(cwd)
  })
  
  afterEach(() => {
    tool.cleanup()
  })
  
  it('init should initialize repository', () => {
    tool.init()
    tool.writeFileSync('a.txt', 'hello')
    tool.stage('.')
    tool.commit('init')
    
    const branch = tool.currentBranch()
    expect(branch).toBe('master')
    
    const log = tool.logOne()
    expect(log).toBe('init')
  })
})
```

### Setup manager

```ts
import { SetupManager } from '@peiyanlu/test-tools'


const manager = new SetupManager()

manager.setSetup([
  async (ctx) => {
    ctx.ready = true
  },
])

manager.setTeardown(async () => {
  // cleanup logic
})


it('should execute setup functions in order', async () => {
  const ctx = await manager.prepare(1)
  
  expect(ctx.ready).toBe(true)
})
```

### Temp workspace

```ts
import { createTempWorkspace } from '@peiyanlu/test-tools'


const { path, name, remove, empty } = createTempWorkspace()
```

### Auto cleanup

```ts
using tool = new Tool(cwd)
// auto cleanup on scope exit

it('mkdirSync should create directory', () => {
  const cwd = createTempDir()
  using tool = new Tool(cwd)
  
  tool.mkdirSync('a/b', { recursive: true })
  
  expect(existsSync(resolve(cwd, 'a/b'))).toBe(true)
})
```

### Hooks

```ts
import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll } from 'vitest'


const { manager, tool, tempDir, tempDirName } = useToolWithManager(
  GitTool,
  [
    async (ctx) => {
      ctx.ready = true
    },
  ],
  afterAll,
  {
    env: {},
    onTeardown: () => {},
    onAfterAll: () => {},
  },
)
```

## Design

* Each tool is bound to an isolated `cwd`
* No global state
* Temporary directories are auto-generated
* SetupManager supports incremental setup levels

## Use cases

* CLI testing
* Git workflow testing
* filesystem integration tests
* monorepo tooling tests

## License

[MIT](./LICENSE)
