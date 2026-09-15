# 部署记录

更新日期：2026-09-15

## 服务器

- 阿里云 ECS，青岛 `cn-qingdao`
- 实例：`i-m5e4p130e52sfxmngh08`
- 公网 IPv4：`47.104.154.48`
- Alibaba Cloud Linux 3，2 核 2 GB
- 域名：`yangjm.cn`

## 已完成

- 安装 Nginx 并启动，已设置开机启动。
- 网站文件部署在 `/var/www/yangjm.cn`。
- Nginx 站点配置：`/etc/nginx/conf.d/yangjm.cn.conf`。
- 原始部署包解压保存在 `/opt/yangjm-deploy/20260915`。
- 服务器本地 HTTP 检查返回 200，Nginx 配置检查通过。
- 公共 DNS 查询到域名 A 记录为 `47.104.154.48`。
- 已安装 Certbot 和 Nginx 插件。
- 已启用 HTTPS，当前证书到期日期为 2026-12-14。
- `certbot-renew.timer` 已启用且运行中，证书续期模拟成功（使用 `--no-random-sleep-on-renew` 跳过测试等待）。
- 浏览器验证 HTTP 自动跳转到 `https://yangjm.cn/`，最终响应 200。
- 线上姓名和备案号正确，页面无 JavaScript 错误；1440px 和 390px 宽度无横向溢出。

## 尚待完成

- GitHub 尚未推送，自动部署尚未配置。

## 运维

通过 Workbench CLI 连接；凭证保存在本机工具配置中，不放入本仓库。

```sh
workbench exec -i i-m5e4p130e52sfxmngh08 -c 'nginx -t; systemctl is-active nginx'
```

更新页面时只上传 `public/` 内的文件。`deploy/yangjm.cn.conf` 是首次部署的 HTTP 配置，启用 HTTPS 后不要用它覆盖服务器的证书配置。
