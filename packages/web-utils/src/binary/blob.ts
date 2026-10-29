/** Blob → ArrayBuffer */
export const blobToArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
  return await blob.arrayBuffer()
}

/** ArrayBuffer → Blob */
export const arrayBufferToBlob = (buffer: ArrayBuffer, type?: string): Blob => {
  return new Blob([ buffer ], { type })
}

/** Blob → Uint8Array */
export const blobToUint8 = async (blob: Blob): Promise<Uint8Array> => {
  return new Uint8Array(await blob.arrayBuffer())
}

/** Uint8Array → Blob */
export const uint8ToBlob = (uint8: Uint8Array, type?: string): Blob => {
  return new Blob([ new Uint8Array(uint8) ], { type })
}

// ------------

/** Blob → Text */
export const blobToText = async (blob: Blob): Promise<string> => {
  return await blob.text()
}

/** Blob → JSON */
export const blobToJson = async <T = unknown>(blob: Blob): Promise<T> => {
  return JSON.parse(await blob.text())
}

/** Text → Blob */
export const textToBlob = (text: string, type = 'text/plain'): Blob => {
  return new Blob([ text ], { type })
}
