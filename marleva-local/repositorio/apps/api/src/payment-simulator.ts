export type SimulatedResult={id:string;state:'pending'|'confirmed'|'failed'|'refunded';amount_centavos:number;simulated:true};
export class PaymentSimulator {
 private records=new Map<string,SimulatedResult>();private events=new Set<string>();
 create(id:string,amount:number,scenario:'success'|'error'|'late'):SimulatedResult {if(!id||!Number.isSafeInteger(amount)||amount<=0)throw new Error('Invalid fixture');const previous=this.records.get(id);if(previous){if(previous.amount_centavos!==amount)throw new Error('Conflicting fixture');return {...previous};}const result:SimulatedResult={id,amount_centavos:amount,state:scenario==='success'?'confirmed':scenario==='error'?'failed':'pending',simulated:true};this.records.set(id,result);return {...result};}
 event(eventId:string,id:string,state:'confirmed'|'failed',internal=false){if(!internal)throw new Error('External webhook rejected');const record=this.records.get(id);if(!record)throw new Error('Unknown fixture');if(this.events.has(eventId))return {...record};this.events.add(eventId);if(record.state==='pending'||record.state==='failed'&&state==='confirmed')record.state=state;return {...record};}
 refund(id:string){const record=this.records.get(id);if(!record||!['confirmed','refunded'].includes(record.state))throw new Error('No confirmed fixture');record.state='refunded';return {...record};}
 status(id:string){const r=this.records.get(id);if(!r)throw new Error('Unknown fixture');return {...r};}
}
