import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'


export interface TempWorkspace {
  path: string;
  name: string;
  remove: () => void;
  empty: () => void;
}


export const TEST_TEMP_DIR_NAME: string = '.test-tools'

export const TEST_TEMP_DIR: string = resolve(process.cwd(), TEST_TEMP_DIR_NAME)

export const createTempDirectory = (parent: string = TEST_TEMP_DIR): string => {
  mkdirSync(parent, { recursive: true })
  return mkdtempSync(join(parent, 'temp-'))
}

export const createTempWorkspace = (parent: string = TEST_TEMP_DIR): TempWorkspace => {
  const path = createTempDirectory(parent)
  const name = basename(path)
  
  const remove = () => {
    rmSync(path, { recursive: true, force: true })
  }
  const empty = () => {
    rmSync(path, { recursive: true, force: true })
    mkdirSync(path, { recursive: true })
  }
  
  return { path, name, remove, empty }
}


/** @deprecated Use TEST_TEMP_DIR_NAME instead. */
export const TEST_TMP_DIR_NAME: string = TEST_TEMP_DIR_NAME

/** @deprecated Use TEST_TEMP_DIR instead. */
export const TEST_TMP_DIR: string = TEST_TEMP_DIR


/** @deprecated Use TEST_TEMP_DIR_NAME instead. */
export const ROOT_DIR: string = TEST_TEMP_DIR_NAME

/** @deprecated Use TEST_TEMP_DIR instead. */
export const TEST_TMP_ROOT: string = TEST_TEMP_DIR

/** @deprecated Use createTempDirectory instead. */
export const createTempDir = (parent: string = TEST_TEMP_DIR): string => {
  mkdirSync(parent, { recursive: true })
  return mkdtempSync(join(parent, 'temp-'))
}
