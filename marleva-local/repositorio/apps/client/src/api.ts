import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
let csrf = '';
const base =
  Platform.OS === 'web' ? '' : (process.env.EXPO_PUBLIC_API_URL ?? 'https://10.0.2.2:8443');
export async function api<Result = unknown>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<Result> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (Platform.OS !== 'web') {
    headers['x-marleva-client'] = 'native';
    const token = await SecureStore.getItemAsync('marleva_session');
    if (token) headers.Authorization = `Bearer ${token}`;
  } else if (method !== 'GET') {
    if (!csrf && path !== '/v1/auth/challenges' && path !== '/v1/auth/verifications') {
      const r = await api<{ csrf_token: string }>('/v1/auth/csrf');
      csrf = r.csrf_token;
    }
    headers['x-csrf-token'] = csrf;
  }
  let response: Response;
  try {
    response = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: Platform.OS === 'web' ? 'include' : 'omit',
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new Error('No hay conexión con Marleva. Conservamos este paso; intenta de nuevo.');
  }
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
  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== '/v1/auth/verifications' &&
      !path.includes('/confirmations')
    ) {
      if (Platform.OS !== 'web') await SecureStore.deleteItemAsync('marleva_session');
      csrf = '';
    }
    throw Object.assign(
      new Error(
        typeof result.mensaje === 'string' ? result.mensaje : 'No pudimos completar la acción',
      ),
      { status: response.status, code: result.codigo },
    );
  }
  if (typeof result.csrf_token === 'string') csrf = result.csrf_token;
  if (typeof result.session_token === 'string' && Platform.OS !== 'web')
    await SecureStore.setItemAsync('marleva_session', result.session_token);
  if (path.startsWith('/v1/auth/sessions') || result.estado === 'completo') {
    csrf = '';
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync('marleva_session');
  }
  return payload as Result;
}
