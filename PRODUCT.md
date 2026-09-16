# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

主页首先服务于希望了解 yangjm、阅读学习记录、查找算法资料的访客，也服务于作者自己持续整理和发布内容。

## Product Purpose

`yangjm.cn` 是 yangjm 的个人空间，用于展示个人信息、算法竞赛经历、算法板子、学习笔记和个人项目。成功意味着访客能快速找到真实内容，并在手机和电脑上舒适阅读。

## Positioning

网站把个人介绍、竞赛档案、可搜索算法板子和持续更新的学习文章放在同一个克制、轻量、无需客户端框架的静态站点中。

## Operating Context

内容在 Git 仓库中维护，通过本地 Node.js 构建为静态文件，再部署到阿里云 ECS 的 Nginx。板子和 OJ 数据由服务器定时任务更新。

## Capabilities and Constraints

- 主站、OI 子站和板子子站共享日间/夜间主题。
- 博客文章以 Markdown 保存，构建为静态 HTML，并支持行内与块级 LaTeX 公式。
- 页面需兼容桌面和手机，正文在 JavaScript 不可用时仍然可读。
- 不在浏览器中请求 GitHub 来获得正文；发布产物必须包含完整文章内容。

## Brand Commitments

- 名称使用 `yangjm`。
- 保持“简洁浅色信息卡片”的视觉方向，并提供协调的深色模式。
- 语气克制、真实，不编造经历、奖项或项目成果。

## Evidence on Hand

- 个人资料：`public/profile.js`。
- 算法板子：`content/banzi.md`。
- 第一篇博客测试文章：`content/blog/Math-Note.md`，来源为作者的公开 GitHub 仓库。

## Product Principles

- 内容优先于装饰。
- 静态优先，减少运行时依赖。
- 真实资料只在一个明确位置维护。
- 在真实浏览器和真实返回标签页场景中验证状态。

