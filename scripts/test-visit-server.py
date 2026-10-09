#!/usr/bin/env python3
"""Smoke test unique counting, post isolation and unpublished slugs."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.request import build_opener, Request


with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    (root / 'blog' / 'first-post').mkdir(parents=True)
    (root / 'blog' / 'first-post' / 'index.html').write_text('ok')
    port = '18765'
    env = dict(os.environ, VISIT_DB=str(root / 'visits.sqlite3'), VISIT_BLOG_ROOT=str(root / 'blog'), VISIT_PORT=port)
    server = subprocess.Popen(['/usr/bin/python3', str(Path(__file__).with_name('visit-server.py'))], env=env,
                              stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    try:
        url = f'http://127.0.0.1:{port}/api/visits'
        for _ in range(30):
            try:
                build_opener().open(Request(url, headers={'X-Visit-Site': 'blog'}), timeout=1)
                break
            except Exception:
                time.sleep(.1)
        else:
            server.terminate()
            raise AssertionError('server did not start: ' + server.communicate(timeout=5)[1].decode())

        def post(page, site='blog', cookie=None):
            request = Request(url, data=json.dumps({'page': page}).encode(), method='POST',
                              headers={'Content-Type': 'application/json', 'X-Visit-Site': site,
                                       **({'Cookie': cookie} if cookie else {})})
            with build_opener().open(request) as response:
                return json.load(response)['count'], response.headers.get('Set-Cookie')

        first, set_cookie = post('first-post')
        assert first == 1
        cookie = set_cookie.split(';', 1)[0]
        assert post('first-post', cookie=cookie)[0] == 1
        assert post('first-post')[0] == 2
        try:
            post('unpublished')
            raise AssertionError('unpublished post was counted')
        except HTTPError as error:
            assert error.code == 404
        assert post('home', 'home', cookie)[0] == 1
        counts = json.load(build_opener().open(Request(url, headers={'X-Visit-Site': 'blog'})))['counts']
        assert counts == {'first-post': 2}, counts
        print('visit-server smoke test passed')
    finally:
        server.terminate()
        server.wait(timeout=5)
