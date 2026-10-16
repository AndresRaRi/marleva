import { useEffect, useRef, useState } from 'react';
import { ManagementClient, ManagementError } from './management-client';
export function restricted(error: ManagementError) {
  if (error.status === 401) return true;
  return (
    error.status === 403 &&
    ['REVIEW_PERMISSION', 'NOT_ELIGIBLE', 'SESSION'].includes(error.code ?? '')
  );
}
export function useManagedAction(client: ManagementClient, expired: (message?: string) => void) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const keys = useRef(new Map<string, string>()),
    active = useRef(true),
    controllers = useRef(new Set<AbortController>());
  useEffect(() => {
    active.current = true;
    const pending = controllers.current;
    return () => {
      active.current = false;
      for (const controller of pending) controller.abort();
    };
  }, []);
  async function run<T>(
    signature: string,
    work: (key: string, signal: AbortSignal) => Promise<T>,
  ): Promise<T | null> {
    if (running.current) return null;
    running.current = true;
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    controllers.current.add(controller);
    try {
      const key = keys.current.get(signature) ?? client.newId();
      keys.current.set(signature, key);
      const result = await work(key, controller.signal);
      keys.current.delete(signature);
      return active.current ? result : null;
    } catch (reason) {
      if (!active.current) return null;
      setError(reason instanceof Error ? reason.message : 'No pudimos guardar. Vuelve a intentar.');
      if (reason instanceof ManagementError && restricted(reason)) expired(reason.message);
      return null;
    } finally {
      running.current = false;
      controllers.current.delete(controller);
      if (active.current) setBusy(false);
    }
  }
  return { busy, error, run };
}
