import { Tool, useToolWithManager } from '@peiyanlu/test-tools'
import { afterAll, expect, it } from 'vitest'
import { runWorker } from '../src/worker.ts'


const code = [
  `import { parentPort, workerData } from 'node:worker_threads'`,
  `const result = workerData.a + workerData.b`,
  `parentPort.postMessage(result)`,
].join('\n')

const codeErr = [
  `import { parentPort, workerData } from 'node:worker_threads'`,
  `const result = workerData.a + workerData.b`,
  `process.exit(1)`,
  `parentPort.postMessage(result)`,
].join('\n')


const { manager, tool } = useToolWithManager(
  Tool,
  [
    () => {
      tool.writeFileSync('worker.ts', code)
    },
    () => {
      tool.writeFileSync('worker.ts', codeErr)
    },
  ],
  afterAll,
)


it('runWorker use file with success', async () => {
  await manager.prepare(1)
  
  expect(await runWorker(tool.resolve('worker.ts'), { a: 1, b: 5 })).toBe(6)
})

it('runWorker use file with exit', async () => {
  await manager.prepare(2)
  
  await expect(() => runWorker(tool.resolve('worker.ts'), { a: 1, b: 5 })).rejects.toThrow()
})


it('runWorker use code with success', async () => {
  expect(await runWorker(code, { a: 1, b: 5 }, true)).toBe(6)
  await expect(() => runWorker(code, { a: 1, b: 5 }, false)).rejects.toThrow()
})

it('runWorker use code with exit', async () => {
  await expect(() => runWorker(codeErr, { a: 1, b: 5 }, false)).rejects.toThrow()
})
