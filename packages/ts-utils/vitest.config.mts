import { defineConfig, mergeConfig, type UserWorkspaceConfig } from 'vitest/config'
import sharedConfig from '../../vitest.shared.config.mjs'


const config: UserWorkspaceConfig = mergeConfig(
  sharedConfig,
  defineConfig({
    test: {},
  }),
)

export default config
