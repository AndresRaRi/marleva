import nodemailer from 'nodemailer';
import type { Database } from './database.js';
import { config } from './config.js';
import type { AccountService } from './account.service.js';
export function startWorker(db:Database,accounts:AccountService){
 const c=config(),mail=nodemailer.createTransport({host:c.SMTP_HOST,port:Number(c.SMTP_PORT),secure:false,connectionTimeout:3000,socketTimeout:3000});let active=false;
 async function tick(){if(active)return;active=true;try{
  await accounts.reconcile();
  const candidates=await db.outbox.findMany({where:{state:{in:['pending','sending']},dueAt:{lte:new Date()},OR:[{leaseUntil:null},{leaseUntil:{lt:new Date()}}]},take:10,orderBy:{createdAt:'asc'}});
  for(const item of candidates){const claimed=await db.outbox.updateMany({where:{id:item.id,OR:[{leaseUntil:null},{leaseUntil:{lt:new Date()}}],state:{in:['pending','sending']}},data:{state:'sending',leaseUntil:new Date(Date.now()+15000),attempts:{increment:1}}});if(!claimed.count)continue;
   try{if(!item.recipient.endsWith('@example.test'))throw new Error('Local email only');await mail.sendMail({from:'Marleva local <no-reply@example.test>',to:item.recipient,subject:item.subject,text:item.text,messageId:`<${item.id}@marleva.example.test>`});await db.outbox.update({where:{id:item.id},data:{state:'sent',leaseUntil:null}});}
   catch{await db.outbox.update({where:{id:item.id},data:{state:Date.now()-+item.createdAt>=86400000?'failed':'pending',leaseUntil:null,dueAt:new Date(Date.now()+[60000,300000,1800000][Math.min(item.attempts,2)]!)}});}
  }
 }catch{/* Durable tasks remain pending on dependency failure; do not log secrets. */}finally{active=false;}}
 const timer=setInterval(()=>void tick(),1000);timer.unref();void tick();return ()=>{clearInterval(timer);mail.close();};
}
