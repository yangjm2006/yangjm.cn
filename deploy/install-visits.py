#!/usr/bin/env python3
"""Install the visitor counter from an already extracted staging directory."""
from pathlib import Path
import shutil
import subprocess
import sys
import time

stage = Path(sys.argv[1]).resolve()
if not (stage / 'scripts/visit-server.py').is_file():
    raise SystemExit('Missing staged visit server')
backup = Path('/opt/yangjm-backups/visits-' + time.strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True)


def run(*args):
    subprocess.run(args, check=True)


def install(source, destination):
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        saved = backup / destination.relative_to('/')
        saved.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(str(destination), str(saved))
    temporary = destination.with_name(destination.name + '.visits-new')
    shutil.copy2(str(stage / source), str(temporary))
    temporary.chmod(0o644)
    temporary.replace(destination)


if subprocess.call(['id', '-u', 'yangjm-visits'], stdout=subprocess.DEVNULL,
                   stderr=subprocess.DEVNULL) != 0:
    run('useradd', '--system', '--no-create-home', 'yangjm-visits')
install('scripts/visit-server.py', '/opt/yangjm-visits/visit-server.py')
install('deploy/yangjm-visits.service', '/etc/systemd/system/yangjm-visits.service')
install('public/index.html', '/var/www/yangjm.cn/index.html')
install('public/visits.js', '/var/www/yangjm.cn/visits.js')
install('public/index.html', '/opt/yangjm-blog/public/index.html')
install('scripts/build-blog.mjs', '/opt/yangjm-blog/scripts/build-blog.mjs')

for site, name in [('home', 'yangjm.cn'), ('blog', 'blog.yangjm.cn')]:
    conf = Path('/etc/nginx/conf.d/' + name + '.conf')
    original = conf.read_text()
    if 'location = /api/visits' in original:
        raise RuntimeError('Counter route already present in ' + str(conf))
    saved = backup / conf.relative_to('/')
    saved.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(str(conf), str(saved))
    marker = '    location / {'
    if marker not in original:
        raise RuntimeError('Expected location missing from ' + str(conf))
    route = ('    location = /api/visits {\n'
             '        client_max_body_size 1k;\n'
             '        proxy_set_header X-Visit-Site ' + site + ';\n'
             '        proxy_pass http://127.0.0.1:8765;\n'
             '    }\n\n')
    temporary = conf.with_name(conf.name + '.visits-new')
    temporary.write_text(original.replace(marker, route + marker, 1))
    temporary.chmod(0o644)
    temporary.replace(conf)

try:
    run('nginx', '-t')
except subprocess.CalledProcessError:
    for name in ('yangjm.cn', 'blog.yangjm.cn'):
        conf = Path('/etc/nginx/conf.d/' + name + '.conf')
        shutil.copy2(str(backup / conf.relative_to('/')), str(conf))
    raise

run('systemctl', 'daemon-reload')
run('systemctl', 'enable', '--now', 'yangjm-visits.service')
run('systemctl', 'is-active', 'yangjm-visits.service')
run('systemctl', 'reload', 'nginx')
print('Backup:', backup)
