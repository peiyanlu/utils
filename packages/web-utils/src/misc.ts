/** 图片懒加载， 需要 `data-src` */
export const lazyLoadImg = (dom: HTMLImageElement): void => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lazyImg = entry.target as HTMLImageElement
        const src = lazyImg.dataset.src
        if (src) {
          lazyImg.src = src
          lazyImg.removeAttribute('data-src')
        }
        observer.unobserve(lazyImg)
      }
    })
  })
  observer.observe(dom)
}

/** 计算元素相对于 offsetParent 层级的累计偏移 */
export const getDomOffset = (dom: HTMLElement): { left: number; top: number; } => {
  let left = dom.offsetLeft
  let top = dom.offsetTop
  let parent = dom.offsetParent as (HTMLElement | null)
  while (parent) {
    left += parent.offsetLeft
    top += parent.offsetTop
    parent = parent.offsetParent as (HTMLElement | null)
  }
  return { left, top }
}

/** 创建 ctx */
export const createCanvasContext = (): CanvasRenderingContext2D => {
  const canvas = document.createElement('canvas')
  return canvas.getContext('2d')!
}

/**
 * 从指定的参考元素获取 Canvas 字体样式字符串，默认 document.body
 *
 * @return 'style weight size family'
 */
export const getCanvasFont = (refer?: HTMLElement): string => {
  const style = getComputedStyle(refer ?? document.body)
  return [
    style.fontStyle,
    style.fontWeight,
    style.fontSize,
    style.fontFamily,
  ].join(' ')
}

/** 获取文本宽度 */
export const getTextWidth = (text: string, refer?: HTMLElement, ctx?: CanvasRenderingContext2D): number => {
  ctx ??= createCanvasContext()
  ctx.font = getCanvasFont(refer)
  return ctx.measureText(text).width
}
