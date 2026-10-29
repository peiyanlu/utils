export const uint8ToBase64 = (data: Uint8Array): string => {
  let binary = ''
  
  for (const byte of data) {
    binary += String.fromCharCode(byte)
  }
  
  return btoa(binary)
}


export const base64ToUint8 = (value: string): Uint8Array => {
  const binary = atob(value)
  const result = new Uint8Array(binary.length)
  
  for (let i = 0; i < binary.length; i++) {
    result[i] = binary.charCodeAt(i)
  }
  
  return result
}


export const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader()
    
    reader.onload = () => resolve(reader.result as string)
    
    reader.readAsDataURL(blob)
  })
}
