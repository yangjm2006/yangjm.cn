const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const safeUrl = value => {
  const url = String(value).trim();
  return /^(https?:\/\/|mailto:|\/|#)/i.test(url) ? escapeHtml(url) : '#';
};

function renderInline(source) {
  const tokens = [];
  const keep = html => {
    const key = `\u0000${tokens.length}\u0000`;
    tokens.push(html);
    return key;
  };

  let text = String(source);
  text = text.replace(/`([^`]+)`/g, (_, code) => keep(`<code>${escapeHtml(code)}</code>`));
  text = text.replace(/\$([^$\n]+)\$/g, (_, tex) => keep(`<span class="math-inline">$${escapeHtml(tex)}$</span>`));
  text = text.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g, (_, alt, url, title) =>
    keep(`<img src="${safeUrl(url)}" alt="${escapeHtml(alt)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy">`));
  text = text.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g, (_, label, url, title) => {
    const external = /^https?:\/\//i.test(url);
    return keep(`<a href="${safeUrl(url)}"${title ? ` title="${escapeHtml(title)}"` : ''}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(label)}</a>`);
  });

  text = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');

  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}

function slugForHeading(text, index) {
  const latin = text.toLocaleLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
  return latin ? `section-${latin}` : `section-${index + 1}`;
}

function renderList(lines, start) {
  const items = [];
  let index = start;
  while (index < lines.length) {
    const match = lines[index].match(/^(\s*)([-+*]|\d+\.)\s+(.+)$/);
    if (!match) break;
    items.push({ indent: match[1].replaceAll('\t', '  ').length, ordered: /\d+\./.test(match[2]), text: match[3] });
    index += 1;
  }

  const renderLevel = (position, indent) => {
    const ordered = items[position].ordered;
    let html = ordered ? '<ol>' : '<ul>';
    while (position < items.length && items[position].indent === indent && items[position].ordered === ordered) {
      html += `<li>${renderInline(items[position].text)}`;
      position += 1;
      if (position < items.length && items[position].indent > indent) {
        const nested = renderLevel(position, items[position].indent);
        html += nested.html;
        position = nested.position;
      }
      html += '</li>';
    }
    html += ordered ? '</ol>' : '</ul>';
    return { html, position };
  };

  return { html: renderLevel(0, items[0].indent).html, next: index };
}

export function renderMarkdown(source) {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
  const html = [];
  const headings = [];
  const usedIds = new Set();
  let paragraph = [];
  let index = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      index += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      flushParagraph();
      const language = trimmed.slice(3).trim().replace(/[^\w+-]/g, '');
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      html.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    if (trimmed.startsWith('$$')) {
      flushParagraph();
      let formula = trimmed.slice(2);
      if (formula.endsWith('$$') && formula.length > 2) {
        formula = formula.slice(0, -2);
        index += 1;
      } else {
        const parts = formula ? [formula] : [];
        index += 1;
        while (index < lines.length && !lines[index].trim().endsWith('$$')) parts.push(lines[index++]);
        if (index < lines.length) {
          parts.push(lines[index].trim().slice(0, -2));
          index += 1;
        }
        formula = parts.join('\n');
      }
      html.push(`<div class="math-block">$$${escapeHtml(formula.trim())}$$</div>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const title = heading[2].replace(/\s+#+\s*$/, '').trim();
      let id = slugForHeading(title, headings.length);
      let suffix = 2;
      while (usedIds.has(id)) id = `${slugForHeading(title, headings.length)}-${suffix++}`;
      usedIds.add(id);
      if (level <= 3) headings.push({ level, title, id });
      html.push(`<h${level} id="${id}">${renderInline(title)}<a class="heading-anchor" href="#${id}" aria-label="链接到${escapeHtml(title)}">#</a></h${level}>`);
      index += 1;
      continue;
    }

    if (/^(\s*)([-+*]|\d+\.)\s+/.test(line)) {
      flushParagraph();
      const list = renderList(lines, index);
      html.push(list.html);
      index = list.next;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) quote.push(lines[index++].trim().replace(/^>\s?/, ''));
      html.push(`<blockquote><p>${renderInline(quote.join(' '))}</p></blockquote>`);
      continue;
    }

    if (/^([-*_])(?:\s*\1){2,}$/.test(trimmed)) {
      flushParagraph();
      html.push('<hr>');
      index += 1;
      continue;
    }

    paragraph.push(trimmed);
    index += 1;
  }

  flushParagraph();
  return { html: html.join('\n'), headings };
}

export function renderToc(headings) {
  if (!headings.length) return '';
  return `<ol>${headings.map(item => `<li class="toc-level-${item.level}"><a href="#${item.id}">${escapeHtml(item.title)}</a></li>`).join('')}</ol>`;
}

export { escapeHtml };
