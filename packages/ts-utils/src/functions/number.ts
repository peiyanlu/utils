/** 创建范围随机整数函数 */
export const createRandom = (rng: () => number = Math.random): (min: number, max: number) => number => {
  return (min: number, max: number) => {
    if (min > max) [ min, max ] = [ max, min ]
    return Math.floor(rng() * (max - min + 1)) + min
  }
}

/** 范围随机整数 */
export const randomInt: (min: number, max: number) => number = createRandom()

/** 四舍五入 */
export const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/** 判断值是否处于范围内（包含边界） */
export const isBetween = (value: number, min: number, max: number): boolean => {
  if (min > max) [ min, max ] = [ max, min ]
  return value >= min && value <= max
}
