import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Action, Message, styles } from './components';
import { ManagementClient, ManagementError, type ManagedOffer } from './management-client';
import { Field, VersionSummary } from './management-components';
import { useManagedAction } from './management-state';
export function ReviewOffer({
  client,
  initial,
  back,
  done,
  expired,
}: {
  client: ManagementClient;
  initial: ManagedOffer;
  back: () => void;
  done: () => void;
  expired: () => void;
}) {
  const [offer, setOffer] = useState(initial),
    [reason, setReason] = useState('');
  const action = useManagedAction(client, expired);
  const version = offer.versions.find((v) => v.state === 'pending');
  async function refresh() {
    const result = await action.run('refresh:' + offer.id, (_key, signal) =>
      client.detail(offer.id, signal),
    );
    if (result) setOffer(result);
  }
  async function decide(decision: 'approved' | 'correction' | 'rejected') {
    if (!version) return;
    const result = await action.run(
      'decide:' + offer.id + ':' + offer.revision + ':' + decision + ':' + reason,
      async (key, signal) => {
        if (!reason.trim()) throw new ManagementError('Explica el motivo de tu decisión.', 422);
        return client.command(
          'decide',
          offer.id,
          { expected_version: offer.revision, version_id: version.id, decision, reason },
          key,
          signal,
        );
      },
    );
    if (result) done();
  }
  return (
    <ScrollView style={styles.root}>
      <View style={styles.content}>
        <Action label="Volver a pendientes" secondary onPress={back} />
        <Text accessibilityRole="header" aria-level={1} style={styles.title}>
          Revisar versión
        </Text>
        {action.error && (
          <Message
            message={action.error}
            retry={() => {
              void refresh();
            }}
          />
        )}
        {version ? (
          <>
            <VersionSummary client={client} offer={offer} version={version} />
            <Field label="Motivo de la decisión" value={reason} change={setReason} multiline />
            <View style={styles.row}>
              {(
                [
                  ['approved', 'Aprobar'],
                  ['correction', 'Pedir corrección'],
                  ['rejected', 'Rechazar'],
                ] as const
              ).map(([decision, label]) => (
                <Action
                  key={decision}
                  label={label}
                  secondary={decision !== 'approved'}
                  disabled={action.busy}
                  onPress={() => {
                    void decide(decision);
                  }}
                />
              ))}
            </View>
          </>
        ) : (
          <Message message="Esta oferta ya no tiene una versión pendiente. Vuelve a la lista para continuar." />
        )}
        {action.busy && <Message message="Guardando decisión…" />}
      </View>
    </ScrollView>
  );
}
