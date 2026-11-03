import { command } from '@peiyanlu/command-utils'
import { GitTool, useToolWithManager } from '@peiyanlu/test-tools'
import { onceAsync } from '@peiyanlu/ts-utils'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
  getLatestTag,
  getLocalTags,
  getPreviousTag,
  getRemoteTags,
  gitPushTag,
  gitTag,
  gitTagAnnotated,
  gitTagDelete,
  gitTagDeleteSync,
  gitTagLightweight,
  gitTagSigned,
  gitTagSync,
} from '../src/index.js'


const configureTestSigning = onceAsync(async (TEMP_DIR: string) => {
  const keyDir = join(TEMP_DIR, '.git', 'test-signing')
  
  const privateKeyFile = join(keyDir, 'signing-key')
  const publicKeyFile = `${ privateKeyFile }.pub`
  const allowedSignersFile = join(keyDir, 'allowed_signers')
  
  const name = 'Test Signer'
  const email = 'test@example.test'
  
  mkdirSync(keyDir, { recursive: true })
  
  const keygen = spawnSync(
    'ssh-keygen',
    [ '-q', ...[ '-t', 'ed25519' ], ...[ '-N', '' ], ...[ '-C', email ], ...[ '-f', privateKeyFile ] ],
    { encoding: 'utf-8' },
  )
  
  if (keygen.error || keygen.status !== 0) {
    throw new Error(
      `ssh-keygen failed: ${ keygen.error?.message ?? keygen.stderr }`,
    )
  }
  
  const publicKey = readFileSync(publicKeyFile, 'utf-8').trim()
  writeFileSync(allowedSignersFile, `${ email } ${ publicKey }\n`)
  
  return { email, name, privateKeyFile, allowedSignersFile }
})

const { manager, tool, tempDir: TEMP_DIR } = useToolWithManager(
  GitTool,
  [
    () => { // 1
      tool.init()
      tool.exec(`git init --bare ${ remoteDir }`)
      tool.exec(`git remote add origin ${ remoteDir }`)
      
      tool.writeFileSync('./package.json', '{"version": "1.0.0"}')
      tool.stage()
      tool.commit('feat: first commit')
    },
    async () => {
      const { name, email, privateKeyFile, allowedSignersFile } = await configureTestSigning(TEMP_DIR)
      
      tool.config('user.name', name)
      tool.config('user.email', email)
      tool.config('gpg.format', 'ssh')
      tool.config('user.signingkey', privateKeyFile)
      tool.config('gpg.ssh.allowedSignersFile', allowedSignersFile)
    },
  ],
  afterAll,
  {
    onTeardown: () => {
      rmSync(remoteDir, { recursive: true })
    },
    onAfterAll: () => {
      rmSync(remoteDir, { recursive: true })
    },
  },
)

const remoteDir = join(TEMP_DIR, '..', 'git-utils-test-tag-remote.git')

command.configure({
  cwd: TEMP_DIR,
})


describe('git tag integration', () => {
  it('gitTag should create lightweight tag', async () => {
    await manager.prepare(1)
    
    await gitTag([ 'v1.0.0' ])
    
    expect(tool.exec('git tag').trim()).toBe('v1.0.0')
  })
  
  it('gitTagSync should create lightweight tag', async () => {
    await manager.prepare(1)
    
    gitTagSync([ 'v1.0.0' ])
    
    expect(tool.exec('git tag').trim()).toBe('v1.0.0')
  })
  
  it('gitTagDelete should delete local tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagDelete('v1.0.0')
    
    expect(tool.exec('git tag')).toBe('')
  })
  
  it('deleteTagSync should delete local tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    gitTagDeleteSync('v1.0.0')
    
    expect(tool.exec('git tag')).toBe('')
  })
  
  it('gitTagLightweight should create lightweight tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    
    expect(tool.exec('git tag').trim()).toBe('v1.0.0')
    expect(tool.exec('git cat-file -t refs/tags/v1.0.0').trim()).toBe('commit')
  })
  
  it('gitTagAnnotated should create annotated tag', async () => {
    await manager.prepare(1)
    
    const tag = 'v1.0.0', message = 'release'
    await gitTagAnnotated(tag, message)
    
    expect(tool.exec('git tag')).toContain(tag)
    expect(tool.exec(`git cat-file -t refs/tags/${ tag }`)).toBe('tag')
    expect(tool.exec(`git tag -n99 ${ tag }`)).toContain(message)
  })
  
  it('gitTagSigned should create signed tag', async () => {
    await manager.prepare(2)
    
    const tag = 'v2.0.0', message = 'signed release tag'
    await gitTagSigned(tag, message)
    
    expect(tool.exec('git tag')).toContain(tag)
    expect(tool.exec(`git cat-file -t refs/tags/${ tag }`)).toBe('tag')
    expect(tool.exec(`git tag -n99 ${ tag }`)).toContain(message)
    expect(tool.exec(`git cat-file -p refs/tags/${ tag }`))
      .toContain('-----BEGIN SSH SIGNATURE-----')
    expect(() => tool.exec(`git verify-tag ${ tag }`)).not.toThrow()
  })
  
  it('getLocalTags should return empty array', async () => {
    await manager.prepare(1)
    
    expect(await getLocalTags()).toEqual([])
  })
  
  it('getLocalTags should return tags sorted by version', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v1.1.0')
    await gitTagLightweight('v2.0.0')
    await gitTagLightweight('v1.0.0-beta.1')
    
    expect(await getLocalTags('*', '*beta*')).toEqual([
      'v2.0.0',
      'v1.1.0',
      'v1.0.0',
    ])
  })
  
  it('getLocalTags should support match', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('test-1')
    
    expect(await getLocalTags('v*')).toEqual([
      'v1.0.0',
    ])
  })
  
  it('getLocalTags should support exclude', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v1.0.0-beta.1')
    
    expect(await getLocalTags('*', '*-beta.*')).toEqual([
      'v1.0.0',
    ])
  })
  
  it('getLocalTags should support count', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1')
    await gitTagLightweight('v2')
    await gitTagLightweight('v3')
    
    expect(
      await getLocalTags('*', '*-beta.*', '-v:refname', 2),
    ).toEqual([
      'v3',
      'v2',
    ])
  })
  
  it('getLatestTag should return latest tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v2.0.0')
    
    expect(await getLatestTag()).toBe('v2.0.0')
  })
  
  it('getLatestTag should ignore beta tags', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v2.0.0-beta.1')
    
    expect(await getLatestTag()).toBe('v1.0.0')
  })
  
  it('getLatestTag should return undefined when no tag exists', async () => {
    await manager.prepare(1)
    
    expect(await getLatestTag()).toBeUndefined()
  })
  
  it('getPreviousTag should return previous tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v2.0.0')
    await gitTagLightweight('v3.0.0')
    
    expect(await getPreviousTag('v3.0.0')).toBe('v2.0.0')
  })
  
  it('getPreviousTag should return undefined for oldest tag', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    
    expect(await getPreviousTag('v1.0.0')).toBeUndefined()
  })
  
  it('getRemoteTags should return empty array when remote has no tags', async () => {
    await manager.prepare(1)
    
    expect(await getRemoteTags()).toEqual([])
  })
  
  it('getRemoteTags should return remote tags sorted by version', async () => {
    await manager.prepare(1)
    
    await gitTagLightweight('v1.0.0')
    await gitTagLightweight('v2.0.0')
    
    await gitPushTag('origin', 'v1.0.0')
    await gitPushTag('origin', 'v2.0.0')
    
    expect(await getRemoteTags()).toEqual([
      'v2.0.0',
      'v1.0.0',
    ])
  })
})
