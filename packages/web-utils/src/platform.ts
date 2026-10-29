/** 是否是浏览器环境 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined'
}

/** 是否是浏览器 */
export const isMobile = (): boolean => {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/** 是否是 IOS */
export const isIOS = (): boolean => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/** 是否是安卓 */
export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent)
}
