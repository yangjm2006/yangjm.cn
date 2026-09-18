#!/usr/bin/env python3
"""Refresh public OJ statistics, preserving each platform's last good result."""
import argparse
import http.cookiejar
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
from urllib.parse import urljoin, urlparse

PLATFORMS = {
    'luogu': {'handle': 'yangjm', 'url': 'https://www.luogu.com.cn/user/502227'},
    'codeforces': {'handle': 'yangjm', 'url': 'https://codeforces.com/profile/yangjm'},
    'atcoder': {'handle': 'yangjm', 'url': 'https://atcoder.jp/users/yangjm'},
    'qoj': {'handle': 'yangjm', 'url': 'https://qoj.ac/user/profile/yangjm'},
}
ALLOWED_AVATAR_HOSTS = {'cdn.luogu.com.cn', 'userpic.codeforces.org'}

def now():
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

def fetch(url, args, limit=26214400, cookie=None):
    command = [args.curl, '--fail', '--silent', '--show-error', '--location',
               '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '10',
               '--max-time', '45', '--max-filesize', str(limit), '--retry', '2', '--retry-delay', '2',
               '-A', 'yangjm.cn public profile updater/1.0']
    if cookie:
        command += ['--cookie', cookie, '--cookie-jar', cookie]
    command += [url]
    return subprocess.check_output(command, timeout=55)

def collect_luogu(args):
    with tempfile.NamedTemporaryFile() as cookie:
        # Luogu's CDN sets a short-lived challenge cookie on the first response.
        subprocess.call([args.curl, '--silent', '--output', os.devnull, '--cookie', cookie.name,
                         '--cookie-jar', cookie.name, '-A', 'Mozilla/5.0', args.luogu_url])
        body = fetch(args.luogu_url, args, cookie=cookie.name).decode('utf-8')
    match = re.search(r'<script id="lentille-context" type="application/json">(.*?)</script>', body, re.S)
    if not match:
        raise ValueError('Luogu profile data missing')
    data = json.loads(match.group(1))['data']
    user = data.get('user') or data.get('currentData', {}).get('user')
    if not user or int(user.get('uid', 0)) != 502227:
        raise ValueError('Luogu user mismatch')
    solved = user.get('passedProblemCount', data.get('passedProblemCount'))
    if not isinstance(solved, int):
        raise ValueError('Luogu solved count missing')
    color = user.get('color')
    ccf_level = user.get('ccfLevel')
    return {
        'solved': solved,
        'color': color if isinstance(color, str) else None,
        'ccfLevel': ccf_level if isinstance(ccf_level, int) else None,
        'avatarSource': user.get('avatar'),
    }

def collect_codeforces(args):
    info = json.loads(fetch(args.cf_info_url, args))['result'][0]
    # The public API asks clients to leave at least two seconds between calls.
    time.sleep(2.1)
    submissions = json.loads(fetch(args.cf_status_url, args))['result']
    solved = set()
    for submission in submissions:
        if submission.get('verdict') != 'OK':
            continue
        problem = submission.get('problem', {})
        key = (problem.get('contestId'), problem.get('problemsetName'), problem.get('index'), problem.get('name'))
        solved.add(key)
    rating = info.get('rating')
    if not isinstance(rating, int):
        raise ValueError('Codeforces rating missing')
    return {'solved': len(solved), 'rating': rating, 'rank': info.get('rank'),
            'avatarSource': urljoin('https://codeforces.com', info.get('titlePhoto') or info.get('avatar', ''))}

def collect_atcoder(args):
    info = json.loads(fetch(args.atcoder_url, args))
    solved = info.get('accepted_count')
    if not isinstance(solved, int):
        raise ValueError('AtCoder solved count missing')
    rating = info.get('rating')
    if not isinstance(rating, int):
        profile = fetch(args.atcoder_profile_url, args, limit=5242880).decode('utf-8')
        match = re.search(r'<th[^>]*>Rating</th>\s*<td>.*?<span[^>]*>([0-9]+)</span>', profile, re.S)
        rating = int(match.group(1)) if match else None
    if not isinstance(rating, int):
        raise ValueError('AtCoder rating missing')
    return {'solved': solved, 'rating': rating}

