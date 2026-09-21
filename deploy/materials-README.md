# 学习资料站

上线日期：2026-09-21。访问地址：https://materials.yangjm.cn/

## 来源与功能

- 唯一内容源：`https://github.com/yangjm2006/OI-Material` 的 `main` 分支。
- 初始版本：`2d2a899328acfd38a43f809f652531413df5cf9e`，63 份资料，205,322,586 字节。
- 按原始目录分组；支持标题/路径搜索、分类筛选、重置、PDF 浏览器查看和原文件下载。
- 页面预生成完整列表，无 JavaScript 时仍可阅读和下载。文件由本站提供，不要求读者访问 GitHub。
- 复用主站样式、导航和跨子域主题 cookie；支持手机布局与已打开页面的主题重新同步。

## ECS 布局

- 实例：`i-m5e4p130e52sfxmngh08`；IPv4：`47.104.154.48`。
- 程序与页面模板：`/opt/yangjm-materials`。
- 状态目录：`/var/lib/yangjm-materials`。
- `current` 指向已验证的静态发布目录；`releases/` 保留发布历史。
- `objects/<Git blob SHA>/<原文件名>` 保存校验后的文件；旧链接持续有效，支持已打开标签页继续下载。
- Nginx：`/etc/nginx/conf.d/materials.conf`。
- 独立证书：`/etc/letsencrypt/live/materials.yangjm.cn/`；由既有 `certbot-renew.timer` 续期。
- `materials.conf` 是首次 HTTP 引导配置；勿用它覆盖线上 HTTPS 配置。`materials.https.conf` 是上线时快照。

## 定时同步

`yangjm-materials-sync.timer` 每小时整点后 0–120 秒触发；`Persistent=true` 会补跑关机期间错过的更新。任务有文件锁，最长运行 45 分钟。

1. 通过 GitHub API 获取 main 的确定提交；提交不变时直接退出。
2. 读取该提交的完整递归树；拒绝截断列表、不安全路径、符号链接、空资料集及未支持的 LFS 指针。
3. 复用按内容哈希缓存的文件。待下载内容超过 8 MiB 时使用 GitHub codeload 整包，较小更新使用固定提交的 raw 下载。
4. 下载大小和 Git blob SHA-1 必须与仓库树一致。页面先在临时目录生成，成功后原子替换 `current`。
5. 网络、文件校验或构建失败时保持原发布版本。错误记录到 journal，下次定时运行重试。

历史文件有意保留，以免旧页面中的下载链接失效；长期运行时需关注磁盘容量。不执行仓库内的脚本。

```sh
# 手动触发 / 查看结果
systemctl start yangjm-materials-sync.service
journalctl -u yangjm-materials-sync.service -n 50 --no-pager
systemctl list-timers yangjm-materials-sync.timer
cat /var/lib/yangjm-materials/current/revision.json

# 更新页面模板后强制重新发布
flock -n /var/lib/yangjm-materials/sync.lock python3 /opt/yangjm-materials/scripts/sync-materials.py --force

# 隔离测试，不使用真实网络或线上状态
python3 scripts/test-materials-sync.py
```

## 已验证

- 公网 HTTP 跳转 HTTPS，首页返回 200。
- 全部 63 个文件 HEAD 返回 200，类型为 PDF 或 PPTX；PDF Range 请求返回 206，并校验 PDF 文件头。
- 浏览器下载保留中文原文件名；搜索、分类、空结果、重置及日夜主题运行正常。
- 1440px 与 390px 页面检查；手机无横向溢出、无页面 JavaScript 错误。
- 无 JavaScript 时仍有全部 63 条资料链接；主站切换主题后，资料页 focus 重读共享状态通过。
- 隔离测试覆盖首次发布、无变化跳过、缓存复用、整包下载、网络失败、错误哈希、截断列表和不安全路径；失败保留旧发布。

初次镜像因 raw 直连较慢，使用本地获取的固定提交 ZIP 上传，再逐文件验证并发布。后续更新直接在 ECS 上运行，不依赖本机或 Codex 在线。
