import { describe, expect, it } from 'vitest'
import { getGithubReleaseUrl, getGithubUrl, parseGitHubRepo } from '../src/index.js'


describe('parseGitHubRepo', () => {
  it('short url', () => {
    expect(parseGitHubRepo('github.com:vuejs/core.git')).toEqual([ 'vuejs', 'core' ])
  })
  
  it('https url', () => {
    expect(parseGitHubRepo('https://github.com/vuejs/core.git')).toEqual([ 'vuejs', 'core' ])
  })
  
  it('https url without .git', () => {
    expect(parseGitHubRepo('https://github.com/vuejs/core')).toEqual([ 'vuejs', 'core' ])
  })
  
  it('https url with tree', () => {
    expect(parseGitHubRepo('https://github.com/vuejs/core/tree/main/packages')).toEqual([ 'vuejs', 'core' ])
  })
  
  it('https url with hash', () => {
    expect(parseGitHubRepo('https://github.com/vuejs/core#readme')).toEqual([ 'vuejs', 'core' ])
  })
  
  it('https url with query', () => {
    expect(parseGitHubRepo('https://github.com/vuejs/core?tab=readme-ov-file')).toEqual([ 'vuejs', 'core' ])
  })
  
  it('ssh url', () => {
    expect(parseGitHubRepo('git@github.com:vuejs/core.git')).toEqual([ 'vuejs', 'core' ])
  })
  
  it('https url without .git', () => {
    expect(parseGitHubRepo('git@github.com:vuejs/core')).toEqual([ 'vuejs', 'core' ])
  })
  
  it('throws on invalid input', () => {
    expect(parseGitHubRepo('not-a-repo')).toEqual([])
    expect(parseGitHubRepo('https://google.com')).toEqual([])
  })
})

describe('url helpers', () => {
  it('getGithubUrl builds repository url', () => {
    expect(getGithubUrl('vuejs', 'core')).toBe('https://github.com/vuejs/core')
  })
  
  it('getGithubReleaseUrl encodes tag in release url', () => {
    expect(getGithubReleaseUrl('vuejs', 'core', 'v1.0.0 beta')).toBe(
      'https://github.com/vuejs/core/releases/tag/v1.0.0%20beta')
  })
})
