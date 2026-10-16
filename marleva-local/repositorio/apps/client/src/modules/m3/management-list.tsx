import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Action, Message, styles } from './components';
import { stateLabels } from './management-components';
import type { ManagedContext, ManagedOffer } from './management-client';
interface Props {
  context: ManagedContext | null;
  scope: 'own' | 'review';
  items: ManagedOffer[];
  cursor: string | null;
  loading: boolean;
  error: string | null;
  notice: string | null;
  busy: boolean;
  back: () => void;
  create: () => void;
  switchScope: () => void;
  retry: () => void;
  more: () => void;
  open: (offer: ManagedOffer) => void;
  pause: (offer: ManagedOffer) => void;
}
function Toolbar({
  context,
  scope,
  busy,
  create,
  switchScope,
}: Pick<Props, 'context' | 'scope' | 'busy' | 'create' | 'switchScope'>) {
  if (!context) return null;
  return (
    <View style={styles.row}>
      {scope === 'own' && context.sellers.length > 0 && (
        <Action label="Nueva oferta" disabled={busy} onPress={create} />
      )}
      {context.reviewer && context.mfa && (
        <Action
          label={scope === 'own' ? 'Por revisar' : 'Mis ofertas'}
          secondary
          onPress={switchScope}
        />
      )}
    </View>
  );
}
function Status({
  context,
  scope,
  items,
  loading,
  error,
  retry,
}: Pick<Props, 'context' | 'scope' | 'items' | 'loading' | 'error' | 'notice' | 'retry'>) {
  if (error) return <Message message={error} retry={retry} />;
  if (loading) return <Message message="Cargando tus ofertas…" />;
  if (!context) return null;
  if (scope === 'own' && context.sellers.length === 0)
    return (
      <Message message="Necesitas un oferente habilitado y pertenencia vigente para publicar ofertas." />
    );
  if (items.length === 0)
    return (
      <Message
        message={
          scope === 'own'
            ? 'Todavía no tienes ofertas. Puedes crear tu primer borrador.'
            : 'No hay ofertas pendientes de revisión.'
        }
      />
    );
  return null;
}
function Card({
  offer,
  scope,
  busy,
  open,
  pause,
}: { offer: ManagedOffer } & Pick<Props, 'scope' | 'busy' | 'open' | 'pause'>) {
  const version = offer.versions.at(-1)!;
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>
        {version.title}
      </Text>
      <Text style={styles.text}>
        {stateLabels[version.state]} ·{' '}
        {offer.paused ? 'Pausada o sin publicar' : 'Visible si mantiene elegibilidad'}
      </Text>
      <View style={styles.row}>
        <Action
          label={scope === 'review' ? 'Revisar oferta' : 'Abrir oferta'}
          disabled={busy}
          onPress={() => open(offer)}
        />
        {scope === 'own' && !offer.paused && (
          <Action label="Pausar oferta" secondary disabled={busy} onPress={() => pause(offer)} />
        )}
      </View>
    </View>
  );
}
export function ManagementList(props: Props) {
  return (
    <ScrollView style={styles.root}>
      <View style={styles.content}>
        <Action label="Volver al catálogo" secondary onPress={props.back} />
        <Text accessibilityRole="header" aria-level={1} style={styles.title}>
          {props.scope === 'own' ? 'Mis ofertas' : 'Ofertas pendientes'}
        </Text>
        <Toolbar {...props} />
        <Status {...props} />
        {props.notice && <Message message={props.notice} />}
        {props.items.map((offer) => (
          <Card
            key={offer.id}
            offer={offer}
            scope={props.scope}
            busy={props.busy}
            open={props.open}
            pause={props.pause}
          />
        ))}
        {props.cursor && (
          <Action label="Ver más ofertas propias" disabled={props.loading} onPress={props.more} />
        )}
      </View>
    </ScrollView>
  );
}
