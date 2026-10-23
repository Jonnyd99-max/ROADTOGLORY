import {changeAbility} from './development';
import {available} from './management';
import {tierOf,division} from './division';
import {assistantPick,random,transact,type Career,type Player} from './engine';

export interface Loan {club:string;startRound:number;returnRound:number;startingAbility:number;weeksPlayed:number;wageShare:number}
export const gameDate=(g:Pick<Career,'season'|'round'|'postseasonWeeks'>)=>new Date(Date.UTC(g.season,7,8+(g.round+(g.postseasonWeeks??0))*7));
export const gameMonth=(g:Pick<Career,'season'|'round'|'postseasonWeeks'>)=>gameDate(g).toISOString().slice(0,7);
export function nextMarketDate(g:Career){const date=gameDate(g);return new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1))}
const first=['Adam','Alex','Ben','Callum','Daniel','Ellis','Felix','Harvey','Idris','Jamie','Kai','Lewis','Miles','Nathan','Owen','Patrick','Rhys','Sean','Tyler','Will','Zach','Aaron','Bobby','Connor','Dominic','Evan','Freddie','Gabriel','Henry','Joel','Kieran','Liam','Morgan','Nico','Riley','Tariq','Victor','Yusuf'];
const last=['Ainsworth','Blackwell','Carrington','Drummond','Edwards','Fielding','Grayson','Hartley','Ingram','Jennings','Kendall','Lennox','Morton','Norwood','Oakley','Prescott','Quinn','Radcliffe','Sinclair','Thornley','Underwood','Vickers','Weston','Yates','Baxter','Dalton','Emerson','Faulkner','Gibson','Hewitt','Jackson','Keating','Langley','Monroe','Neville','Osborne','Preston','Redfern','Stafford','Townsend'];
export function monthlyMarket(g:Pick<Career,'seed'|'season'|'round'|'postseasonWeeks'|'tier'>):Player[]{
 const month=gameMonth(g),seed=g.seed+Number(month.replace('-',''))*7919,r=random(seed),names=new Set<string>();
 return Array.from({length:32},(_,i)=>{
  let name='';do{name=first[Math.floor(r()*first.length)]+' '+last[Math.floor(r()*last.length)]}while(names.has(name));names.add(name);
  const position=i<4?'GK':i<14?'DEF':i<24?'MID':'FWD',age=17+Math.floor(r()*18),ability=Math.min(90,(tierOf(g)===8?35:43+(7-tierOf(g))*6)+Math.floor(r()*34)),potential=Math.min(90,ability+(age<25?10+Math.floor(r()*23):3+Math.floor(r()*5)));
  return{id:`market-${month}-${i}`,name,position,age,ability,startingAbility:ability,potential,fitness:100,wage:Math.round((55+Math.floor(r()*100))*(tierOf(g)===8?1:1.55*Math.pow(1.65,7-tierOf(g)))),contract:1+Math.floor(r()*3),attack:Math.min(99,ability+Math.floor(r()*11)-5),defence:Math.min(99,ability+Math.floor(r()*11)-5)};
 });
}
export function refreshMarket(g:Career,notify=true){
 if(g.marketMonth===gameMonth(g))return;
 g.market=monthlyMarket(g).filter(p=>!g.squad.some(x=>x.id===p.id));g.marketMonth=gameMonth(g);
 if(notify)g.inbox.unshift(`Transfer market update Â· ${gameMonth(g)}\n\nYour scouts have found ${g.market.length} available players. This month's list replaces unsold listings from the previous month. Browse Transfers to negotiate a signing.`);
}
const partners=['Salford Vale FC','Peak District Town','Rochdale Park','Lancaster Heath','Bolton Stags','Cheshire Rangers'];
function partner(g:Career,p:Player){const hash=[...p.id].reduce((n,c)=>n+c.charCodeAt(0),g.seed);return partners[Math.abs(hash)%partners.length]}
export function saleOffer(g:Career,p:Player){return{club:partner(g,p),fee:Math.round((p.ability*75+Math.max(0,p.potential-p.ability)*20)*(p.age<24?1.15:p.age>30?.8:1))}}
function removable(g:Career,id:string){
 const p=g.squad.find(p=>p.id===id);if(!p)throw Error('Player unavailable');if(p.loanIn)throw Error('Borrowed players cannot be sold or loaned out');if(p.loan)throw Error('Recall this player from loan first');
 try{assistantPick({...g,squad:g.squad.filter(p=>p.id!==id)})}catch{throw Error(`Keep enough available players to field ${g.formation}. Recruit cover or change formation first.`)}
 return p;
}
export function sellPlayer(input:Career,id:string):Career{
 const g=structuredClone(input),p=removable(g,id),offer=saleOffer(g,p);if(p.freeAgentSignedSeason===g.season)throw Error('Free-agent signings can be sold from next season');if(p.academyPromotedSeason===g.season)throw Error('Academy graduates can be sold from next season');
 // Sale income may reduce an overdraft without needing to clear it in one transaction.
 transact(g,`Sale: ${p.name} to ${offer.club}`,offer.fee);
 g.squad=g.squad.filter(p=>p.id!==id);g.selection=g.selection.filter(x=>x!==id);
 g.inbox.unshift(`Player sold Â· ${p.name}\n\n${offer.club} have paid Â£${offer.fee.toLocaleString('en-GB')} for ${p.name}. His Â£${p.wage} weekly wage is removed from your commitments. If he was in your starting XI, select a replacement before the next match.`);
 return g;
}
export function loanPlayer(input:Career,id:string,weeks:number):Career{
 if(![4,8,12].includes(weeks))throw Error('Choose a 4, 8 or 12 week loan');
 if(input.round>=42)throw Error('Begin the next season before arranging a loan');
 const g=structuredClone(input),p=removable(g,id);if(!available(p))throw Error('Player must be fit and free of suspension before a development loan');const duration=Math.min(weeks,42-g.round);
 p.loan={club:partner(g,p),startRound:g.round,returnRound:g.round+duration,startingAbility:p.ability,weeksPlayed:0,wageShare:50};
 g.selection=g.selection.filter(x=>x!==id);
 g.inbox.unshift(`Development loan Â· ${p.name}\n\n${p.name} joins ${p.loan.club} for ${duration} matchweeks, returning after matchweek ${p.loan.returnRound}. The host pays 50% of his Â£${p.wage} weekly wage. He will gain first-team experience, with a 35% weekly ability-growth chance if under 25 (12% otherwise), up to his potential. You can recall him at any time. His full wage remains reserved within the Â£${division(g).wageBudget.toLocaleString('en-GB')} budget for his return.`);
 return g;
}
export function recallPlayer(input:Career,id:string):Career{const g=structuredClone(input),p=g.squad.find(p=>p.id===id);if(!p?.loan)throw Error('Player is not on loan');finishLoan(g,p,'recalled');return g}
function finishLoan(g:Career,p:Player,reason:string){const loan=p.loan!;g.inbox.unshift(`Loan ${reason} Â· ${p.name}\n\n${p.name} is available for selection again after ${loan.weeksPlayed} matchweeks at ${loan.club}. Ability: ${loan.startingAbility} â†’ ${p.ability} (${p.ability-loan.startingAbility>=0?'+':''}${p.ability-loan.startingAbility}). His full Â£${p.wage} weekly wage now returns to the club payroll.`);delete p.loan;p.fitness=100}
/** Called once after each matchweek, before the round counter advances. */
export function processLoans(g:Career){
 const r=random(g.seed+g.season*991+g.round*157+777);
 for(const p of g.squad){if(!p.loan)continue;const loan=p.loan;loan.weeksPlayed++;
  const contribution=Math.floor(p.wage*loan.wageShare/100);transact(g,`Loan wage contribution: ${p.name}`,contribution);
  if(p.ability<p.potential&&r()<(p.age<25?.35:.12)){p.startingAbility??=p.ability;changeAbility(p,p.ability+1);g.inbox.unshift(`Loan development Â· ${p.name}\n\n${p.name} has improved to ${p.ability} ability (+1) through regular football at ${loan.club}. Total loan growth: +${p.ability-loan.startingAbility}.`)}
  p.fitness=100;
  if(g.round+1>=loan.returnRound)finishLoan(g,p,'completed');
 }
}

