import React, { useEffect, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { api } from '../../../api';
import { noticesResponse } from '../notices-response';
import type { ApiResponse } from '../../../api-response';
type Props = {
  accountId: string;
  onSessionExpired: (account: null) => void;
  styles: { body: StyleProp<TextStyle>; error: StyleProp<TextStyle> };
};
function useAccountNotices(accountId: string, onSessionExpired: (account: null) => void) {
  const [items, setItems] = useState<ApiResponse<'MAR_M1_API_009'>['items'] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let current = true;
    const controller = new AbortController();
    api('/v1/notifications', 'GET', undefined, controller.signal)
      .then((value) => {
        const response = noticesResponse(value, accountId);
        if (current) setItems(response.items);
      })
      .catch((cause: unknown) => {
        if (!current) return;
        if (cause instanceof Error && 'status' in cause && cause.status === 401)
          onSessionExpired(null);
        else setError(cause instanceof Error ? cause.message : 'No pudimos consultar tus avisos');
      });
    return () => {
      current = false;
      controller.abort();
    };
  }, [accountId, onSessionExpired]);
  return { items, error };
}
export function AccountNotices({ accountId, onSessionExpired, styles }: Props) {
  const { items, error } = useAccountNotices(accountId, onSessionExpired);
  if (error)
    return (
      <Text accessibilityRole="alert" style={styles.error}>
        {error}
      </Text>
    );
  if (items === null)
    return (
      <Text accessibilityLiveRegion="polite" style={styles.body}>
        Consultando avisos…
      </Text>
    );
  if (!items.length) return <Text style={styles.body}>Todavía no hay avisos.</Text>;
  return (
    <>
      {items.map((item) => (
        <Text key={item.id} style={styles.body}>
          {item.text}
        </Text>
      ))}
    </>
  );
}
