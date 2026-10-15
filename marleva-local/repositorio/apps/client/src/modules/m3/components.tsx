import { OfferPhotos } from './offer-photos';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CatalogOffer } from './catalog-client';
export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF9F0' },
  content: { width: '100%', maxWidth: 1000, alignSelf: 'center', padding: 24, gap: 16 },
  title: { fontSize: 30, fontWeight: '700', color: '#19352D' },
  heading: { fontSize: 24, fontWeight: '600', color: '#19352D' },
  text: { fontSize: 16, lineHeight: 25, color: '#19352D' },
  small: { fontSize: 16, color: '#365B4A' },
  brand: { fontSize: 25, fontWeight: '700', color: '#145544' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#6A8878',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#19352D',
  },
  button: {
    minHeight: 48,
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#145544',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  secondary: { backgroundColor: '#E2EBE2' },
  secondaryText: { color: '#145544' },
  card: {
    padding: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CEDACF',
    borderRadius: 18,
    marginBottom: 16,
  },
  note: { backgroundColor: '#F4E5D8', padding: 16, borderRadius: 12 },
  error: { color: '#9C2525', fontSize: 16 },
  space: { height: 16 },
});
export function Action({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, secondary && styles.secondary, disabled && { opacity: 0.65 }]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}
export function Price({ offer }: { offer: CatalogOffer }) {
  const label =
    offer.kind === 'service'
      ? 'Requiere cotización'
      : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
          (offer.price_cents ?? 0) / 100,
        ) + ' MXN';
  return (
    <Text style={styles.heading}>
      {label}
      {offer.unit ? ' por ' + offer.unit : ''}
    </Text>
  );
}
export function OfferCard({ offer, open }: { offer: CatalogOffer; open: () => void }) {
  return (
    <View style={styles.card}>
      <OfferPhotos offer={offer} />
      <Text style={styles.small}>{offer.seller.name}</Text>
      <Text accessibilityRole="header" style={styles.heading}>
        {offer.title}
      </Text>
      <Price offer={offer} />
      <Text style={styles.text}>
        {offer.kind === 'service'
          ? 'Precio por acordar en una cotización.'
          : offer.stock === 0
            ? 'Agotado por ahora.'
            : 'Disponibilidad sujeta a confirmación.'}
      </Text>
      <Action label="Ver oferta" onPress={open} />
    </View>
  );
}
export function Message({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <View style={styles.note} accessibilityLiveRegion="polite">
      <Text style={styles.text}>{message}</Text>
      {retry && <Action label="Volver a intentar" onPress={retry} />}
    </View>
  );
}
export const developmentNames = [
  'Gran Santa Fe I',
  'Gran Santa Fe II',
  'Gran Santa Fe Norte I',
  'Gran Santa Fe Norte II',
  'Gran Santa Fe Norte III',
  'Cerradas de Gran Santa Fe',
  'Paraíso Santa Fe',
];
