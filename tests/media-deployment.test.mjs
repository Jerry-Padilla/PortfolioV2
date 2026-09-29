import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const exec = promisify(execFile);

test('web-facing MP4 videos are committed as deployable files rather than LFS pointers', async () => {
  const files = [
    'flight images/Monterrey/0FB26450-CA31-46C0-9430-99C3686ECFDC.MP4',
    'flight images/Monterrey/5973D93E-11B6-468F-9202-158E5F9DB95C.MP4',
    'flight images/Monterrey/67787268-968F-47FE-8AB9-8C99CB4326F0.MP4',
  ];

  for (const file of files) {
    const { stdout: attributes } = await exec('git', ['check-attr', 'filter', '--', file], { cwd: root });
    assert.match(attributes, /: filter: unspecified\s*$/, `${file} must bypass Git LFS for static hosting`);

    const { stdout: size } = await exec('git', ['cat-file', '-s', `:${file}`], { cwd: root });
    assert.ok(Number(size.trim()) > 1_000_000, `${file} must be staged as real video bytes, not an LFS pointer`);
  }
});
