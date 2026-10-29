import { describe, expect, it } from 'vitest'
import { assert, getCallStack, throwError } from '../../src/index.js'


describe('throwError', () => {
  it('should support string', () => {
    expect(() => throwError('error')).toThrow('error')
  })
  
  it('should support Error', () => {
    expect(() => throwError(new Error('error'))).toThrow('error')
  })
})

describe('assert', () => {
  it('should support string', () => {
    expect(() => assert(false, 'error')).toThrow('error')
  })
  
  it('should support Error', () => {
    expect(() => assert(false, new Error('error'))).toThrow('error')
  })
  
  it('should support default params', () => {
    expect(() => assert(false)).toThrow('Assertion failed')
  })
  
  it('should pass when value is truthy', () => {
    expect(() => assert(true)).not.toThrow()
  })
})

describe('getCallStack', () => {
  it('should get call stack', () => {
    const foo = () => {
      return getCallStack()
    }
    
    const stack = foo()
    
    expect(stack).toContain('foo')
    expect(stack).not.toContain('getCallStack')
  })
  
  it('should get nested call stack', () => {
    const foo = () => bar()
    
    const bar = () => getCallStack()
    
    const stack = foo()
    
    expect(stack).toContain('foo')
    expect(stack).toContain('bar')
  })
  
  it('should support async function', async () => {
    const foo = async () => {
      return getCallStack()
    }
    
    const stack = await foo()
    
    expect(stack).toContain('foo')
  })
})
