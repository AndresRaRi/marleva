import type { ApiActionHeaders } from '../../api';
export type M1Request = <Result = unknown>(
  path: string,
  method?: string,
  body?: unknown,
  headers?: ApiActionHeaders,
) => Promise<Result>;
export type M1Run = (task: (request: M1Request) => Promise<void>) => Promise<void>;
export type M1Actions = {
  busy: boolean;
  error: string;
  message: string;
  run: M1Run;
  notify: (message: string) => void;
};
