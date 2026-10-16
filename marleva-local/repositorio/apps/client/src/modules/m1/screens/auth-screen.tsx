import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { StatusMessages } from '../../../status-messages';
import type { ApiResponse } from '../../../api-response';
import { accountResponse } from '../account-response';
import { useM1Actions } from '../hooks/use-m1-actions';
import { M1Button, M1Field } from '../components/m1-controls';
import { m1Styles as styles } from '../m1-theme';
type Account = ApiResponse<'MAR_M1_API_003'>;
export function AuthScreen({
  onAuthenticated,
  recovery,
  notice,
}: {
  onAuthenticated: (account: Account) => void;
  recovery: boolean;
  notice: string;
}) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState('');
  const [wait, setWait] = useState(0);
  const actions = useM1Actions(() => {
    setChallenge('');
    setOtp('');
  });
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);
  const send = () =>
    void actions.run(async (request) => {
      const result = await request<ApiResponse<'MAR_M1_API_001'>>('/v1/auth/challenges', 'POST', {
        correo: email,
      });
      setChallenge(result.challenge_id);
      setOtp('');
      setWait(60);
      actions.notify(result.mensaje ?? 'Revisa tu correo para continuar');
    });
  const verify = () =>
    void actions.run(async (request) => {
      const result = await request<ApiResponse<'MAR_M1_API_002'>>(
        '/v1/auth/verifications',
        'POST',
        { challenge_id: challenge, codigo: otp },
      );
      const account = accountResponse(result.cuenta);
      setOtp('');
      setChallenge('');
      onAuthenticated(account);
    });
  return (
    <View style={styles.stack}>
      <Text accessibilityRole="header" style={styles.title}>
        Accede a tu cuenta
      </Text>
      <Text style={styles.body}>
        {recovery
          ? 'Tu sesión terminó. Confirma tu correo para retomar una acción propia.'
          : 'Entra con tu correo. Te enviaremos un código para continuar.'}
      </Text>
      <Text style={styles.footer}>
        Para esta prueba usa una dirección @example.test. El correo aparece en el capturador local.
      </Text>
      {notice ? (
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {notice}
        </Text>
      ) : null}
      <StatusMessages {...actions} styles={styles} />
      <M1Field label="Correo" value={email} onChangeText={setEmail} disabled={actions.busy} />
      <M1Button
        label={challenge ? 'Enviar otro código' : 'Recibir código'}
        onPress={send}
        busy={actions.busy}
        disabled={wait > 0}
      />
      {wait > 0 ? (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          Puedes reenviar en {wait} segundos.
        </Text>
      ) : null}
      {challenge ? (
        <View style={styles.stack}>
          <M1Field
            label="Código de seis cifras"
            value={otp}
            onChangeText={setOtp}
            numeric
            disabled={actions.busy}
          />
          <M1Button label="Verificar código" onPress={verify} busy={actions.busy} />
        </View>
      ) : null}
      <View style={styles.info}>
        <Text style={styles.label}>Tu cuenta es el primer paso</Text>
        <Text style={styles.body}>
          La pertenencia vecinal se revisará por separado. Esta cuenta todavía no permite comprar ni
          ofrecer.
        </Text>
      </View>
      <Text style={styles.body}>
        Si perdiste tu buzón, recupéralo con tu proveedor de correo. Un comprobante vecinal no
        permite transferir tu cuenta.
      </Text>
    </View>
  );
}
