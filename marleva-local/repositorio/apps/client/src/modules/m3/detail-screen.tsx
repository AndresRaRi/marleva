import { OfferPhotos } from './offer-photos';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CatalogClient, type CatalogOffer } from './catalog-client';
import { Action, Message, Price, developmentNames, styles } from './components';
const client = new CatalogClient();
const modeLabels: Record<string, string> = {
  delivery: 'Entrega del oferente',
  pickup: 'Recogida',
  home: 'A domicilio',
  establishment: 'En establecimiento',
};
function Details({ offer, seller }: { offer: CatalogOffer; seller: (id: string) => void }) {
  return (
    <>
      <OfferPhotos offer={offer} detail />
      <Text accessibilityRole="header" aria-level={1} style={styles.title}>
        {offer.title}
      </Text>
      <Price offer={offer} />
      <Text style={styles.text}>{offer.description}</Text>
      <Text style={styles.heading}>Disponibilidad orientativa</Text>
      <Text style={styles.text}>
        {offer.kind === 'service'
          ? 'El alcance y precio se acuerdan mediante cotización.'
          : offer.made_to_order
            ? 'Por encargo.'
            : offer.stock === 0
              ? 'Agotado por ahora.'
              : `${offer.stock} unidades. Se confirma al aceptar el pedido.`}
      </Text>
      <Text style={styles.heading}>Modalidades</Text>
      <Text style={styles.text}>
        {offer.modalities.map((mode) => modeLabels[mode] ?? mode).join(' · ')}
      </Text>
      <Text style={styles.heading}>Desarrollos atendidos</Text>
      <Text style={styles.text}>
        {offer.developments.map((id) => developmentNames[id - 1]).join(', ')}
      </Text>
      <Text style={styles.text}>
        Respuesta del oferente: hasta {offer.response_minutes} minutos. Preparación declarada:{' '}
        {offer.preparation_minutes} minutos.
      </Text>
      {offer.food && (
        <>
          <Text style={styles.heading}>Ingredientes y alérgenos</Text>
          <Text style={styles.text}>{offer.food.ingredients}</Text>
          <Text style={styles.text}>Alérgenos: {offer.food.allergens}</Text>
          <Text style={styles.text}>Conservación: {offer.food.storage}</Text>
        </>
      )}
      <Message message="Este catálogo no reserva ni cobra. Comprar y cotizar requieren los módulos correspondientes." />
      <Action
        label={'Ver oferente: ' + offer.seller.name}
        onPress={() => seller(offer.seller.id)}
      />
    </>
  );
}
export function DetailScreen({
  id,
  back,
  seller,
}: {
  id: string;
  back: () => void;
  seller: (id: string) => void;
}) {
  const [offer, setOffer] = useState<CatalogOffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    client
      .detail(id, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setOffer(value);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'No pudimos cargar la oferta.');
      });
    return () => controller.abort();
  }, [id, retry]);
  return (
    <ScrollView style={styles.root}>
      <View style={styles.content}>
        <Action label="Volver al catálogo" secondary onPress={back} />
        {error ? (
          <Message
            message={error}
            retry={() => {
              setError(null);
              setOffer(null);
              setRetry(retry + 1);
            }}
          />
        ) : offer ? (
          <Details offer={offer} seller={seller} />
        ) : (
          <Message message="Cargando oferta…" />
        )}
      </View>
    </ScrollView>
  );
}
