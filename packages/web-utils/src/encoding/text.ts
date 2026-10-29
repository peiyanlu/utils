const encoder = new TextEncoder()
const decoder = new TextDecoder()


export const textToUint8 = (text: string): Uint8Array => {
  return encoder.encode(text)
}


export const uint8ToText = (data: Uint8Array): string => {
  return decoder.decode(data)
}
