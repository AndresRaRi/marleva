import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useInitialRead } from '../hooks/use-initial-read';
import { emailChangeResponse } from '../email-change-response';
import type { ApiResponse } from '../../../api-response';
import type { M1Actions, M1Request } from '../m1-request';
import { M1Button, M1Field } from '../components/m1-controls';
import { m1Styles as styles } from '../m1-theme';
type Props = {
  accountId: string;
  actions: M1Actions;
  onExpired: () => void;
  onBegin: () => void;
  onCompleted: () => void;
};
type Progress = ApiResponse<'MAR_M1_API_025'>['cambio'];
export function EmailChangePanel(props: Props) {
  const { accountId, onExpired } = props;
  const [progress, setProgress] = useState<Progress>(null),
    [loaded, setLoaded] = useState(false),
    [next, setNext] = useState(''),
    [mail, setMail] = useState(''),
    [otp, setOtp] = useState(''),
    [uncertain, setUncertain] = useState(false);
  const apply = useCallback(
    (value: unknown) => {
      const change = emailChangeResponse(value, accountId);
      setProgress(change);
      setMail(change?.actual_confirmado ? change.correo_nuevo : (change?.correo_actual ?? ''));
      setLoaded(true);
      setUncertain(false);
    },
    [accountId],
  );
  const initial = useInitialRead('/v1/auth/email-changes/current', accountId, apply, onExpired);
  const read = async (request: M1Request) => {
    initial.cancel();
    apply(await request('/v1/auth/email-changes/current'));
  };
  const consult = () => void props.actions.run(read);
  const start = () =>
    void props.actions.run(async (request) => {
      initial.cancel();
      props.onBegin();
      setUncertain(true);
      await request('/v1/auth/email-changes', 'POST', { correo: next });
      await read(request);
      props.actions.notify('Revisa ambos buzones en el capturador local');
    });
  const confirm = () =>
    void props.actions.run(async (request) => {
      initial.cancel();
      if (!progress) return;
      props.onBegin();
      setUncertain(true);
      try {
        const result = await request<ApiResponse<'MAR_M1_API_008'>>(
          `/v1/auth/email-changes/${progress.id}/confirmations`,
          'POST',
          { correo: mail, codigo: otp },
        );
        setOtp('');
        if (result.estado === 'completo') {
          props.onCompleted();
          return;
        }
        await read(request);
        props.actions.notify('Verifica ahora el otro buzón');
      } catch (cause) {
        if (cause instanceof Error && 'code' in cause && cause.code === 'CODIGO_NO_VALIDO')
          setUncertain(false);
        throw cause;
      }
    });
  return (
    <View style={styles.stack}>
      <Text accessibilityRole="header" style={styles.heading}>
        Cambiar correo
      </Text>
      <Text style={styles.body}>
        Verifica el buzón actual y el nuevo. Al completar, se cierran las sesiones anteriores.
      </Text>
      {initial.error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {initial.error}
        </Text>
      ) : null}
      {!loaded && !initial.error ? (
        <Text accessibilityLiveRegion="polite" style={styles.body}>
          Consultando cambio de correo…
        </Text>
      ) : null}
      {uncertain ? (
        <Text style={styles.body}>Consulta el estado antes de repetir la acción.</Text>
      ) : null}
      <EmailChangeForm
        progress={progress}
        ready={loaded && !uncertain}
        next={next}
        setNext={setNext}
        mail={mail}
        setMail={setMail}
        otp={otp}
        setOtp={setOtp}
        busy={props.actions.busy}
        start={start}
        confirm={confirm}
      />
      <M1Button
        label="Consultar cambio de correo"
        onPress={consult}
        busy={props.actions.busy}
        secondary
      />
    </View>
  );
}
function EmailChangeForm({
  progress,
  ready,
  next,
  setNext,
  mail,
  setMail,
  otp,
  setOtp,
  busy,
  start,
  confirm,
}: {
  progress: Progress;
  ready: boolean;
  next: string;
  setNext: (value: string) => void;
  mail: string;
  setMail: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  busy: boolean;
  start: () => void;
  confirm: () => void;
}) {
  if (!ready) return null;
  if (progress?.estado === 'verificar_ambos_buzones')
    return (
      <View style={styles.stack}>
        <M1Field
          label="Buzón que estás verificando"
          value={mail}
          onChangeText={setMail}
          disabled={busy}
        />
        <M1Field
          label="Código del cambio"
          value={otp}
          onChangeText={setOtp}
          numeric
          disabled={busy}
        />
        <M1Button label="Confirmar buzón" onPress={confirm} busy={busy} />
      </View>
    );
  if (progress && ['enviando', 'verificando', 'conciliando'].includes(progress.estado))
    return (
      <Text style={styles.body}>
        Estamos comprobando el cambio. Consulta el estado para continuar sin repetirlo.
      </Text>
    );
  return (
    <View style={styles.stack}>
      {progress ? (
        <Text style={styles.body}>
          {progress.estado === 'completo'
            ? 'El cambio anterior se completó.'
            : 'El cambio anterior ya no está disponible.'}
        </Text>
      ) : null}
      <M1Field label="Nuevo correo" value={next} onChangeText={setNext} disabled={busy} />
      <M1Button label="Iniciar cambio" onPress={start} busy={busy} />
    </View>
  );
}
