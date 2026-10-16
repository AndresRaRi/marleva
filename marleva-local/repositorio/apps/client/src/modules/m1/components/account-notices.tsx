import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, type StyleProp, type TextStyle } from 'react-native';
import { NoticePages, type NoticePageState } from '../notice-pages';
type Props = {
  accountId: string;
  onSessionExpired: (account: null) => void;
  styles: { body: StyleProp<TextStyle>; error: StyleProp<TextStyle> };
};
function useAccountNotices(accountId: string, onSessionExpired: (account: null) => void) {
  const [state, setState] = useState<NoticePageState>({
    items: null,
    cursor: null,
    loading: true,
    error: '',
  });
  const pages = useRef<NoticePages | null>(null);
  useEffect(() => {
    const current = new NoticePages(accountId, setState, onSessionExpired);
    pages.current = current;
    void current.load();
    return () => current.dispose();
  }, [accountId, onSessionExpired]);
  return {
    ...state,
    loadMore: () => {
      void pages.current?.load();
    },
  };
}
export function AccountNotices({ accountId, onSessionExpired, styles }: Props) {
  const { items, error, cursor, loading, loadMore } = useAccountNotices(
    accountId,
    onSessionExpired,
  );
  if (items === null)
    return (
      <Text
        accessibilityRole={error ? 'alert' : undefined}
        accessibilityLiveRegion="polite"
        style={error ? styles.error : styles.body}
      >
        {error || 'Consultando avisos…'}
      </Text>
    );
  if (!items.length) return <Text style={styles.body}>Todavía no hay avisos.</Text>;
  return (
    <>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {items.map((item) => (
        <Text key={item.id} style={styles.body}>
          {item.text}
        </Text>
      ))}
      {cursor !== null ? (
        <MoreNotices loading={loading} load={loadMore} style={styles.body} />
      ) : null}
    </>
  );
}

function MoreNotices({
  loading,
  load,
  style,
}: {
  loading: boolean;
  load: () => void;
  style: StyleProp<TextStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      style={{ minHeight: 48, justifyContent: 'center' }}
      disabled={loading}
      onPress={load}
    >
      <Text style={style}>{loading ? 'Consultando más avisos…' : 'Cargar más avisos'}</Text>
    </Pressable>
  );
}
