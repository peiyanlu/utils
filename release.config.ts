import { defineConfig, GithubHosting, PnpmWorkspacesProject } from '@peiyanlu/release'


const config: ReturnType<typeof defineConfig> = defineConfig({
  project: new PnpmWorkspacesProject({
    mode: 'independent',
  }),
  bump: {
    extraScopes: [ 'deps' ],
  },
  hosting: new GithubHosting(),
  releaser: {
    verbose: true,
  },
})

export default config
