import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('browser bundle is generated for script-tag usage', () => {
  const bundlePath = path.resolve(import.meta.dirname, '../dist/logged.global.js');
  assert.ok(fs.existsSync(bundlePath), 'Expected dist/logged.global.js to be built for the browser script tag');

  const bundle = fs.readFileSync(bundlePath, 'utf8');
  assert.match(bundle, /window\.Logged|window\.LoggedSDK|globalThis\.Logged/, 'Expected the browser bundle to expose a global Logged constructor');
});
