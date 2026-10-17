import { config } from './config.js';
import { database } from './database.js';
import { fail } from './security.js';

export async function readiness() {
  try {
    return await probeDependencies();
  } catch {
    fail(503, 'DEPENDENCIA', 'Una dependencia local no está disponible');
  }
}
async function probeDependencies() {
  const c = config();
  const db = database({ connectionTimeoutMillis: 3000, query_timeout: 3000 });
  try {
    await db.$queryRaw`SELECT 1`;
    const results = await Promise.all([
      fetch(`${c.SUPABASE_URL}/auth/v1/health`, {
        headers: { apikey: c.SUPABASE_ANON_KEY },
        signal: AbortSignal.timeout(3000),
      }),
      fetch(`${c.SUPABASE_URL}/storage/v1/status`, {
        headers: { apikey: c.SUPABASE_ANON_KEY },
        signal: AbortSignal.timeout(3000),
      }),
      fetch(`${c.MAILPIT_URL}/api/v1/info`, { signal: AbortSignal.timeout(3000) }),
    ]);
    if (results.some((r) => !r.ok)) throw new Error('Dependencia no disponible');
    return { status: 'ready', mode: 'local', payment: 'simulated' };
  } finally {
    await db.$disconnect();
  }
}
