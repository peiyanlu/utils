import { Tool } from './base.js'


export class GitTool extends Tool {
  init(branch = 'master'): string {
    return this.exec(`git init --initial-branch ${ branch }`)
  }
  
  initBare(remote: string): string {
    return this.exec(`git init --bare ${ remote }`)
  }
  
  clone(url: string, dir?: string): string {
    return this.exec(`git clone ${ url } ${ dir ?? '' }`)
  }
  
  
  config(key: string, value?: string): string {
    return this.exec(`git config  ${ key } ${ value ?? '' }`)
  }
  
  globalConfig(key: string, value?: string): string {
    return this.exec(`git config --global ${ key } ${ value ?? '' }`)
  }
  
  
  addRemote(name: string, url: string): string {
    return this.exec(`git remote add ${ name } ${ url }`)
  }
  
  removeRemote(name: string): string {
    return this.exec(`git remote remove ${ name }`)
  }
  
  upstream(branch?: string): string {
    const ref = branch ? `${ branch }@{u}` : '@{u}'
    return this.exec(`git rev-parse --abbrev-ref --symbolic-full-name ${ ref }`)
  }
  
  push(remote: string, ref = 'HEAD'): string {
    return this.exec(`git push ${ remote } ${ ref }`)
  }
  
  pushSetUpstream(remote: string, ref = 'HEAD'): string {
    return this.exec(`git push --set-upstream ${ remote } ${ ref }`)
  }
  
  fetch(remote: string): string {
    return this.exec(`git fetch ${ remote }`)
  }
  
  
  branch(branch: string): string {
    return this.exec(`git branch ${ branch }`)
  }
  
  deleteBranch(branch: string): string {
    return this.exec(`git branch --delete ${ branch }`)
  }
  
  checkout(branch: string): string {
    return this.exec(`git checkout ${ branch }`)
  }
  
  merge(branch: string): string {
    return this.exec(`git merge ${ branch }`)
  }
  
  tag(tag: string): string {
    return this.exec(`git tag ${ tag }`)
  }
  
  deleteTag(tag: string): string {
    return this.exec(`git tag --delete ${ tag }`)
  }
  
  hasRef(ref: string): boolean {
    try {
      this.exec(`git show-ref --verify --quiet ${ ref }`)
      return true
    } catch {
      return false
    }
  }
  
  currentBranch(): string {
    return this.exec('git branch --show-current')
  }
  
  branches(): string {
    return this.exec(`git branch --format="%(refname:short)"`)
  }
  
  tags(): string {
    return this.exec(`git tag --format="%(refname:short)"`)
  }
  
  revParse(ref: string): string {
    return this.exec(`git rev-parse ${ ref }`)
  }
  
  deleteHeadRef(): string {
    return this.exec(`git update-ref -d HEAD`)
  }
  
  
  commit(msg: string): string {
    return this.exec(`git commit -m "${ msg }" --allow-empty --no-gpg-sign`)
  }
  
  logOne(pretty = '%s'): string {
    return this.exec(`git log -1 --pretty=${ pretty }`)
  }
  
  commitCount(): string {
    return this.exec('git rev-list --count HEAD')
  }
  
  
  stage(file = '.'): string {
    return this.exec(`git add ${ file }`)
  }
  
  status(): string {
    return this.exec('git status --porcelain')
  }
  
  stagedFiles(): string {
    return this.exec('git diff --cached --name-only')
  }
  
  unstagedFiles(): string {
    return this.exec('git diff --name-only')
  }
  
  untrackedFiles(): string {
    return this.exec('git ls-files --others --exclude-standard')
  }
  
  resetHard(): string {
    return this.exec(`git reset --hard HEAD`)
  }
  
  // ----------------------------------------------------------
  
  headHash(): string {
    return this.revParse('HEAD')
  }
  
  lastAuthor(): string {
    return this.logOne('%an')
  }
  
  lastEmail(): string {
    return this.logOne('%ae')
  }
  
  hasBranch(branch: string): boolean {
    return this.hasRef(`refs/heads/${ branch }`)
  }
  
  hasRemoteTrackingBranch(remote: string, branch: string): boolean {
    return this.hasRef(`refs/remotes/${ remote }/${ branch }`)
  }
  
  hasTag(tag: string): boolean {
    return this.hasRef(`refs/tags/${ tag }`)
  }
}
