import { createClient, type Session as ProviderSession } from '@supabase/supabase-js';
import { config } from './config.js';
export type Tokens={access_token:string;refresh_token:string;expires_at:number};
export function tokens(s:ProviderSession):Tokens{return {access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at??0};}
export function identity(){const c=config();return createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY,{global:{fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});}
export function identityAdmin(){const c=config();return createClient(c.SUPABASE_URL,c.SUPABASE_SERVICE_KEY,{global:{fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})},auth:{persistSession:false,autoRefreshToken:false}});}
export async function authenticatedIdentity(t:Tokens){const client=identity();const {data,error}=await client.auth.setSession(t);if(error||!data.session)throw new Error('Provider session unavailable');return {client,tokens:tokens(data.session)};}
