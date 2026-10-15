import { spawnSync } from 'node:child_process';
function docker(args, input) {
  const result = spawnSync('./scripts/tool', ['docker', ...args], {
    input,
    encoding: 'utf8',
    timeout: 10000,
  });
  if (result.status !== 0) throw Error('Preparación del rol M3 falló.');
  return result.stdout.trim();
}
if (
  docker([
    'inspect',
    '--format',
    '{{index .Config.Labels "mx.marleva.module"}}',
    'marleva-m3-008',
  ]) !== 'M3'
)
  throw Error('Destino ajeno rechazado.');
docker(
  [
    'exec',
    '-i',
    'marleva-m3-008',
    'psql',
    '-h',
    '127.0.0.1',
    '-U',
    'postgres',
    '-d',
    'marleva_m3_008',
    '-v',
    'ON_ERROR_STOP=1',
  ],
  `
DO $$ BEGIN
 IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='m3_api') THEN
  CREATE ROLE m3_api LOGIN PASSWORD 'fixture-api-only';
 END IF;
END $$;
GRANT USAGE ON SCHEMA m3 TO m3_api;
REVOKE ALL ON ALL TABLES IN SCHEMA m3 FROM m3_api;
GRANT SELECT(id,public_name,membership_current,enabled) ON m3."SellerEligibility" TO m3_api;
GRANT SELECT(id,seller_id,paused,public_version_id,updated_at) ON m3."Offer" TO m3_api;
GRANT SELECT(id,version_id,position,state,metadata_removed,derivatives) ON m3."Photo" TO m3_api;
GRANT SELECT(id,offer_id,number,state,title,description,kind,category,price_cents,unit,stock,made_to_order,developments,modalities,response_minutes,preparation_minutes,food) ON m3."OfferVersion" TO m3_api;
`,
);
console.log('Rol M3 preparado: consulta solamente; no permisos de escritura ni migración.');
