/** https:// 或 http:// */
export const isHttpUrl = (url: string): boolean => /^https?:\/\//i.test(url)

/** file:// */
export const isFileUrl = (url: string): boolean => /^file:\/\/\//i.test(url)

/** /page 或 #/page */
export const isInternalRoute = (url: string): boolean => /^(#?\/(?!\/))/i.test(url)

/** localhost 或 127.0.0.1 或 [::1] */
export const isLocalhost = (url: string): boolean =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1])(?::\d+)?(?:\/|$)/i.test(url)
