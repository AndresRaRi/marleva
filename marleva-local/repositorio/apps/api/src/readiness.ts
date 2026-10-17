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
    await Promise.all([
      probeHttp(`${c.SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1`, {
        apikey: c.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${c.SUPABASE_SERVICE_KEY}`,
      }),
      probeHttp(`${c.SUPABASE_URL}/storage/v1/status`, { apikey: c.SUPABASE_ANON_KEY }),
      probeHttp(`${c.MAILPIT_URL}/api/v1/info`),
    ]);
    return { status: 'ready', mode: 'local', payment: 'simulated' };
  } finally {
    await db.$disconnect();
  }
}
async function probeHttp(url: string, headers?: HeadersInit) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(3000) });
  try {
    if (!response.ok) throw new Error('Dependencia no disponible');
  } finally {
    await response.body?.cancel();
  }
}
