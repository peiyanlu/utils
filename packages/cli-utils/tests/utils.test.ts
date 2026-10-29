import { describe, expect, it } from 'vitest'
import { eol, isTestFile, parseArgs, splitLines, stringifyArgs, trimTemplate } from '../src/index.js'


describe('isTestFile', () => {
  describe('directory based', () => {
    it('matches __tests__ folder (unix)', () => {
      expect(isTestFile('src/__tests__/foo.ts')).toBe(true)
    })
    
    it('matches __test__ folder (windows)', () => {
      expect(isTestFile('src\\__test__\\foo.ts')).toBe(true)
    })
    
    it('matches tests folder', () => {
      expect(isTestFile('packages/core/tests/ts')).toBe(true)
    })
    
    it('matches test folder', () => {
      expect(isTestFile('packages/core/test/index.ts')).toBe(true)
    })
    
    it('does not match contest or latest', () => {
      expect(isTestFile('src/contest/foo.ts')).toBe(false)
      expect(isTestFile('src/latest/foo.ts')).toBe(false)
    })
  })
  
  describe('file suffix based', () => {
    it('matches foo.test.ts', () => {
      expect(isTestFile('foo.test.ts')).toBe(true)
    })
    
    it('matches foo.spec.ts', () => {
      expect(isTestFile('foo.spec.ts')).toBe(true)
    })
    
    it('matches foo.unit-test.ts', () => {
      expect(isTestFile('foo.unit-test.ts')).toBe(true)
    })
    
    it('matches foo.e2e-spec.js', () => {
      expect(isTestFile('foo.e2e-spec.js')).toBe(true)
    })
    
    it('matches foo.test.mts', () => {
      expect(isTestFile('foo.test.mts')).toBe(true)
    })
    
    it('matches foo.spec.mjs', () => {
      expect(isTestFile('foo.spec.mjs')).toBe(true)
    })
    
    it('does not match foo.testcase.ts', () => {
      expect(isTestFile('foo.testcase.ts')).toBe(false)
    })
    
    it('does not match foo.specimen.ts', () => {
      expect(isTestFile('foo.specimen.ts')).toBe(false)
    })
  })
  
  describe('vitest special entry files', () => {
    it('matches vitest.config.ts', () => {
      expect(isTestFile('vitest.config.ts')).toBe(true)
    })
    
    it('matches vitest.workspace.ts', () => {
      expect(isTestFile('vitest.workspace.ts')).toBe(true)
    })
    
    it('matches vitest-setup.ts', () => {
      expect(isTestFile('vitest-setup.ts')).toBe(true)
    })
    
    it('matches vitest.global.ts', () => {
      expect(isTestFile('vitest.global.ts')).toBe(true)
    })
  })
  
  describe('negative cases', () => {
    it('does not match normal source files', () => {
      expect(isTestFile('src/index.ts')).toBe(false)
      expect(isTestFile('packages/utils/foo.ts')).toBe(false)
    })
    
    it('does not match test in middle of filename', () => {
      expect(isTestFile('src/testingUtils.ts')).toBe(false)
      expect(isTestFile('src/mytesthelper.ts')).toBe(false)
    })
    
    it('does not match vitest in the middle of filename', () => {
      expect(isTestFile('src/myvitesthelper.ts')).toBe(false)
    })
  })
})

describe('string helpers', () => {
  it('eol repeats OS line endings', () => {
    expect(eol(2)).toBe(eol() + eol())
  })
  
  it('parseArgs splits by spaces after trimming', () => {
    expect(parseArgs('  a b  c  ')).toEqual([ 'a', 'b', '', 'c' ])
    expect(parseArgs('   ')).toEqual([])
  })
  
  it('stringifyArgs joins args with spaces', () => {
    expect(stringifyArgs([ 'a', 'b' ])).toBe('a b')
    expect(stringifyArgs([])).toBe('')
  })
  
  it('trimTemplate removes leading and trailing blank lines', () => {
    expect(trimTemplate(`
      hello
    `)).toBe('      hello')
  })
  
  it('splitLines supports lf and crlf and removes empty lines', () => {
    expect(splitLines('a\n\nb\r\nc\n')).toEqual([ 'a', 'b', 'c' ])
  })
})
