import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { splitNonEmptyLines } from '@peiyanlu/ts-utils'
import { afterAll, expect, it } from 'vitest'
import {
  checkVersion,
  checkVersionSync,
  runGit,
  runGitSync,
  runNode,
  runNodeSync,
  runNpm,
  runNpmSync,
} from '../src/index.js'


const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => {
      tool.init()
      tool.writeFileSync('./package.json', '{"version": "1.0.0"}')
      tool.stage()
      tool.commit('first commit')
    },
    () => {
      tool.writeFileSync('./cli.mjs', [
        'console.log(process.env._VITE_TEST_CLI)',
        'console.log(process.argv.slice(2).join(","))',
      ].join('\n'))
      tool.writeFileSync('./multi-line.mjs', [
        'console.log("a")',
        'console.log("b")',
      ].join('\n'))
    },
  ],
  afterAll,
)


const nodePrint = (code: string) => [ '-e', code ]


it('runGit and runGitSync delegate to git execution', async () => {
  await manager.prepare(1)
  
  expect(await runGit([ 'log', '-1', '--pretty=%s' ], { trimEnd: true, cwd: TEMP_DIR }))
    .toBe('first commit')
  expect(runGitSync([ 'log', '-1', '--pretty=%s' ], { trimEnd: true, cwd: TEMP_DIR }))
    .toBe('first commit')
})

it('runNode and runNodeSync delegate to node execution', async () => {
  await expect(runNode(nodePrint('console.log("async")'), { trimEnd: true })).resolves.toBe('async')
  expect(runNodeSync(nodePrint('console.log("sync")'), { trimEnd: true })).toBe('sync')
})

it('runNode and runNodeSync runs js with test environment flag and args', async () => {
  await manager.prepare(2)
  
  const res = runNodeSync([ 'cli.mjs', 'a', 'b' ], {
    env: { ...process.env, _VITE_TEST_CLI: 'true' },
    cwd: TEMP_DIR,
  })
  expect(splitNonEmptyLines(res)).toEqual([ 'true', 'a,b' ])
})

it('runNode and runNodeSync captures multi-line output consistently', async () => {
  await manager.prepare(2)
  
  const str = await runNode([ 'multi-line.mjs' ], {
    trimEnd: false,
    cwd: TEMP_DIR,
  })
  expect(splitNonEmptyLines(str)).toEqual([ 'a', 'b' ])
})

it('runNpm and runNpmSync delegate to npm execution', async () => {
  await manager.prepare(1)
  
  await runNpm([ 'pkg', 'set', 'version="1.0.2"' ], { cwd: TEMP_DIR })
  expect(tool.readFileSync('./package.json', 'utf-8')).toBe('{"version":"1.0.2"}')
  
  runNpmSync([ 'pkg', 'set', 'version="1.0.3"' ], { cwd: TEMP_DIR })
  expect(tool.readFileSync('./package.json', 'utf-8')).toBe('{"version":"1.0.3"}')
})

it('checkVersion and checkVersionSync runs --version command', async () => {
  await expect(checkVersion('node')).resolves.toMatch(/^v\d+\.\d+\.\d+/)
  expect(checkVersionSync('node')).toMatch(/^v\d+\.\d+\.\d+/)
})
