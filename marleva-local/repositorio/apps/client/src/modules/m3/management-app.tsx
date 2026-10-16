import React, { useCallback, useState } from 'react';
import { ManagementClient, type ManagedContext, type ManagedOffer } from './management-client';
import { ManagementForm } from './management-form';
import { ReviewOffer } from './management-review';
import { ManagementList } from './management-list';
import { useManagementList } from './management-list-state';
import { useManagedAction } from './management-state';
function sellerId(selected: ManagedOffer | null, context: ManagedContext) {
  if (selected) return selected.seller_id;
  return context.sellers[0]?.id ?? '';
}
export function ManagementApp({ client, back }: { client: ManagementClient; back: () => void }) {
  const [mode, setMode] = useState<'list' | 'edit' | 'review'>('list'),
    [selected, setSelected] = useState<ManagedOffer | null>(null),
    [notice, setNotice] = useState<string | null>(null);
  const resetView = useCallback(() => {
    setSelected(null);
    setMode('list');
  }, []);
  const list = useManagementList(client, resetView),
    { expired, changed } = list;
  const action = useManagedAction(client, expired);
  async function open(offer: ManagedOffer) {
    const result = await action.run('open:' + offer.id, (_key, signal) =>
      client.detail(offer.id, signal),
    );
    if (result) {
      setSelected(result);
      setMode(list.scope === 'review' ? 'review' : 'edit');
    }
  }
  async function pause(offer: ManagedOffer) {
    const result = await action.run('pause:' + offer.id + ':' + offer.revision, (key, signal) =>
      client.command('pause', offer.id, { expected_version: offer.revision }, key, signal),
    );
    if (result) {
      setNotice('Oferta pausada. Se oculta del catálogo.');
      changed();
    }
  }
  if (list.context && mode === 'edit')
    return (
      <ManagementForm
        client={client}
        original={selected}
        sellerId={sellerId(selected, list.context)}
        back={() => {
          setMode('list');
          changed();
        }}
        changed={changed}
        expired={expired}
      />
    );
  if (list.context && selected && mode === 'review')
    return (
      <ReviewOffer
        client={client}
        initial={selected}
        back={() => setMode('list')}
        done={() => {
          setMode('list');
          setNotice('Decisión guardada.');
          changed();
        }}
        expired={expired}
      />
    );
  return (
    <ManagementList
      {...list}
      busy={action.busy}
      error={list.error ?? action.error}
      notice={notice}
      back={back}
      create={() => {
        setSelected(null);
        setMode('edit');
      }}
      retry={changed}
      more={() => {
        void list.load(true);
      }}
      open={(offer) => {
        void open(offer);
      }}
      pause={(offer) => {
        void pause(offer);
      }}
    />
  );
}
