import { defineConfig, type UserConfig } from 'tsdown'


const config: UserConfig[] = defineConfig([
  {
    entry: 'src/index.ts',
    format: [ 'esm', 'cjs' ],
    outDir: 'dist',
    platform: 'neutral',
    dts: true,
    publint: true,
  },
] satisfies UserConfig[])

export default config
