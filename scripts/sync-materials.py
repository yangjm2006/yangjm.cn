#!/usr/bin/env python3
"""Mirror verified GitHub blobs and atomically publish a searchable catalog (Python 3.6+)."""
import argparse
import concurrent.futures
import hashlib
import html
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import tempfile
import time
import zipfile
from urllib.parse import quote

REPO = 'yangjm2006/OI-Material'
API = 'https://api.github.com/repos/' + REPO


def fetch(url, target, limit=1073741824):
    subprocess.run(['curl', '--fail', '--silent', '--show-error', '--location',
                    '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '15',
                    '--max-time', '600', '--retry', '3', '--retry-delay', '3',
                    '--max-filesize', str(limit), '-H', 'User-Agent: yangjm-materials-sync',
                    url, '-o', str(target)], check=True, timeout=2500)


def git_hash(path):
    digest = hashlib.sha1(('blob %d\0' % path.stat().st_size).encode())
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def select_files(tree):
    if tree.get('truncated'):
        raise ValueError('Incomplete GitHub tree; refusing partial publication')
    files = []
    for entry in tree['tree']:
        path = PurePosixPath(entry['path'])
        if path.is_absolute() or '..' in path.parts or '\\' in str(path):
            raise ValueError('Unsafe repository path')
        if entry['type'] != 'blob' or any(p.startswith('.') for p in path.parts) or str(path) == 'README.md':
            continue
        if entry['mode'] not in ('100644', '100755') or not re.fullmatch('[0-9a-f]{40}', entry['sha']):
            raise ValueError('Unsupported repository object')
        files.append(entry)
    if not files:
        raise ValueError('Empty materials repository; keeping current release')
    return sorted(files, key=lambda item: item['path'])


def render(files, revision, app, output):
    esc = html.escape
    groups = {}
    for item in files:
        group = item['path'].split('/')[0] if '/' in item['path'] else '其他资料'
        groups.setdefault(group, []).append(item)
    sections = []
    options = []
    for index, (group, entries) in enumerate(groups.items()):
        options.append('<option value="{0}">{0}</option>'.format(esc(group)))
        rows = []
        for item in entries:
            path = PurePosixPath(item['path'])
            ext = path.suffix.lstrip('.').upper() or 'FILE'
            url = '/files/' + item['sha'] + '/' + quote(path.name, safe='')
            size = '{:.1f} MB'.format(item['size'] / 1048576) if item['size'] >= 1048576 else '{:.0f} KB'.format(item['size'] / 1024)
            nested = str(path.parent)
            preview = '<a href="{}" target="_blank" rel="noopener" aria-label="在线查看 {}">在线查看</a>'.format(url, esc(path.name)) if ext == 'PDF' else ''
            rows.append('<li class="material-row" data-group="{group}" data-search="{search}"><div class="material-copy"><h3><a href="{url}" {behavior}>{title}</a></h3><p>{parent}</p></div><span class="file-meta">{ext} · {size}</span><div class="file-actions">{preview}<a href="{url}" download="{filename}" aria-label="下载 {filename}">下载</a></div></li>'.format(
                group=esc(group), search=esc(item['path'].lower()), url=url,
                behavior='target="_blank" rel="noopener"' if ext == 'PDF' else 'download="{}"'.format(esc(path.name)),
                title=esc(path.stem), parent=esc(nested), ext=esc(ext), size=size, preview=preview, filename=esc(path.name)))
        sections.append('<details class="material-group" open><summary><span class="material-group-title">{0}</span><span class="material-group-count">{1} 份</span><svg class="material-group-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><ul>{2}</ul></details>'.format(esc(group), len(entries), ''.join(rows)))
    template = (app / 'materials/index.template.html').read_text(encoding='utf-8')
    homepage = (app / 'public/index.html').read_text(encoding='utf-8')
    header = re.search(r'<header id="site-navigation"[\s\S]*?</header>', homepage).group(0)
    header = header.replace(' aria-current="page"', '').replace('data-section="materials"', 'data-section="materials" aria-current="page"')
    template = template.replace('{{SITE_HEADER}}', header)
    for key, value in {'ROWS': ''.join(sections), 'OPTIONS': ''.join(options), 'COUNT': str(len(files)),
                       'DATE': revision['publishedAt'].replace('T', ' ').replace('Z', ' UTC')}.items():
        template = template.replace('{{' + key + '}}', value)
    output.mkdir(parents=True, exist_ok=True)
    (output / 'index.html').write_text(template, encoding='utf-8')
    for name in ['styles.css', 'subsites.css', 'subsites.js', 'favicon.svg', 'navigation.css']:
        shutil.copyfile(app / 'public' / name, output / name)
    for name in ['materials.css', 'materials.js']:
        shutil.copyfile(app / 'materials' / name, output / name)
    (output / 'revision.json').write_text(json.dumps(revision, ensure_ascii=False), encoding='utf-8')


