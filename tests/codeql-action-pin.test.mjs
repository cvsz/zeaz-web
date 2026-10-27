import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(new URL('../.github/workflows/codeql.yml', import.meta.url), 'utf8');

function assertConsistentCodeqlPins(source) {
  const pins = [...source.matchAll(/^\s*- uses: github\/codeql-action\/(init|analyze)@([a-f0-9]{40})(?:\s+#.*)?$/gm)];
  assert.equal(pins.length, 2, 'CodeQL workflow must pin exactly init and analyze');
  assert.deepEqual(pins.map((match) => match[1]), ['init', 'analyze']);
  assert.equal(pins[0][2], pins[1][2], 'CodeQL init/analyze must use the same immutable commit');
}

test('CodeQL init and analyze use the same immutable action commit', () => {
  assertConsistentCodeqlPins(workflow);
});

test('mixed CodeQL action versions are rejected by the regression contract', () => {
  const mismatched = workflow.replace(
    /github\/codeql-action\/analyze@[a-f0-9]{40}/,
    'github/codeql-action/analyze@b96794f015dfd88f77b49b1c93e0fa7110f94c63',
  );
  assert.notEqual(mismatched, workflow);
  assert.throws(() => assertConsistentCodeqlPins(mismatched), /same immutable commit/);
});
