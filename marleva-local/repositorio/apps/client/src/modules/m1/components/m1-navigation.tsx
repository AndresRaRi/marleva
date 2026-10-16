import React from 'react';
import { View, Pressable, Text } from 'react-native';
import type { M1Destination } from '../safe-return';
import { m1Styles as styles } from '../m1-theme';
const tabs = [
  { route: 'cuenta', label: 'Cuenta' },
  { route: 'avisos', label: 'Avisos' },
  { route: 'ayuda', label: 'Ayuda' },
] as const;
export function M1Navigation({
  destination,
  onChange,
  disabled,
}: {
  destination: M1Destination;
  onChange: (destination: M1Destination) => void;
  disabled: boolean;
}) {
  const active = destination === 'cambio_correo' ? 'cuenta' : destination;
  return (
    <View role="tablist" accessibilityLabel="Navegación de tu cuenta" style={styles.navigation}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.route}
          accessibilityRole="tab"
          accessibilityLabel={tab.label}
          aria-selected={active === tab.route}
          aria-disabled={disabled}
          accessibilityState={{
            selected: active === tab.route,
            disabled,
          }}
          disabled={disabled}
          onPress={() => onChange(tab.route)}
          style={[styles.navItem, active === tab.route && styles.navActive]}
        >
          <Text style={[styles.navText, active === tab.route && styles.navSelected]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
