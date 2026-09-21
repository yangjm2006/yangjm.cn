import { siteHeader } from './site-header.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { renderMarkdown, renderToc, escapeHtml } from './blog.mjs';

const root = new URL('../', import.meta.url);
const contentRoot = process.env.BLOG_CONTENT_DIR
  ? new URL('./', pathToFileURL(`${process.env.BLOG_CONTENT_DIR}/`))
  : new URL('content/blog/', root);
const outputRoot = process.env.BLOG_OUTPUT
  ? new URL('./', pathToFileURL(`${process.env.BLOG_OUTPUT}/`))
  : new URL('public/blog/', root);
const blogOrigin = 'https://blog.yangjm.cn';
const read = path => readFile(new URL(path, root), 'utf8');
const readContent = path => readFile(new URL(path, contentRoot), 'utf8');
const save = async (path, text) => {
  const target = new URL(path, outputRoot);
  await mkdir(new URL('./', target), { recursive: true });
  await writeFile(target, text);
};
const dateLabel = value => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai' }).format(new Date(`${value}T00:00:00+08:00`));

const homepage = await read('public/index.html');
const theme = homepage.match(/<script>[\s\S]*?<\/script>/)[0];
const button = homepage.match(/<button class="theme-toggle"[\s\S]*?<\/button>/)[0];

function shell({ title, description, type, body, math = false }) {
  const mathAssets = math ? `<script>window.MathJax={tex:{inlineMath:[["$","$"],["\\\\(","\\\\)"]],displayMath:[["$$","$$"],["\\\\[","\\\\]"]],packages:{"[+]": ["ams"]},tags:"ams"},options:{skipHtmlTags:["script","noscript","style","textarea","pre","code"]},chtml:{scale:1}};</script><script defer src="/vendor/mathjax/tex-chtml.js"></script>` : '';
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f4f1e8"><meta name="description" content="${escapeHtml(description)}"><title>${escapeHtml(title)} · yangjm</title>${theme}<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/styles.css?v=20260916"><link rel="stylesheet" href="/subsites.css?v=20260916"><link rel="stylesheet" href="/blog.css?v=1"><script src="/subsites.js?v=20260916" defer></script>${mathAssets}<link rel="stylesheet" href="/navigation.css?v=20260921a"></head><body class="subsite ${type}"><a class="skip-link" href="#content">跳到正文</a>${siteHeader(homepage, 'blog')}${body}<footer class="sub-footer"><span>© ${new Date().getFullYear()} yangjm</span><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">鲁ICP备2026048978号-1 <span aria-hidden="true">↗</span></a></footer></body></html>`;
}

const posts = JSON.parse(await readContent('posts.json'));
const built = [];
for (const post of posts) {
  if (!/^[a-z0-9-]+$/.test(post.slug)) throw new Error(`Invalid blog slug: ${post.slug}`);
  const source = await readContent(post.source);
  const rendered = renderMarkdown(source);
  const toc = renderToc(rendered.headings);
  const readingMinutes = Math.max(1, Math.ceil(source.replace(/\s+/g, '').length / 600));
  const body = `<main id="content" class="article-shell"><article class="article-page"><nav class="breadcrumb" aria-label="面包屑"><a href="${blogOrigin}/">文字与记录</a><span aria-hidden="true">/</span><span>${escapeHtml(post.title)}</span></nav><header class="article-header"><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.description)}</p><div class="article-meta"><time datetime="${escapeHtml(post.date)}">${dateLabel(post.date)}</time><span>${readingMinutes} 分钟阅读</span><span>${escapeHtml(post.topic)}</span></div></header><details class="mobile-toc"><summary>文章目录</summary>${toc}</details><div class="article-layout"><aside class="article-toc" aria-label="文章目录"><strong>文章目录</strong>${toc}<a class="source-link" href="${escapeHtml(post.originalUrl)}" target="_blank" rel="noopener noreferrer">查看 Markdown 原文 <span aria-hidden="true">↗</span></a></aside><div class="article-body">${rendered.html}</div></div></article></main>`;
  await save(`${post.slug}/index.html`, shell({ title: post.title, description: post.description, type: 'blog-article', body, math: true }));
  built.push({ ...post, readingMinutes });
}

const rows = built.map(post => `<article class="post-row"><a href="${blogOrigin}/${post.slug}/" aria-label="阅读${escapeHtml(post.title)}"></a><div class="post-date"><time datetime="${escapeHtml(post.date)}">${dateLabel(post.date)}</time><span>${escapeHtml(post.topic)}</span></div><div class="post-copy"><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.description)}</p></div><span class="post-arrow" aria-hidden="true">→</span></article>`).join('');
const indexBody = `<main id="content" class="blog-main"><header class="blog-intro"><h1>文字与记录</h1><p>把学习中的推导、问题和偶然想到的东西，认真放在这里。</p></header><section class="post-list" aria-label="文章列表">${rows}</section><p class="blog-note">共 ${built.length} 篇文章 · 持续整理中</p></main>`;
await save('index.html', shell({ title: '文字与记录', description: 'yangjm 的学习笔记与思考。', type: 'blog-index', body: indexBody }));

console.log(`Built blog: ${built.length} post${built.length === 1 ? '' : 's'}.`);
