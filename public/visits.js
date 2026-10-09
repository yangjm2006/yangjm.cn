(() => {
  const current = document.querySelector('[data-visit-current]');
  if (current) {
    fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: current.dataset.visitCurrent }),
      credentials: 'same-origin',
      cache: 'no-store',
    }).then(response => {
      if (!response.ok) throw new Error('visit count unavailable');
      return response.json();
    }).then(({ count }) => {
      if (Number.isSafeInteger(count) && count >= 0) current.textContent = count.toLocaleString('zh-CN');
    }).catch(() => { current.closest('[data-visit-label]')?.remove(); });
  }

  const list = document.querySelectorAll('[data-visit-post]');
  if (list.length) {
    fetch('/api/visits', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('visit counts unavailable');
        return response.json();
      }).then(({ counts }) => {
        for (const element of list) {
          const count = counts?.[element.dataset.visitPost];
          if (Number.isSafeInteger(count) && count >= 0) {
            element.textContent = `阅读：${count.toLocaleString('zh-CN')}`;
          }
        }
      }).catch(() => { list.forEach(element => element.remove()); });
  }
})();
