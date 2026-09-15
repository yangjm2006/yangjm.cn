"""Exercise the real updater in an isolated directory on the Linux server."""
import hashlib
import os
from pathlib import Path
import subprocess
import tempfile

APP = Path(__file__).resolve().parent.parent
with tempfile.TemporaryDirectory(prefix='notebook-sync-test-') as temp:
    root = Path(temp)
    state = root / 'state'
    source = root / 'source.md'
    source.write_text('## Test\n### Example\n```cpp\n// ' + 'initial ' * 20 + '\nint main() {}\n```\n')
    base = ['python3', str(APP / 'scripts/sync-notebook.py'), '--app-dir', str(APP), '--state-dir', str(state)]
    def run(extra, expected=0):
        result = subprocess.run(base + extra, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
        assert result.returncode == expected, result.stdout + result.stderr
    def snapshot():
        current = state / 'current'
        return (os.readlink(str(current)), hashlib.sha256((current / 'index.html').read_bytes()).hexdigest(),
                (current / 'source.md').read_bytes())
    run(['--local', str(source)])
    first = snapshot()
    run(['--local', str(source)])
    assert snapshot() == first, 'Unchanged source should not republish'
    run(['--source-url', 'https://127.0.0.1:1/unreachable'], 1)
    assert snapshot() == first, 'Network failure replaced current release'
    source.write_text('invalid document ' * 20)
    run(['--local', str(source)], 1)
    assert snapshot() == first, 'Invalid source replaced current release'
    source.write_text('## Test\n### Example\n```cpp\n// ' + 'updated ' * 20 + '\nint main() {}\n```\n')
    run(['--local', str(source), '--node', '/bin/false'], 1)
    assert snapshot() == first, 'Build failure replaced current release'
    run(['--local', str(source)])
    assert snapshot() != first, 'Changed source was not published'
    assert (state / 'current/source.md').read_text() == source.read_text()
    print('PASS: initial publish, unchanged source, network failure, invalid source, build failure, atomic update.')
