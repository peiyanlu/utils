import { expect, it, vi } from 'vitest'
import * as fsEntry from '../src/fs-entry.js'
import {
  getDirectoryEntries,
  getFileFromFileEntry,
  getFilesFromEntry,
  isDirectoryEntry,
  isFileEntry,
} from '../src/fs-entry.js'


it('isFileEntry', () => {
  const fileEntry = {
    isFile: true,
    isDirectory: false,
  } as FileSystemFileEntry
  
  const directoryEntry = {
    isFile: false,
    isDirectory: true,
  } as FileSystemDirectoryEntry
  
  expect(isFileEntry(fileEntry)).toBe(true)
  expect(isFileEntry(directoryEntry)).toBe(false)
})

it('isDirectoryEntry', () => {
  const fileEntry = {
    isFile: true,
    isDirectory: false,
  } as FileSystemFileEntry
  
  const directoryEntry = {
    isFile: false,
    isDirectory: true,
  } as FileSystemDirectoryEntry
  
  expect(isDirectoryEntry(fileEntry)).toBe(false)
  expect(isDirectoryEntry(directoryEntry)).toBe(true)
})

it('getFileFromFileEntry', async () => {
  const file = new File([ 'hello' ], 'hello.txt')
  
  const entry = {
    file: vi.fn((resolve: (file: File) => void) => {
      resolve(file)
    }),
  } as unknown as FileSystemFileEntry
  
  await expect(getFileFromFileEntry(entry)).resolves.toBe(file)
  
  expect(entry.file).toHaveBeenCalledOnce()
})

it('getFileFromFileEntry reject', async () => {
  const error = new Error('boom')
  
  const entry = {
    file: vi.fn((_: any, reject: (err: Error) => void) => {
      reject(error)
    }),
  } as unknown as FileSystemFileEntry
  
  await expect(getFileFromFileEntry(entry)).rejects.toThrow('boom')
})

it('getDirectoryEntries', async () => {
  const e1 = {} as FileSystemEntry
  const e2 = {} as FileSystemEntry
  
  const reader = {
    readEntries: vi.fn((resolve: any) => {
      resolve([ e1, e2 ])
    }),
  }
  
  let called = false
  
  reader.readEntries = vi.fn((resolve: any) => {
    if (!called) {
      called = true
      resolve([ e1, e2 ])
    } else {
      resolve([])
    }
  })
  
  const entry = {
    createReader: () => reader,
  } as unknown as FileSystemDirectoryEntry
  
  await expect(getDirectoryEntries(entry)).resolves.toEqual([ e1, e2 ])
  
  expect(reader.readEntries).toHaveBeenCalledTimes(2)
})

it('getDirectoryEntries reject', async () => {
  const error = new Error('boom')
  
  const reader = {
    readEntries: vi.fn((_: any, reject: any) => reject(error)),
  }
  
  const entry = {
    createReader: () => reader,
  } as unknown as FileSystemDirectoryEntry
  
  await expect(getDirectoryEntries(entry)).rejects.toThrow('boom')
})


it('getFilesFromEntry(file)', async () => {
  const file = new File([], 'a.txt')
  
  vi.spyOn(fsEntry, 'getFileFromFileEntry')
    .mockResolvedValue(file)
  
  const entry = {
    isFile: true,
    isDirectory: false,
    file: vi.fn(resolve => resolve(file)),
  } as unknown as FileSystemFileEntry
  
  await expect(fsEntry.getFilesFromEntry(entry))
    .resolves.toEqual([ file ])
})

it('getFilesFromEntry(directory)', async () => {
  const file1 = new File([], '1.txt')
  const file2 = new File([], '2.txt')
  
  const fileEntry1 = {
    isFile: true,
    isDirectory: false,
    file: (resolve: any) => resolve(file1),
  } as FileSystemFileEntry
  
  const fileEntry2 = {
    isFile: true,
    isDirectory: false,
    file: (resolve: any) => resolve(file2),
  } as FileSystemFileEntry
  
  let first = true
  
  const reader = {
    readEntries: vi.fn(resolve => {
      if (first) {
        first = false
        resolve([ fileEntry1, fileEntry2 ])
      } else {
        resolve([])
      }
    }),
  }
  
  const directory = {
    isFile: false,
    isDirectory: true,
    createReader: () => reader,
  } as unknown as FileSystemDirectoryEntry
  
  await expect(getFilesFromEntry(directory))
    .resolves.toEqual([ file1, file2 ])
})

it('getFilesFromEntry(unknown)', async () => {
  const entry = {
    isFile: false,
    isDirectory: false,
  } as FileSystemEntry
  
  await expect(getFilesFromEntry(entry)).resolves.toEqual([])
})
