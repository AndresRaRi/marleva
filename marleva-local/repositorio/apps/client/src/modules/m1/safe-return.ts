export type M1Destination = 'cuenta' | 'avisos' | 'cambio_correo' | 'ayuda';
const destinations = new Set<M1Destination>(['cuenta', 'avisos', 'cambio_correo', 'ayuda']);
export class SafeReturn {
  private pending: { accountId: string; destination: M1Destination } | null = null;
  remember(accountId: string, destination: M1Destination) {
    if (!destinations.has(destination)) throw new Error('Destino interno no permitido');
    this.pending = { accountId, destination };
  }
  consume(accountId: string): M1Destination {
    const pending = this.pending;
    this.pending = null;
    return pending?.accountId === accountId ? pending.destination : 'cuenta';
  }
  clear() {
    this.pending = null;
  }
}
export function sessionExpired(error: unknown) {
  if (!(error instanceof Error) || !('status' in error) || error.status !== 401) return false;
  return !('code' in error && ['CODIGO_NO_VALIDO', 'FACTOR'].includes(String(error.code)));
}
