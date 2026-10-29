import { isNull } from '@peiyanlu/ts-utils'


const svgDoc = (svg: string): Document => {
  return new DOMParser().parseFromString(svg, 'image/svg+xml')
}

const isParserErr = (doc: Document): boolean => {
  return !isNull(doc.querySelector('parsererror'))
}


/** 序列化 SVG */
export const serializeSVG = (svg: string): string => {
  const doc = svgDoc(svg)
  if (isParserErr(doc)) {
    throw new Error('Invalid SVG')
  }
  return new XMLSerializer().serializeToString(doc.documentElement)
}

/** 判断 SVG 代码是否有效 */
export const isSVGCode = (svg: string): boolean => {
  const doc = svgDoc(svg)
  return 'svg' === doc.documentElement.tagName && !isParserErr(doc)
}
