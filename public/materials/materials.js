(() => {
  const search = document.querySelector('#material-search');
  const category = document.querySelector('#material-category');
  const rows = [...document.querySelectorAll('.material-row')];
  const groups = [...document.querySelectorAll('.material-group')];
  const status = document.querySelector('#materials-status');
  const empty = document.querySelector('#materials-empty');
  function filter() {
    const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const row of rows) {
      row.hidden = (category.value && category.value !== row.dataset.group) || !words.every(word => row.dataset.search.includes(word));
      if (!row.hidden) count++;
    }
    for (const group of groups) group.hidden = ![...group.querySelectorAll('.material-row')].some(row => !row.hidden);
    status.textContent = count === rows.length ? `共 ${count} 份资料` : `找到 ${count} 份资料，共 ${rows.length} 份`;
    empty.hidden = count > 0;
  }
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  document.querySelector('#material-reset').addEventListener('click', () => {
    search.value = ''; category.value = ''; filter(); search.focus();
  });
  filter();
})();
