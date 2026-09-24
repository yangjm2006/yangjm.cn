const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export function parseNotebook(source) {
  const groups = []; const ids = new Set(); let current, entry, fence = false, code = [];
  for (const line of source.replace(/\r\n/g, '\n').split('\n')) {
    if (/^```/.test(line)) {
      if (!entry) throw Error('Code outside a template');
      if (fence) { entry.blocks.push({code: code.join('\n') + '\n'}); code = []; }
      fence = !fence; continue;
    }
    if (fence) { code.push(line); continue; }
    if (line.startsWith('## ')) { current = {title: line.slice(3).trim(), entries: []}; groups.push(current); entry = null; }
    else if (line.startsWith('### ')) {
      if (!current) throw Error('Template without category');
      const title = line.slice(4).trim(), id = 'template-' + Buffer.from(title).toString('hex');
      if (!title || ids.has(id)) throw Error('Empty or duplicate template title');
      ids.add(id); entry = {title, id, blocks: []}; current.entries.push(entry);
    } else if (line.trim()) {
      if (!entry) throw Error('Unsupported content outside template');
      entry.blocks.push({text: line});
    }
  }
  if (fence || !ids.size || !groups.some(g => g.entries.some(e => e.blocks.some(b => b.code)))) throw Error('Incomplete notebook');
  return groups;
}
function highlight(code) {
  // Tokenize the original text once, then escape all text, including comments.
  return code.split(/(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|^\s*#[^\n]*|\b(?:int|long|double|float|char|bool|void|auto|const|struct|class|template|typename|using|namespace|return|if|else|for|while|do|break|continue|switch|case|public|private|true|false|sizeof|static|unsigned|signed)\b|\b\d+(?:\.\d+)?\b)/gm).map(token => {
    let type = /^\/\//.test(token) || /^\/\*/.test(token) ? 'comment' : /^['"]/.test(token) ? 'string' : /^\s*#/.test(token) ? 'directive' : /^\d/.test(token) ? 'number' : /^(int|long|double|float|char|bool|void|auto|const|struct|class|template|typename|using|namespace|return|if|else|for|while|do|break|continue|switch|case|public|private|true|false|sizeof|static|unsigned|signed)$/.test(token) ? 'keyword' : '';
    return type ? `<span class="syntax-${type}">${escape(token)}</span>` : escape(token);
  }).join('');
}
export function renderNotebook(groups) {
  const all = groups.flatMap(group => group.entries), count = all.length;
  const nav = groups.map((group, i) => `<details class="nav-group" open><summary><span>${String(i + 1).padStart(2, '0')} / ${escape(group.title)}</span><small>${group.entries.length}</small><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="nav-group-links">${group.entries.map(entry => `<a href="#${entry.id}">${escape(entry.title)}</a>`).join('')}</div></details>`).join('');
  const articles = groups.map(group => `<section class="template-group"><h2>${escape(group.title)}</h2>${group.entries.map(entry => `<article class="template" id="${entry.id}" data-category="${escape(group.title)}" tabindex="-1"><div class="article-heading"><div><p class="article-category">${escape(group.title)} <span>/ C++ NOTEBOOK</span></p><h3>${escape(entry.title)}</h3></div><a class="permalink" href="#${entry.id}" aria-label="${escape(entry.title)}永久链接">#</a></div>${entry.blocks.map(block => block.code !== undefined ? `<div class="code-box"><div class="code-bar"><span><b class="code-dot"></b>C++ <small>· ${block.code.trimEnd().split('\n').length} 行</small></span><div><button type="button" class="wrap-code" aria-pressed="false">自动换行</button><button type="button" class="copy-code">复制代码</button></div></div><pre tabindex="0" aria-label="${escape(entry.title)}代码"><code>${highlight(block.code)}</code></pre></div>` : `<p class="source-note">${escape(block.text)}</p>`).join('')}</article>`).join('')}</section>`).join('');
  return `<main id="content" class="notebook-main"><section class="notebook-intro"><div><p class="eyebrow">THE ALGORITHM COLLECTION</p><h1>算法手册<span> / 板子</span></h1><p class="lead">常用算法，随手可查。</p></div><div class="notebook-meta"><a href="https://github.com/yangjm2006/Blog/blob/main/%E6%9D%BF%E5%AD%90.md" target="_blank" rel="noopener noreferrer">GitHub 原文 ↗</a><a href="/banzi/source.md" download="板子.md">下载板子 ↓</a><span>${groups.length} 个分类 <i>·</i> ${count} 篇收录</span></div></section><div class="notebook-layout"><aside class="notebook-sidebar" aria-label="板子目录"><div class="sidebar-heading"><span>内容目录</span><button id="directory-toggle" type="button" aria-expanded="false" aria-controls="directory-body">展开目录 ↓</button></div><div id="directory-body"><label class="search-label" for="template-search">搜索算法或代码</label><div class="search-field"><span aria-hidden="true">⌕</span><input id="template-search" type="search" placeholder="搜索算法或代码…" autocomplete="off"><button id="clear-search" type="button" aria-label="清空搜索">×</button></div><p id="search-status" role="status">共 ${count} 篇板子</p><nav class="template-nav" aria-label="分类目录">${nav}</nav><p class="sidebar-note">从一道题，到一类问题。</p></div></aside><div class="notebook-articles"><p class="empty-search" hidden>没有找到相关板子。<br><small>试试算法名称、分类或代码里的关键词。</small></p>${articles}<nav class="reader-pagination" aria-label="上一篇与下一篇" hidden><a id="previous-template"></a><a id="next-template"></a></nav><p class="reader-note">yangjm 的算法笔记 · 保持思考，持续整理。</p></div></div><p id="copy-status" role="status" class="copy-status"></p></main>`;
}
