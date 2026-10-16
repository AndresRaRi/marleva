import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { recoveryResponse } from '../recovery-response';
import { OperationKeys } from '../operation-keys';
import type { M1Actions } from '../m1-request';
import type { ApiResponse } from '../../../api-response';
import { M1Button, M1Field } from '../components/m1-controls';
import { m1Styles as styles } from '../m1-theme';
export function RecoveryReviewPanel({
  accountId,
  actions,
}: {
  accountId: string;
  actions: M1Actions;
}) {
  const [reference, setReference] = useState(''),
    [record, setRecord] = useState<ApiResponse<'MAR_M1_API_016'> | null>(null),
    [reason, setReason] = useState('');
  const keys = useRef(new OperationKeys(accountId)),
    revision = useRef(0);
  const read = () =>
    void actions.run(async (request) => {
      const result = await request(
        `/v1/auth/mfa-recoveries/${encodeURIComponent(reference.trim())}`,
      );
      setRecord(recoveryResponse(result));
      actions.notify(
        'Solicitud consultada. La revisión exige otro administrador vigente y segundo factor.',
      );
    });
  const review = (decision: 'approvals' | 'rejections') =>
    void actions.run(async (request) => {
      if (!record) return;
      const body = {
        expected_version: record.version,
        ...(decision === 'rejections' ? { reason } : {}),
      };
      const result = await request(
        `/v1/auth/mfa-recoveries/${record.id}/${decision}`,
        'POST',
        body,
        {
          'idempotency-key': keys.current.forOperation(
            `${decision}:${record.id}:${record.version}:${revision.current}`,
          ),
        },
      );
      setRecord(recoveryResponse(result));
      actions.notify(
        decision === 'approvals'
          ? 'Solicitud aprobada. El sistema continúa la recuperación.'
          : 'Solicitud rechazada.',
      );
    });
  return (
    <View style={styles.stack}>
      <Text accessibilityRole="header" style={styles.heading}>
        Revisar otra solicitud
      </Text>
      <Text style={styles.body}>
        Solo otro administrador autorizado, con segundo factor y acceso reciente, puede aprobar o
        rechazar. La API comprueba el permiso vigente.
      </Text>
      <M1Field
        label="Referencia de solicitud a revisar"
        value={reference}
        onChangeText={(value) => {
          setReference(value);
          setRecord(null);
        }}
        disabled={actions.busy}
      />
      <M1Button
        label="Consultar solicitud a revisar"
        onPress={read}
        busy={actions.busy}
        secondary
      />
      {record ? (
        <View style={styles.stack}>
          <Text style={styles.body}>Solicitud consultada. Revisa el caso antes de decidir.</Text>
          <M1Button
            label="Aprobar recuperación ajena"
            onPress={() => review('approvals')}
            busy={actions.busy}
            disabled={record.state !== 'requested'}
          />
          <M1Field
            label="Motivo del rechazo"
            value={reason}
            onChangeText={(value) => {
              revision.current++;
              setReason(value);
            }}
            disabled={actions.busy}
            multiline
          />
          <M1Button
            label="Rechazar recuperación ajena"
            onPress={() => review('rejections')}
            busy={actions.busy}
            disabled={record.state !== 'requested' || !reason.trim()}
            secondary
          />
        </View>
      ) : null}
    </View>
  );
}
