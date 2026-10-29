import { describe, expect, it } from 'vitest'
import {
  isArray,
  isAsyncFunction,
  isBigInt,
  isBlankString,
  isBoolean,
  isDate,
  isEmpty,
  isEmptyArray,
  isEmptyMap,
  isEmptyObject,
  isEmptySet,
  isEmptyString,
  isFinite,
  isFunction,
  isIndex,
  isInstanceOf,
  isInteger,
  isMap,
  isNewable,
  isNonNullable,
  isNotEmpty,
  isNotObject,
  isNull,
  isNullable,
  isNumber,
  isObject,
  isPlainObject,
  isPositive,
  isPrimitive,
  isPromise,
  isRegExp,
  isSet,
  isString,
  isSymbol,
  isSyncFunction,
  isUndefined,
  isZero,
} from '../../src/index.js'


class Foo {}


describe('type', () => {
  it('isObject', () => {
    expect(isObject({})).toBe(true)
    expect(isObject(new Foo())).toBe(true)
    expect(isObject(null)).toBe(false)
    expect(isObject([])).toBe(true)
    expect(isObject(() => [])).toBe(false)
  })
  
  it('isNotObject', () => {
    expect(isNotObject({})).toBe(false)
    expect(isNotObject(new Foo())).toBe(false)
    expect(isNotObject(null)).toBe(true)
    expect(isNotObject([])).toBe(false)
    expect(isNotObject(() => [])).toBe(true)
  })
  
  it('isPlainObject', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject(Object.create(null))).toBe(true)
    expect(isPlainObject(new Foo())).toBe(false)
    expect(isPlainObject(null)).toBe(false)
  })
  
  it('isFunction', () => {
    expect(isFunction('')).toBe(false)
    expect(isFunction([])).toBe(false)
    expect(isFunction({})).toBe(false)
    expect(isFunction(Foo)).toBe(true)
    expect(isFunction(Array)).toBe(true)
    expect(isFunction(() => void 0)).toBe(true)
  })
  
  it('isSyncFunction', () => {
    expect(isSyncFunction(Foo)).toBe(true)
    expect(isSyncFunction(Array)).toBe(true)
    expect(isSyncFunction(() => void 0)).toBe(true)
    expect(isSyncFunction(async () => void 0)).toBe(false)
  })
  
  it('isAsyncFunction', () => {
    expect(isAsyncFunction(Foo)).toBe(false)
    expect(isAsyncFunction(Array)).toBe(false)
    expect(isAsyncFunction(() => void 0)).toBe(false)
    expect(isAsyncFunction(async () => void 0)).toBe(true)
  })
  
  it('isInstanceOf', () => {
    class Boo extends Foo {}
    
    expect(isInstanceOf(new Foo(), Foo)).toBe(true)
    expect(isInstanceOf(new Boo(), Foo)).toBe(true)
    expect(isInstanceOf({}, Foo)).toBe(false)
  })
  
  it('isBoolean', () => {
    expect(isBoolean(0)).toBe(false)
    expect(isBoolean('true')).toBe(false)
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean(false)).toBe(true)
  })
  
  it('isString', () => {
    expect(isString('7')).toBe(true)
    expect(isString(`7`)).toBe(true)
    expect(isString(7)).toBe(false)
    expect(isString(true)).toBe(false)
  })
  
  it('isNumber', () => {
    expect(isNumber('7')).toBe(false)
    expect(isNumber(7)).toBe(true)
    expect(isNumber(true)).toBe(false)
    expect(isNumber(NaN)).toBe(false)
  })
  
  it('isBigInt', () => {
    expect(isBigInt(1n)).toBe(true)
    expect(isBigInt(1)).toBe(false)
  })
  
  it('isFinite', () => {
    expect(isFinite(789)).toBe(true)
    expect(isFinite(Infinity)).toBe(false)
  })
  
  it('isInteger', () => {
    expect(isInteger(789)).toBe(true)
    expect(isInteger(-789)).toBe(true)
    expect(isInteger(7.89)).toBe(false)
    expect(isInteger(-7.89)).toBe(false)
  })
  
  it('isPositive', () => {
    expect(isPositive(789)).toBe(true)
    expect(isPositive(-789)).toBe(false)
    expect(isPositive(7.89)).toBe(true)
    expect(isPositive(-7.89)).toBe(false)
  })
  
  it('isSymbol', () => {
    expect(isSymbol(Symbol(7))).toBe(true)
    expect(isSymbol(7)).toBe(false)
  })
  
  it('isPrimitive', () => {
    expect(isPrimitive('1')).toBe(true)
    expect(isPrimitive(1)).toBe(true)
    expect(isPrimitive(1n)).toBe(true)
    expect(isPrimitive(true)).toBe(true)
    expect(isPrimitive(Symbol(1))).toBe(true)
    expect(isPrimitive(null)).toBe(true)
    expect(isPrimitive(undefined)).toBe(true)
    expect(isPrimitive([])).toBe(false)
    expect(isPrimitive({})).toBe(false)
    expect(isPrimitive(() => {})).toBe(false)
  })
  
  it('isArray', () => {
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
    expect(isArray(Array.from({ length: 8 }))).toBe(true)
  })
  
  it('isDate', () => {
    expect(isDate(new Date())).toBe(true)
    expect(isDate('1997-04-20')).toBe(false)
  })
  
  it('isRegExp', () => {
    expect(isRegExp(new RegExp(''))).toBe(true)
    expect(isRegExp(/\w+/)).toBe(true)
    expect(isRegExp('/\w+/')).toBe(false)
  })
  
  it('isPromise', () => {
    expect(isPromise((async () => {})())).toBe(true)
    expect(isPromise((() => ({}))())).toBe(false)
  })
  
  it('isNewable', () => {
    expect(isNewable(Foo)).toBe(true)
    expect(isNewable(function () {})).toBe(true)
    expect(isNewable({})).toBe(false)
    expect(isNewable(() => {})).toBe(false)
    expect(isNewable(async function () {})).toBe(false)
    expect(isNewable(function* () {})).toBe(false)
    expect(isNewable(async function* () {})).toBe(false)
  })
  
  it('isMap', () => {
    expect(isMap(new Map)).toBe(true)
    expect(isMap({})).toBe(false)
  })
  
  it('isSet', () => {
    expect(isSet(new Set)).toBe(true)
    expect(isSet([])).toBe(false)
  })
})

