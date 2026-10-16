import React from 'react';
import { View, Text } from 'react-native';
import type { M1Actions } from '../m1-request';
import { useRecoveryModel } from '../hooks/use-recovery-model';
import { M1Button, M1Field } from '../components/m1-controls';
import { m1Styles as styles } from '../m1-theme';
const messages = {
  requested: 'Solicitud en revisión',
  approved: 'Solicitud aprobada',
  executing: 'Recuperación en curso',
  provider_pending: 'Recuperación pendiente de comprobación',
  reenrollment: 'Puedes configurar tu nuevo factor',
  completed: 'Recuperación completada',
  rejected: 'Solicitud rechazada',
  expired: 'Solicitud vencida',
};
export function RecoveryPanel({
  accountId,
  actions,
  onExpired,
  onCompleted,
}: {
  accountId: string;
  actions: M1Actions;
  onExpired: () => void;
  onCompleted: () => void;
}) {
  const model = useRecoveryModel(accountId, actions, onExpired, onCompleted);
  return (
    <View style={styles.stack}>
      <Text accessibilityRole="header" style={styles.heading}>
        Recuperar segundo factor
      </Text>
      <Text style={styles.body}>
        Si perdiste tu segundo factor, otra persona autorizada debe revisar la solicitud. Entrar por
        correo no concede permisos de operador.
      </Text>
      {model.error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {model.error}
        </Text>
      ) : null}
      {!model.loaded && !model.error ? (
        <Text style={styles.body}>Consultando recuperación…</Text>
      ) : null}
      {model.record ? (
        <View style={styles.info}>
          <Text style={styles.label}>{messages[model.record.state]}</Text>
          <Text style={styles.body}>Referencia de tu solicitud</Text>
          <Text selectable style={styles.body}>
            {model.record.id}
          </Text>
        </View>
      ) : null}
      <RecoverySteps model={model} busy={actions.busy} />
      <M1Button
        label="Consultar estado de recuperación"
        onPress={model.consult}
        busy={actions.busy}
        secondary
      />
    </View>
  );
}
function RecoverySteps({
  model,
  busy,
}: {
  model: ReturnType<typeof useRecoveryModel>;
  busy: boolean;
}) {
  if (!model.loaded) return null;
  if (!model.record || ['expired', 'rejected'].includes(model.record.state))
    return (
      <View style={styles.stack}>
        <M1Field
          label="Motivo de recuperación"
          value={model.reason}
          onChangeText={model.setReason}
          disabled={busy}
          multiline
        />
        <M1Button
          label="Solicitar recuperación"
          onPress={model.requestRecovery}
          busy={busy}
          disabled={!model.reason.trim()}
        />
      </View>
    );
  if (['approved', 'executing', 'provider_pending'].includes(model.record.state))
    return (
      <View style={styles.stack}>
        <Text style={styles.body}>
          Puede ser necesario entrar de nuevo por correo para continuar el proceso aprobado.
        </Text>
        <M1Button label="Continuar recuperación aprobada" onPress={model.resume} busy={busy} />
      </View>
    );
  if (model.record.state !== 'reenrollment') return null;
  return (
    <View style={styles.stack}>
      <M1Button
        label="Solicitar autorización temporal"
        onPress={model.authorize}
        busy={busy}
        secondary
      />
      {model.capability ? (
        <M1Button label="Preparar nuevo factor" onPress={model.enroll} busy={busy} />
      ) : null}
      {model.uri ? (
        <View style={styles.info}>
          <Text style={styles.label}>Clave privada para tu autenticador</Text>
          <Text selectable style={styles.body}>
            {model.uri}
          </Text>
          <Text style={styles.footer}>No compartas esta clave ni guardes capturas.</Text>
        </View>
      ) : null}
      {model.factor ? (
        <View style={styles.stack}>
          <M1Field
            label="Código del nuevo factor"
            value={model.code}
            onChangeText={model.setCode}
            numeric
            disabled={busy}
          />
          <M1Button label="Completar recuperación" onPress={model.verify} busy={busy} />
        </View>
      ) : null}
    </View>
  );
}
