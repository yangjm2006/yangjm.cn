const profile = window.SITE_PROFILE || {};
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
if (profile.icpNumber) {
  const link = document.getElementById('icp-link');
  link.textContent = profile.icpNumber;
  link.hidden = false;
}
