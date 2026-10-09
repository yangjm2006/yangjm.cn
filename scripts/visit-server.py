#!/usr/bin/env python3
"""Small, private SQLite counter for the homepage and published blog posts."""
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from http.cookies import SimpleCookie
from pathlib import Path
import re
import secrets
import sqlite3
from socketserver import ThreadingMixIn
from urllib.parse import urlsplit

DB = Path(os.environ.get('VISIT_DB', '/var/lib/yangjm-visits/visits.sqlite3'))
BLOG_ROOT = Path(os.environ.get('VISIT_BLOG_ROOT', '/var/www/yangjm.cn/blog'))
HOST = os.environ.get('VISIT_HOST', '127.0.0.1')
PORT = int(os.environ.get('VISIT_PORT', '8765'))
COOKIE = 'yangjm_visitor'
SLUG = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*\Z')
VISITOR = re.compile(r'[0-9a-f]{32}\Z')


def connect():
    db = sqlite3.connect(str(DB), timeout=10)
    db.execute('PRAGMA journal_mode=WAL')
    db.execute('CREATE TABLE IF NOT EXISTS visits (page TEXT NOT NULL, visitor TEXT NOT NULL, PRIMARY KEY(page, visitor))')
    return db


def published_posts():
    return {path.parent.name for path in BLOG_ROOT.glob('*/index.html') if SLUG.fullmatch(path.parent.name)}


class Handler(BaseHTTPRequestHandler):
    def respond(self, status, data, cookie=None):
        body = json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if cookie:
            self.send_header('Set-Cookie', f'{COOKIE}={cookie}; Max-Age=31536000; Path=/; Domain=yangjm.cn; Secure; HttpOnly; SameSite=Lax')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def site(self):
        return self.headers.get('X-Visit-Site')

    def do_GET(self):
        if urlsplit(self.path).path != '/api/visits' or self.site() != 'blog':
            return self.respond(404, {'error': 'not found'})
        posts = published_posts()
        with connect() as db:
            counts = dict(db.execute('SELECT page, COUNT(*) FROM visits GROUP BY page'))
        self.respond(200, {'counts': {slug: counts.get(slug, 0) for slug in posts}})

    def do_POST(self):
        site = self.site()
        if urlsplit(self.path).path != '/api/visits' or site not in ('home', 'blog'):
            return self.respond(404, {'error': 'not found'})
        if self.headers.get('Origin') not in (None, 'https://yangjm.cn' if site == 'home' else 'https://blog.yangjm.cn'):
            return self.respond(403, {'error': 'origin denied'})
        if self.headers.get_content_type() != 'application/json':
            return self.respond(415, {'error': 'JSON required'})
        try:
            size = int(self.headers.get('Content-Length', '-1'))
            if not 0 < size <= 256:
                return self.respond(413, {'error': 'invalid body size'})
            page = json.loads(self.rfile.read(size))['page']
        except (ValueError, KeyError, TypeError, UnicodeDecodeError):
            return self.respond(400, {'error': 'invalid body'})
        if page != 'home' and (site != 'blog' or not isinstance(page, str) or not SLUG.fullmatch(page) or page not in published_posts()):
            return self.respond(404, {'error': 'unknown page'})
        if page == 'home' and site != 'home':
            return self.respond(404, {'error': 'unknown page'})
        cookies = SimpleCookie()
        try:
            cookies.load(self.headers.get('Cookie', ''))
            visitor = cookies[COOKIE].value if COOKIE in cookies else None
        except Exception:
            visitor = None
        fresh = not visitor or not VISITOR.fullmatch(visitor)
        if fresh:
            visitor = secrets.token_hex(16)
        with connect() as db:
            db.execute('INSERT OR IGNORE INTO visits(page, visitor) VALUES (?, ?)', (page, visitor))
            count = db.execute('SELECT COUNT(*) FROM visits WHERE page = ?', (page,)).fetchone()[0]
        self.respond(200, {'count': count}, visitor if fresh else None)


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


if __name__ == '__main__':
    DB.parent.mkdir(parents=True, exist_ok=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
