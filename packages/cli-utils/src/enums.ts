export enum PkgManager {
  NPM = 'npm',
  YARN = 'yarn',
  PNPM = 'pnpm',
}

/**
 * @deprecated Use `ConfirmResult` instead.
 */
export enum YesOrNo {
  Yes = 'yes',
  No = 'no',
  Ignore = 'ignore',
}

export enum ConfirmResult {
  YES = 'yes',
  NO = 'no',
  IGNORE = 'ignore',
}

export enum HttpLibrary {
  EXPRESS = 'express',
  FASTIFY = 'fastify',
  KOA = 'koa',
  HONO = 'hono',
}
