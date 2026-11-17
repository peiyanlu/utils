import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'


const nodeStyleText = vi.hoisted(() =>
  vi.fn(
    (formats: readonly string[] | string, text: string) =>
      `${ typeof formats === 'string' ? formats : formats.join('.') }:${ text }`,
  ),
)

vi.mock('node:util', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:util')>()
  
  return {
    ...original,
    styleText: nodeStyleText,
  }
})


const output = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)
const hasColorsDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'hasColors')
const hasColors = vi.fn(() => false)

Object.defineProperty(process.stdout, 'hasColors', {
  configurable: true,
  value: hasColors,
})

let createNodeStyleText: typeof import('../src/style-text.ts').createNodeStyleText

beforeAll(async () => {
  ;({ createNodeStyleText } = await import('../src/style-text.ts'))
})

afterAll(() => {
  output.mockRestore()
  log.mockRestore()
  
  if (hasColorsDescriptor) {
    Object.defineProperty(process.stdout, 'hasColors', hasColorsDescriptor)
  } else {
    Reflect.deleteProperty(process.stdout, 'hasColors')
  }
})


describe('createNodeStyleText', () => {
  beforeAll(() => {
    nodeStyleText.mockClear()
  })

  it('returns existing function properties without treating them as formats', () => {
    const styled = createNodeStyleText(nodeStyleText)

    expect(styled.name).toBe('styleTextProxy')
    expect(nodeStyleText).not.toHaveBeenCalled()
  })

  it('passes symbol properties through to the function target', () => {
    const styled = createNodeStyleText(nodeStyleText)

    expect(typeof Reflect.get(styled, Symbol.hasInstance)).toBe('function')
    expect(nodeStyleText).not.toHaveBeenCalled()
  })
  
  it('applies chained formats to plain text', () => {
    const styled = createNodeStyleText(nodeStyleText).bold.red('message')
    
    expect(styled).toBe('bold.red:message')
    expect(nodeStyleText).toHaveBeenLastCalledWith([ 'bold', 'red' ], 'message', undefined)
  })
  
  it('supports tagged templates and interpolations', () => {
    const styled = createNodeStyleText(nodeStyleText).cyan`hello ${ 'world' }`
    
    expect(styled).toBe('cyan:hello world')
    expect(nodeStyleText).toHaveBeenLastCalledWith([ 'cyan' ], 'hello world', undefined)
  })
  
  it('passes the configured options to the style function', () => {
    const options = { validateStream: false }
    const styled = createNodeStyleText(nodeStyleText, [ 'underline' ], options)('text')
    
    expect(styled).toBe('underline:text')
    expect(nodeStyleText).toHaveBeenLastCalledWith([ 'underline' ], 'text', options)
  })
  
  it('uses the fallback format when RGB colors are unavailable', () => {
    hasColors.mockReturnValue(false)
    
    const styled = createNodeStyleText(nodeStyleText)['#ff0000, red']('warning')
    
    expect(styled).toBe('red:warning')
    expect(nodeStyleText).toHaveBeenLastCalledWith([ 'red' ], 'warning', undefined)
  })
  
  it('uses the hex format when RGB colors are available', () => {
    hasColors.mockReturnValue(true)
    
    const styled = createNodeStyleText(nodeStyleText)['#ff0000, red']('warning')
    
    expect(styled).toBe('#ff0000:warning')
    expect(nodeStyleText).toHaveBeenLastCalledWith([ '#ff0000' ], 'warning', undefined)
  })
  
  it('omits the hex format when RGB colors are unavailable and no fallback is given', () => {
    hasColors.mockReturnValue(false)
    
    const styled = createNodeStyleText(nodeStyleText)['#FF0000']('warning')
    
    expect(styled).toBe(':warning')
    expect(nodeStyleText).toHaveBeenLastCalledWith([], 'warning', undefined)
  })
})
