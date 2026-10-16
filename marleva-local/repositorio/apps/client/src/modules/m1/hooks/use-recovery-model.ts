import { useCallback, useEffect, useRef, useState } from 'react';
import { useInitialRead } from './use-initial-read';
import type { ApiResponse } from '../../../api-response';
import { currentRecoveryResponse, recoveryResponse } from '../recovery-response';
import { OperationKeys } from '../operation-keys';
import type { M1Actions, M1Request } from '../m1-request';
type Recovery = ApiResponse<'MAR_M1_API_016'>;
export function useRecoveryModel(
  accountId: string,
  actions: M1Actions,
  onExpired: () => void,
  onCompleted: () => void,
) {
  const [record, setRecord] = useState<Recovery | null>(null),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(''),
    [reason, setReason] = useState(''),
    [code, setCode] = useState(''),
    [uri, setUri] = useState(''),
    [factor, setFactor] = useState(''),
    [capability, setCapability] = useState<ApiResponse<'MAR_M1_API_018'> | null>(null);
  const keys = useRef(new OperationKeys(accountId)),
    reasonRevision = useRef(0),
    codeRevision = useRef(0);
  const receive = useCallback((value: unknown) => {
    setRecord(currentRecoveryResponse(value));
    setLoaded(true);
  }, []);
  const initial = useInitialRead('/v1/auth/mfa-recoveries/current', accountId, receive, onExpired);
  useEffect(() => {
    const operationKeys = keys.current;
    return () => operationKeys.clear();
  }, [accountId]);
  async function read(request: M1Request) {
    initial.cancel();
    const row = currentRecoveryResponse(await request('/v1/auth/mfa-recoveries/current'));
    setRecord(row);
    setLoaded(true);
    setError('');
    if (row?.state !== 'reenrollment') {
      setCapability(null);
      setUri('');
      setCode('');
      setFactor('');
    }
    return row;
  }
  function headers(operation: string) {
    return { 'idempotency-key': keys.current.forOperation(operation) };
  }
  const consult = () =>
    void actions.run(async (request) => {
      initial.cancel();
      await read(request);
    });
  const requestRecovery = () =>
    void actions.run(async (request) => {
      initial.cancel();
      const result = await request(
        '/v1/auth/mfa-recoveries',
        'POST',
        { reason },
        headers(`request:${reasonRevision.current}`),
      );
      setRecord(recoveryResponse(result));
      setLoaded(true);
      setError('');
      actions.notify('Solicitud enviada. Otra persona autorizada debe revisarla.');
    });
  const resume = () =>
    void actions.run(async (request) => {
      initial.cancel();
      if (!record) return;
      const result = await request(
        '/v1/auth/mfa-recoveries',
        'POST',
        { reason: 'Continuar recuperación aprobada' },
        headers(`resume:${record.id}:${record.version}`),
      );
      setRecord(recoveryResponse(result));
      actions.notify('Proceso retomado. Consulta el estado para continuar.');
    });
  const authorize = () =>
    void actions.run(async (request) => {
      initial.cancel();
      if (!record) return;
      const result = await request<ApiResponse<'MAR_M1_API_018'>>(
        `/v1/auth/mfa-recoveries/${record.id}/capabilities`,
        'POST',
        { expected_version: record.version },
        headers(`capability:${record.id}:${record.version}`),
      );
      if (typeof result.capability !== 'string' || !Number.isFinite(Date.parse(result.expires_at)))
        throw new Error('No pudimos comprobar la autorización');
      setCapability(result);
      setUri('');
      setFactor('');
      setCode('');
      await read(request);
      actions.notify('Autorización temporal preparada para esta sesión.');
    });
  function activeCapability() {
    if (!capability || Date.parse(capability.expires_at) <= Date.now())
      throw new Error('La autorización venció. Solicita una nueva autorización para continuar.');
    return capability.capability;
  }
  const enroll = () =>
    void actions.run(async (request) => {
      initial.cancel();
      if (!record) return;
      const result = await request<ApiResponse<'MAR_M1_API_019'>>(
        `/v1/auth/mfa-recoveries/${record.id}/enrollments`,
        'POST',
        { expected_version: record.version },
        {
          ...headers(`enroll:${record.id}:${record.version}`),
          'x-recovery-capability': activeCapability(),
        },
      );
      if (
        typeof result.factor_id !== 'string' ||
        typeof result.uri !== 'string' ||
        !result.uri.startsWith('otpauth://totp/')
      )
        throw new Error('No pudimos comprobar el nuevo factor');
      setFactor(result.factor_id);
      setUri(result.uri);
      setCode('');
      await read(request);
      actions.notify('Añade la clave privada a tu autenticador y verifica el código.');
    });
  const verify = () =>
    void actions.run(async (request) => {
      initial.cancel();
      if (!record || !factor) return;
      try {
        await request(
          `/v1/auth/mfa-recoveries/${record.id}/verifications`,
          'POST',
          { expected_version: record.version, factor_id: factor, codigo: code },
          {
            ...headers(`verify:${record.id}:${record.version}:${codeRevision.current}`),
            'x-recovery-capability': activeCapability(),
          },
        );
      } catch (cause) {
        if (cause instanceof Error && 'code' in cause && cause.code === 'FACTOR') {
          await read(request);
        }
        throw cause;
      }
      setCode('');
      setUri('');
      setCapability(null);
      keys.current.clear();
      onCompleted();
    });
  return {
    record,
    loaded,
    error: error || initial.error,
    reason,
    code,
    uri,
    factor,
    capability,
    consult,
    requestRecovery,
    resume,
    authorize,
    enroll,
    verify,
    setReason: (value: string) => {
      reasonRevision.current++;
      setReason(value);
    },
    setCode: (value: string) => {
      codeRevision.current++;
      setCode(value);
    },
  };
}
