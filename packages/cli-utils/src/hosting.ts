export interface HostedGitInfo {
  host: string
  prefix: string
  owner: string
  repo: string
}

export const parseHostedGitUrl = (url: string): HostedGitInfo => {
  const reg = /((?:github|gitlab|bitbucket|gitee|codeberg|sourceforge|git\.sr|\d+\.\d+\.\d+\.\d+:\d+)\.?(?:com|org|net|ht)?)[:\/](~)?([^/]+)\/([^/]+?)(?:[#/?](?:.+?)?)?(?:\.git)?$/
  
  const match = url.trim().match(reg) ?? []
  const [ domain = '', prefix = '', owner = '', repo = '' ] = [ ...match.slice(1) ]
  const host = domain ? `http${ url.includes('https://') ? 's' : '' }://${ domain }` : ''
  
  return { host, prefix, owner, repo }
}


const arr = [
  'https://github.com/user/repo/',
  'git+https://github.com/user/repo/',
  'https://gitlab.com/user/repo#readme',
  'https://bitbucket.org/user/repo.git',
  'https://gitee.com/user/repo/tree/main/packages',
  'https://codeberg.org/user/repo',
  'https://sourceforge.net/projects/repo',
  'https://git.sr.ht/~username/repo',
  'git@git.sr.ht:~username/repo',
  'https://github.com/shashkovdanil/clean-publish.git',
  'https://github.com/shashkovdanil/clean-publish/tree/dependabot/npm_and_yarn/brace-expansion-5.0.12',
  'ssh://git@10.215.143.96:8082/cybertwin/cybertwin-server-example.git',
  'ssh://git@github.com:shashkovdanil/clean-publish.git',
  '',
]
