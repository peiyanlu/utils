/** File → ArrayBuffer */
export const fileToArrayBuffer = async (file: File): Promise<ArrayBuffer> => {
  return await file.arrayBuffer()
}

/** ArrayBuffer → File */
export const arrayBufferToFIle = (buffer: ArrayBuffer, name: string, type?: string): File => {
  return new File([ buffer ], name, { type })
}

/** File → Uint8Array */
export const fileToUint8 = async (file: File): Promise<Uint8Array> => {
  return new Uint8Array(await file.arrayBuffer())
}

/** Uint8Array → File */
export const uint8ToFile = (uint8: Uint8Array, name: string, type?: string): File => {
  return new File([ new Uint8Array(uint8) ], name, { type })
}

/** Blob → File */
export const blobToFile = (blob: Blob, name: string, type?: string): File => {
  return new File([ blob ], name, { type: blob.type || type })
}

// ------------

/** Text → File */
export const textToFile = (text: string, name: string, type = 'text/plain'): File => {
  return new File([ text ], name, { type })
}

/** File → Text */
export const fileToText = (file: File): Promise<string> => {
  return file.text()
}

/** File → JSON */
export const fileToJson = async <T>(file: File): Promise<T> => {
  return JSON.parse(await file.text())
}
