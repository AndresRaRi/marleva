import React, { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { useInitialRead } from '../hooks/use-initial-read';
import type { ApiResponse } from '../../../api-response';
import type { M1Actions } from '../m1-request';
import { factorResponse } from '../factor-response';
import { M1Button, M1Field } from '../components/m1-controls';
import { m1Styles as styles } from '../m1-theme';
export function OperatorPanel({
  actions,
  onExpired,
}: {
  actions: M1Actions;
  onExpired: () => void;
}) {
  const [items, setItems] = useState<ApiResponse<'MAR_M1_API_027'>['items']>([]),
    [factor, setFactor] = useState(''),
    [code, setCode] = useState(''),
    [uri, setUri] = useState('');
  const receive = useCallback((value: unknown) => {
    const result = factorResponse(value);
    setItems(result);
    const verified = result.filter((item) => item.estado === 'verified');
    if (verified.length === 1) setFactor(verified[0].id);
  }, []);
  const initial = useInitialRead('/v1/auth/mfa/factors', 'operator', receive, onExpired);
  const enroll = () =>
    void actions.run(async (request) => {
      initial.cancel();
      const result = await request<ApiResponse<'MAR_M1_API_010'>>(
        '/v1/auth/mfa/enrollments',
        'POST',
        {},
      );
      setFactor(result.id);
      setUri(result.totp.uri);
      setCode('');
      actions.notify('Añade la clave a tu autenticador. No compartas este dato.');
    });
  const verify = () =>
    void actions.run(async (request) => {
      initial.cancel();
      await request('/v1/auth/mfa/verifications', 'POST', { factor_id: factor, codigo: code });
      setCode('');
      setUri('');
      actions.notify('Segundo factor verificado');
    });
  const check = () =>
    void actions.run(async (request) => {
      await request('/v1/operator/access');
      actions.notify('Permiso y segundo factor comprobados');
    });
  return (
    <View style={styles.stack}>
      <Text accessibilityRole="header" style={styles.heading}>
        Acceso de operador ficticio
      </Text>
      <Text style={styles.body}>
        El segundo factor es obligatorio. El registro normal no concede permisos de operador.
      </Text>
      {initial.error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {initial.error}
        </Text>
      ) : null}
      {items.filter((item) => item.estado === 'verified').length > 1
        ? items
            .filter((item) => item.estado === 'verified')
            .map((item) => (
              <M1Button
                key={item.id}
                label={`Usar ${item.nombre}`}
                onPress={() => setFactor(item.id)}
                busy={actions.busy}
                secondary
              />
            ))
        : null}
      <M1Button label="Preparar segundo factor" onPress={enroll} busy={actions.busy} secondary />
      {uri ? (
        <View style={styles.info}>
          <Text style={styles.label}>Clave privada para tu autenticador</Text>
          <Text selectable style={styles.body}>
            {uri}
          </Text>
          <Text style={styles.footer}>
            No guardes capturas ni compartas esta clave. Desaparece al salir.
          </Text>
        </View>
      ) : null}
      <M1Field
        label="Código del segundo factor"
        value={code}
        onChangeText={setCode}
        numeric
        disabled={actions.busy}
      />
      <M1Button
        label="Verificar segundo factor"
        onPress={verify}
        busy={actions.busy}
        disabled={!factor}
      />
      <M1Button
        label="Comprobar permiso de operador"
        onPress={check}
        busy={actions.busy}
        secondary
      />
    </View>
  );
}
