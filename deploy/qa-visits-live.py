#!/usr/bin/env python3
"""Check the published pages and browser-like cookie deduplication."""
import http.cookiejar
import json
from urllib.request import Request, build_opener, HTTPCookieProcessor

opener = build_opener(HTTPCookieProcessor(http.cookiejar.CookieJar()))


def read(url):
    with opener.open(url, timeout=10) as response:
        return response.read().decode()


def visit(origin, page):
    request = Request(origin + '/api/visits', data=json.dumps({'page': page}).encode(), method='POST',
                      headers={'Content-Type': 'application/json', 'Origin': origin})
    with opener.open(request, timeout=10) as response:
        return json.load(response)['count']


home = 'https://yangjm.cn'
blog = 'https://blog.yangjm.cn'
assert 'data-visit-current="home"' in read(home + '/')
assert 'data-visit-post="math-note">阅读：…' in read(blog + '/')
assert 'data-visit-label>阅读：<span data-visit-current="math-note"' in read(blog + '/math-note/')
assert 'data-visit-label>阅读：<span data-visit-current="2026-2027-season"' in read(blog + '/2026-2027-season/')
script = read(home + '/visits.js')
assert 'fetch(\'/api/visits\'' in script
assert 'element.textContent = `阅读：${count.toLocaleString' in script

home_first = visit(home, 'home')
assert visit(home, 'home') == home_first
article_first = visit(blog, 'math-note')
assert visit(blog, 'math-note') == article_first
counts = json.loads(read(blog + '/api/visits'))['counts']
assert counts['math-note'] == article_first
assert '2026-2027-season' in counts
print('Live visit QA passed: home={}, math-note={}, season={}'.format(
    home_first, article_first, counts['2026-2027-season']))
