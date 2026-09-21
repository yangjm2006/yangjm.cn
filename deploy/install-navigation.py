"""Install the shared navigation, preserving live content and backup copies."""
from pathlib import Path
import os
import re
import shutil
import time

source = Path('/opt/yangjm-navigation-20260921')
backup = Path('/opt/yangjm-backups') / ('navigation-' + time.strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True)

def save(target, data):
    target = Path(target)
    if target.exists():
        saved = backup / str(target).lstrip('/')
        saved.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(str(target), str(saved))
    target.parent.mkdir(parents=True, exist_ok=True)
    temp = target.with_name(target.name + '.navigation-new')
    temp.write_bytes(data)
    temp.chmod(0o644)
    os.replace(str(temp), str(target))

def copy(relative, target):
    save(target, (source / relative).read_bytes())

for name in ['index.html', 'navigation.css', 'notebook.css']:
    copy('public/' + name, '/var/www/yangjm.cn/' + name)
for app, builder in [('yangjm-blog', 'build-blog.mjs'), ('yangjm-notebook', 'build-subsites.mjs')]:
    copy('public/index.html', '/opt/' + app + '/public/index.html')
    for name in [builder, 'site-header.mjs']:
        copy('scripts/' + name, '/opt/' + app + '/scripts/' + name)
for name in ['public/index.html', 'public/navigation.css', 'materials/index.template.html', 'scripts/sync-materials.py']:
    copy(name, '/opt/yangjm-materials/' + name)

home = (source / 'public/index.html').read_text(encoding='utf-8')
header = re.search(r'<header id="site-navigation"[\s\S]*?</header>', home).group(0)
for folder, section in [('/var/www/yangjm.cn/oi', 'oi'), ('/var/lib/yangjm-blog/current', 'blog'),
                        ('/var/lib/yangjm-notebook/current', 'notebook'), ('/var/lib/yangjm-materials/current', 'materials')]:
    current = Path(folder).resolve()
    for file in current.rglob('*.html'):
        text = file.read_text(encoding='utf-8')
        nav = header.replace(' aria-current="page"', '').replace('data-section="' + section + '"', 'data-section="' + section + '" aria-current="page"')
        text, count = re.subn(r'<header (?:class="sub-header"|id="site-navigation")[\s\S]*?</header>', lambda _: nav, text, count=1)
        if count != 1:
            raise ValueError('Missing header: ' + str(file))
        if '/navigation.css?' not in text:
            text = text.replace('</head>', '<link rel="stylesheet" href="/navigation.css?v=20260921a"></head>')
        save(file, text.encode('utf-8'))
copy('public/navigation.css', '/var/lib/yangjm-materials/current/navigation.css')
print('Navigation installed; backup: ' + str(backup))
