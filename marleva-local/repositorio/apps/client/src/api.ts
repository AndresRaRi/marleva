import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
export type ApiActionHeaders = { 'idempotency-key'?: string; 'x-recovery-capability'?: string };
let csrf = '';
const base =
  Platform.OS === 'web' ? '' : (process.env.EXPO_PUBLIC_API_URL ?? 'https://10.0.2.2:8443');
export async function api<Result = unknown>(
  path: string,
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
  actionHeaders?: ApiActionHeaders,
): Promise<Result> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel();
  const timeout = setTimeout(cancel, 12000);
  try {
    const headers = {
      ...(await requestHeaders(path, method, controller.signal)),
      ...actionHeaders,
    };
    const response = await request(path, method, headers, body, controller.signal);
    const result = await readPayload(response);
    if (controller.signal.aborted)
      throw Object.assign(new Error('Consulta cancelada'), { name: 'AbortError' });
    await checkResponse(response, result);
    await saveSession(result, path);
    return result as Result;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

async function requestHeaders(path: string, method: string, signal: AbortSignal) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (Platform.OS !== 'web') {
    headers['x-marleva-client'] = 'native';
    const token = await SecureStore.getItemAsync('marleva_session');
    if (token) headers.Authorization = `Bearer ${token}`;
  } else if (method !== 'GET') {
    if (!csrf && path !== '/v1/auth/challenges' && path !== '/v1/auth/verifications') {
      const r = await api<{ csrf_token: string }>('/v1/auth/csrf', 'GET', undefined, signal);
      csrf = r.csrf_token;
    }
    headers['x-csrf-token'] = csrf;
  }
  return headers;
}
async function request(
  path: string,
  method: string,
  headers: Record<string, string>,
  body: unknown,
  signal?: AbortSignal,
) {
  try {
    return await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: Platform.OS === 'web' ? 'include' : 'omit',
      signal,
    });
  } catch {
    throw new Error('No hay conexión con Marleva. Conservamos este paso; intenta de nuevo.');
  }
}
async function readPayload(response: Response) {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(
      'No pudimos leer la respuesta de Marleva. Conservamos este paso; intenta de nuevo.',
    );
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(
      'No pudimos leer la respuesta de Marleva. Conservamos este paso; intenta de nuevo.',
    );
  const result = payload as Record<string, unknown>;
  return result;
}
async function checkResponse(response: Response, result: Record<string, unknown>) {
  if (response.ok) return;
  if (response.status === 401 && !['CODIGO_NO_VALIDO', 'FACTOR'].includes(String(result.codigo)))
    await clearSession();
  throw Object.assign(
    new Error(
      typeof result.mensaje === 'string' ? result.mensaje : 'No pudimos completar la acción',
    ),
    { status: response.status, code: result.codigo },
  );
}
async function clearSession() {
  if (Platform.OS !== 'web') await SecureStore.deleteItemAsync('marleva_session');
  csrf = '';
}
async function saveSession(result: Record<string, unknown>, path: string) {
  if (typeof result.csrf_token === 'string') csrf = result.csrf_token;
  if (typeof result.session_token === 'string' && Platform.OS !== 'web')
    await SecureStore.setItemAsync('marleva_session', result.session_token);
  if (
    path.startsWith('/v1/auth/sessions') ||
    result.estado === 'completo' ||
    (path.startsWith('/v1/auth/mfa-recoveries/') &&
      path.endsWith('/verifications') &&
      result.state === 'completed')
  ) {
    await clearSession();
  }
}
