import { defineConfig, type UserWorkspaceConfig } from 'vitest/config'


const config: UserWorkspaceConfig = defineConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
    },
    env: {
      // FORCE_COLOR: '0'
    },
  },
})

export default config
