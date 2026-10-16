import { useEffect, useRef, useState } from 'react';
import { api } from '../../../api';
import { sessionExpired } from '../safe-return';
import type { M1Actions, M1Request, M1Run } from '../m1-request';
export function useM1Actions(onExpired: () => void): M1Actions {
  const controller = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, notify] = useState('');
  useEffect(() => () => controller.current?.abort(), []);
  const run: M1Run = async (task) => {
    if (controller.current) return;
    const active = new AbortController();
    controller.current = active;
    setBusy(true);
    setError('');
    notify('');
    const request: M1Request = (path, method = 'GET', body, headers) =>
      api(path, method, body, active.signal, headers);
    try {
      await task(request);
    } catch (cause: unknown) {
      if (active.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : 'No pudimos completar la acción');
      if (sessionExpired(cause)) onExpired();
    } finally {
      controller.current = null;
      if (!active.signal.aborted) setBusy(false);
    }
  };
  return { busy, error, message, run, notify };
}
