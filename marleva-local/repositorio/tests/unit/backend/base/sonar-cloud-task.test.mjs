import { describe, it, expect } from 'vitest';
import { validateCloudTask } from '../../../../scripts/sonar-cloud-task.mjs';
const warning =
  "Pull request decoration did not happen. Property 'sonar.pullrequest.provider' was missing.";
const context = { project: 'private', pullRequest: '5', binding: { is_bound: false } };
const task = {
  status: 'SUCCESS',
  analysisId: 'analysis',
  componentKey: 'private',
  warningCount: 1,
  warnings: [warning],
};
describe('Cloud task integrity and integration warnings', () => {
  it('records the exact decoration warning for an unbound PR', () => {
    expect(validateCloudTask(task, context)).toEqual({
      analysisWarnings: 0,
      integrationWarnings: [warning],
    });
  });
  it('accepts complete tasks without warnings', () => {
    expect(
      validateCloudTask({ ...task, warningCount: 0, warnings: [] }, context).analysisWarnings,
    ).toBe(0);
  });
  it.each([{}, { is_bound: true }, undefined])(
    'rejects unknown or bound projects %j',
    (binding) => {
      expect(() => validateCloudTask(task, { ...context, binding })).toThrow();
    },
  );
  it('rejects decoration warnings outside PR context', () => {
    expect(() => validateCloudTask(task, { ...context, pullRequest: undefined })).toThrow();
  });
  it.each(['language analysis incomplete', warning + ' changed'])(
    'blocks every other warning %s',
    (message) => {
      expect(() => validateCloudTask({ ...task, warnings: [message] }, context)).toThrow();
    },
  );
  it.each([
    { warningCount: 0 },
    { analysisId: undefined },
    { status: 'FAILED' },
    { componentKey: 'other' },
    { warnings: undefined },
  ])('rejects incomplete or unrelated tasks %j', (patch) => {
    expect(() => validateCloudTask({ ...task, ...patch }, context)).toThrow();
  });
});