describe('value', () => {
  it('isUndefined', () => {
    expect(isUndefined(undefined)).toBe(true)
    expect(isUndefined(null)).toBe(false)
    expect(isUndefined(10)).toBe(false)
  })
  
  it('isNull', () => {
    expect(isNull(undefined)).toBe(false)
    expect(isNull(null)).toBe(true)
    expect(isNull(10)).toBe(false)
  })
  
  it('isNonNullable', () => {
    expect(isNonNullable(1)).toBe(true)
    expect(isNonNullable('0')).toBe(true)
    expect(isNonNullable(undefined)).toBe(false)
    expect(isNonNullable(null)).toBe(false)
  })
  
  it('isNullable', () => {
    expect(isNullable(1)).toBe(false)
    expect(isNullable('0')).toBe(false)
    expect(isNullable(undefined)).toBe(true)
    expect(isNullable(null)).toBe(true)
  })
  
  it('isZero', () => {
    expect(isZero(0)).toBe(true)
    expect(isZero(1)).toBe(false)
  })
  
  it('isIndex', () => {
    expect(isIndex(1)).toBe(true)
    expect(isIndex(0)).toBe(true)
    expect(isIndex(-1)).toBe(false)
  })
  
  it('isEmptyObject', () => {
    expect(isEmptyObject({})).toBe(true)
    expect(isEmptyObject(Object.create(null))).toBe(true)
    expect(isEmptyObject(new Foo())).toBe(false)
    expect(isEmptyObject(null)).toBe(false)
    expect(isEmptyObject({ a: 1 })).toBe(false)
  })
  
  it('isEmptyString', () => {
    expect(isEmptyString('')).toBe(true)
    expect(isEmptyString('abc')).toBe(false)
  })
  
  it('isEmptyArray', () => {
    expect(isEmptyArray([])).toBe(true)
    expect(isEmptyArray([ 1 ])).toBe(false)
    expect(isEmptyArray(new Array(1))).toBe(false)
  })
  
  it('isBlankString', () => {
    expect(isBlankString(' ')).toBe(true)
    expect(isBlankString('')).toBe(true)
  })
  
  it('isEmptyMap', () => {
    expect(isEmptyMap(new Map)).toBe(true)
    expect(isEmptyMap(new Map([ [ 1, 2 ] ]))).toBe(false)
    expect(isEmptyMap(new Map([ [ 1, 2 ], [ 3, 4 ] ]))).toBe(false)
  })
  
  it('isEmptySet', () => {
    expect(isEmptySet(new Set)).toBe(true)
    expect(isEmptySet(new Set([ 1 ]))).toBe(false)
    expect(isEmptySet(new Set([ 1, 2 ]))).toBe(false)
  })
  
  it('isEmpty', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty({})).toBe(true)
    expect(isEmpty(new Set())).toBe(true)
    expect(isEmpty(new Map())).toBe(true)
    expect(isEmpty(new Foo())).toBe(false)
  })
  
  it('isNotEmpty', () => {
    expect(isNotEmpty(null)).toBe(false)
    expect(isNotEmpty(undefined)).toBe(false)
    expect(isNotEmpty('')).toBe(false)
    expect(isNotEmpty([])).toBe(false)
    expect(isNotEmpty({})).toBe(false)
    expect(isNotEmpty(new Set())).toBe(false)
    expect(isNotEmpty(new Map())).toBe(false)
    expect(isNotEmpty(new Foo())).toBe(true)
  })
})
