import { spawn } from 'node:child_process'
import { expect, it, vi } from 'vitest'
import { openDir, revealFile } from '../src/focus.js'


vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({
    unref: vi.fn(),
  })),
}))


it('openDir should opens directory', () => {
  const platformTest = vi.spyOn(process, 'platform', 'get')
  platformTest.mockReturnValue('win32')
  
  openDir('c:/tmp/test')
  
  expect(spawn).toHaveBeenCalled()
  
  platformTest.mockReturnValue('darwin')
  
  openDir('/tmp/test')
  
  expect(spawn).toHaveBeenCalled()
  
  platformTest.mockReturnValue('linux')
  
  openDir('/tmp/test')
  
  expect(spawn).toHaveBeenCalled()
  
  platformTest.mockReturnValue('android')
  
  expect(() => openDir('/tmp/test')).toThrow()
})


it('revealFile should reveal files', () => {
  const platformTest = vi.spyOn(process, 'platform', 'get')
  platformTest.mockReturnValue('win32')
  
  revealFile('c:/tmp/test/test.txt')
  
  expect(spawn).toHaveBeenCalled()
  
  platformTest.mockReturnValue('darwin')
  
  revealFile('/tmp/test/test.txt')
  
  expect(spawn).toHaveBeenCalled()
  
  platformTest.mockReturnValue('linux')
  
  revealFile('/tmp/test/test.txt')
  
  expect(spawn).toHaveBeenCalled()
  
  platformTest.mockReturnValue('android')
  
  expect(() => revealFile('/tmp/test/test.txt')).toThrow()
})
