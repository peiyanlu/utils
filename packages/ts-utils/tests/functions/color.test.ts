import { describe, expect, it } from 'vitest'
import { alpha, channel, hex, hexa, rgb, rgba } from '../../src/index.js'


const hexColorRegex = /^#[0-9a-f]{6}$/i
const hexaColorRegex = /^#[0-9a-f]{8}$/i
const rgbColorRegex = /^rgb\((.+)\)$/i
const rgbaColorRegex = /^rgba\((.+)\)$/i


const hexToChannels = (color: string) => {
  const hex = color.slice(1)
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ]
}

const hexaToChannels = (color: string) => {
  const hex = color.slice(1)
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
    parseInt(hex.slice(6, 8), 16),
  ]
}

const rgbToChannels = (color: string) => {
  const rgba = color.match(rgbColorRegex)?.[1]?.split(/,\s*/) ?? []
  return rgba.map(Number)
}

const rgbaToChannels = (color: string) => {
  const rgba = color.match(rgbaColorRegex)?.[1]?.split(/,\s*/) ?? []
  return rgba.map(Number)
}


const expectRange = (value: number, min: number, max: number) => {
  expect(value).toBeGreaterThanOrEqual(min)
  expect(value).toBeLessThanOrEqual(max)
}

const expectChannelsRange = (channels: number[], min: number, max: number) => {
  channels.forEach(channel => {
    expectRange(channel, min, max)
  })
}


type ColorGenerator = () => string


const testHexColor = (
  name: string,
  generator: ColorGenerator,
  rgbMin: number,
  rgbMax: number,
) => {
  describe(name, () => {
    it('should return 6 digit hex color', () => {
      const color = generator()
      
      expect(color).toMatch(hexColorRegex)
      expect(color).toHaveLength(7)
    })
    
    it(`should generate rgb channels between ${ rgbMin } and ${ rgbMax }`, () => {
      const [ r, g, b ] = hexToChannels(generator())
      
      expectChannelsRange(
        [ r, g, b ],
        rgbMin,
        rgbMax,
      )
    })
  })
}

const testHexaColor = (
  name: string,
  generator: ColorGenerator,
  rgbMin: number,
  rgbMax: number,
) => {
  describe(name, () => {
    it('should return 8 digit hexa color', () => {
      const color = generator()
      
      expect(color).toMatch(hexaColorRegex)
      expect(color).toHaveLength(9)
    })
    
    it(`should generate rgb channels between ${ rgbMin } and ${ rgbMax }`, () => {
      const [ r, g, b, a ] = hexaToChannels(generator())
      
      expectChannelsRange(
        [ r, g, b ],
        rgbMin,
        rgbMax,
      )
      
      expectRange(a, 0, 255)
    })
  })
}

const testRgbColor = (
  name: string,
  generator: ColorGenerator,
  rgbMin: number,
  rgbMax: number,
) => {
  describe(name, () => {
    it('should return valid rgb color', () => {
      const color = generator()
      
      expect(color).toMatch(rgbColorRegex)
    })
    
    it(`should generate rgb channels between ${ rgbMin } and ${ rgbMax }`, () => {
      const [ r, g, b ] = rgbToChannels(generator())
      
      expectChannelsRange(
        [ r, g, b ],
        rgbMin,
        rgbMax,
      )
    })
  })
}

const testRgbaColor = (
  name: string,
  generator: ColorGenerator,
  rgbMin: number,
  rgbMax: number,
) => {
  describe(name, () => {
    it('should return valid rgba color', () => {
      const color = generator()
      
      expect(color).toMatch(rgbaColorRegex)
    })
    
    it(`should generate rgb channels between ${ rgbMin } and ${ rgbMax }`, () => {
      const [ r, g, b, a ] = rgbaToChannels(generator())
      
      expectChannelsRange(
        [ r, g, b ],
        rgbMin,
        rgbMax,
      )
      
      expectRange(a, 0, 1)
    })
  })
}


const testHexaAlpha = (
  alphaFn: () => number,
  min: number,
) => {
  const color = hexa.random(channel.random, alphaFn)
  const [ , , , a ] = hexaToChannels(color)
  
  expectRange(a, min * 255, 255)
}

