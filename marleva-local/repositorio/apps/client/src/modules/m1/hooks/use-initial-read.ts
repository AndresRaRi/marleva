import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../api';
import { sessionExpired } from '../safe-return';

export function useInitialRead(
  path: string,
  scope: string,
  receive: (value: unknown) => void,
  onExpired: () => void,
) {
  const pending = useRef<AbortController | null>(null);
  const [error, setError] = useState('');
  const cancel = useCallback(() => {
    pending.current?.abort();
    setError('');
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    pending.current = controller;
    api(path, 'GET', undefined, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) {
          setError('');
          receive(value);
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (sessionExpired(cause)) onExpired();
        else setError(cause instanceof Error ? cause.message : 'No pudimos consultar el estado');
      });
    return () => controller.abort();
  }, [path, scope, receive, onExpired]);
  return { cancel, error };
}
