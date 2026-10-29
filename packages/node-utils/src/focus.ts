import { spawn } from 'node:child_process'
import { dirname } from 'node:path'


/** 打开文件夹 */
export const openDir = (dir: string): void => {
  let cmd: string
  let args: string[]
  
  switch (process.platform) {
    case 'win32':
      cmd = 'cmd'
      args = [ '/c', 'start', '', dir ]
      break
    
    case 'darwin':
      cmd = 'open'
      args = [ dir ]
      break
    
    case 'linux':
      cmd = 'xdg-open'
      args = [ dir ]
      break
    
    default:
      throw new Error(`Unsupported platform: ${ process.platform }`)
  }
  
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref()
}

/** 显示文件 */
export const revealFile = (file: string): void => {
  let cmd: string
  let args: string[]
  
  switch (process.platform) {
    case 'win32':
      cmd = 'explorer.exe'
      args = [ `/select,${ file }` ]
      break
    
    case 'darwin':
      cmd = 'open'
      args = [ '-R', file ]
      break
    
    case 'linux':
      cmd = 'xdg-open'
      args = [ dirname(file) ]
      break
    
    default:
      throw new Error(`Unsupported platform: ${ process.platform }`)
  }
  
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref()
}
