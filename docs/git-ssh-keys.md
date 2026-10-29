# SSH 密钥：拉取代码与签名标签

SSH 密钥对由私钥和公钥组成。`ssh-keygen` 的生成方式相同，之后通过不同配置指定用途。私钥留在本机；只把公钥添加到 GitHub。

## 生成密钥

个人长期使用的密钥建议设置口令：

```sh
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_ed25519
```

生成两个文件：`id_ed25519` 是私钥，`id_ed25519.pub` 是公钥。Windows PowerShell 可将路径写成：

```powershell
ssh-keygen -t ed25519 -C "your-email@example.com" -f "$env:USERPROFILE\.ssh\id_ed25519"
```

## 用于 SSH 拉取/推送

1. 将 `.pub` 文件内容添加到 GitHub：**Settings → SSH and GPG keys → New SSH key → Authentication key**。
2. 将仓库 remote 设为 SSH 地址并测试连接：

```sh
git remote set-url origin git@github.com:OWNER/REPO.git
ssh-add ~/.ssh/id_ed25519
ssh -T git@github.com
```

SSH agent 未运行时，先启动系统的 ssh-agent，再执行 `ssh-add`。认证时使用私钥；GitHub 保存公钥。

## 用于签名 Git 标签

Git 2.34+ 支持 SSH 签名。配置本地或全局 Git：

```sh
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519
```

要让 GitHub 显示签名验证状态，还要把同一个 `.pub` 文件添加到 GitHub，类型选择 **Signing key**。若同一密钥同时用于认证和签名，需要在 GitHub 分别登记为两种类型。

本机验证 SSH 签名时，配置 allowed signers 文件。文件每行格式为“签名者邮箱 + 公钥整行内容”：

```text
your-email@example.com ssh-ed25519 AAAAC3... your-email@example.com
```

然后配置文件路径：

```sh
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

创建并验证标签：

```sh
git tag -s v1.0.0 -m "release"
git verify-tag v1.0.0
```

项目的 `gitTagSigned(tag, message)` 使用相同的 Git 签名配置。

## `gitTagSigned` 集成测试

集成测试可在临时仓库中生成临时密钥，不需要个人密钥或 GitHub Secrets。测试机器需要 Git 2.34+ 和 `ssh-keygen`（GitHub 的 Windows、macOS、Linux runner 均可按此方式运行）。在 `manager.prepare(1)` 初始化仓库后执行：

```ts
const email = 'test@example.test'
const keyDir = join(TEMP_DIR, '.git', 'test-signing')
const privateKey = join(keyDir, 'signing-key')
const allowedSigners = join(keyDir, 'allowed_signers')

mkdirSync(keyDir, { recursive: true })
const keygen = spawnSync(
  'ssh-keygen',
  [ '-q', '-t', 'ed25519', '-N', '', '-C', email, '-f', privateKey ],
  { encoding: 'utf-8' },
)
if (keygen.error || keygen.status !== 0) {
  throw new Error(`ssh-keygen failed: ${ keygen.error?.message ?? keygen.stderr }`)
}

const publicKey = readFileSync(`${ privateKey }.pub`, 'utf-8').trim()
writeFileSync(allowedSigners, `${ email } ${ publicKey }\n`)

await runGit([ 'config', 'user.name', 'Test Signer' ])
await runGit([ 'config', 'user.email', email ])
await runGit([ 'config', 'gpg.format', 'ssh' ])
await runGit([ 'config', 'user.signingkey', privateKey ])
await runGit([ 'config', 'gpg.ssh.allowedSignersFile', allowedSigners ])
```

调用 `gitTagSigned` 后断言标签对象、签名内容和验证结果：

```ts
await gitTagSigned('v1.0.0', 'release')

expect(tool.exec('git cat-file -t refs/tags/v1.0.0').trim()).toBe('tag')
expect(tool.exec('git cat-file -p refs/tags/v1.0.0'))
  .toContain('-----BEGIN SSH SIGNATURE-----')
expect(() => tool.exec('git verify-tag v1.0.0')).not.toThrow()
```

这里 `-N ''` 只表示测试私钥不设口令；公钥仍由 `ssh-keygen` 写入 `signing-key.pub`。测试私钥放在临时仓库 `.git` 目录，不要上传到 GitHub，也不要用于拉取代码。
