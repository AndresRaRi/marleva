import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { CatalogStore } from './catalog-store';
import type { CatalogOffer, Search } from './catalog-client';
import { Action, Message, OfferCard, developmentNames, styles } from './components';
const categoryLabels = [
  ['food', 'Comida y postres'],
  ['everyday', 'Artículos cotidianos'],
  ['classes', 'Clases'],
  ['repairs', 'Reparaciones'],
  ['personal_care', 'Cuidado personal'],
];
function Filters({ search, apply }: { search: Search; apply: (search: Search) => void }) {
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>
        Filtrar ofertas
      </Text>
      <Text style={styles.text}>Categoría</Text>
      <View style={styles.row}>
        {categoryLabels.map(([id, label]) => (
          <Action
            key={id}
            label={label}
            secondary={search.category !== id}
            onPress={() => apply({ ...search, category: search.category === id ? undefined : id })}
          />
        ))}
      </View>
      <Text style={styles.text}>Desarrollo atendido</Text>
      {developmentNames.map((label, index) => (
        <Action
          key={label}
          label={label}
          secondary={search.development !== String(index + 1)}
          onPress={() =>
            apply({
              ...search,
              development: search.development === String(index + 1) ? undefined : String(index + 1),
            })
          }
        />
      ))}
      <Text style={styles.text}>Modalidad</Text>
      <View style={styles.row}>
        {[
          ['delivery', 'Entrega'],
          ['pickup', 'Recogida'],
          ['home', 'A domicilio'],
          ['establishment', 'En establecimiento'],
        ].map(([id, label]) => (
          <Action
            key={id}
            label={label}
            secondary={search.modality !== id}
            onPress={() => apply({ ...search, modality: search.modality === id ? undefined : id })}
          />
        ))}
      </View>
    </View>
  );
}
function Failure({ store }: { store: CatalogStore }) {
  const state = store.state;
  return state.error ? (
    <Message
      message={state.error}
      retry={() => {
        void store.load(state.search, state.items.length > 0);
      }}
    />
  ) : null;
}
export function CatalogScreen({
  store,
  open,
  seller,
}: {
  store: CatalogStore;
  open: (offer: CatalogOffer) => void;
  seller?: { id: string; name: string };
}) {
  const state = useSyncExternalStore(store.subscribe, store.snapshot);
  const [q, setQ] = useState(store.state.search.q ?? '');
  const [filters, setFilters] = useState(false);
  useEffect(() => {
    void store.load(seller ? { ...store.state.search, seller_id: seller.id } : store.state.search);
    return () => store.dispose();
  }, [store, seller]);
  const search = () => {
    void store.load({ ...state.search, q: q.trim() });
  };
  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={styles.content}
      data={state.items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <OfferCard offer={item} open={() => open(item)} />}
      ListHeaderComponent={
        <View style={{ gap: 16 }}>
          <Text style={styles.brand}>marleva</Text>
          <Text style={styles.small}>Productos y servicios entre vecinos de Gran Santa Fe</Text>
          <Text accessibilityRole="header" aria-level={1} style={styles.title}>
            {seller ? seller.name : 'Lo que necesitas, cerca de ti.'}
          </Text>
          <Text style={styles.text}>Datos ficticios. Catálogo de desarrollo independiente.</Text>
          <Text nativeID="m3-search-label" style={styles.text}>
            Buscar productos o servicios
          </Text>
          <TextInput
            accessibilityLabel="Buscar productos o servicios"
            style={styles.input}
            value={q}
            onChangeText={setQ}
            onSubmitEditing={search}
            placeholder="¿Qué estás buscando?"
            maxLength={120}
          />
          <View style={styles.row}>
            <Action label="Buscar" onPress={search} />
            <Action
              label={filters ? 'Cerrar filtros' : 'Filtros'}
              secondary
              onPress={() => setFilters(!filters)}
            />
            <Action
              label="Limpiar filtros"
              secondary
              onPress={() => {
                setQ('');
                void store.load(seller ? { seller_id: seller.id } : {});
              }}
            />
          </View>
          {filters && (
            <Filters
              search={state.search}
              apply={(next) => {
                void store.load(next);
              }}
            />
          )}
          {state.phase === 'loading' && <Message message="Cargando ofertas…" />}
          <Failure store={store} />
          {state.phase === 'ready' && state.items.length === 0 && (
            <Message message="No encontramos ofertas con estos filtros. Prueba otra búsqueda o cambia tus filtros." />
          )}
          <View style={styles.space} />
        </View>
      }
      ListFooterComponent={
        <View style={{ gap: 16 }}>
          {state.phase === 'more' && <Message message="Cargando más ofertas…" />}
          {state.next_cursor && (
            <Action
              label="Ver más ofertas"
              disabled={state.phase === 'more'}
              onPress={() => {
                void store.load(state.search, true);
              }}
            />
          )}
          <Text style={styles.small}>
            Explorar no reserva, compra ni cobra. El domicilio residencial permanece privado.
          </Text>
        </View>
      }
    />
  );
}
