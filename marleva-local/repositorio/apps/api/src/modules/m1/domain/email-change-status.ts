const states = {
  sending: 'enviando',
  open: 'verificar_ambos_buzones',
  verifying: 'verificando',
  reconcile: 'conciliando',
  complete: 'completo',
  failed: 'fallido',
} as const;
export function emailChangeStatus(state: string, expiresAt: Date, now: Date) {
  if (!Object.hasOwn(states, state)) throw new Error('Estado de cambio no reconocido');
  if (!['complete', 'failed', 'reconcile'].includes(state) && expiresAt <= now)
    return 'vencido' as const;
  return states[state as keyof typeof states];
}
