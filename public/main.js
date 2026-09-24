const profile = window.SITE_PROFILE || {};
const themeRoot = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme, { persist = false } = {}) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  const dark = nextTheme === 'dark';
  themeRoot.dataset.theme = nextTheme;
  themeRoot.style.colorScheme = nextTheme;
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? '切换到日间模式' : '切换到夜间模式');
  themeToggle.title = dark ? '切换到日间模式' : '切换到夜间模式';
  themeColor.content = dark ? '#15231d' : '#f4f1e8';
  if (persist) {
    window.YANGJM_THEME?.save(nextTheme);
  }
}

applyTheme(themeRoot.dataset.theme);
themeToggle.addEventListener('click', () => {
  applyTheme(themeRoot.dataset.theme === 'dark' ? 'light' : 'dark', { persist: true });
});
function syncSharedTheme() {
  const sharedTheme = window.YANGJM_THEME?.read();
  if (window.YANGJM_THEME?.valid(sharedTheme) && sharedTheme !== themeRoot.dataset.theme) {
    applyTheme(sharedTheme);
  }
}
window.addEventListener('pageshow', syncSharedTheme);
window.addEventListener('focus', syncSharedTheme);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') syncSharedTheme();
});

if (profile.school && profile.major) {
  document.querySelector('.card-caption').textContent = `${profile.school} · ${profile.major}`;
}
if (profile.email) {
  const link = document.getElementById('email-link');
  link.href = `mailto:${profile.email}`;
  link.textContent = `${profile.email} ↗`;
}
if (profile.name) {
  for (const id of ['profile-name', 'card-name', 'footer-name']) {
    document.getElementById(id).textContent = profile.name;
  }
  document.title = `${profile.name} · 个人主页`;
  document.querySelector('.brand').setAttribute('aria-label', `${profile.name} 首页`);
}
if (profile.intro) {
  document.getElementById('profile-intro').textContent = profile.intro;
  document.querySelector('meta[name="description"]').content = profile.intro;
}
if (profile.github) {
  try {
    const url = new URL(profile.github);
    if (url.protocol === 'https:') {
      document.querySelectorAll('.github-link').forEach(link => { link.href = url.href; });
    }
  } catch { /* 保留默认 GitHub 链接。 */ }
}
document.getElementById('year').textContent = new Date().getFullYear();
const blogCount = document.getElementById('blog-count');
fetch('/blog/revision.json', { cache: 'no-store' })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(revision => {
    if (Number.isSafeInteger(revision.posts) && revision.posts >= 0) {
      blogCount.textContent = `${revision.posts} 篇文章`;
    }
  })
  .catch(() => { /* 保留构建时的文章数。 */ });
if (profile.icpNumber) {
  const link = document.getElementById('icp-link');
  link.textContent = profile.icpNumber;
  link.hidden = false;
}

const hitokotoContent = document.getElementById('hitokoto-content');
const hitokotoText = document.getElementById('hitokoto-text');
const hitokotoSource = document.getElementById('hitokoto-source');
const hitokotoRefresh = document.getElementById('hitokoto-refresh');
const hitokotoEndpoint = 'https://v1.hitokoto.cn/?c=d&c=i&c=k&encode=json&max_length=32';
const hitokotoFallback = {
  hitokoto: '今天也向前一点。',
  from: '暂时未连接一言，点击刷新重试',
  uuid: '',
};

function renderHitokoto(data) {
  const sentence = typeof data.hitokoto === 'string' ? data.hitokoto.trim() : '';
  if (!sentence || sentence.length > 80) throw new Error('Invalid sentence');
  const author = typeof data.from_who === 'string' ? data.from_who.trim() : '';
  const source = typeof data.from === 'string' ? data.from.trim() : '';
  hitokotoText.textContent = `“${sentence}”`;
  hitokotoSource.textContent = [...new Set([author, source].filter(Boolean))].join(' · ') || '来自一言';
  hitokotoText.href = data.uuid
    ? `https://hitokoto.cn/?uuid=${encodeURIComponent(data.uuid)}`
    : 'https://hitokoto.cn/';
}

async function loadHitokoto({ refresh = false } = {}) {
  hitokotoContent.setAttribute('aria-busy', 'true');
  hitokotoRefresh.disabled = true;

  if (!refresh) {
    try {
      const cached = JSON.parse(sessionStorage.getItem('yangjm-hitokoto-literary-v1'));
      if (cached?.hitokoto) {
        renderHitokoto(cached);
        hitokotoContent.setAttribute('aria-busy', 'false');
        hitokotoRefresh.disabled = false;
        return;
      }
    } catch { /* 缓存不可用时直接请求。 */ }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(hitokotoEndpoint, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderHitokoto(data);
    try {
      sessionStorage.setItem('yangjm-hitokoto-literary-v1', JSON.stringify({
        hitokoto: data.hitokoto,
        from: data.from,
        from_who: data.from_who,
        uuid: data.uuid,
      }));
    } catch { /* 隐私模式下缓存可能不可用。 */ }
  } catch {
    renderHitokoto(hitokotoFallback);
  } finally {
    clearTimeout(timeout);
    hitokotoContent.setAttribute('aria-busy', 'false');
    window.setTimeout(() => { hitokotoRefresh.disabled = false; }, 800);
  }
}

hitokotoRefresh.addEventListener('click', () => loadHitokoto({ refresh: true }));
loadHitokoto();
