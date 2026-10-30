import { newline, space } from '@peiyanlu/ts-utils'


const formatError = (cmd: string, stderr: string) => {
  const detail = stderr.trim()
  
  return [
    'Command failed',
    `${ space(2) }command: ${ cmd }`,
    `${ space(2) }details:`,
    detail
      ? detail.split(/\r?\n/)
        .map(line => `${ space(4) }${ line }`)
        .join(newline())
      : `${ space(4) }(no error output)`,
  ].join(newline())
}

export const handleError = (cmd: string, stderr: string, error?: string) => {
  const message = formatError(cmd, stderr)
  
  switch (error) {
    case 'log':
      console.error(message)
      return ''
    
    case 'throw':
      throw new Error(message)
    
    default:
      return ''
  }
}
