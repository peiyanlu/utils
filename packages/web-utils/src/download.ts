import { MimeType } from '@peiyanlu/ts-utils'


/** 下载链接 */
export const downloadUrl = (url: string, filename: string): void => {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

/** 下载 Blob */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  
  downloadUrl(url, filename)
  
  URL.revokeObjectURL(url)
}

/** 下载 Text，text/plain */
export const downloadText = (text: string, filename: string): void => {
  downloadBlob(
    new Blob([ text ], { type: MimeType.TEXT }),
    filename,
  )
}

/** 下载 JSON，application/json */
export const downloadJson = (json: unknown, filename: string): void => {
  downloadBlob(
    new Blob([ JSON.stringify(json, null, 2) ], { type: MimeType.JSON }),
    filename,
  )
}

/** 下载 SVG，image/svg+xml */
export const downloadSvg = (svg: string, filename: string): void => {
  downloadBlob(
    new Blob([ svg ], { type: MimeType.SVG }),
    filename,
  )
}
