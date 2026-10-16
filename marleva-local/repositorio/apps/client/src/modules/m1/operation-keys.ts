let sequence = 0;
// Correlación idempotente, nunca una credencial: el servidor valida actor, cuerpo y versión.
export class OperationKeys {
  private readonly keys = new Map<string, string>();
  constructor(private readonly accountId: string) {}
  forOperation(operation: string) {
    let key = this.keys.get(operation);
    if (!key) {
      key = `m1-${this.accountId}-${Date.now().toString(36)}-${sequence++}`;
      this.keys.set(operation, key);
    }
    return key;
  }
  clear() {
    this.keys.clear();
  }
}
