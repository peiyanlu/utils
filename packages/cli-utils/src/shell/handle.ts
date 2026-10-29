import { eol } from '../utils.js'


export const handleError = <T>(
  cmd: string,
  fallback: T | undefined,
  error: string | undefined,
  stderr: string,
) => {
  const msg = `$ ${ cmd }${ eol(2) }${ stderr }`
  switch (error) {
    case 'log': {
      console.error(msg)
      return fallback
    }
    case 'throw':
      throw new Error(msg)
    default:
      return fallback
  }
}
