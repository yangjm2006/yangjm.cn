#!/usr/bin/env python3
"""Fetch -> validate/build -> atomic release. Failed updates never touch current."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time

SOURCE = 'https://raw.githubusercontent.com/yangjm2006/Blog/main/%E6%9D%BF%E5%AD%90.md'

def sync(args):
    state = Path(args.state_dir).resolve()
    app = Path(args.app_dir).resolve()
    releases = state / 'releases'
    releases.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='staging-', dir=state) as stage_name:
        stage = Path(stage_name)
        candidate = stage / 'source.md'
        if args.local:
            shutil.copyfile(args.local, candidate)
        else:
            subprocess.run(['curl', '--fail', '--silent', '--show-error', '--location',
                            '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '10',
                            '--max-time', '45', '--max-filesize', '5242880',
                            args.source_url, '--output', str(candidate)], check=True, timeout=55)
        data = candidate.read_bytes()
        if not 100 <= len(data) <= 5242880:
            raise ValueError('Source size outside allowed range')
        text = data.decode('utf-8-sig').replace('\r\n', '\n')
        candidate.write_text(text, encoding='utf-8')
        digest = hashlib.sha256(text.encode()).hexdigest()
        current = state / 'current'
        previous = {}
        if current.exists():
            previous = json.loads((current / 'revision.json').read_text())
        if previous.get('sha256') == digest and not args.force:
            print('GitHub content unchanged; keeping current release.', flush=True)
            return
        output = stage / 'built'
        env = dict(os.environ, NOTEBOOK_ONLY='1', NOTEBOOK_SOURCE=str(candidate), NOTEBOOK_OUTPUT=str(output))
        subprocess.run([args.node, str(app / 'scripts/build-subsites.mjs')], env=env, check=True, timeout=45)
        html = (output / 'index.html').read_text(encoding='utf-8')
        if 'class="template"' not in html or '<!doctype html>' not in html:
            raise ValueError('Generated page is incomplete')
        revision = {'sha256': digest, 'publishedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'source': SOURCE}
        (output / 'revision.json').write_text(json.dumps(revision) + '\n', encoding='utf-8')
        # Release directory + pointer live on the same filesystem for atomic rename.
        name = str(int(time.time() * 1000000)) + '-' + digest[:12]
        release = releases / name
        os.rename(output, release)
        release.chmod(0o755)
        for file in release.iterdir():
            file.chmod(0o644)
        pointer = state / ('current-' + name)
        pointer.symlink_to(Path('releases') / name, target_is_directory=True)
        os.replace(pointer, current)
        print('Published notebook release ' + name, flush=True)
        # Only remove old directories created by this updater, keeping five releases.
        old = sorted((p for p in releases.iterdir() if p.is_dir() and not p.is_symlink()
                      and p.name.split('-')[0].isdigit()), key=lambda p: p.name, reverse=True)
        for path in old[5:]:
            if path.resolve().parent == releases.resolve() and path != release:
                shutil.rmtree(path)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state-dir', default='/var/lib/yangjm-notebook')
    parser.add_argument('--app-dir', default='/opt/yangjm-notebook')
    parser.add_argument('--node', default='/usr/bin/node')
    parser.add_argument('--source-url', default=SOURCE)
    parser.add_argument('--local', help='Seed a release from an existing local Markdown file')
    parser.add_argument('--force', action='store_true')
    args = parser.parse_args()
    os.umask(0o022)
    try:
        sync(args)
    except Exception as error:
        print('Sync failed; keeping the last successful local release: ' + str(error), file=sys.stderr)
        sys.exit(1)
