import type { operations } from '../../../packages/contracts/generated';

export type ApiResponse<Operation extends keyof operations> =
  operations[Operation]['responses'][Extract<
    keyof operations[Operation]['responses'],
    200 | 201 | 202
  >] extends { content: { 'application/json': infer Result } }
    ? Result
    : never;
