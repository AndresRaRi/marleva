import React, { useEffect, useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import { Message, Price, developmentNames, styles } from './components';
import { ManagementClient, type ManagedOffer, type ManagedVersion } from './management-client';
export const stateLabels: Record<string, string> = {
  draft: 'Borrador',
  pending: 'En revisión',
  approved: 'Aprobada',
  correction: 'Requiere corrección',
  rejected: 'Rechazada',
};
export function Field({
  label,
  value,
  change,
  multiline = false,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.text}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={change}
        multiline={multiline}
        style={[styles.input, multiline && { minHeight: 100 }]}
      />
    </View>
  );
}
function PrivatePhoto({
  client,
  offer,
  photo,
  version,
}: {
  client: ManagementClient;
  offer: ManagedOffer;
  photo: string;
  version: ManagedVersion;
}) {
  const [uri, setUri] = useState<string | null>(null),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    client
      .photo(offer.id, photo, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setUri(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [client, offer.id, photo]);
  if (failed)
    return <Message message="No pudimos cargar esta foto. Actualiza la oferta para reintentar." />;
  return uri ? (
    <Image
      accessible
      source={{ uri }}
      accessibilityLabel={'Foto privada de ' + version.title}
      style={{ width: '100%', height: 180, borderRadius: 12 }}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  ) : (
    <Message message="Cargando foto…" />
  );
}
export function VersionSummary({
  client,
  offer,
  version,
}: {
  client: ManagementClient;
  offer: ManagedOffer;
  version: ManagedVersion;
}) {
  return (
    <View style={{ gap: 12 }}>
      <Text accessibilityRole="header" style={styles.heading}>
        {version.title}
      </Text>
      <Text style={styles.small}>
        {stateLabels[version.state]} · Versión {version.number}
      </Text>
      <Price offer={version} />
      <Text style={styles.text}>{version.description}</Text>
      <Text style={styles.text}>
        {version.made_to_order
          ? 'Por encargo'
          : version.kind === 'service'
            ? 'Alcance por cotizar'
            : `${version.stock} unidades disponibles`}
      </Text>
      <Text style={styles.text}>
        Atiende: {version.developments.map((value) => developmentNames[value - 1]).join(', ')}
      </Text>
      <Text style={styles.text}>Modalidades: {version.modalities.join(', ')}</Text>
      <Text style={styles.text}>
        Respuesta: {version.response_minutes} minutos. Preparación: {version.preparation_minutes}{' '}
        minutos.
      </Text>
      {version.food && (
        <View>
          <Text style={styles.text}>Ingredientes: {version.food.ingredients}</Text>
          <Text style={styles.text}>Alérgenos: {version.food.allergens}</Text>
          <Text style={styles.text}>Conservación: {version.food.storage}</Text>
        </View>
      )}
      {version.reason && <Message message={'Motivo: ' + version.reason} />}
      <Text style={styles.text}>{version.photos.length} de 6 fotos</Text>
      {version.photos.map((photo) => (
        <PrivatePhoto
          key={photo.id}
          client={client}
          offer={offer}
          photo={photo.id}
          version={version}
        />
      ))}
    </View>
  );
}
