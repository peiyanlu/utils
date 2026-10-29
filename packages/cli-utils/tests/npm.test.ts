import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readJsonFile } from '../src/file-dir.js'
import * as npm from '../src/npm.js'
import { getPackageUrl } from '../src/npm.js'
import { runNpm } from '../src/shell.js'


vi.mock('../src/shell.js', () => ({
  runNpm: vi.fn(),
}))

vi.mock('../src/file-dir.js', () => ({
  readJsonFile: vi.fn(),
}))

const mockRunNpm = vi.mocked(runNpm)
const mockReadJsonFile = vi.mocked(readJsonFile)


describe('accessArg', () => {
  it('should use default access', () => {
    expect(npm.accessArg()).toEqual([
      '--access',
      'public',
    ])
  })
  
  it('should use custom access', () => {
    expect(npm.accessArg('restricted')).toEqual([
      '--access',
      'restricted',
    ])
  })
})

describe('registryArg', () => {
  it('should use default registry', () => {
    expect(npm.registryArg()).toEqual([
      '--registry',
      'https://registry.npmjs.org/',
    ])
  })
  
  it('should use custom registry', () => {
    expect(npm.registryArg('https://foo.com')).toEqual([
      '--registry',
      'https://foo.com',
    ])
  })
})

describe('tagArg', () => {
  it('should use default tag', () => {
    expect(npm.tagArg()).toEqual([
      '--tag',
      'latest',
    ])
  })
  
  it('should use custom tag', () => {
    expect(npm.tagArg('beta')).toEqual([
      '--tag',
      'beta',
    ])
  })
})

describe('getRegistry', () => {
  it('should use publishConfig registry', async () => {
    mockReadJsonFile.mockReturnValue({
      publishConfig: {
        registry: 'https://foo.com',
      },
    } as any)
    
    expect(await npm.getRegistry('.'))
      .toBe('https://foo.com/')
  })
  
  it('should use npm config registry', async () => {
    mockReadJsonFile.mockReturnValue({} as any)
    mockRunNpm.mockResolvedValue('https://bar.com')
    
    expect(await npm.getRegistry('.'))
      .toBe('https://bar.com/')
  })
  
  it('should keep trailing slash', async () => {
    mockReadJsonFile.mockReturnValue({
      publishConfig: {
        registry: 'https://foo.com/',
      },
    } as any)
    
    expect(await npm.getRegistry('.'))
      .toBe('https://foo.com/')
  })
  
  it('should fallback to default registry', async () => {
    mockReadJsonFile.mockReturnValue({} as any)
    mockRunNpm.mockResolvedValue(undefined)
    
    expect(await npm.getRegistry('.'))
      .toBe('https://registry.npmjs.org/')
  })
})

describe('getAccess', () => {
  it('should use publishConfig access', async () => {
    mockReadJsonFile.mockReturnValue({
      name: 'foo',
      publishConfig: {
        access: 'restricted',
      },
    } as any)
    
    expect(await npm.getAccess('.'))
      .toBe('restricted')
  })
  
  it('should use restricted for scoped package', async () => {
    mockReadJsonFile.mockReturnValue({
      name: '@scope/foo',
    } as any)
    
    expect(await npm.getAccess('.'))
      .toBe('restricted')
  })
  
  it('should use public for unscoped package', async () => {
    mockReadJsonFile.mockReturnValue({
      name: 'foo',
    } as any)
    
    expect(await npm.getAccess('.'))
      .toBe('public')
  })
})

describe('pingRegistry', () => {
  it('should return true', async () => {
    mockRunNpm.mockResolvedValue('pong')
    
    expect(await npm.pingRegistry())
      .toBe(true)
  })
  
  it('should return false', async () => {
    mockRunNpm.mockResolvedValue(undefined)
    
    expect(await npm.pingRegistry())
      .toBe(false)
  })
})

describe('getAuthenticatedUser', () => {
  it('should call npm whoami', async () => {
    mockRunNpm.mockResolvedValue('alice')
    
    expect(await npm.getAuthenticatedUser())
      .toBe('alice')
    
    expect(mockRunNpm).toHaveBeenCalledWith([
      'whoami',
      '--registry',
      'https://registry.npmjs.org/',
    ])
  })
})

describe('hasWriteAccess', () => {
  it('should return true', async () => {
    mockRunNpm.mockResolvedValue(JSON.stringify({
      alice: 'read-write',
    }))
    
    expect(await npm.hasWriteAccess('foo', 'alice'))
      .toBe(true)
  })
  
  it('should return false', async () => {
    mockRunNpm.mockResolvedValue(JSON.stringify({
      alice: 'read-only',
    }))
    
    expect(await npm.hasWriteAccess('foo', 'alice'))
      .toBe(false)
  })
  
  it('should return false when user not collaborator', async () => {
    mockRunNpm.mockResolvedValue(undefined)
    
    expect(await npm.hasWriteAccess('foo', 'alice'))
      .toBe(false)
  })
})

describe('getPublishedVersion', () => {
  it('should call npm view version', async () => {
    mockRunNpm.mockResolvedValue('1.0.0')
    
    expect(await npm.getPublishedVersion('foo'))
      .toBe('1.0.0')
    
    expect(mockRunNpm).toHaveBeenCalledWith([
      'view',
      'foo',
      'version',
      '--registry',
      'https://registry.npmjs.org/',
    ])
  })
})

