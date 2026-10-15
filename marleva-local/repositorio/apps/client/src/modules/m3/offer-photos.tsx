import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import type { CatalogOffer } from './catalog-client';
function Photo({
  photo,
  title,
  detail,
}: {
  photo: CatalogOffer['photos'][number];
  title: string;
  detail: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const frame = {
    width: '100%' as const,
    height: detail ? 240 : 140,
    borderRadius: 12,
    backgroundColor: '#E2EBE2',
  };
  return failed ? (
    <View
      style={[frame, { justifyContent: 'center', padding: 16 }]}
      accessibilityLiveRegion="polite"
    >
      <Text style={{ fontSize: 16, lineHeight: 25, color: '#19352D' }}>
        La foto no está disponible.
      </Text>
    </View>
  ) : (
    <Image
      accessible
      accessibilityLabel={'Foto de ' + title}
      crossOrigin="anonymous"
      source={{ uri: detail ? photo.url.replace(/\/card$/u, '/detail') : photo.url }}
      resizeMode="contain"
      style={frame}
      onError={() => setFailed(true)}
    />
  );
}
export function OfferPhotos({ offer, detail = false }: { offer: CatalogOffer; detail?: boolean }) {
  const photos = detail ? offer.photos : offer.photos.slice(0, 1);
  return photos.length ? (
    <View style={{ gap: 12 }}>
      {photos.map((photo) => (
        <Photo key={photo.id} photo={photo} title={offer.title} detail={detail} />
      ))}
    </View>
  ) : null;
}
