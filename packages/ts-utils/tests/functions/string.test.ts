import { describe, expect, it } from 'vitest'
import {
  collapseBlankLines,
  dedent,
  joinWithSpace,
  newline,
  space,
  splitByWhitespace,
  splitLines,
  splitNonEmptyLines,
  trimTemplate,
  upperFirst,
} from '../../src/index.js'


it('upperFirst', () => {
  expect(upperFirst('test')).toBe('Test')
  expect(upperFirst('test1')).toBe('Test1')
  expect(upperFirst('test2')).toBe('Test2')
  expect(upperFirst('')).toBe('')
  expect(upperFirst(' ')).toBe(' ')
})

it('space', () => {
  expect(space(0)).toBe('')
  expect(space()).toBe(' ')
  expect(space(3)).toBe('   ')
  expect(space(-3)).toBe('   ')
})

it('trimTemplate', () => {
  const tpl = `
    hello
  `
  expect(trimTemplate(tpl)).toBe('    hello')
})

it('splitLines', () => {
  expect(splitLines('a\n\nb\r\nc\n')).toEqual([ 'a', '', 'b', 'c', '' ])
  expect(splitLines('a\nb\r\nc\n')).toEqual([ 'a', 'b', 'c', '' ])
  expect(splitLines('a\nb\r\nc')).toEqual([ 'a', 'b', 'c' ])
})

it('splitNonEmptyLines', () => {
  expect(splitNonEmptyLines('a\nb\r\nc')).toEqual([ 'a', 'b', 'c' ])
  expect(splitNonEmptyLines('a\n\nb\r\nc\n')).toEqual([ 'a', 'b', 'c' ])
})

it('splitByWhitespace', () => {
  expect(splitByWhitespace('alpha   beta\tgamma')).toEqual([ 'alpha', 'beta', 'gamma' ])
  expect(splitByWhitespace('  alpha \r\nbeta\ngamma  ')).toEqual([ 'alpha', 'beta', 'gamma' ])
  expect(splitByWhitespace('alpha\n\nbeta\tgamma\n\n')).toEqual([ 'alpha', 'beta', 'gamma' ])
  
  expect(splitByWhitespace('')).toEqual([])
  expect(splitByWhitespace('\n')).toEqual([])
})

it('joinWithSpace', () => {
  expect(joinWithSpace([ 'alpha', 'beta' ])).toBe('alpha beta')
  expect(joinWithSpace([ 'alpha', 'beta', '' ])).toBe('alpha beta ')
  
  expect(joinWithSpace([])).toBe('')
})

it('collapseBlankLines', () => {
  const str1 = `line1${ '\n'.repeat(3) }line2${ '\n'.repeat(5) }}`
  expect(collapseBlankLines(str1))
    .toEqual(`line1${ '\n'.repeat(3) }line2${ '\n'.repeat(3) }}`)
  expect(collapseBlankLines(str1, { threshold: 2, preserve: 1 }))
    .toEqual(`line1${ '\n'.repeat(1) }line2${ '\n'.repeat(1) }}`)
  
  const str2 = `line1${ '\r\n'.repeat(3) }line2${ '\r\n'.repeat(5) }}`
  expect(collapseBlankLines(str2))
    .toEqual(`line1${ '\r\n'.repeat(3) }line2${ '\r\n'.repeat(3) }}`)
  expect(collapseBlankLines(str2, { threshold: 2, preserve: 1 }))
    .toEqual(`line1${ '\r\n'.repeat(1) }line2${ '\r\n'.repeat(1) }}`)
})

it('newline', () => {
  expect(newline(0)).toBe('')
  expect(newline()).toBe('\n')
  expect(newline(3)).toBe('\n\n\n')
  expect(newline(-3)).toBe('\n\n\n')
})

describe('dedent', () => {
  it('should remove common indentation', () => {
    const input = `
      hello
        world
      !
    `
    
    expect(dedent(input)).toBe('hello\n  world\n!')
    expect(dedent(input, l => l.trimStart())).toBe('hello\nworld\n!')
  })
  
  it('should keep relative indentation', () => {
    const input = `
      foo
        bar
          baz
    `
    
    expect(dedent(input)).toBe('foo\n  bar\n    baz')
    expect(dedent(input, l => l.trimStart())).toBe('foo\nbar\nbaz')
  })
  
  it('should trim empty lines', () => {
    const str = `
        
        hello
        
      `
    expect(dedent(str)).toBe('hello')
  })
  
  it('should handle no indentation', () => {
    expect(dedent('hello\nworld')).toBe('hello\nworld')
  })
  
  it('should handle empty string', () => {
    expect(dedent(' \n\n ')).toBe('')
  })
  
  it('should support custom format function', () => {
    const infer = [ 1, 2, 3 ].join('\n')
    const text = `
      hello
      
      ${ infer }
      
      world!
    `
    
    expect(dedent(text, l => l.trimStart())).toBe('hello\n\n1\n2\n3\n\nworld!')
  })
})
