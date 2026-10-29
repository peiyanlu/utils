export const MimeType = {
  // Text
  TEXT: 'text/plain',
  CSV: 'text/csv',
  HTML: 'text/html',
  CSS: 'text/css',
  MARKDOWN: 'text/markdown',
  
  // Data
  JSON: 'application/json',
  XML: 'application/xml',
  WASM: 'application/wasm',
  
  // Image
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',
  BMP: 'image/bmp',
  
  // Audio
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  OGG_AUDIO: 'audio/ogg',
  
  // Video
  MP4: 'video/mp4',
  WEBM_VIDEO: 'video/webm',
  
  // Document
  PDF: 'application/pdf',
  RTF: 'application/rtf',
  
  // Microsoft Office - legacy
  DOC: 'application/msword',
  XLS: 'application/vnd.ms-excel',
  PPT: 'application/vnd.ms-powerpoint',
  
  // Microsoft Office - Open XML
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // Archive
  ZIP: 'application/zip',
  GZIP: 'application/gzip',
  RAR: 'application/vnd.rar',
  SEVEN_ZIP: 'application/x-7z-compressed',
  
  // Binary
  OCTET_STREAM: 'application/octet-stream',
  
} as const


export type MimeType = typeof MimeType[keyof typeof MimeType]
