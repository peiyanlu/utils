import { defineConfig, mergeConfig } from 'vitest/config'
import sharedConfig from './vitest.shared.config.mjs'


export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: {
              label: 'node',
              color: 'green',
            },
            include: [
              'packages/*/tests/**/*.{test,spec}.{ts,mts}',
              '!packages/web-utils/tests/**/*.{test,spec}.{ts,mts}',
              '!packages/ts-utils/tests/**/*.{test,spec}.{ts,mts}',
            ],
          },
        },
        {
          extends: true,
          test: {
            name: {
              label: 'browser',
              color: 'blue',
            },
            environment: 'jsdom',
            include: [ 'packages/web-utils/tests/**/*.{test,spec}.{ts,mts}' ],
          },
        },
        {
          extends: true,
          test: {
            name: {
              label: 'neutral',
              color: 'yellow',
            },
            include: [ 'packages/ts-utils/tests/**/*.{test,spec}.{ts,mts}' ],
          },
        },
      ],
    },
  }),
)