const testRgbaAlpha = (
  alphaFn: () => number,
  min: number,
) => {
  const color = rgba.random(channel.random, alphaFn)
  const [ , , , a ] = rgbaToChannels(color)
  
  expectRange(a, min, 1)
}


describe('hex', () => {
  testHexColor(
    'randomColor',
    hex.randomColor,
    0,
    255,
  )
  
  testHexColor(
    'randomDarkColor',
    hex.randomDarkColor,
    0,
    140,
  )
  
  testHexColor(
    'randomLightColor',
    hex.randomLightColor,
    140,
    255,
  )
  
  it('is', () => {
    expect(hex.is('#fff')).toBe(true)
    expect(hex.is('#fff8')).toBe(false)
    expect(hex.is('#ffffff')).toBe(true)
    expect(hex.is('#ffffff80')).toBe(false)
    expect(hex.is('ffffff')).toBe(false)
    expect(hex.is('#ggg')).toBe(false)
  })
})

describe('hexa', () => {
  testHexaColor(
    'randomColor',
    hexa.randomColor,
    0,
    255,
  )
  
  testHexaColor(
    'randomDarkColor',
    hexa.randomDarkColor,
    0,
    140,
  )
  
  testHexaColor(
    'randomLightColor',
    hexa.randomLightColor,
    140,
    255,
  )
  
  it('is', () => {
    expect(hexa.is('#fff')).toBe(true)
    expect(hexa.is('#fff8')).toBe(true)
    expect(hexa.is('#ffffff')).toBe(true)
    expect(hexa.is('#ffffff80')).toBe(true)
    expect(hexa.is('ffffff')).toBe(false)
    expect(hexa.is('#ggg')).toBe(false)
  })
})

describe('rgb', () => {
  testRgbColor(
    'randomColor',
    rgb.randomColor,
    0,
    255,
  )
  
  testRgbColor(
    'randomDarkColor',
    rgb.randomDarkColor,
    0,
    140,
  )
  
  testRgbColor(
    'randomLightColor',
    rgb.randomLightColor,
    140,
    255,
  )
  
  it('is', () => {
    expect(rgb.is('rgb(1,1,1,1)')).toBe(true)
    expect(rgb.is('rgb(1,1,1,.1)')).toBe(true)
    expect(rgb.is('rgb(1,1,1,.51)')).toBe(true)
    expect(rgb.is('rgb(1,1,1,1)')).toBe(true)
    expect(rgb.is('rgba(1, 1, 1, 1)')).toBe(false)
  })
})

describe('rgba', () => {
  testRgbaColor(
    'randomColor',
    rgba.randomColor,
    0,
    255,
  )
  
  testRgbaColor(
    'randomDarkColor',
    rgba.randomDarkColor,
    0,
    140,
  )
  
  testRgbaColor(
    'randomLightColor',
    rgba.randomLightColor,
    140,
    255,
  )
  
  it('is', () => {
    expect(rgba.is('rgba(1,1,1,1)')).toBe(true)
    expect(rgba.is('rgba(1,1,1,.1)')).toBe(true)
    expect(rgba.is('rgba(1,1,1,.51)')).toBe(true)
    expect(rgba.is('rgb(1,1,1,1)')).toBe(false)
    expect(rgba.is('rgba(1, 1, 1, 1)')).toBe(true)
  })
})


describe('alpha', () => {
  const alphaCases = [
    [ 'random alpha', alpha.random, 0 ],
    [ 'visible alpha', alpha.visible, 0.25 ],
    [ 'opaque alpha', alpha.opaque, 0.5 ],
    [ 'solid alpha', alpha.solid, 0.75 ],
  ] as const
  
  describe('hexa', () => {
    it.each(alphaCases)(
      'should generate color with $0',
      (_, alphaFn, min) => {
        testHexaAlpha(alphaFn, min)
      },
    )
  })
  
  describe('rgba', () => {
    it.each(alphaCases)(
      'should generate color with $0',
      (_, alphaFn, min) => {
        testRgbaAlpha(alphaFn, min)
      },
    )
  })
})
