import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
export function StatusMessages({
  busy,
  error,
  message,
  styles,
}: {
  busy: boolean;
  error: string;
  message: string;
  styles: { error: StyleProp<TextStyle>; message: StyleProp<TextStyle> };
}) {
  return (
    <>
      {busy && <Text accessibilityLiveRegion="polite">Procesando…</Text>}
      {error !== '' && (
        <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
          {error}
        </Text>
      )}
      {message !== '' && (
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {message}
        </Text>
      )}
    </>
  );
}
