import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { m1Styles as styles } from '../m1-theme';
export function M1Button({
  label,
  onPress,
  disabled = false,
  busy = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (disabled || busy) && styles.disabled,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}
export function M1Field({
  label,
  value,
  onChangeText,
  numeric = false,
  disabled = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  numeric?: boolean;
  disabled?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        keyboardType={numeric ? 'number-pad' : 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={numeric ? 6 : multiline ? 500 : 254}
        editable={!disabled}
        textContentType={numeric ? 'oneTimeCode' : 'none'}
        multiline={multiline}
      />
    </View>
  );
}