def sync(args):
    state, app = Path(args.state_dir).resolve(), Path(args.app_dir).resolve()
    state.mkdir(parents=True, exist_ok=True)
    objects, releases = state / 'objects', state / 'releases'
    objects.mkdir(exist_ok=True)
    releases.mkdir(exist_ok=True)
    # A durable object URL keeps downloads from already-open catalog tabs working.
    with tempfile.TemporaryDirectory(prefix='staging-', dir=str(state)) as temp:
        stage = Path(temp)
        if args.fixture:
            tree = json.loads(Path(args.fixture).read_text(encoding='utf-8'))
            commit = tree['sha']
        else:
            fetch(API + '/commits/main', stage / 'commit.json', 5242880)
            commit = json.loads((stage / 'commit.json').read_text())['sha']
            if not re.fullmatch('[0-9a-f]{40}', commit):
                raise ValueError('Invalid commit')
            previous = state / 'current/revision.json'
            if previous.exists() and not args.force and json.loads(previous.read_text())['commit'] == commit:
                print('Materials unchanged: ' + commit, flush=True)
                return
            fetch(API + '/git/trees/' + commit + '?recursive=1', stage / 'tree.json', 20971520)
            tree = json.loads((stage / 'tree.json').read_text())
        files = select_files(tree)

        missing_bytes = sum(item['size'] for item in files
                            if not (objects / item['sha'] / PurePosixPath(item['path']).name).exists())
        if not args.fixture and missing_bytes > 8 * 1048576:
            archive = stage / 'source.zip'
            fetch('https://codeload.github.com/' + REPO + '/zip/' + commit, archive)
            with zipfile.ZipFile(str(archive)) as package:
                archive_roots = {name.split('/', 1)[0] for name in package.namelist()}
                if len(archive_roots) != 1:
                    raise ValueError('Unexpected archive roots')
                archive_root = archive_roots.pop()
                if not archive_root.endswith('-' + commit):
                    raise ValueError('Unexpected archive root: ' + archive_root)
                for item in files:
                    name = PurePosixPath(item['path']).name
                    folder = objects / item['sha']
                    folder.mkdir(exist_ok=True)
                    target = folder / name
                    if target.exists() and git_hash(target) == item['sha']:
                        continue
                    try:
                        entry = package.getinfo(archive_root + '/' + item['path'])
                    except KeyError:
                        # GitHub's archive can omit a tree blob. The pinned raw
                        # download below still verifies its size and Git hash.
                        continue
                    if entry.file_size != item['size']:
                        raise ValueError('Archive size mismatch: ' + item['path'])
                    candidate = stage / 'archive-object'
                    with package.open(entry) as source, candidate.open('wb') as destination:
                        shutil.copyfileobj(source, destination)
                    if git_hash(candidate) != item['sha']:
                        raise ValueError('Archive Git blob mismatch: ' + item['path'])
                    with candidate.open('rb') as source:
                        if source.read(80).startswith(b'version https://git-lfs.github.com/spec/'):
                            raise ValueError('Git LFS pointer is not a downloadable material')
                    os.replace(str(candidate), str(target))

        def download(item):
            name = PurePosixPath(item['path']).name
            folder = objects / item['sha']
            folder.mkdir(exist_ok=True)
            target = folder / name
            if target.exists() and target.stat().st_size == item['size'] and git_hash(target) == item['sha']:
                return
            candidate = stage / (item['sha'] + '-' + hashlib.sha256(name.encode()).hexdigest()[:12])
            fetch('https://raw.githubusercontent.com/' + REPO + '/' + commit + '/' + quote(item['path'], safe='/'), candidate)
            if candidate.stat().st_size != item['size'] or git_hash(candidate) != item['sha']:
                raise ValueError('Git blob verification failed: ' + item['path'])
            with candidate.open('rb') as stream:
                if stream.read(80).startswith(b'version https://git-lfs.github.com/spec/'):
                    raise ValueError('Git LFS pointer requires explicit support: ' + item['path'])
            os.replace(str(candidate), str(target))
            print('Verified ' + item['path'], flush=True)

        if not args.fixture:
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
                list(pool.map(download, files))
        revision = {'commit': commit, 'files': len(files), 'bytes': sum(x['size'] for x in files),
                    'publishedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'repository': 'https://github.com/' + REPO}
        output = stage / 'site'
        render(files, revision, app, output)
        name = str(int(time.time() * 1000000)) + '-' + commit[:12]
        release = releases / name
        os.rename(str(output), str(release))
        pointer = state / ('current-' + name)
        pointer.symlink_to(Path('releases') / name, target_is_directory=True)
        os.replace(str(pointer), str(state / 'current'))
        print('Published {} materials at {}'.format(len(files), commit), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state-dir', default='/var/lib/yangjm-materials')
    parser.add_argument('--app-dir', default='/opt/yangjm-materials')
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--fixture', help='Build a preview from a tree JSON without downloading files')
    args = parser.parse_args()
    os.umask(0o022)
    sync(args)