describe('getDistTags', () => {
  it('should return dist tags', async () => {
    mockRunNpm.mockResolvedValue(JSON.stringify({
      latest: '1.0.0',
      beta: '2.0.0',
    }))
    
    expect(await npm.getDistTags('foo'))
      .toEqual([
        'latest',
        'beta',
      ])
  })
  
  it('should return empty array', async () => {
    mockRunNpm.mockResolvedValue(undefined)
    
    expect(await npm.getDistTags('foo'))
      .toEqual([])
  })
})

describe('bumpPackageVersion', () => {
  it('should call npm version', async () => {
    mockRunNpm.mockResolvedValue('1.0.1')
    
    await npm.bumpPackageVersion(
      '1.0.1',
      [ '--force' ],
      '/tmp',
    )
    
    expect(mockRunNpm).toHaveBeenCalledWith(
      [
        'version',
        '1.0.1',
        '--workspaces=false',
        '--no-git-tag-version',
        '--allow-same-version',
        '--force',
      ],
      {
        cwd: '/tmp',
      },
    )
  })
})

describe('publishPackage', () => {
  it('should call npm publish', async () => {
    mockRunNpm.mockResolvedValue('ok')
    
    await npm.publishPackage({
      tag: 'beta',
      access: 'restricted',
      registry: 'https://foo.com/',
      cwd: '/tmp',
      args: [ '--provenance' ],
    })
    
    expect(mockRunNpm).toHaveBeenCalledWith(
      [
        'publish',
        '--tag',
        'beta',
        '--access',
        'restricted',
        '--registry',
        'https://foo.com/',
        '--workspaces=false',
        '--provenance',
      ],
      {
        cwd: '/tmp',
        error: 'throw',
      },
    )
  })
  
  it('should call npm publish use defaults', async () => {
    mockRunNpm.mockResolvedValue('ok')
    
    await npm.publishPackage()
    
    expect(mockRunNpm).toHaveBeenCalledWith(
      [
        'publish',
        '--tag',
        'latest',
        '--access',
        'public',
        '--registry',
        'https://registry.npmjs.org/',
        '--workspaces=false',
      ],
      {
        cwd: '.',
        error: 'throw',
      },
    )
  })
})

describe('resolvePublishTag', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  
  it('should return prerelease tag', async () => {
    expect(await npm.resolvePublishTag(
      'foo',
      '1.0.0-beta.1',
    )).toBe('beta')
  })
  
  it('should return next when prerelease id is missing', async () => {
    mockRunNpm.mockResolvedValue('1.0.0')
    
    expect(await npm.resolvePublishTag(
      'foo',
      '1.0.0-0',
    )).toBe('next')
  })
  
  it('should return latest when package is not published', async () => {
    mockRunNpm.mockResolvedValue(undefined)
    
    expect(await npm.resolvePublishTag(
      'foo',
      '1.0.0',
    )).toBe('latest')
  })
  
  it('should return previous', async () => {
    mockRunNpm.mockResolvedValue('2.0.0')
    
    expect(await npm.resolvePublishTag(
      'foo',
      '1.0.0',
    )).toBe('previous')
  })
  
  it('should return latest when version is equal', async () => {
    mockRunNpm.mockResolvedValue('1.0.0')
    
    expect(await npm.resolvePublishTag(
      'foo',
      '1.0.0',
    )).toBe('latest')
  })
  
  it('should return latest when version is newer', async () => {
    mockRunNpm.mockResolvedValue('1.0.0')
    
    expect(await npm.resolvePublishTag(
      'foo',
      '2.0.0',
    )).toBe('latest')
  })
})

describe('isOtpError', () => {
  it('should detect one-time password error', () => {
    expect(
      npm.isOtpError(
        new Error('One-time password required'),
      ),
    ).toBe(true)
  })
  
  it('should detect otp error', () => {
    expect(
      npm.isOtpError(
        new Error('OTP required'),
      ),
    ).toBe(true)
  })
  
  it('should return false for normal error', () => {
    expect(
      npm.isOtpError(
        new Error('network error'),
      ),
    ).toBe(false)
  })
  
  it('should return false for non Error', () => {
    expect(
      npm.isOtpError('otp'),
    ).toBe(false)
  })
})

describe('canPublish', () => {
  it('should return true when publish succeeds', async () => {
    mockRunNpm.mockResolvedValue('ok')
    
    expect(await npm.canPublish())
      .toBe(true)
  })
  
  it('should return true for previously published error', async () => {
    mockRunNpm.mockRejectedValue(
      new Error('previously published versions'),
    )
    
    expect(await npm.canPublish())
      .toBe(true)
  })
  
  it('should return true for cannot publish over error', async () => {
    mockRunNpm.mockRejectedValue(
      new Error('cannot publish over existing version'),
    )
    
    expect(await npm.canPublish())
      .toBe(true)
  })
  
  it('should return false for other errors', async () => {
    mockRunNpm.mockRejectedValue(new Error('network error'))
    
    await expect(() => npm.canPublish()).rejects.toThrow()
    
    mockRunNpm.mockClear()
    mockRunNpm.mockRejectedValue(new Error('previously published versions'))
    
    expect(await npm.canPublish()).toBe(true)
  })
})

describe('getPackageUrl', () => {
  it('should builds npm package version url', () => {
    expect(getPackageUrl('@scope/pkg', '1.0.0')).toBe('https://www.npmjs.com/package/@scope/pkg/v/1.0.0')
  })
})
