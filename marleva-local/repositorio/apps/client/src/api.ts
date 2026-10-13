import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
let csrf='';
const base=Platform.OS==='web'?'':process.env.EXPO_PUBLIC_API_URL??'https://10.0.2.2:8443';
export async function api(path:string,method='GET',body?:unknown):Promise<any>{
 const headers:Record<string,string>={'Content-Type':'application/json'};
 if(Platform.OS!=='web'){headers['x-marleva-client']='native';const token=await SecureStore.getItemAsync('marleva_session');if(token)headers.Authorization=`Bearer ${token}`;}
 else if(method!=='GET'){if(!csrf&&path!=='/v1/auth/challenges'&&path!=='/v1/auth/verifications'){const r=await api('/v1/auth/csrf');csrf=r.csrf_token;}headers['x-csrf-token']=csrf;}
 let response:Response;try{response=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),credentials:Platform.OS==='web'?'include':'omit',signal:AbortSignal.timeout(12000)});}catch{throw new Error('No hay conexión con Marleva. Conservamos este paso; intenta de nuevo.');}
 const result=await response.json();if(!response.ok){if(response.status===401&&path!=='/v1/auth/verifications'&&!path.includes('/confirmations')){if(Platform.OS!=='web')await SecureStore.deleteItemAsync('marleva_session');csrf='';}throw Object.assign(new Error(result.mensaje??'No pudimos completar la acción'),{status:response.status,code:result.codigo});}
 if(result.csrf_token)csrf=result.csrf_token;if(result.session_token&&Platform.OS!=='web')await SecureStore.setItemAsync('marleva_session',result.session_token);
 if(path.startsWith('/v1/auth/sessions')||result.estado==='completo'){csrf='';if(Platform.OS!=='web')await SecureStore.deleteItemAsync('marleva_session');}return result;
}
