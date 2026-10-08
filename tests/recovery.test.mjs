import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

test('editable source packs into the unchanged standalone baseline', async () => {
  assert.ok(existsSync('src/app.js'), 'editable application source is missing');
  const { build } = await import('../scripts/build.mjs');
  await build();
  assert.deepEqual(readFileSync('dist/节拍工作台.html'), readFileSync('reference/2026-09-22/节拍工作台.html'));
  new vm.Script(readFileSync('src/app.js', 'utf8'));
});
