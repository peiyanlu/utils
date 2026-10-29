import { describe, expect, it } from 'vitest'
import { isSVGCode, serializeSVG } from '../src/label.js'


describe('serializeSVG', () => {
  it('should convert empty svg elements to self closing', () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <path></path>
        <rect></rect>
        <circle></circle>
      </svg>
    `
    
    const result = serializeSVG(svg)
    
    expect(result).toContain('<path')
    expect(result).toContain('<rect')
    expect(result).toContain('<circle')
    expect(result).not.toContain('</path>')
    expect(result).not.toContain('</rect>')
    expect(result).not.toContain('</circle>')
  })
  
  it('should keep elements with children', () => {
    const svg = `
      <svg>
        <g>
          <path />
        </g>
      </svg>
    `
    
    const result = serializeSVG(svg)
    
    expect(result).toContain('<g>')
    expect(result).toContain('</g>')
  })
  
  it('should keep svg root element', () => {
    const svg = '<svg></svg>'
    
    const result = serializeSVG(svg)
    
    expect(result).toMatch(/^<svg/)
  })
  
  it('should preserve attributes', () => {
    const svg = `
      <svg>
        <path
          id="test"
          fill="red">
        </path>
      </svg>
    `
    
    const result = serializeSVG(svg)
    
    expect(result).toContain('id="test"')
    expect(result).toContain('fill="red"')
  })
  
  it('should handle invalid svg', () => {
    const svg = '<svg><path></svg>'
    
    expect(() => serializeSVG(svg)).toThrow()
  })
})

describe('isSVGCode', () => {
  it('should return true for empty svg', () => {
    const svg = '<svg></svg>'
    
    expect(isSVGCode(svg)).toBe(true)
  })
  
  it('should return true for valid svg', () => {
    const svg = '<svg><path d="M417" /></svg>'
    
    expect(isSVGCode(svg)).toBe(true)
  })
  
  it('should return false for invalid svg', () => {
    const svg = '<svg><path></svg>'
    
    expect(isSVGCode(svg)).toBe(false)
  })
})
