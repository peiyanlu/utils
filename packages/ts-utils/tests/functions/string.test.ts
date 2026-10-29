import { describe, expect, it } from 'vitest'
import {
  collapseBlankLines,
  dedent,
  newline,
  space,
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
    const output = `hello
  world
!`
    expect(dedent(input)).toBe(output)
  })
  
  it('should keep relative indentation', () => {
    const input = `
      foo
        bar
          baz
    `
    const output = `foo
  bar
    baz`
    expect(dedent(input)).toBe(output)
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
  
  it('should ', () => {
    expect(dedent('aaaaaaa')).toBe('aaaaaaa')
  })
})
