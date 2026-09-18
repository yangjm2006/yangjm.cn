(() => {
  const toggle = document.querySelector('#theme-toggle');
  function apply(theme, {persist = false} = {}) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    const label = nextTheme === 'dark' ? '切换到日间模式' : '切换到夜间模式';
    toggle.setAttribute('aria-label', label); toggle.title = label;
    toggle.setAttribute('aria-pressed', String(nextTheme === 'dark'));
    document.querySelector('meta[name="theme-color"]').content = nextTheme === 'dark' ? '#15231d' : '#f4f1e8';
    if (persist) window.YANGJM_THEME?.save(nextTheme);
  }
  apply(document.documentElement.dataset.theme);
  toggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(theme, {persist: true});
  });
  function syncSharedTheme() {
    const sharedTheme = window.YANGJM_THEME?.read();
    if (window.YANGJM_THEME?.valid(sharedTheme) && sharedTheme !== document.documentElement.dataset.theme) {
      apply(sharedTheme);
    }
  }
  window.addEventListener('pageshow', syncSharedTheme);
  window.addEventListener('focus', syncSharedTheme);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncSharedTheme();
  });
  if (document.body.classList.contains('oi-page')) {
    const cards = [...document.querySelectorAll('.platform')];
    const status = document.createElement('p');
    status.className = 'oj-stats-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-atomic', 'true');
    status.textContent = '训练数据每小时更新';
    document.querySelector('.platforms').prepend(status);
    cards.forEach(card => {
      const id = card.dataset.platform;
      const mark = card.querySelector('.platform-mark');
      const avatar = document.createElement('span');
      avatar.className = 'judge-avatar';
      const image = document.createElement('img');
      image.src = '/assets/avatar.jpg';
      image.alt = '';
      image.width = 64;
      image.height = 64;
      image.addEventListener('error', () => { image.src = '/assets/avatar.jpg'; }, {once: true});
      avatar.append(image, mark);
      card.prepend(avatar);
      const stats = document.createElement('dl');
      stats.className = 'judge-stats';
      const solved = document.createElement('div');
      solved.innerHTML = '<dt>已通过</dt><dd data-stat="solved">—</dd>';
      stats.append(solved);
      if (id === 'codeforces' || id === 'atcoder') {
        const rating = document.createElement('div');
        rating.innerHTML = '<dt>Rating</dt><dd data-stat="rating">—</dd>';
        stats.append(rating);
      }
      card.insertBefore(stats, card.lastElementChild);
    });
    fetch('/oi/stats.json', {cache: 'no-cache'}).then(response => {
      if (!response.ok) throw new Error('stats unavailable');
      return response.json();
    }).then(data => {
      cards.forEach(card => {
        const item = data.platforms?.[card.dataset.platform];
        if (!item) return;
        const solved = card.querySelector('[data-stat="solved"]');
        solved.textContent = Number.isInteger(item.solved) ? item.solved.toLocaleString('zh-CN') : '待同步';
        const image = card.querySelector('.judge-avatar img');
        if (item.avatar) image.src = item.avatar;
        card.title = item.lastSuccess ? `数据更新于 ${new Date(item.lastSuccess).toLocaleString('zh-CN')}` : '等待首次成功同步';
        const handle = card.querySelector('.judge-handle');
        if (card.dataset.platform === 'luogu') {
          if (item.color) handle.classList.add('luogu-' + String(item.color).toLowerCase());
          if (Number.isInteger(item.ccfLevel) && item.ccfLevel > 0) {
            const badge = document.createElement('span');
            badge.className = 'luogu-verification';
            badge.setAttribute('aria-label', `洛谷 ${item.ccfLevel} 级认证`);
            badge.title = `洛谷 ${item.ccfLevel} 级认证`;
            badge.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="verification-seal" d="m12 1.8 2.3 1.4 2.7-.2 1.2 2.4 2.4 1.2-.2 2.7 1.4 2.3-1.4 2.3.2 2.7-2.4 1.2-1.2 2.4-2.7-.2-2.3 1.4-2.3-1.4-2.7.2-1.2-2.4-2.4-1.2.2-2.7L2.2 12l1.4-2.3-.2-2.7 2.4-1.2L7 3.4l2.7.2Z"/><path class="verification-check" d="m7.4 12.2 3 3 6.4-7"/></svg>';
            handle.after(badge);
          }
        }
        const rating = card.querySelector('[data-stat="rating"]');
        if (rating && Number.isInteger(item.rating)) {
          rating.textContent = item.rating.toLocaleString('zh-CN');
          let ratingClass = '';
          let ratingLabel = '';
          if (card.dataset.platform === 'codeforces') {
            ratingClass = 'rating-' + String(item.rank || '').replaceAll(' ', '-');
            ratingLabel = item.rank || '';
          } else {
            const atcoderTiers = ['gray', 'brown', 'green', 'cyan', 'blue', 'yellow', 'orange', 'red'];
            ratingClass = 'atcoder-' + atcoderTiers[Math.min(7, Math.floor(item.rating / 400))];
            ratingLabel = 'rating';
          }
          rating.className = `rating ${ratingClass}`;
          handle.classList.add(ratingClass);
          if (ratingLabel) {
            const rank = document.createElement('small');
            rank.textContent = ratingLabel;
            rating.append(rank);
          }
        }
      });
      const values = Object.values(data.platforms || {});
      const pending = values.filter(item => item.stale && !item.lastSuccess).length;
      const cached = values.filter(item => item.stale && item.lastSuccess).length;
      status.textContent = pending
        ? `已更新 ${values.length - pending}/${values.length} 个平台 · 每小时重试`
        : cached ? `${cached} 个平台使用上次数据 · 每小时同步` : '训练数据已更新 · 每小时同步';
    }).catch(() => {
      status.textContent = '暂时无法读取训练数据，稍后自动重试';
    });
  }
  const search = document.querySelector('#template-search');
  if (!search || document.querySelector('#directory-toggle')) return;
  const entries = [...document.querySelectorAll('.template')];
  const index = entries.map(el => ({ el, text: (el.parentElement.querySelector('h2').textContent + ' ' + el.textContent).toLocaleLowerCase() }));
  function filter() {
    const query = search.value.trim().toLocaleLowerCase(); let count = 0;
    for (const {el, text} of index) { el.hidden = !text.includes(query); if (!el.hidden) count++; }
    for (const group of document.querySelectorAll('.template-group')) group.hidden = ![...group.querySelectorAll('.template')].some(el => !el.hidden);
    for (const anchor of document.querySelectorAll('.template-nav a')) anchor.hidden = document.getElementById(anchor.getAttribute('href').slice(1)).hidden;
    for (const group of document.querySelectorAll('.nav-group')) group.hidden = ![...group.querySelectorAll('a')].some(el => !el.hidden);
    document.querySelector('#search-status').textContent = query ? `找到 ${count} 篇板子` : `共 ${count} 篇板子`;
    document.querySelector('.empty-search').hidden = count !== 0;
  }
  search.addEventListener('input', filter);
  document.querySelector('#clear-search').addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
  document.querySelectorAll('.copy-code').forEach(button => button.addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try { await navigator.clipboard.writeText(button.closest('.code-box').querySelector('code').textContent); button.textContent = '已复制'; status.textContent = '代码已复制'; }
    catch { status.textContent = '复制失败，请选中代码手动复制。'; }
    setTimeout(() => { button.textContent = '复制代码'; status.textContent = ''; }, 2500);
  }));
})();
