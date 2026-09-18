# yangjm · 个人主页

简洁浅色的静态个人主页，适配手机和电脑。包含个人简介、博客、算法竞赛档案和可搜索的算法板子。

## 本地预览

安装 Node.js 后，在仓库目录运行：

```sh
npm run dev
```

打开 http://127.0.0.1:3000 。不需要安装 npm 依赖，也不需要构建。此预览服务仅供本机开发使用。

## 修改内容

- `public/profile.js`：显示名称、个人简介、GitHub 链接、实际 ICP 备案号。
- `public/index.html`：页面结构和静态文案。改名或简介时建议同步更新 HTML 默认内容，方便搜索引擎及关闭 JavaScript 的访客读取。
- `public/styles.css`：主页颜色、字体、布局和移动端适配。
- `content/blog/`：Markdown 博客文章与文章清单；执行 `npm run build` 后生成到 `public/blog/`。
- `public/blog.css`：博客列表与文章阅读页面样式。

上线前填写真实 ICP 备案号。公安备案完成后，再按实际提供的备案编号、图标和链接添加页脚信息。

## 部署到阿里云 ECS

网站部署文件只有 `public/` 内的文件。服务器无需运行 Node.js、npm 或数据库，可通过 Nginx 等静态 Web 服务提供这些文件。

待确认服务器的 Linux 发行版、现有服务和公网 IP 后，再确定安装命令与 Nginx 配置，避免影响服务器已有程序。

部署流程：

1. 将 `public/` 内容上传到服务器的网站目录。
2. 配置 Web 服务的网站根目录、域名 `yangjm.cn` 和 HTTP 访问。
3. 在阿里云 DNS 中添加根域名 `@` 的 A 记录，指向 ECS 公网 IPv4 地址。如果需要 `www.yangjm.cn`，同时配置对应 DNS 记录和 Web 服务域名。
4. 检查服务器防火墙与安全组，按需开放网站的 80、443 端口。
5. 域名解析生效后，配置 HTTPS 证书和自动续期，再启用 HTTP 到 HTTPS 跳转。

当前仓库没有自动部署配置；推送 GitHub 不会自动修改线上网站。

## 博客

线上地址：<https://blog.yangjm.cn/>。

文章正文以 Markdown 保存在 `content/blog/`，元数据记录在 `content/blog/posts.json`。构建器支持常用 Markdown 结构、行内公式 `$...$` 和块级公式 `$$...$$`，并生成文章目录和静态 HTML。公式由 `public/vendor/mathjax/` 中自托管的 MathJax 渲染；即使脚本不可用，正文与公式源码仍然可读。

新增文章后执行：

```sh
npm run build
```

## 算法竞赛与板子子站

- `oi.yangjm.cn`：平台链接、队伍经历、奖项占位。内容在 `scripts/build-subsites.mjs` 中维护。
- `banzi.yangjm.cn`：7 个分类、47 篇板子，支持全文搜索、目录跳转和代码复制。
- 板子源文件：`content/banzi.md`，来自 https://github.com/yangjm2006/Blog/blob/main/板子.md 。更新该文件后执行 `npm run build`，再部署 `public/`。
- 构建无需第三方依赖，使用 Node.js。当前源文档为二、三级标题、C++ 围栏和纯文本笔记；若以后添加其他 Markdown 语法，需要扩展构建脚本。
- 本地运行 `npm run dev`，访问 `/oi/` 与 `/banzi/`。子站导航使用正式域名。
- `deploy/subsites.conf` 为首次部署的 HTTP 配置；线上 HTTPS 由 Certbot 管理，不要用该文件覆盖已签发证书的线上配置。
- `public/banzi/source.md` 和子站 HTML 为构建产物，需随 `public/` 一同部署。网站不依赖访问 GitHub 来加载板子。

### 每小时自动同步（已部署）

ECS 的 `yangjm-notebook-sync.timer` 每小时整点检查 GitHub 的 `Blog/main/板子.md`；服务器重启后自动恢复运行。电脑无需在线。

- 下载设置超时与大小限制，只接受 HTTPS；使用系统证书验证。
- 内容未变时不重新发布。内容变化后，先验证 Markdown 结构、完成静态构建，再原子切换版本目录。
- 下载失败、文档格式异常、构建失败时，继续提供最后一次成功的本地版本，下一小时重试。
- 页面保留 C++ 原文并添加语法配色，支持单篇阅读、目录搜索、上下篇切换、复制代码、自动换行及手机折叠目录。

服务器维护命令：

```sh
systemctl list-timers yangjm-notebook-sync.timer
systemctl start yangjm-notebook-sync.service
journalctl -u yangjm-notebook-sync.service -n 30 --no-pager
```

构建程序位于 `/opt/yangjm-notebook`，本地缓存及最近五个成功版本位于 `/var/lib/yangjm-notebook/releases`，`current` 链接指向当前版本；网站 `banzi` 目录链接至该版本。新版本的 HTML、Markdown 在同一次指针切换中发布。

更新页面设计时，更新服务器构建脚本和 `notebook.css`、`notebook.js`，再用 `python3 /opt/yangjm-notebook/scripts/sync-notebook.py --force` 重建。不要把本地旧的 `public/banzi` 直接覆盖到线上同步目录。

同步器的回退测试：在 Linux 上运行 `python3 scripts/test-sync-notebook.py`，覆盖未变、成功更新、网络失败、非法内容和构建失败；测试使用独立临时目录。

### 在线评测平台统计（已部署）

`yangjm-oj-stats.timer` 每小时整点更新 `oi.yangjm.cn` 的公开训练数据。页面只读取服务器缓存，不会在访客浏览时直接请求各个平台。

- 洛谷：公开资料中的头像和通过题数。
- Codeforces：官方 `user.info` 与 `user.status`，展示头像、唯一通过题数、rating 和文字等级。
- AtCoder：AtCoder Problems 的公开统计接口提供通过题数，官方个人页提供 rating；AtCoder 没有个人头像字段时使用本站常用头像。
- QOJ：尝试读取公开个人资料；受登录或 Cloudflare 验证影响时使用上一次缓存。首次没有缓存时显示“待同步”。
- 每个平台独立更新。某一平台或头像 CDN 失败时，不影响其他平台的数字；已有数据会继续保留。

服务器维护命令：

```sh
systemctl list-timers yangjm-oj-stats.timer
systemctl start yangjm-oj-stats.service
journalctl -u yangjm-oj-stats.service -n 30 --no-pager
```

同步脚本位于 `/opt/yangjm-oj-stats/sync-oj-stats.py`，缓存位于 `/var/lib/yangjm-oj-stats/cache.json`，公开结果为 `/var/www/yangjm.cn/oi/stats.json`。这些运行时文件不提交到 Git。
