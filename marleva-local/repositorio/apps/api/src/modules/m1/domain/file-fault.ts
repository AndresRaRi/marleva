export type FileFaultKind =
  | 'session'
  | 'missing'
  | 'capability'
  | 'conflict'
  | 'input'
  | 'limit'
  | 'integrity'
  | 'dependency';
export class FileFault extends Error {
  constructor(
    public readonly kind: FileFaultKind,
    public readonly retryAfter?: number,
  ) {
    super(kind);
  }
}
