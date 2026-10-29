import { defineConfig, type UserConfig } from 'tsdown'


const config: UserConfig[] = defineConfig([
  {
    entry: 'src/index.ts',
    format: [ 'esm' ],
    outDir: 'dist',
    platform: 'browser',
    shims: true,
    dts: true,
    publint: true,
  },
] satisfies UserConfig[])

export default config
