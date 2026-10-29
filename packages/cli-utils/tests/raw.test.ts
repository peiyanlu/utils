import { describe, expect, it, vi } from 'vitest'
import * as raw from '../src/git/raw.js'


const mocks = vi.hoisted(() => ({
  runGit: vi.fn(async () => 'async-output'),
  runGitSync: vi.fn(() => 'sync-output'),
}))

vi.mock('../src/shell.js', () => ({
  runGit: mocks.runGit,
  runGitSync: mocks.runGitSync,
}))


const rawCommands = [
  [ 'gitRevParse', 'gitRevParseSync', 'rev-parse' ],
  [ 'gitRevList', 'gitRevListSync', 'rev-list' ],
  [ 'gitForEachRef', 'gitForEachRefSync', 'for-each-ref' ],
  [ 'gitAdd', 'gitAddSync', 'add' ],
  [ 'gitBranch', 'gitBranchSync', 'branch' ],
  [ 'gitCheckout', 'gitCheckoutSync', 'checkout' ],
  [ 'gitCommit', 'gitCommitSync', 'commit' ],
  [ 'gitConfig', 'gitConfigSync', 'config' ],
  [ 'gitSymbolicRef', 'gitSymbolicRefSync', 'symbolic-ref' ],
  [ 'gitUpdateRef', 'gitUpdateRefSync', 'update-ref' ],
  [ 'gitPush', 'gitPushSync', 'push' ],
  [ 'gitRemote', 'gitRemoteSync', 'remote' ],
  [ 'gitTag', 'gitTagSync', 'tag' ],
  [ 'gitReset', 'gitResetSync', 'reset' ],
  [ 'gitRestore', 'gitRestoreSync', 'restore' ],
  [ 'gitRevert', 'gitRevertSync', 'revert' ],
  [ 'gitLsRemote', 'gitLsRemoteSync', 'ls-remote' ],
  [ 'gitStatus', 'gitStatusSync', 'status' ],
  [ 'gitShow', 'gitShowSync', 'show' ],
  [ 'gitDiff', 'gitDiffSync', 'diff' ],
  [ 'gitStash', 'gitStashSync', 'stash' ],
  [ 'gitRm', 'gitRmSync', 'rm' ],
  [ 'gitMv', 'gitMvSync', 'mv' ],
  [ 'gitCatFile', 'gitCatFileSync', 'cat-file' ],
  [ 'gitLog', 'gitLogSync', 'log' ],
  [ 'gitInit', 'gitInitSync', 'init' ],
  [ 'gitFetch', 'gitFetchSync', 'fetch' ],
] as const

const rawCommandsWithDefaultArgs = [
  [ 'gitCommit', 'gitCommitSync', 'commit' ],
  [ 'gitStatus', 'gitStatusSync', 'status' ],
  [ 'gitDiff', 'gitDiffSync', 'diff' ],
  [ 'gitStash', 'gitStashSync', 'stash' ],
] as const


describe('git raw wrappers', () => {
  it.each(rawCommands)('%s delegates to git %s', async (asyncName, _syncName, command) => {
    const options = { cwd: 'repo', trimEnd: false }
    const args = [ '--flag', 'value' ]
    
    await (raw[asyncName] as any)(args, options)
    
    expect(mocks.runGit).toHaveBeenCalledWith([ command, ...args ], options)
  })
  
  it.each(rawCommands)('%s delegates to git %s synchronously', (_asyncName, syncName, command) => {
    const options = { cwd: 'repo', trimEnd: false }
    const args = [ '--flag', 'value' ]
    
    ;(raw[syncName] as any)(args, options)
    
    expect(mocks.runGitSync).toHaveBeenCalledWith([ command, ...args ], options)
  })
  
  it.each(rawCommandsWithDefaultArgs)('%s defaults to empty args', async (asyncName, _syncName, command) => {
    await (raw[asyncName] as any)()
    
    expect(mocks.runGit).toHaveBeenCalledWith([ command ], undefined)
  })
  
  it.each(rawCommandsWithDefaultArgs)('%s defaults to empty args synchronously', (_asyncName, syncName, command) => {
    ;(raw[syncName] as any)()
    
    expect(mocks.runGitSync).toHaveBeenCalledWith([ command ], undefined)
  })
})
