import { isBetween, randomInt } from './number.js'


export namespace channel {
  /** [0, 255] */
  export const random: () => number = () => randomInt(0, 255)
  
  /** [0, 140] */
  export const dark: () => number = () => randomInt(0, 140)
  
  /** [140, 255] */
  export const light: () => number = () => randomInt(140, 255)
}

export namespace alpha {
  /** [0, 255] 转为 [0, 1] */
  export const random: () => number = () => randomInt(0, 255)
  
  /** [64, 255] 转为 [0.25, 1] */
  export const visible: () => number = () => randomInt(64, 255)
  
  /** [128, 255] 转为 [0.5, 1] */
  export const opaque: () => number = () => randomInt(128, 255)
  
  /** [192, 255] 转为 [0.75, 1] */
  export const solid: () => number = () => randomInt(192, 255)
}


export namespace hex {
  /** 构造随机颜色 */
  export const random = (r: () => number): `#${ string }` => {
    const rgba = [ r(), r(), r() ]
      .map(v => v.toString(16).padStart(2, '0'))
      .join('')
    return `#${ rgba }`
  }
  
  /** 随机颜色 */
  export const randomColor = (): `#${ string }` => {
    return random(channel.random)
  }
  
  /** 随机暗色系颜色 */
  export const randomDarkColor = (): `#${ string }` => {
    return random(channel.dark)
  }
  
  /** 随机浅色系颜色 */
  export const randomLightColor = (): `#${ string }` => {
    return random(channel.light)
  }
  
  /** 是否是 hex 颜色 */
  export const is = (color: string): boolean => {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)
  }
}

export namespace hexa {
  /** 构造随机颜色 */
  export const random = (r: () => number, a: () => number): `#${ string }` => {
    const rgba = [ r(), r(), r(), a() ]
      .map(v => v.toString(16).padStart(2, '0'))
      .join('')
    return `#${ rgba }`
  }
  
  /** 随机颜色 */
  export const randomColor = (): `#${ string }` => {
    return random(channel.random, alpha.random)
  }
  
  /** 随机暗色系颜色 */
  export const randomDarkColor = (): `#${ string }` => {
    return random(channel.dark, alpha.random)
  }
  
  /** 随机浅色系颜色 */
  export const randomLightColor = (): `#${ string }` => {
    return random(channel.light, alpha.random)
  }
  
  /** 是否是 hexa 颜色 */
  export const is = (color: string): boolean => {
    return /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)
  }
}

export namespace rgb {
  /** 构造随机颜色 */
  export const random = (r: () => number): `rgb(${ string })` => {
    return `rgb(${ r() }, ${ r() }, ${ r() })`
  }
  
  /** 随机颜色 */
  export const randomColor = (): `rgb(${ string })` => {
    return random(channel.random)
  }
  
  
  /** 随机暗色系颜色 */
  export const randomDarkColor = (): `rgb(${ string })` => {
    return random(channel.dark)
  }
  
  /** 随机浅色系颜色 */
  export const randomLightColor = (): `rgb(${ string })` => {
    return random(channel.light)
  }
  
  /** 是否是 rgba 颜色 */
  export const is = (color: string): boolean => {
    const match = color.match(/^rgb\((.+)\)$/i)
    if (!match) return false
    
    const vals = match[1].split(',').map(v => Number(v.trim()))
    
    return vals.every(v => isBetween(v, 0, 255))
  }
}

export namespace rgba {
  /** 构造随机颜色 */
  export const random = (r: () => number, a: () => number): `rgba(${ string })` => {
    const alpha = (a() / 255).toFixed(2)
    return `rgba(${ r() }, ${ r() }, ${ r() }, ${ alpha })`
  }
  
  /** 随机颜色 */
  export const randomColor = (): `rgba(${ string })` => {
    return random(channel.random, alpha.random)
  }
  
  
  /** 随机暗色系颜色 */
  export const randomDarkColor = (): `rgba(${ string })` => {
    return random(channel.dark, alpha.random)
  }
  
  /** 随机浅色系颜色 */
  export const randomLightColor = (): `rgba(${ string })` => {
    return random(channel.light, alpha.random)
  }
  
  /** 是否是 rgba 颜色 */
  export const is = (color: string): boolean => {
    const match = color.match(/^rgba\((.+)\)$/i)
    if (!match) return false
    
    const [ r, g, b, a ] = match[1].split(',').map(v => Number(v.trim()))
    
    return [ r, g, b ].every(v => isBetween(v, 0, 255)) &&
      isBetween(a, 0, 1)
  }
}
