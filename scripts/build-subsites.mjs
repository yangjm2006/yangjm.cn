import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parseNotebook, renderNotebook } from './notebook.mjs';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const save = (path, text) => writeFile(new URL(path, root), text);
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const homepage = await read('public/index.html');
const theme = homepage.match(/<script>[\s\S]*?<\/script>/)[0];
const button = homepage.match(/<button class="theme-toggle"[\s\S]*?<\/button>/)[0];
const link = (url, title) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${title} <span aria-hidden="true">↗</span></a>`;
function shell(title, type, body) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f4f1e8"><meta name="description" content="yangjm 的${title}"><title>${title} · yangjm</title>${theme}<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/styles.css?v=20260916"><link rel="stylesheet" href="/subsites.css?v=20260916"><script src="/subsites.js?v=20260916" defer></script>${type === 'notebook-page' ? '<link rel="stylesheet" href="/notebook.css?v=3"><script src="/notebook.js?v=2" defer></script>' : ''}</head><body class="subsite ${type}"><a class="skip-link" href="#content">跳到正文</a><header class="sub-header"><a class="brand" href="https://yangjm.cn" aria-label="yangjm 个人主页">y<span>.</span></a><nav aria-label="主导航"><a href="https://yangjm.cn">主页</a><a href="https://blog.yangjm.cn/">博客</a><a href="https://oi.yangjm.cn" ${type === 'oi-page' ? 'aria-current="page"' : ''}>竞赛</a><a href="https://banzi.yangjm.cn" ${type === 'notebook-page' ? 'aria-current="page"' : ''}>板子</a></nav>${button}</header>${body}<footer class="sub-footer"><span>© ${new Date().getFullYear()} yangjm</span>${link('https://beian.miit.gov.cn/', '鲁ICP备2026048978号-1')}</footer></body></html>`;
}
await mkdir(new URL('public/oi/', root), { recursive: true });
await mkdir(new URL('public/banzi/', root), { recursive: true });
const platforms = [['LG','洛谷','yangjm · 502227','https://www.luogu.com.cn/user/502227'],['CF','Codeforces','yangjm','https://codeforces.com/profile/yangjm'],['AT','AtCoder','yangjm','https://atcoder.jp/users/yangjm'],['Q','QOJ','yangjm','https://qoj.ac/user/profile/yangjm']];
if (!process.env.NOTEBOOK_ONLY) await save('public/oi/index.html', shell('算法竞赛', 'oi-page', `<main id="content" class="oi-main"><section class="oi-intro"><div><p class="eyebrow">YANGJM / COMPETITIVE PROGRAMMING</p><h1>思考，编码，<br><em>再进一步。</em></h1><p class="lead">我是 yangjm，山东大学软件工程专业。<br>这里记录我的算法竞赛经历。</p></div><div class="contest-note"><span class="eyebrow">ALGORITHM JOURNAL</span><div class="code-art" aria-hidden="true">while (curious) {<br>　learn();<br>　solve();<br>　grow();<br>}</div><a href="https://banzi.yangjm.cn">翻开我的算法板子 <span aria-hidden="true">↗</span></a></div></section><section class="oi-section"><div class="section-label"><span>01 / ONLINE JUDGES</span><h2>练习的地方</h2></div><div class="platforms">${platforms.map(([mark,name,caption,url]) => `<a class="platform" href="${url}" target="_blank" rel="noopener noreferrer"><span class="platform-mark">${mark}</span><div><h3>${name}</h3><p>${caption}</p></div><span aria-hidden="true">↗</span></a>`).join('')}</div></section><section class="oi-section"><div class="section-label"><span>02 / TEAM HISTORY</span><h2>一起解题的人</h2></div><div class="team-list"><article class="team"><p>2026.04 — 至今</p><div><h3>Rolling Girl</h3><span class="status">当前队伍</span></div></article><article class="team"><p>2025.08 — 2025.12</p><div><h3>零一之间</h3></div></article></div></section><section class="oi-section"><div class="section-label"><span>03 / ACHIEVEMENTS</span><h2>比赛与奖项</h2></div><div class="awards"><span aria-hidden="true">✳</span><div><h3>记录，待续。</h3><p>比赛与获奖经历将在这里补充。</p></div></div></section></main>`));
const source = (await readFile(process.env.NOTEBOOK_SOURCE || new URL('content/banzi.md', root), 'utf8')).replace(/\r\n/g, '\n');
const groups = parseNotebook(source);
const output = process.env.NOTEBOOK_OUTPUT;
const html = shell('算法板子', 'notebook-page', renderNotebook(groups));
if (output) {
  await mkdir(output, {recursive: true});
  await writeFile(output + '/index.html', html);
  await writeFile(output + '/source.md', source);
} else {
  await save('public/banzi/index.html', html);
  await save('public/banzi/source.md', source);
}
console.log(`Built notebook: ${groups.length} categories, ${groups.flatMap(g => g.entries).length} templates.`);
