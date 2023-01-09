import { test } from 'zora';
import { createWriter } from './writer.js';

const createTestWriter = ({ eq }) => {
  const logs = [];
  const writer = createWriter({
    log: (message) => logs.push(message),
  });
  return {
    writer,
    check(messages, description) {
      eq(logs, messages, description);
    },
  };
};

test(`tap writer`, ({ test }) => {
  test('print with no padding', ({ eq }) => {
    const { writer, check } = createTestWriter({ eq });
    writer.print('test');
    check(['test']);
  });
  test('print with padding', ({ eq }) => {
    const { writer, check } = createTestWriter({ eq });
    writer.print('test', 2);
    check(['        test']);
  });
  test('printComment with no padding', ({ eq }) => {
    const { writer, check } = createTestWriter({ eq });
    writer.printComment('test');
    check(['# test']);
  });
  test('printComment with padding', ({ eq }) => {
    const { writer, check } = createTestWriter({ eq });
    writer.printComment('test', 1);
    check(['    # test']);
  });

  test('print header', ({ eq }) => {
    const { writer, check } = createTestWriter({ eq });
    writer.printHeader();
    check(['TAP version 13']);
  });

  test('print bailout', ({ eq }) => {
    const { writer, check } = createTestWriter({ eq });
    writer.printBailOut();
    check(['Bail out! Unhandled error.']);
  });

  test('print test start', ({ eq }) => {
    const { writer, check } = createTestWriter({ eq });
    writer.printTestStart({ data: { description: 'some test' } });
    check(['# some test']);
  });

  test('print assertion', ({ test, skip }) => {
    test('simple passing assertion', ({ eq }) => {
      const { writer, check } = createTestWriter({ eq });
      writer.printAssertion(
        {
          data: {
            pass: true,
            description: 'some test',
          },
        },
        { id: 66 }
      );
      check(['ok 66 - some test']);
    });
    test('simple failing assertion', ({ eq }) => {
      const { writer, check } = createTestWriter({ eq });
      writer.printAssertion(
        {
          data: {
            pass: false,
            actual: { a: 123 },
            expected: { b: 456 },
            description: 'some failing test',
          },
        },
        { id: 666 }
      );
      check([
        'not ok 666 - some failing test',
        `  ---`,
        `    actual: {"a":123}`,
        `    expected: {"b":456}`,
        `  ...`,
      ]);
    });
    test('es6 Map failing assertion', ({ eq }) => {
      const { writer, check } = createTestWriter({ eq });
      writer.printAssertion(
        {
          data: {
            pass: false,
            actual: new Map([['a', 123]]),
            expected: new Map([['b', 456]]),
            description: 'some failing test',
          },
        },
        { id: 666 }
      );
      check([
        'not ok 666 - some failing test',
        `  ---`,
        `    actual: {"Map":{"a":123}}`,
        `    expected: {"Map":{"b":456}}`,
        `  ...`,
      ]);
    });
  });

  test('print summary', ({ eq }) => {
    const { writer, check } = createTestWriter({ eq });
    writer.printSummary({
      success: 3,
      skip: 1,
      failure: 5,
      total: 9,
    });
    check(['', '1..9', '# tests 9', '# pass  3', '# fail  5', '# skip  1']);
  });
});
