import { expect, it, vi } from 'vitest'
import { downloadBlob, downloadJson, downloadSvg, downloadText, downloadUrl } from '../src/download.js'


it('downloadUrl should create link and click', () => {
  const click = vi.fn()
  
  const createElement = vi.spyOn(document, 'createElement')
    .mockReturnValue({
      href: '',
      download: '',
      click,
    } as unknown as HTMLAnchorElement)
  
  downloadUrl('test.txt', 'test.txt')
  
  expect(createElement).toHaveBeenCalledWith('a')
  expect(click).toHaveBeenCalled()
})

it('downloadBlob should create object url and revoke', () => {
  const createObjectURL = vi
    .spyOn(URL, 'createObjectURL')
    .mockReturnValue('blob:test')
  
  const revokeObjectURL = vi
    .spyOn(URL, 'revokeObjectURL')
    .mockImplementation(() => {})
  
  const download = vi
    .spyOn(document, 'createElement')
    .mockReturnValue({
      click: vi.fn(),
    } as unknown as HTMLAnchorElement)
  
  const blob = new Blob([ 'hello' ])
  
  downloadBlob(blob, 'test.txt')
  
  expect(createObjectURL).toHaveBeenCalledWith(blob)
  expect(download).toHaveBeenCalledWith('a')
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
})

it('downloadText should download text blob', () => {
  const spy = vi
    .spyOn(URL, 'createObjectURL')
    .mockReturnValue('blob:test')
  
  const download = vi
    .spyOn(document, 'createElement')
    .mockReturnValue({ click: vi.fn() } as unknown as HTMLAnchorElement)
  
  downloadText('hello', 'test.txt')
  
  const blob = spy.mock.calls[0][0] as Blob
  
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.type).toBe('text/plain')
  expect(download).toHaveBeenCalled()
})

it('downloadJson should download json blob', async () => {
  const spy = vi
    .spyOn(URL, 'createObjectURL')
    .mockReturnValue('blob:test')
  
  vi.spyOn(document, 'createElement')
    .mockReturnValue({
      click: vi.fn(),
    } as unknown as HTMLAnchorElement)
  
  downloadJson({
    foo: 'bar',
  }, 'test.json')
  
  const blob = spy.mock.calls[0][0] as Blob
  
  expect(blob.type).toBe('application/json')
  expect(await blob.text()).toBe(JSON.stringify({ foo: 'bar' }, null, 2))
})

it('downloadSvg should download svg blob', async () => {
  const spy = vi
    .spyOn(URL, 'createObjectURL')
    .mockReturnValue('blob:test')
  
  vi.spyOn(document, 'createElement')
    .mockReturnValue({
      click: vi.fn(),
    } as unknown as HTMLAnchorElement)
  
  downloadSvg('<svg></svg>', 'test.svg')
  
  const blob = spy.mock.calls[0][0] as Blob
  
  expect(blob.type).toBe('image/svg+xml')
  expect(await blob.text()).toBe('<svg></svg>')
})
