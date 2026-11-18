import { cancel, isCancel } from '@clack/prompts'
import { styleText } from '@peiyanlu/node-utils'
import { describe, expect, it, vi } from 'vitest'
import { abortTask, question, singlePrompt } from '../src/prompts.ts'


vi.mock('@clack/prompts', () => ({
  cancel: vi.fn(),
  isCancel: vi.fn(),
}))

vi.mock('@peiyanlu/node-utils', () => ({
  styleText: {
    green: vi.fn((value: string) => `green(${ value })`),
    yellow: vi.fn((value: string) => `yellow(${ value })`),
  },
}))

const cancelValue = Symbol('cancel')


describe('abortTask', () => {
  it('shows the supplied message and exits successfully', () => {
    const exitError = new Error('process.exit called')
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw exitError
    })
    
    expect(() => abortTask('Cancelled by user')).toThrow(exitError)
    expect(cancel).toHaveBeenCalledWith('Cancelled by user')
    expect(process.exit).toHaveBeenCalledWith(0)
  })
  
  it('uses a default message when none is supplied', () => {
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called')
    })
    
    expect(() => abortTask()).toThrow('process.exit called')
    expect(cancel).toHaveBeenCalledWith('✕ Task cancelled.')
  })
})

describe('singlePrompt', () => {
  it('returns the prompt result', async () => {
    const result = await singlePrompt(() => Promise.resolve('answer'))
    
    expect(result).toBe('answer')
    expect(isCancel).toHaveBeenCalledWith('answer')
  })
  
  it('aborts with the supplied message when the prompt is cancelled', async () => {
    vi.mocked(isCancel).mockImplementation(value => value === cancelValue)
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called')
    })
    
    await expect(singlePrompt(() => cancelValue, 'Prompt cancelled')).rejects.toThrow('process.exit called')
    expect(cancel).toHaveBeenCalledWith('Prompt cancelled')
    expect(process.exit).toHaveBeenCalledWith(0)
  })
  
  it('propagates errors from the prompt function', async () => {
    const error = new Error('prompt failed')
    
    await expect(singlePrompt(() => Promise.reject(error))).rejects.toBe(error)
  })
})

describe('question', () => {
  it('uses green for a regular prompt', () => {
    expect(question('Continue?')).toBe('green(?) Continue?')
    expect(styleText.green).toHaveBeenCalledWith('?')
    expect(styleText.yellow).not.toHaveBeenCalled()
  })
  
  it('uses yellow for a dry-run prompt', () => {
    expect(question('Continue?', true)).toBe('yellow(?) Continue?')
    expect(styleText.yellow).toHaveBeenCalledWith('?')
    expect(styleText.green).not.toHaveBeenCalled()
  })
})
