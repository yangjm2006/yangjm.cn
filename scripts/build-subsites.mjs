import { siteHeader } from './site-header.mjs';
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
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f4f1e8"><meta name="description" content="yangjm 的${title}"><title>${title} · yangjm</title>${theme}<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/styles.css?v=20260916"><link rel="stylesheet" href="/subsites.css?v=${type === 'oi-page' ? '20260924' : '20260923c'}"><script src="/subsites.js?v=20260917b" defer></script>${type === 'notebook-page' ? '<link rel="stylesheet" href="/notebook.css?v=5"><script src="/notebook.js?v=3" defer></script>' : ''}<link rel="stylesheet" href="/navigation.css?v=20260921a"></head><body class="subsite ${type}"><a class="skip-link" href="#content">跳到正文</a>${siteHeader(homepage, type === 'oi-page' ? 'oi' : 'notebook')}${body}<footer class="sub-footer"><span>© ${new Date().getFullYear()} yangjm</span>${link('https://beian.miit.gov.cn/', '鲁ICP备2026048978号-1')}</footer></body></html>`;
}
await mkdir(new URL('public/oi/', root), { recursive: true });
await mkdir(new URL('public/banzi/', root), { recursive: true });
const icons = {
  luogu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="luogu-back" d="M4.2 4.8h10.1v3.6H7.8v7.2h6.5v3.6H4.2z"/><path class="luogu-front" d="M10 8.4h9.8v10.8H10v-3.6h6.2V12H10z"/></svg>',
  codeforces: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="cf-blue" d="M3 8h5v12H3z"/><path class="cf-yellow" d="M9.5 4h5v16h-5z"/><path class="cf-red" d="M16 10h5v10h-5z"/></svg>',
  atcoder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="at-blue" d="M2.6 18.8 8.8 5.2h3.6L6.2 18.8z"/><path class="at-orange" d="M10 18.8 16.2 5.2h5.2l-1.7 3.6h-3.5l-2.9 6.4h3.5l-1.7 3.6z"/></svg>',
  qoj: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a8 8 0 1 0 4.7 14.5l3.1 3.1 2-2-3.1-3.1A8 8 0 0 0 12 3Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/></svg>',
};
const platforms = [
  ['luogu','洛谷','https://www.luogu.com.cn/user/502227'],
  ['codeforces','Codeforces','https://codeforces.com/profile/yangjm'],
  ['atcoder','AtCoder','https://atcoder.jp/users/yangjm'],
  ['qoj','QOJ','https://qoj.ac/user/profile/yangjm'],
];
if (!process.env.NOTEBOOK_ONLY) await save('public/oi/index.html', shell('算法竞赛', 'oi-page', `<main id="content" class="oi-main"><section class="oi-intro"><div><p class="eyebrow">YANGJM / COMPETITIVE PROGRAMMING</p><h1>思考，编码，<br><em>再进一步。</em></h1><p class="lead">我是 yangjm，山东大学软件工程专业。<br>这里记录我的算法竞赛经历。</p></div><div class="contest-note"><span class="eyebrow">ALGORITHM JOURNAL</span><div class="code-art" aria-hidden="true"><span class="code-keyword">while</span> (<span class="code-condition">curious</span>) {<br>　<span class="code-learn">learn</span>();<br>　<span class="code-solve">solve</span>();<br>　<span class="code-grow">grow</span>();<br>}</div><a href="https://banzi.yangjm.cn">翻开我的算法板子 <span aria-hidden="true">↗</span></a></div></section><section class="oi-section"><div class="section-label"><span>01 / ONLINE JUDGES</span><h2>练习的地方</h2></div><div class="platforms">${platforms.map(([id,name,url]) => `<a class="platform" data-platform="${id}" href="${url}" target="_blank" rel="noopener noreferrer"><span class="platform-mark" aria-label="${name}">${icons[id]}</span><div class="judge-identity"><h3>${name}</h3><p><span class="judge-handle">yangjm</span></p></div><span aria-hidden="true">↗</span></a>`).join('')}</div></section><section class="oi-section"><div class="section-label"><span>02 / TEAM HISTORY</span><h2>一起解题的人</h2></div><div class="team-list"><article class="team"><p>2026.04 — 至今</p><div><h3>Rolling Girl</h3><span class="status">当前队伍</span></div></article><article class="team"><p>2025.08 — 2025.12</p><div><h3>零一之间</h3></div></article></div></section><section class="oi-section"><div class="section-label"><span>03 / ACHIEVEMENTS</span><h2>比赛与奖项</h2></div><div class="award-list"><article class="award"><time datetime="2026-04">2026.04</time><h3>2026年山东大学程序设计精英挑战赛</h3><span class="award-result">冠军</span></article><article class="award"><time datetime="2026-05">2026.05</time><h3>2026年ICPC山东省赛</h3><span class="award-result">金奖</span></article><article class="award"><time datetime="2026-06">2026.06</time><h3>2026年中国大学生程序设计竞赛全国邀请赛（贵阳）</h3><span class="award-result">银奖</span></article><article class="award"><time datetime="2026-07">2026.07</time><h3>2026年ICPC沈阳全国邀请赛</h3><span class="award-result">铜奖</span></article></div></section></main>`));
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
