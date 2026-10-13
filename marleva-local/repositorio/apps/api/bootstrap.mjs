import pg from 'pg';
import {readFile,writeFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
if(process.env.APP_MODE!=='local'||process.env.PAYMENT_MODE!=='simulated')throw new Error('Local only');
const bootstrap=new URL(process.env.BOOTSTRAP_DATABASE_URL);if(bootstrap.hostname!=='127.0.0.1'||bootstrap.port!=='54322')throw new Error('Unexpected destination');
const db=new pg.Client({connectionString:bootstrap.toString()});await db.connect();
for(const [name,key] of [['marleva_api','DATABASE_URL'],['marleva_migrator','MIGRATION_DATABASE_URL']]){
 const pass=new URL(process.env[key]).password;if(!/^[a-f0-9]{48}$/.test(pass))throw new Error('Fixture credential invalid');
 const exists=await db.query('SELECT 1 FROM pg_roles WHERE rolname=$1',[name]);if(!exists.rowCount)await db.query(`CREATE ROLE ${name} LOGIN PASSWORD '${pass}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT`);
}
const grant=spawnSync(fileURLToPath(new URL('../../scripts/tool',import.meta.url)),['docker','exec','supabase_db_marleva-m1','psql','-U','supabase_admin','-d','postgres','-v','ON_ERROR_STOP=1','-c','GRANT marleva_migrator TO postgres WITH SET TRUE;'],{encoding:'utf8'});
if(grant.status!==0)throw new Error('No se pudo asignar el rol migrador local');
await db.query('CREATE SCHEMA IF NOT EXISTS marleva AUTHORIZATION marleva_migrator');
await db.query('SET ROLE marleva_migrator');
await db.query('GRANT USAGE ON SCHEMA marleva TO marleva_api');
await db.query('RESET ROLE');
await db.query('SET ROLE marleva_migrator');
await db.query('ALTER DEFAULT PRIVILEGES IN SCHEMA marleva GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO marleva_api');
await db.query('RESET ROLE');
await db.query('SET ROLE marleva_migrator');
await db.query('REVOKE ALL ON SCHEMA marleva FROM anon,authenticated,service_role');
await db.query('RESET ROLE');
const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const {data,error}=await admin.auth.admin.listUsers();if(error)throw new Error('Local Auth unavailable');
const users=[];for(const email of ['a@example.test','b@example.test','operator1@example.test','operator2@example.test']){
 let user=data.users.find(u=>u.email===email);if(!user){const created=await admin.auth.admin.createUser({email,email_confirm:true});if(created.error)throw new Error('Fixture creation failed');user=created.data.user;}users.push({email,id:user.id});
}
await writeFile(new URL('../../infra/local/secrets/fixture-identities.json',import.meta.url),JSON.stringify(users),{mode:0o600});
const bucket=await admin.storage.getBucket('m1-private');if(bucket.error){const created=await admin.storage.createBucket('m1-private',{public:false,fileSizeLimit:1024*1024,allowedMimeTypes:['text/plain']});if(created.error)throw new Error('Private bucket failed');}
await db.end();console.log('Roles mínimos, esquema privado, cuatro identidades ficticias y bucket privado preparados.');