def collect_qoj(args):
    body = fetch(args.qoj_url, args, limit=5242880).decode('utf-8')
    patterns = [
        r'Accepted problems[^0-9]{0,80}([0-9]+)\s+problems?',
        r'通过的题目[^0-9]{0,80}([0-9]+)\s*题',
    ]
    solved = None
    for pattern in patterns:
        match = re.search(pattern, body, re.I | re.S)
        if match:
            solved = int(match.group(1))
            break
    if solved is None:
        raise ValueError('QOJ solved count missing')
    avatar = None
    match = re.search(r'<img[^>]+src="([^"]+)"[^>]+alt="yangjm Avatar"', body, re.I)
    if match:
        avatar = urljoin(args.qoj_url, match.group(1))
    return {'solved': solved, 'avatarSource': avatar}

def cache_avatar(platform, source, public_dir, args, previous):
    if not source:
        return previous or '/assets/avatar.jpg'
    host = (urlparse(source).hostname or '').lower()
    if host not in ALLOWED_AVATAR_HOSTS:
        return previous or '/assets/avatar.jpg'
    data = fetch(source, args, limit=2097152)
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        ext = 'png'
    elif data.startswith(b'\xff\xd8\xff'):
        ext = 'jpg'
    elif data.startswith((b'GIF87a', b'GIF89a')):
        ext = 'gif'
    elif data.startswith(b'RIFF') and data[8:12] == b'WEBP':
        ext = 'webp'
    else:
        raise ValueError('Unsupported avatar image')
    avatars = public_dir / 'avatars'
    avatars.mkdir(parents=True, exist_ok=True)
    target = avatars / (platform + '.' + ext)
    temp = avatars / ('.' + platform + '-' + str(os.getpid()))
    temp.write_bytes(data)
    os.chmod(str(temp), 0o644)
    os.replace(str(temp), str(target))
    return '/oi/avatars/' + target.name

def main(args):
    state_dir = Path(args.state_dir)
    public_dir = Path(args.public_dir)
    state_dir.mkdir(parents=True, exist_ok=True)
    public_dir.mkdir(parents=True, exist_ok=True)
    cache_file = state_dir / 'cache.json'
    try:
        cache = json.loads(cache_file.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        cache = {'platforms': {}}
    results = dict(cache.get('platforms', {}))
    collectors = {
        'luogu': collect_luogu,
        'codeforces': collect_codeforces,
        'atcoder': collect_atcoder,
        'qoj': collect_qoj,
    }
    summary = []
    for platform, base in PLATFORMS.items():
        previous = results.get(platform, {})
        try:
            fresh = collectors[platform](args)
            avatar_source = fresh.pop('avatarSource', None)
            try:
                avatar = cache_avatar(platform, avatar_source, public_dir, args, previous.get('avatar'))
            except Exception:
                # Profile numbers are still a successful refresh when an image CDN is unavailable.
                avatar = previous.get('avatar') or '/assets/avatar.jpg'
            results[platform] = dict(base, **fresh)
            results[platform].update({'avatar': avatar, 'lastSuccess': now(), 'stale': False})
            summary.append(platform + '=fresh')
        except Exception as error:
            if previous:
                previous.update(base)
                previous['stale'] = True
                results[platform] = previous
            else:
                results[platform] = dict(base, solved=None, rating=None, rank=None,
                                         avatar='/assets/avatar.jpg', lastSuccess=None, stale=True)
            summary.append(platform + '=cached(' + str(error)[:80] + ')')
    payload = {'updatedAt': now(), 'refreshIntervalSeconds': 3600, 'platforms': results}
    encoded = (json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n').encode('utf-8')
    for target in (cache_file, public_dir / 'stats.json'):
        temp = target.with_name('.' + target.name + '-' + str(os.getpid()))
        temp.write_bytes(encoded)
        os.chmod(str(temp), 0o644)
        os.replace(str(temp), str(target))
    print('; '.join(summary), flush=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state-dir', default='/var/lib/yangjm-oj-stats')
    parser.add_argument('--public-dir', default='/var/www/yangjm.cn/oi')
    parser.add_argument('--curl', default='/usr/bin/curl')
    parser.add_argument('--luogu-url', default='https://www.luogu.com.cn/user/502227?_contentOnly=1')
    parser.add_argument('--cf-info-url', default='https://codeforces.com/api/user.info?handles=yangjm')
    parser.add_argument('--cf-status-url', default='https://codeforces.com/api/user.status?handle=yangjm&from=1&count=10000')
    parser.add_argument('--atcoder-url', default='https://kenkoooo.com/atcoder/atcoder-api/v2/user_info?user=yangjm')
    parser.add_argument('--atcoder-profile-url', default='https://atcoder.jp/users/yangjm')
    parser.add_argument('--qoj-url', default='https://qoj.ac/user/profile/yangjm')
    os.umask(0o022)
    main(parser.parse_args())
