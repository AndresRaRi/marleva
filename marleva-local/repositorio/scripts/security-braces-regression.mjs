import assert from 'node:assert/strict';
export function checkBraces(braces) {
  assert.deepEqual(braces.expand('src/{api,client}/{a,b}.ts'), [
    'src/api/a.ts',
    'src/api/b.ts',
    'src/client/a.ts',
    'src/client/b.ts',
  ]);
  assert.equal(braces.compile('a/{b,c}/d'), 'a/(b|c)/d');
  assert.equal(braces.stringify(braces.parse('a/{b,c}/d')), 'a/{b,c}/d');
  for (const method of ['parse', 'compile', 'expand', 'stringify']) {
    for (const [open, close] of [
      ['{', '}'],
      ['(', ')'],
    ])
      assert.throws(
        () => braces[method](open.repeat(4000) + 'x' + close.repeat(4000)),
        /security depth limit/,
      );
  }
  for (const method of ['compile', 'expand', 'stringify']) {
    const root = { type: 'root', nodes: [] };
    let parent = root;
    for (let depth = 0; depth < 120; depth++) {
      const child = { type: 'brace', nodes: [], parent };
      parent.nodes.push(child);
      parent = child;
    }
    assert.throws(() => braces[method](root), /security depth limit/);
    const cycle = { type: 'root', nodes: [] };
    cycle.nodes.push(cycle);
    assert.throws(() => braces[method](cycle), /security depth limit/);
  }
  return 'braces: valid patterns and bounded rejection of deep strings, AST and cycles';
}
