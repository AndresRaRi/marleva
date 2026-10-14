import { readFileSync } from 'node:fs';
export const limits = JSON.parse(
  readFileSync(new URL('../../../packages/config/limits.json', import.meta.url), 'utf8'),
) as {
  otp_seconds: number;
  resend_seconds: number;
  max_attempts: number;
  pause_seconds: number;
  user_max_seconds: number;
  user_idle_seconds: number;
  operator_max_seconds: number;
  operator_idle_seconds: number;
  reauth_seconds: number;
};
if (Object.values(limits).some((n) => !Number.isSafeInteger(n) || n <= 0))
  throw new Error('Límites inválidos');
export function config() {
  const required = [
    'APP_MODE',
    'PAYMENT_MODE',
    'APP_ORIGIN',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'TOKEN_ENCRYPTION_KEY',
    'DATABASE_URL',
    'SMTP_HOST',
    'SMTP_PORT',
    'MAILPIT_URL',
  ] as const;
  const result = Object.fromEntries(
    required.map((k) => {
      const v = process.env[k];
      if (!v) throw new Error(`Falta configuración: ${k}`);
      return [k, v];
    }),
  ) as Record<(typeof required)[number], string>;
  if (result.APP_MODE !== 'local' || result.PAYMENT_MODE !== 'simulated')
    throw new Error('Solo modo local con pago simulado está permitido');
  for (const name of ['SUPABASE_URL', 'DATABASE_URL', 'MAILPIT_URL'] as const) {
    const u = new URL(result[name]);
    if (!['localhost', '127.0.0.1'].includes(u.hostname))
      throw new Error('Destino local obligatorio');
  }
  if (
    !result.APP_ORIGIN.startsWith('https://') ||
    !/[a-f0-9]{64}/.test(result.TOKEN_ENCRYPTION_KEY)
  )
    throw new Error('HTTPS/clave local inválidos');
  if (result.SMTP_HOST !== '127.0.0.1' || !['54325', '54425'].includes(result.SMTP_PORT))
    throw new Error('Solo correo capturado local');
  return result;
}
