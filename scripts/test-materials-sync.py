"""Isolated publication tests: never touch the production state or network."""
import argparse
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('materials', str(Path(__file__).with_name('sync-materials.py')))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class SyncTests(unittest.TestCase):
    def test_publish_incremental_and_failures(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            app = root / 'app'
            (app / 'materials').mkdir(parents=True)
            (app / 'public').mkdir()
            (app / 'materials/index.template.html').write_text('{{COUNT}}{{ROWS}}', encoding='utf-8')
            for folder, names in [('materials', ['materials.css', 'materials.js']),
                                  ('public', ['styles.css', 'subsites.css', 'subsites.js', 'favicon.svg', 'navigation.css'])]:
                for name in names:
                    (app / folder / name).write_text('test')
            (app / 'public/index.html').write_text('<header id="site-navigation"><a data-section="materials">Materials</a></header>')
            data = b'%PDF-1.7\nsmall verified fixture'
            sample = root / 'sample'
            sample.write_bytes(data)
            entry = {'path': 'test/<unsafe>&.pdf', 'type': 'blob', 'mode': '100644', 'sha': m.git_hash(sample), 'size': len(data)}
            tree = {'tree': [entry], 'truncated': False}
            commit = ['a' * 40]
            failed = [False]
            downloads = []

            def fetch(url, target, limit=0):
                if failed[0]:
                    raise RuntimeError('simulated network failure')
                if url.endswith('/commits/main'):
                    target.write_text(json.dumps({'sha': commit[0]}))
                elif '?recursive=1' in url:
                    target.write_text(json.dumps(tree))
                elif 'codeload.github.com' in url:
                    with zipfile.ZipFile(str(target), 'w') as z:
                        prefix = 'Materials-' if commit[0] == 'c' * 40 else 'OI-Material-'
                        z.writestr(prefix + commit[0] + '/' + entry['path'], sample.read_bytes())
                else:
                    downloads.append(url)
                    target.write_bytes(sample.read_bytes())

            m.fetch = fetch
            args = argparse.Namespace(state_dir=str(root / 'state'), app_dir=str(app), fixture=None, force=False)
            m.sync(args)
            current = root / 'state/current'
            original = current.resolve()
            self.assertIn('&lt;unsafe&gt;&amp;', (current / 'index.html').read_text())
            self.assertEqual(len(downloads), 1)
            m.sync(args)
            self.assertEqual(current.resolve(), original)
            commit[0] = 'b' * 40
            m.sync(args)
            self.assertEqual(len(downloads), 1, 'unchanged blobs must be reused')
            last_good = current.resolve()
            failed[0] = True
            with self.assertRaises(RuntimeError):
                m.sync(args)
            self.assertEqual(current.resolve(), last_good)
            failed[0] = False
            commit[0] = 'c' * 40
            tree['truncated'] = True
            with self.assertRaises(ValueError):
                m.sync(args)
            self.assertEqual(current.resolve(), last_good)
            tree['truncated'] = False
            entry['sha'] = 'd' * 40
            with self.assertRaises(ValueError):
                m.sync(args)
            self.assertEqual(current.resolve(), last_good)
            # Large updates use the archive path and retain the same blob validation.
            sample.write_bytes(b'%PDF-' + b'x' * (9 * 1048576))
            entry['sha'], entry['size'] = m.git_hash(sample), sample.stat().st_size
            m.sync(args)
            self.assertNotEqual(current.resolve(), last_good)
            self.assertEqual(json.loads((current / 'revision.json').read_text())['bytes'], sample.stat().st_size)
            # A tree entry omitted by the archive is fetched from its pinned raw URL.
            before_fallback_downloads = len(downloads)
            commit[0] = 'e' * 40
            sample.write_bytes(b'%PDF-' + b'y' * (9 * 1048576))
            entry['sha'], entry['size'] = m.git_hash(sample), sample.stat().st_size
            old_fetch = m.fetch

            def fetch_without_archive_entry(url, target, limit=0):
                if 'codeload.github.com' in url:
                    with zipfile.ZipFile(str(target), 'w') as archive:
                        archive.writestr('OI-Material-' + commit[0] + '/README.md', b'example')
                else:
                    old_fetch(url, target, limit)

            m.fetch = fetch_without_archive_entry
            m.sync(args)
            self.assertEqual(len(downloads), before_fallback_downloads + 1)
            self.assertEqual(json.loads((current / 'revision.json').read_text())['commit'], commit[0])

    def test_unsafe_and_empty_trees(self):
        with self.assertRaises(ValueError):
            m.select_files({'tree': [], 'truncated': False})
        with self.assertRaises(ValueError):
            m.select_files({'tree': [{'path': '../escape', 'type': 'blob'}]})


if __name__ == '__main__':
    unittest.main()
