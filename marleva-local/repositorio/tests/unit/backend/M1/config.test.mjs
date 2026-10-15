import { it, expect } from 'vitest';
import { config } from '../../../../apps/api/src/config.ts';

it('MAR-M1-UT-BE-113-F | SMTP limitado a capturadores locales de origen y destino', () => {
  const before = { ...process.env };
  try {
    Object.assign(process.env, {
      APP_MODE: 'local',
      PAYMENT_MODE: 'simulated',
      APP_ORIGIN: 'https://localhost:8443',
      SUPABASE_URL: 'http://127.0.0.1:54421',
      SUPABASE_ANON_KEY: 'fixture',
      SUPABASE_SERVICE_KEY: 'fixture',
      TOKEN_ENCRYPTION_KEY: 'a'.repeat(64),
      DATABASE_URL: 'postgresql://fixture@127.0.0.1:54422/postgres',
      SMTP_HOST: '127.0.0.1',
      MAILPIT_URL: 'http://127.0.0.1:54424',
    });
    for (const port of ['54325', '54425', '54625']) {
      process.env.SMTP_PORT = port;
      expect(config().SMTP_PORT).toBe(port);
    }
    for (const port of ['25', '587', '54425evil', '65536']) {
      process.env.SMTP_PORT = port;
      expect(() => config()).toThrow('Solo correo capturado local');
    }
    process.env.SMTP_PORT = '54425';
    process.env.SMTP_HOST = 'smtp.example.test';
    expect(() => config()).toThrow('Solo correo capturado local');
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in before)) delete process.env[key];
    Object.assign(process.env, before);
  }
});
