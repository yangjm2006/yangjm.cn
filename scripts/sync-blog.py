#!/usr/bin/env python3
"""Fetch blog Markdown, build it, then atomically publish a verified release."""
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


def sync(args):
    state = Path(args.state_dir).resolve()
    app = Path(args.app_dir).resolve()
    releases = state / 'releases'
    releases.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix='staging-', dir=state) as stage_name:
        stage = Path(stage_name)
        content = stage / 'content'
        content.mkdir()
        manifest = json.loads((app / 'content/blog/posts.json').read_text(encoding='utf-8'))
        (content / 'posts.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

        digests = []
        for post in manifest:
            target = content / post['source']
            source_url = post.get('sourceUrl')
            if args.local_dir:
                shutil.copyfile(Path(args.local_dir) / post['source'], target)
            elif source_url:
                subprocess.run([
                    'curl', '--fail', '--silent', '--show-error', '--location',
                    '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '10',
                    '--max-time', '45', '--max-filesize', '5242880', source_url, '--output', str(target)
                ], check=True, timeout=55)
            else:
                shutil.copyfile(app / 'content/blog' / post['source'], target)
            data = target.read_bytes()
            if not 20 <= len(data) <= 5242880:
                raise ValueError(f"Source size outside allowed range: {post['source']}")
            text = data.decode('utf-8-sig').replace('\r\n', '\n')
            target.write_text(text, encoding='utf-8')
            digests.append(post['source'] + '\0' + hashlib.sha256(text.encode()).hexdigest())

        digest = hashlib.sha256('\n'.join(digests).encode()).hexdigest()
        current = state / 'current'
        previous = {}
        if current.exists():
            previous = json.loads((current / 'revision.json').read_text(encoding='utf-8'))
        if previous.get('sha256') == digest and not args.force:
            print('GitHub blog content unchanged; keeping current release.', flush=True)
            return

        output = stage / 'built'
        env = dict(os.environ, BLOG_CONTENT_DIR=str(content), BLOG_OUTPUT=str(output))
        subprocess.run([args.node, str(app / 'scripts/build-blog.mjs')], env=env, check=True, timeout=45)
        index = (output / 'index.html').read_text(encoding='utf-8')
        if '<!doctype html>' not in index or len(list(output.glob('*/index.html'))) != len(manifest):
            raise ValueError('Generated blog is incomplete')
        revision = {
            'sha256': digest,
            'publishedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'posts': len(manifest),
        }
        (output / 'revision.json').write_text(json.dumps(revision) + '\n', encoding='utf-8')

        name = str(int(time.time() * 1000000)) + '-' + digest[:12]
        release = releases / name
        os.rename(output, release)
        release.chmod(0o755)
        for path in release.rglob('*'):
            path.chmod(0o755 if path.is_dir() else 0o644)
        pointer = state / ('current-' + name)
        pointer.symlink_to(Path('releases') / name, target_is_directory=True)
        os.replace(pointer, current)
        print('Published blog release ' + name, flush=True)

        old = sorted(
            (path for path in releases.iterdir() if path.is_dir() and not path.is_symlink() and path.name.split('-')[0].isdigit()),
            key=lambda path: path.name,
            reverse=True,
        )
        for path in old[5:]:
            if path.resolve().parent == releases.resolve() and path != release:
                shutil.rmtree(path)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state-dir', default='/var/lib/yangjm-blog')
    parser.add_argument('--app-dir', default='/opt/yangjm-blog')
    parser.add_argument('--node', default='/usr/bin/node')
    parser.add_argument('--local-dir', help='Use a local directory containing every Markdown source')
    parser.add_argument('--force', action='store_true')
    args = parser.parse_args()
    os.umask(0o022)
    try:
        sync(args)
    except Exception as error:
        print('Sync failed; keeping the last successful blog release: ' + str(error), file=sys.stderr)
        sys.exit(1)
