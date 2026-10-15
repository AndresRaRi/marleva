import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { CatalogClient, type CatalogOffer } from '../src/modules/m3/catalog-client';
import { CatalogStore } from '../src/modules/m3/catalog-store';
import { CatalogScreen } from '../src/modules/m3/catalog-screen';
import { DetailScreen } from '../src/modules/m3/detail-screen';
import { Action, Message, styles } from '../src/modules/m3/components';
type Route = { kind: 'catalog' } | { kind: 'offer'; id: string } | { kind: 'seller'; id: string };
function SellerScreen({
  id,
  back,
  open,
}: {
  id: string;
  back: () => void;
  open: (offer: CatalogOffer) => void;
}) {
  const [seller, setSeller] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const store = useMemo(() => new CatalogStore(), []);
  useEffect(() => {
    const controller = new AbortController();
    new CatalogClient()
      .seller(id, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setSeller(value);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'No pudimos cargar el perfil.');
      });
    return () => controller.abort();
  }, [id, retry]);
  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Action label="Volver al catálogo" secondary onPress={back} />
        <Text style={styles.text}>
          Perfil público. Sin domicilio residencial ni documentos privados.
        </Text>
      </View>
      {error ? (
        <Message
          message={error}
          retry={() => {
            setError(null);
            setRetry(retry + 1);
          }}
        />
      ) : seller ? (
        <CatalogScreen store={store} open={open} seller={seller} />
      ) : (
        <Message message="Cargando perfil…" />
      )}
    </View>
  );
}
export default function App() {
  const [route, setRoute] = useState<Route>({ kind: 'catalog' });
  const store = useMemo(() => new CatalogStore(), []);
  const back = () => setRoute({ kind: 'catalog' });
  const open = (offer: CatalogOffer) => setRoute({ kind: 'offer', id: offer.id });
  return (
    <SafeAreaView role="main" style={styles.root}>
      {route.kind === 'offer' ? (
        <DetailScreen
          key={route.id}
          id={route.id}
          back={back}
          seller={(id) => setRoute({ kind: 'seller', id })}
        />
      ) : route.kind === 'seller' ? (
        <SellerScreen key={route.id} id={route.id} back={back} open={open} />
      ) : (
        <CatalogScreen store={store} open={open} />
      )}
    </SafeAreaView>
  );
}
