import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { api } from '../../api';
import { accountResponse } from './account-response';
import { SafeReturn, type M1Destination } from './safe-return';
import { AuthScreen } from './screens/auth-screen';
import { AccountWorkspace } from './screens/account-workspace';
import { m1Styles as styles } from './m1-theme';
import type { ApiResponse } from '../../api-response';
type Account = ApiResponse<'MAR_M1_API_003'>;
export function M1App() {
  const [authMessage, setAuthMessage] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [destination, setDestination] = useState<M1Destination>('cuenta');
  const [recovering, setRecovering] = useState(false);
  const intent = useRef(new SafeReturn());
  useEffect(() => {
    const controller = new AbortController();
    api('/v1/me', 'GET', undefined, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setAccount(accountResponse(value));
      })
      .catch((cause: unknown) => {
        if (
          !controller.signal.aborted &&
          !(cause instanceof Error && 'status' in cause && cause.status === 401)
        )
          setError(cause instanceof Error ? cause.message : 'No pudimos consultar tu cuenta');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);
  const authenticated = useCallback((next: Account) => {
    setDestination(intent.current.consume(next.id));
    setAccount(next);
    setRecovering(false);
    setError('');
  }, []);
  const expired = useCallback((id: string, route: M1Destination) => {
    intent.current.remember(id, route);
    setAccount(null);
    setRecovering(true);
  }, []);
  const exit = useCallback((message = 'Sesión cerrada') => {
    setAuthMessage(message);
    intent.current.clear();
    setAccount(null);
    setRecovering(false);
    setDestination('cuenta');
  }, []);
  return (
    <ScrollView role="main" contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.brand}>
          Marleva
        </Text>
        <Text style={styles.footer}>Productos y servicios entre vecinos de Gran Santa Fe</Text>
        <Text style={styles.footer}>Entorno local · Datos ficticios · Sin pagos reales</Text>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        {loading ? (
          <Text accessibilityLiveRegion="polite" style={styles.body}>
            Consultando tu cuenta…
          </Text>
        ) : account ? (
          <AccountWorkspace
            key={account.id}
            account={account}
            destination={destination}
            onDestination={setDestination}
            onAccount={setAccount}
            onExpired={expired}
            onExit={exit}
          />
        ) : (
          <AuthScreen onAuthenticated={authenticated} recovery={recovering} notice={authMessage} />
        )}
        <Text style={styles.footer}>Acceso, cuenta y recuperación · M1 en comprobación</Text>
      </View>
    </ScrollView>
  );
}
