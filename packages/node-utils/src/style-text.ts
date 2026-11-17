import { isString, isSuccessSync } from '@peiyanlu/ts-utils'
import { type InspectColor, styleText as nodeStyleText, type StyleTextOptions } from 'node:util'


export type StyleFormat = InspectColor | `#${ string }`

type StyleFunction = (
  formats: readonly StyleFormat[],
  text: string,
  options?: StyleTextOptions,
) => string

type StyleText = {
  (text: string, options?: StyleTextOptions): string
  (template: TemplateStringsArray, ...substitutions: unknown[]): string
} & { [key in StyleFormat]: StyleText }


const supportsRGB = (options?: StyleTextOptions): boolean => {
  if (!process.stdout.hasColors?.(2 ** 24)) return false
  return isSuccessSync(() => nodeStyleText([ '#000000' ], 'v24.16.0+', options))
}

export const createNodeStyleText = (
  styleText: StyleFunction,
  formats: readonly StyleFormat[] = [],
  options?: StyleTextOptions,
): StyleText => {
  const styleTextProxy = (raw: string | TemplateStringsArray, ...substitutions: unknown[]): string => {
    const text = isString(raw) ? raw : String.raw(raw, ...substitutions)
    return styleText([ ...formats ], text, options)
  }
  
  return new Proxy(styleTextProxy as StyleText, {
    get(target, property, receiver) {
      if (!isString(property) || property in target) {
        return Reflect.get(target, property, receiver)
      }
      
      if (property.startsWith('#')) {
        const [ hex, fallback ] = property.slice(1).split(/,\s*/, 2)
        
        if (!supportsRGB(options)) {
          return fallback
            ? createNodeStyleText(styleText, [ ...formats, fallback as StyleFormat ])
            : createNodeStyleText(styleText, [ ...formats ])
        }
        
        return createNodeStyleText(styleText, [ ...formats, `#${ hex }` as StyleFormat ])
      }
      
      return createNodeStyleText(styleText, [ ...formats, property as StyleFormat ])
    },
  })
}

/**
 * Node.js `styleText` 便利包装：支持模板标签和链式调用。
 * `styleText['#ff0000,red']` 在支持的终端使用十六进制颜色，而在其他终端使用 `red`。
 */
export const styleText: StyleText = createNodeStyleText(nodeStyleText)

/** 按 stdout 的终端能力决定是否生成颜色控制码 */
export const stdout: StyleText = createNodeStyleText(nodeStyleText, [], { stream: process.stdout })

/** 按 stderr 的终端能力决定是否生成颜色控制码 */
export const stderr: StyleText = createNodeStyleText(nodeStyleText, [], { stream: process.stderr })
