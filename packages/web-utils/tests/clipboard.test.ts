import { describe, expect, it, vi } from 'vitest'
import { copyBlob, copyText, getPasteFiles, getPasteText, readText } from '../src/clipboard.js'


vi.mock('../src/fs-entry.js', () => ({
  getFilesFromEntry: vi.fn(),
}))


it('copyText should write text', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText,
    },
  })
  
  await copyText('hello')
  
  expect(writeText).toHaveBeenCalledWith('hello')
})

it('readText should read text', async () => {
  const mockReadText = vi.fn().mockResolvedValue('hello')
  
  vi.stubGlobal('navigator', {
    clipboard: {
      readText: mockReadText,
    },
  })
  
  await expect(readText()).resolves.toBe('hello')
})

it('copyBlob should write blob', async () => {
  const write = vi.fn().mockResolvedValue(undefined)
  
  class MockClipboardItem {
    constructor(
      public items: Record<string, Blob>,
    ) {}
  }
  
  vi.stubGlobal(
    'ClipboardItem',
    MockClipboardItem,
  )
  
  vi.stubGlobal('navigator', {
    clipboard: {
      write,
    },
  })
  
  const blob = new Blob([ 'hello' ], { type: 'text/plain' })
  
  await copyBlob(blob)
  
  expect(write).toHaveBeenCalledTimes(1)
  
  const item = write.mock.calls[0][0][0]
  
  expect(item).toBeInstanceOf(MockClipboardItem)
  expect(item.items).toEqual({ 'text/plain': blob })
})

describe('getPasteFiles', () => {
  it('should return all files', async () => {
    const file1 = new File([ 'hello' ], 'hello.txt', {
      type: 'text/plain',
    })
    
    const file2 = new File([ 'world' ], 'world.txt', {
      type: 'text/plain',
    })
    
    const entry1 = {} as FileSystemEntry
    const entry2 = {} as FileSystemEntry
    
    const { getFilesFromEntry } = await import('../src/fs-entry.js')
    
    vi.mocked(getFilesFromEntry)
      .mockResolvedValueOnce([ file1 ])
      .mockResolvedValueOnce([ file2 ])
    
    const evt = {
      clipboardData: {
        items: [
          {
            webkitGetAsEntry: vi.fn(() => entry1),
          },
          {
            webkitGetAsEntry: vi.fn(() => entry2),
          },
        ],
      },
    } as unknown as ClipboardEvent
    
    await expect(getPasteFiles(evt)).resolves.toEqual([
      file1,
      file2,
    ])
    
    expect(getFilesFromEntry).toHaveBeenNthCalledWith(1, entry1)
    expect(getFilesFromEntry).toHaveBeenNthCalledWith(2, entry2)
  })
  
  it('should flatten nested file arrays', async () => {
    const file1 = new File([], '1.txt')
    const file2 = new File([], '2.txt')
    const file3 = new File([], '3.txt')
    
    const { getFilesFromEntry } = await import('../src/fs-entry.js')
    
    vi.mocked(getFilesFromEntry)
      .mockResolvedValueOnce([ file1, file2 ])
      .mockResolvedValueOnce([ file3 ])
    
    const evt = {
      clipboardData: {
        items: [
          {
            webkitGetAsEntry: () => ({} as FileSystemEntry),
          },
          {
            webkitGetAsEntry: () => ({} as FileSystemEntry),
          },
          {
            webkitGetAsEntry: () => null,
          },
        ],
      },
    } as unknown as ClipboardEvent
    
    await expect(getPasteFiles(evt)).resolves.toEqual([
      file1,
      file2,
      file3,
    ])
  })
  
  it('should return empty array when clipboardData is missing', async () => {
    const evt = {} as ClipboardEvent
    
    expect(await getPasteFiles(evt)).toEqual([])
  })
})

describe('getPasteText', () => {
  it('should return plain text', () => {
    const evt = {
      clipboardData: {
        getData: (type: string) => {
          expect(type).toBe('text/plain')
          return 'hello world'
        },
      },
    } as unknown as ClipboardEvent
    
    expect(getPasteText(evt)).toBe('hello world')
  })
  
  it('should return empty string when clipboardData is missing', () => {
    const evt = {} as ClipboardEvent
    
    expect(getPasteText(evt)).toBe('')
  })
})
