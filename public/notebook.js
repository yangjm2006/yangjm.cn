(() => {
  const search = document.querySelector('#template-search');
  const entries = [...document.querySelectorAll('.template')];
  const links = [...document.querySelectorAll('.template-nav a')];
  const index = entries.map(el => ({el, text: (el.dataset.category + ' ' + el.textContent).toLocaleLowerCase()}));
  let matches = entries, active;
  const directory = document.querySelector('#directory-toggle');
  document.body.classList.add('reader-ready');
  function setDirectory(open) {
    directory.setAttribute('aria-expanded', String(open));
    directory.textContent = open ? '收起目录 ↑' : '展开目录 ↓';
    document.querySelector('.notebook-sidebar').classList.toggle('directory-open', open);
  }
  directory.addEventListener('click', () => setDirectory(directory.getAttribute('aria-expanded') !== 'true'));
  function show(id, focus = false) {
    active = matches.find(el => el.id === id) || matches[0];
    entries.forEach(el => { el.hidden = el !== active; });
    document.querySelectorAll('.template-group').forEach(group => { group.hidden = !active || !group.contains(active); });
    links.forEach(link => {
      const selected = active && link.hash === '#' + active.id;
      if (selected) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
    const pos = matches.indexOf(active);
    for (const [selector, offset, label] of [['#previous-template', -1, '← 上一篇'], ['#next-template', 1, '下一篇 →']]) {
      const target = matches[pos + offset], anchor = document.querySelector(selector);
      anchor.hidden = !target;
      if (target) { anchor.href = '#' + target.id; anchor.textContent = label + ' · ' + target.querySelector('h3').textContent; }
    }
    document.querySelector('.reader-pagination').hidden = !active;
    document.querySelector('.reader-note').hidden = !active;
    document.querySelector('.empty-search').hidden = !!active;
    if (focus && active) { active.focus({preventScroll:true}); active.scrollIntoView({block:'start', behavior:'instant'}); }
  }
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    matches = index.filter(item => item.text.includes(query)).map(item => item.el);
    links.forEach(link => { link.hidden = !matches.some(el => '#' + el.id === link.hash); });
    document.querySelectorAll('.nav-group').forEach(group => { group.hidden = ![...group.querySelectorAll('a')].some(a => !a.hidden); });
    document.querySelector('#search-status').textContent = query ? `找到 ${matches.length} 篇板子` : `共 ${entries.length} 篇板子`;
    show(active?.id || location.hash.slice(1));
  }
  search.addEventListener('input', filter);
  document.querySelector('#clear-search').addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
  function navigate(id) {
    if (!matches.some(el => el.id === id)) { search.value = ''; filter(); }
    setDirectory(false); show(id, true);
  }
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#template-"]');
    if (!anchor) return;
    event.preventDefault();
    if (location.hash !== anchor.hash) history.pushState(null, '', anchor.hash);
    navigate(anchor.hash.slice(1));
  });
  window.addEventListener('popstate', () => navigate(location.hash.slice(1)));
  window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
  document.querySelectorAll('.copy-code').forEach(button => button.addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(button.closest('.code-box').querySelector('code').textContent);
      button.textContent = '已复制 ✓'; status.textContent = '代码已复制';
    } catch { status.textContent = '复制失败，请选中代码手动复制。'; }
    setTimeout(() => {button.textContent = '复制代码';status.textContent = '';}, 2500);
  }));
  document.querySelectorAll('.wrap-code').forEach(button => button.addEventListener('click', () => {
    const wrap = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(wrap)); button.closest('.code-box').classList.toggle('code-wrapped', wrap);
  }));
  show(location.hash.slice(1));
})();
