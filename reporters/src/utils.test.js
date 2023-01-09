import { test } from 'zora';
import { defaultSerializer as stringify } from './utils.js';

test(`serialize`, ({ test }) => {
  test('literals', ({ eq }) => {
    eq(stringify(4), '4');
    eq(stringify('foo'), '"foo"');
    eq(stringify(null), 'null');
    eq(stringify(undefined), undefined);
  });

  test(`simple object`, ({ eq }) => {
    eq(stringify({ foo: 'bar' }), `{"foo":"bar"}`);
  });

  test(`simple array`, ({ eq }) => {
    eq(stringify([{ foo: 'bar' }, 4]), `[{"foo":"bar"},4]`);
  });

  test(`symbols`, ({ eq }) => {
    eq(stringify(Symbol('some symbol')), '"Symbol(some symbol)"');
    eq(
      stringify({ foo: Symbol('some symbol') }),
      '{"foo":"Symbol(some symbol)"}',
      'nested'
    );
  });

  test(`ES6 structures`, ({ test }) => {
    test(`Map`, ({ eq }) => {
      eq(stringify(new Map([['a', 123]])), `{"Map":{"a":123}}`);
    });
    test(`Set`, ({ eq }) => {
      eq(stringify(new Set(['a', 'b'])), `{"Set":["a","b"]}`);
    });
    test(`TypedArray`, ({ eq }) => {
      eq(stringify(Uint8Array.from([1, 2, 3])), `{"Uint8Array":[1,2,3]}`);
    });
  });

  test(`circular dependencies`, ({ eq }) => {
    const a = {
      foo: 'bar',
    };
    const b = {
      foo: 'other bar',
      a,
    };

    a.b = b;

    eq(
      stringify(a),
      '{"foo":"bar","b":{"foo":"other bar","a":"[__CIRCULAR_REF__]"}}'
    );

    delete b.a;

    eq(
      stringify(a),
      '{"foo":"bar","b":{"foo":"other bar"}}',
      'should not keep in memory visited node'
    );
  });
});
