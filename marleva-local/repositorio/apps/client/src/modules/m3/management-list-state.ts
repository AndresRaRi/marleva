import { restricted } from './management-state';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ManagementClient,
  ManagementError,
  type ManagedContext,
  type ManagedOffer,
} from './management-client';
function canReview(context: ManagedContext) {
  return context.reviewer && context.mfa;
}
function append(previous: ManagedOffer[], items: ManagedOffer[], more: boolean) {
  return more
    ? [...previous, ...items.filter((item) => !previous.some((old) => old.id === item.id))]
    : items;
}
// Abort the latest request, including pagination started after the effect.
function cancel(ref: React.RefObject<AbortController | null>) {
  ref.current?.abort();
}
function changedActor(ref: React.RefObject<string | null>, id: string, resetView: () => void) {
  const changed = ref.current !== null && ref.current !== id;
  if (changed) resetView();
  ref.current = id;
  return changed;
}
function begin(ref: React.RefObject<AbortController | null>) {
  ref.current?.abort();
  const request = new AbortController();
  ref.current = request;
  return request;
}
export function useManagementList(client: ManagementClient, resetView: () => void) {
  const [context, setContext] = useState<ManagedContext | null>(null),
    [scope, setScope] = useState<'own' | 'review'>('own'),
    [items, setItems] = useState<ManagedOffer[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [revision, setRevision] = useState(0);
  const requestRef = useRef<AbortController | null>(null),
    cursorRef = useRef<string | null>(null),
    active = useRef(true),
    actorRef = useRef<string | null>(null);
  const expired = useCallback(
    (message = 'Inicia sesión para continuar.') => {
      setContext(null);
      setItems([]);
      setCursor(null);
      cursorRef.current = null;
      actorRef.current = null;
      resetView();
      setError(message);
    },
    [resetView],
  );
  const changed = useCallback(() => {
    setLoading(true);
    setError(null);
    setRevision((value) => value + 1);
  }, []);
  const failed = useCallback(
    (reason: unknown, signal: AbortSignal) => {
      if (signal.aborted || !active.current) return;
      if (reason instanceof ManagementError && restricted(reason)) {
        expired(reason.message);
        return;
      }
      setError(reason instanceof Error ? reason.message : 'No pudimos cargar tus ofertas.');
    },
    [expired],
  );
  const load = useCallback(
    (more = false) => {
      const current = begin(requestRef);
      return client
        .context(current.signal)
        .then(async (ctx) => {
          if (current.signal.aborted) return;
          const actorChanged = changedActor(actorRef, ctx.actor_id, resetView);
          if (actorChanged) {
            setItems([]);
            setCursor(null);
            cursorRef.current = null;
          }
          setContext(ctx);
          setLoading(true);
          setError(null);
          if (scope === 'review' && !canReview(ctx)) {
            resetView();
            setScope('own');
            setItems([]);
            return;
          }
          const appendMore = more && !actorChanged;
          const page = await client.list(
            scope,
            appendMore ? cursorRef.current : null,
            current.signal,
          );
          if (current.signal.aborted) return;
          setItems((previous) => append(previous, page.items, appendMore));
          setCursor(page.next_cursor);
          cursorRef.current = page.next_cursor;
        })
        .catch((reason: unknown) => failed(reason, current.signal))
        .finally(() => {
          if (!current.signal.aborted) setLoading(false);
        });
    },
    [client, scope, failed, resetView],
  );
  useEffect(() => {
    active.current = true;
    void load();
    return () => {
      active.current = false;
      cancel(requestRef);
    };
  }, [load, revision]);
  const switchScope = () => {
    setLoading(true);
    setError(null);
    setItems([]);
    setCursor(null);
    cursorRef.current = null;
    setScope(scope === 'own' ? 'review' : 'own');
  };
  return { context, scope, items, cursor, loading, error, expired, changed, load, switchScope };
}
