import type {Career} from './engine';
export function digestNewMail(g:Career,previousLength:number,title:string,summary=''){const count=g.inbox.length-previousLength;if(count<1)return;const messages=g.inbox.splice(0,count);g.inbox.unshift(`${title}\n\n${summary?summary+'\n\n':''}${messages.join('\n\n────────────────────\n\n')}`)}
export interface MailThread {id:number;ids:number[];subject:string;body:string;unread:boolean;sender:string}
/** Group old routine mail for display without deleting messages or changing their IDs. */
export function inboxThreads(g:Career):MailThread[]{const threads:MailThread[]=[],read=new Set(g.readMailIds??[]);let pending:{id:number;body:string}[]=[];
 const flush=()=>{if(!pending.length)return;const week=pending.map(p=>p.body.match(/(?:Matchweek|Matchday)\s+(\d+)/i)?.[1]).find(Boolean);threads.push({id:pending[0].id,ids:pending.map(p=>p.id),subject:`${week?'Matchweek '+week:'Club'} · Routine digest`,body:pending.map(p=>p.body).join('\n\n────────────────────\n\n'),unread:pending.some(p=>!read.has(p.id)),sender:'Club staff'});pending=[]};
 g.inbox.forEach((body,i)=>{const id=g.inbox.length-1-i,routine=/^(Matchday\b|Development report|Assistant match report|Club & commercial report|Medical update|Suspension|Loan development|Loan completed|Transfer market update)/.test(body);
 if(routine){pending.push({id,body});if(body.startsWith('Club & commercial report'))flush();return}flush();threads.push({id,ids:[id],subject:body.split('\n')[0].split('.')[0],body,unread:!read.has(id),sender:/digest/.test(body.split('\n')[0])?'Club staff':'Club secretary'})});flush();return threads;
}
