/** ArrayBuffer → Uint8Array (copy-safe) */
export const arrayBufferToUint8 = (data: ArrayBuffer): Uint8Array => {
  return new Uint8Array(data.slice(0))
}

/** Uint8Array → ArrayBuffer (copy-safe) */
export const uint8ToArrayBuffer = (data: Uint8Array): ArrayBuffer => {
  const uint8 = new Uint8Array(data)
  return uint8.buffer.slice(
    uint8.byteOffset,
    uint8.byteOffset + uint8.byteLength,
  )
}

/** 复制为 uint8 */
export const safeUint8 = (data: ArrayBuffer | Uint8Array): Uint8Array => {
  return data instanceof Uint8Array
    ? new Uint8Array(data)
    : new Uint8Array(data.slice(0))
}
