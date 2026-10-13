import {spawn,spawnSync} from 'node:child_process';import {readFile,writeFile,mkdir,open,unlink} from 'node:fs/promises';import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);process.chdir(root);const tool=path.join(root,'scripts/tool'),stateDir=path.join(root,'infra/local/secrets/processes');await mkdir(stateDir,{recursive:true,mode:0o700});
const services={api:['node','--env-file='+path.join(root,'.env'),path.join(root,'apps/api/dist/main.js')],https:['node',path.join(root,'scripts/proxy.mjs')]};
const action=process.argv[2],name=process.argv[3];
if(!['start','stop','status'].includes(action))throw new Error('Uso: local.mjs start|stop|status [api|https]');
for(const [service,args] of Object.entries(services)){
 if(name&&name!==service)continue;const file=path.join(stateDir,service+'.json');let record;try{record=JSON.parse(await readFile(file,'utf8'));}catch{}
 function alive(){if(!record)return false;const proc=spawnSync('ps',['-p',String(record.pid),'-o','command='],{encoding:'utf8'});return proc.status===0&&proc.stdout.includes(args.at(-1));}
 if(action==='status'){console.log(`${service}: ${alive()?'running, pid '+record.pid:'stopped'}`);continue;}
 if(action==='stop'){if(alive()){process.kill(record.pid,'SIGTERM');for(let i=0;i<50&&alive();i++)await new Promise(r=>setTimeout(r,100));if(alive())throw new Error('No terminó '+service+'; revisar, no borrar estado');}if(record)await unlink(file);console.log(service+': stopped');continue;}
 if(alive()){console.log(service+': already running');continue;}
 const log=await open(path.join(stateDir,service+'.log'),'a',0o600);const child=spawn(tool,args,{cwd:root,detached:true,stdio:['ignore',log.fd,log.fd]});child.unref();await writeFile(file,JSON.stringify({pid:child.pid,args,createdAt:new Date().toISOString()}),{mode:0o600});await log.close();await new Promise(r=>setTimeout(r,750));record={pid:child.pid};if(!alive())throw new Error(service+' no arrancó; revisar log privado');console.log(service+': running, pid '+child.pid);
}
