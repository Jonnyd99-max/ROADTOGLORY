import {ensureCup,advanceCup,cupPending,type CupSeason} from './cup';
import {ensureSupporters,settleExpectations,staffQuality,staffWages,tacticalEffects,tacticalReport,type Staff,type Supporters,type TacticalPlan} from './clubSystems';
import {ensureClubHistory,archivePlayer,type ClubHistory} from './clubHistory';
import {processScouting,type ScoutRecord} from './scouting';
import type {SquadRole} from './personality';
import {defaultIdentity,type ClubIdentity} from './identity';
import {matchFatigue,ageRecovery} from './conditioning';
import {agreePackage,type Perk,type ContractPackage} from './negotiation';
import {repairDevelopment,changeAbility,conditionFactor} from './development';
import {ensureAcademy,developAcademy,startAcademySeason} from './academy';
import {digestNewMail,inboxThreads} from './mail';
import {ensureSeasonMarkets} from './seasonMarket';
import {available,selectionScore,performanceFactor,selectionModes,type SelectionMode} from './management';
import {recordPlayerMatch} from './playerStats';
import {division,type Tier} from './division';
import {ensureCompetition,playOtherRound,prepareFinale,settleSeason,type Competition} from './competition';
import {initialClub,ensureClub,processClubMatch,trainingChance,recoveryPoints,type ClubDevelopment} from './club';
import {gameMonth,monthlyMarket,refreshMarket,processLoans,type Loan} from './market';
export type Position='GK'|'DEF'|'MID'|'FWD';
export const positionOrder:Position[]=['GK','DEF','MID','FWD'];
export const positionLabel=(position:Position)=>position==='FWD'?'ATT':position;
export function orderedSquad(squad:Player[]){return [...squad].sort((a,b)=>positionOrder.indexOf(a.position)-positionOrder.indexOf(b.position)||b.ability-a.ability||a.name.localeCompare(b.name)||a.id.localeCompare(b.id))}
export function assistantPick(input:Career,mode:SelectionMode=input.assistantMode??'Balanced'):Career{
 if(!selectionModes.includes(mode))throw Error('Choose a supported assistant selection mode');
 const formation=input.formation.split('-').map(Number);
 if(formation.length!==3||formation.some(n=>!Number.isInteger(n)||n<1)||formation.reduce((a,b)=>a+b,0)!==10)throw Error('Choose a supported formation');
 const requirements=[1,...formation],selection:string[]=[];
 for(const [index,pos] of positionOrder.entries()){
  const candidates=orderedSquad(input.squad).filter(p=>p.position===pos&&available(p)).sort((a,b)=>selectionScore(b,mode)-selectionScore(a,mode)||b.ability-a.ability);
  if(candidates.length<requirements[index])throw Error(`Not enough ${positionLabel(pos)} players for ${input.formation}: need ${requirements[index]}, have ${candidates.length}`);
  selection.push(...candidates.slice(0,requirements[index]).map(p=>p.id));
 }
 return {...input,selection,assistantMode:mode};
}
export interface PlayerSeasonStats {assists?:number;ratingTotal?:number;ratedAppearances?:number;cleanSheets?:number;season:number;appearances:number;starts:number;minutes:number;goals:number}
export interface Player {squadRole?:SquadRole;roleHistory?:boolean[];contractPackage?:ContractPackage;attributeAbility?:number;academyPromotedSeason?:number;freeAgentSignedSeason?:number;loanIn?:import('./seasonMarket').IncomingLoan;morale?:number;recentRatings?:number[];unusedMatches?:number;injury?:{name:string;weeks:number};suspension?:number;yellows?:number;stats?:PlayerSeasonStats[];id:string;name:string;position:Position;age:number;ability:number;startingAbility?:number;potential:number;fitness:number;wage:number;contract:number;attack:number;defence:number;loan?:Loan}
export interface Club {id:number;name:string;strength:number}
export interface Goal {assistId?:string;assistName?:string;assistRecorded?:boolean;minute:number;teamId:number;playerName:string;playerId?:string}
export interface Fixture {competition?:'cup';duration?:number;tacticalReport?:string;ratings?:import('./management').MatchRating[];playerOfMatch?:string;minutes?:Record<string,number>;starters?:string[];goals?:Goal[];round:number;home:number;away:number;score?:[number,number];events?:string[];winner?:number;decidedBy?:'penalties'}
export interface Transaction {round:number;label:string;amount:number}
export interface Career {staff?:Staff[];supporters?:Supporters;tacticalPlan?:TacticalPlan;cup?:CupSeason;lastPlayed?:Fixture;clubHistory?:ClubHistory;scouting?:Record<string,ScoutRecord>;identity?:ClubIdentity;identitySetupComplete?:boolean;potentialRules?:2;assistantMode?:SelectionMode;academy?:import('./academy').Academy;seasonMarkets?:import('./seasonMarket').SeasonMarkets;version:1;seed:number;season:number;round:number;cash:number;squad:Player[];market:Player[];clubs:Club[];fixtures:Fixture[];selection:string[];formation:string;tactic:string;training:string;ledger:Transaction[];inbox:string[];readMailIds?:number[];marketMonth?:string;club?:ClubDevelopment;tier?:Tier;competition?:Competition;postseasonWeeks?:number;activeMatch?:import('./match').LiveMatch}
export function random(seed:number){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function schedule(count=22):Fixture[]{if(count<2||count%2)throw Error('Even number of clubs required');let ids=Array.from({length:count},(_,i)=>i);const first:Fixture[]=[];for(let r=0;r<count-1;r++){for(let i=0;i<count/2;i++){const pair=[ids[i],ids[count-1-i]];first.push({round:r,home:pair[r%2],away:pair[1-r%2]})}ids=[ids[0],ids[count-1],...ids.slice(1,-1)]}return [...first,...first.map(f=>({round:f.round+count-1,home:f.away,away:f.home}))]}
const firstNames=['Oliver','Theo','Jack','Alfie','Noah','Harry','Archie','Leo','Oscar','Charlie','Finley','George','Lucas','Ethan','Mason','Hugo','Max','Toby','Isaac','Dylan','Reuben','Jude','Sam','Elliot','Ben','Rory'];
const surnames=['Mercer','Ashworth','Rowley','Bennett','Hargreaves','Fletcher','Holt','Whitaker','Barlow','Sutton','Dawson','Walsh','Hale','Archer','Booth','Lawson','Reed','Turner','Shaw','Clarke','Price','Ward','Cole','Frost','Hayes','Dean'];
function players(seed:number,n:number,prefix:string):Player[]{const r=random(seed);return Array.from({length:n},(_,i)=>{const ability=40+Math.floor(r()*22),age=17+Math.floor(r()*17);return{id:prefix+i,name:firstNames[i%26]+' '+surnames[(i+seed)%26],position:(i<2?'GK':i<10?'DEF':i<18?'MID':'FWD') as Position,age,ability,startingAbility:ability,potential:Math.min(99,ability+(age<24?12+Math.floor(r()*20):4)),fitness:100,wage:75+Math.floor(r()*55),contract:1+Math.floor(r()*3),attack:ability+Math.floor(r()*10)-5,defence:ability+Math.floor(r()*10)-5}})}
export function newCareer(seed=2026):Career {const squad=players(seed,22,'p');const g:Career={clubHistory:{players:{},matches:[]},identity:{...defaultIdentity},identitySetupComplete:false,potentialRules:2,version:1,tier:8,postseasonWeeks:0,seed,season:2026,round:0,cash:75000,club:initialClub(),squad,market:monthlyMarket({seed,season:2026,round:0}),marketMonth:gameMonth({season:2026,round:0}),clubs:['Dragons Athletic FC','Bramblewick Town','Irwell Borough','Pennine Rovers','Mossley Vale','Westbrook United','Ashford Heath','Calder Athletic','Oakmere FC','Northwich Albion','Redbank Town','Stonebridge FC','Whitfield Rangers','Hawthorn United','Longford Vale','Chorley Heath','Ravenswood FC','Kingswell Town','Eastmoor Athletic','Brookside Rovers','Alderley Borough','Wychwood United'].map((name,id)=>({id,name,strength:id===0?52:44+(id*7%18)})),fixtures:schedule(),selection:[0,2,3,4,5,10,11,12,13,18,19].map(i=>squad[i].id),formation:'4-4-2',tactic:'Balanced',training:'Balanced',ledger:[],readMailIds:[],inbox:['Welcome to Dragon’s Den. Build sustainably, develop young talent and make Greater Manchester proud.']};ensureCompetition(g);ensureSeasonMarkets(g);ensureAcademy(g);ensureCup(g);ensureSupporters(g);return g}
export function table(g:Career){return g.clubs.map(c=>{let played=0,won=0,drawn=0,lost=0,gf=0,ga=0;g.fixtures.filter(f=>f.score&&(f.home===c.id||f.away===c.id)).forEach(f=>{const [a,b]=f.home===c.id?f.score!:[f.score![1],f.score![0]];played++;gf+=a;ga+=b;if(a>b)won++;else if(a===b)drawn++;else lost++});return{...c,played,won,drawn,lost,gf,ga,gd:gf-ga,points:won*3+drawn}}).sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf||a.id-b.id)}
export function transact(g:Career,label:string,amount:number){if(!Number.isFinite(amount)||!Number.isInteger(amount))throw Error('Invalid amount');if(amount<0&&g.cash+amount<0)throw Error('Insufficient club funds');g.cash+=amount;g.ledger.unshift({round:g.round,label,amount})}
export function validTeam(g:Career){const team=g.squad.filter(p=>g.selection.includes(p.id)&&available(p)),counts=g.formation.split('-').map(Number);return team.length===11&&new Set(g.selection).size===11&&team.filter(p=>p.position==='GK').length===1&&(['DEF','MID','FWD'] as Position[]).every((p,i)=>team.filter(x=>x.position===p).length===counts[i])}
function poisson(r:()=>number,mean:number){let k=0,p=1;do{k++;p*=r()}while(p>Math.exp(-mean)&&k<12);return k-1}
export function clubById(clubs:Club[],id:number){const club=clubs.find(c=>c.id===id);if(!club)throw Error('Unknown club '+id);return club}
export function simulateFixture(g:Career,f:Fixture,clubs=g.clubs){
 const r=random(g.seed+g.season*1000+f.round*97+f.home*13+f.away*31);
 const team=g.squad.filter(p=>g.selection.includes(p.id)&&!p.loan);
 const strength=team.length?team.reduce((s,p)=>s+(p.ability*.6+(p.attack+p.defence)*.2)*conditionFactor(p.fitness,45,p.age,p.position)*performanceFactor(p)*(1+staffQuality(g,'Assistant')/5000),0)/team.length:40;
let hs=f.home===0?strength:clubById(clubs,f.home).strength*conditionFactor(100,45),as=f.away===0?strength:clubById(clubs,f.away).strength*conditionFactor(100,45);const attack=(f.home===0||f.away===0)?(g.tactic==='Attacking'?1.2:g.tactic==='Defensive'?.8:1):1;const effects=tacticalEffects(g),ours=f.home===0||f.away===0;const h=poisson(r,Math.max(.25,1.35+(hs-as)/23)*attack*(ours?(f.home===0?effects.attack:effects.against):1)),a=poisson(r,Math.max(.2,1.05+(as-hs)/23)*attack*(ours?(f.away===0?effects.attack:effects.against):1));f.score=[h,a];if(f.home===0||f.away===0){f.events=[];for(let i=0;i<h+a;i++){const home=i<h;f.events.push(`${8+Math.floor(r()*81)}′ · ${home?clubById(clubs,f.home).name:clubById(clubs,f.away).name} score`)}f.events.sort((a,b)=>parseInt(a)-parseInt(b));f.goals=[];for(const [side,count] of [h,a].entries())for(let i=0;i<count;i++){const teamId=side===0?f.home:f.away;const scorer=team.filter(p=>p.position!=='GK')[Math.floor(r()*10)];f.goals.push({minute:8+Math.floor(r()*81),teamId,playerName:teamId===0?scorer.name:opponentName(teamId,Math.floor(r()*10)),playerId:teamId===0?scorer.id:undefined})}f.goals.sort((a,b)=>a.minute-b.minute);processClubMatch(g,f);g.inbox.unshift(`Matchday ${g.round+1}: ${clubById(clubs,f.home).name} ${h}–${a} ${clubById(clubs,f.away).name}.`)}
}
export function finishWeek(g:Career,minutes?:Record<string,number>){
const r=random(g.seed+g.season*1000+g.round*97+90001);
const wages=g.squad.reduce((s,p)=>s+p.wage,0);g.cash-=wages;g.ledger.unshift({round:g.round,label:'Weekly player wages',amount:-wages});const staffCost=staffWages(g);if(staffCost){g.cash-=staffCost;g.ledger.unshift({round:g.round,label:'Weekly staff wages',amount:-staffCost});}const growth:string[]=[];g.squad.forEach(p=>{if(p.loan)return;p.startingAbility??=p.ability;const played=minutes?(minutes[p.id]??0):(g.selection.includes(p.id)?90:0);p.fitness=Math.min(100,Math.round(Math.max(35,p.fitness-matchFatigue(p)*played/90*tacticalEffects(g).fatigue)+ageRecovery(p,recoveryPoints(g))));if(!p.injury&&p.age<25&&p.ability<p.potential&&r()<trainingChance(g,p)){changeAbility(p,Math.min(p.potential,p.ability+1));growth.push(`${p.name}: ${p.ability-1} → ${p.ability} (+1)`)}});if(growth.length)g.inbox.unshift(`Development report · Matchweek ${g.round+1}\n\n${growth.join('\n')}\n\nYour ${g.training.toLowerCase()} training and first-team experience are helping young players improve. Green ability segments show total growth since their starting rating.`);processLoans(g);developAcademy(g);processScouting(g);
}
export function playRound(input:Career,resolved?:Fixture):Career{
 if(input.round>=42)throw Error('Season complete');if(cupPending(input))throw Error('Play the midweek cup fixture first');if(!validTeam(input))throw Error('Select 11 players matching your formation');
 const g=structuredClone(input),mailBefore=g.inbox.length;ensureClub(g);ensureCompetition(g);
 for(const f of g.fixtures.filter(f=>f.round===g.round)){if(resolved&&f.home===resolved.home&&f.away===resolved.away){Object.assign(f,resolved);processClubMatch(g,f)}else simulateFixture(g,f);}
 const played=g.fixtures.find(f=>f.round===g.round&&(f.home===0||f.away===0))!;played.tacticalReport=tacticalReport(g);g.lastPlayed=played;recordPlayerMatch(g,played);playOtherRound(g);finishWeek(g,played.minutes);g.round++;advanceCup(g);refreshMarket(g);
 if(g.round===42){settleExpectations(g);prepareFinale(g);g.inbox.unshift('League season complete. Review the table and promotion playoffs before starting the next campaign.')}
 digestNewMail(g,mailBefore,`Weekly digest · Matchweek ${g.round}`,`${clubById(g.clubs,played.home).name} ${played.score!.join(' – ')} ${clubById(g.clubs,played.away).name}\nCash: £${g.cash.toLocaleString('en-GB')} · Weekly wages: £${g.squad.reduce((n,p)=>n+p.wage,0).toLocaleString('en-GB')}`);return g;
}
export function signPlayer(input:Career,id:string,fee:number,wage:number,years:number,perk:Perk='none',role?:SquadRole):Career{const g=structuredClone(input),p=g.market.find(p=>p.id===id);if(!p)throw Error('Player unavailable');if(p.age<16)throw Error('First-team signings must be at least 16');if(p.loanIn)throw Error('Loan players cannot sign permanent contract renewals');if(!Number.isInteger(years)||years<1||years>3)throw Error('Choose a 1–3 year contract');const contractPackage=agreePackage(p,p.wage,wage,years,perk,role);if(!Number.isInteger(fee)||fee<p.ability*110)throw Error('Offer rejected: improve the fee or weekly wage');if(g.squad.reduce((s,p)=>s+p.wage,0)+wage>division(g).wageBudget)throw Error(`Offer exceeds £${division(g).wageBudget.toLocaleString('en-GB')} weekly wage budget`);transact(g,`Transfer: ${p.name}`,-fee);if(contractPackage.cost)transact(g,`Contract perk: ${p.name} · ${perk}`,-contractPackage.cost);g.squad.push({...p,wage,contract:years,contractPackage,...(role?{squadRole:role,roleHistory:[]}: {})});g.market=g.market.filter(x=>x.id!==id);g.inbox.unshift(`${p.name} has signed a ${years}-year contract.`);return g}
export function renew(input:Career,id:string,wage:number,years:number,perk:Perk='none',role?:SquadRole){const g=structuredClone(input),p=g.squad.find(p=>p.id===id);if(!p)throw Error('Player unavailable');if(p.age<16)throw Error('First-team signings must be at least 16');if(p.loanIn)throw Error('Loan players cannot sign permanent contract renewals');const contractPackage=agreePackage(p,Math.ceil(p.wage*1.1),wage,years,perk,role);if(g.squad.reduce((s,x)=>s+x.wage,0)-p.wage+wage>division(g).wageBudget)throw Error('Wage budget exceeded');if(contractPackage.cost)transact(g,`Contract perk: ${p.name} · ${perk}`,-contractPackage.cost);p.wage=wage;p.contract=years;p.contractPackage=contractPackage;if(role){if(role!==p.squadRole)p.roleHistory=[];p.squadRole=role;}return g}
export function nextSeason(input:Career){if(input.round!==42)throw Error('Finish the season first');if(cupPending(input))throw Error('Finish the cup fixture first');const g=structuredClone(input),mailBefore=g.inbox.length;ensureClub(g);ensureClubHistory(g);settleSeason(g);g.season++;g.round=0;g.postseasonWeeks=0;delete g.lastPlayed;ensureCup(g);ensureSupporters(g);g.squad=g.squad.filter(p=>{if(p.loanIn){archivePlayer(g,p,'Loan returned');g.inbox.unshift(`Loan ended · ${p.name} returned to ${p.loanIn.club}.`);return false}p.age++;p.contract--;if(p.age>30)changeAbility(p,Math.max(20,p.ability-2));p.fitness=100;delete p.injury;p.yellows=0;p.recentRatings=[];p.roleHistory=[];p.morale=Math.round(((p.morale??60)+60)/2);if(p.contract<=0)archivePlayer(g,p,p.age>=38?'Retired':'Released');return p.contract>0});g.selection=g.selection.filter(id=>g.squad.some(p=>p.id===id));refreshMarket(g);ensureSeasonMarkets(g);startAcademySeason(g);g.inbox.unshift('New season: expired contracts have left the club. Recruit and select your XI.');digestNewMail(g,mailBefore,`Season digest · ${g.season}/${String(g.season+1).slice(-2)}`);return g}


/** Restore original generated ratings in existing version-one saves. */
export function migrateCareer(input:Career):Career{
 const g=structuredClone(input);
 const originalSquad=players(g.seed,22,'p'),originalMarket=players(g.seed+7,26,'m');
 for(const p of [...g.squad,...g.market]){
  if(p.startingAbility!==undefined)continue;
  const season=p.id.match(/^s(\d{4})/);
  const originals=season?players(g.seed+Number(season[1]),26,'s'+season[1]):p.id.startsWith('m')?originalMarket:originalSquad;
  p.startingAbility=originals.find(x=>x.id===p.id)?.ability??p.ability;
 }
 g.readMailIds??=[];ensureCup(g);ensureSupporters(g);ensureClub(g);ensureClubHistory(g);g.tier??=8;g.postseasonWeeks??=0;ensureCompetition(g,true);if(g.round===42)prepareFinale(g);
 if(g.marketMonth===undefined){const ids=new Set([...g.squad,...g.market].map(p=>p.id));g.market=[...g.market,...monthlyMarket(g).filter(p=>!ids.has(p.id))].slice(0,Math.max(32,g.market.length));g.marketMonth=gameMonth(g)}
 ensureSeasonMarkets(g);ensureAcademy(g);if(g.potentialRules!==2){for(const p of [...g.squad,...g.market,...g.academy!.players,...g.academy!.prospects,...g.seasonMarkets!.freeAgents,...g.seasonMarkets!.loans])if(p.potential===90)p.potential=99;g.potentialRules=2;}for(const p of [...g.squad,...g.market,...g.academy!.players,...g.academy!.prospects,...g.seasonMarkets!.freeAgents,...g.seasonMarkets!.loans])repairDevelopment(p);return g;
}
export function abilitySegments(p:Player){const start=p.startingAbility??p.ability;return{blue:Math.min(start,p.ability),green:Math.max(0,p.ability-start),growth:p.ability-start}}
/** Mail IDs count from the oldest message so prepending new mail never changes them. */
export function mailId(g:Career,index:number){return g.inbox.length-1-index}
export function markMailRead(input:Career,id:number){if(!Number.isInteger(id)||id<0||id>=input.inbox.length)throw Error('Message unavailable');const g=structuredClone(input);g.readMailIds=Array.from(new Set([...(g.readMailIds??[]),id]));return g}
export function unreadCount(g:Career){return inboxThreads(g).filter(t=>t.unread).length}
export function mailDetails(body:string){if(/^(Weekly digest|Season digest)/.test(body))return{subject:body.split('\n')[0],sender:'Club staff'};if(body.startsWith('Development report'))return{subject:body.split('\n')[0],sender:'Youth development coach'};if(body.startsWith('Matchday'))return{subject:body.split(':')[0]+' · Full-time report',sender:'Assistant manager'};if(body.startsWith('Welcome'))return{subject:body.split('\n')[0].split('.')[0],sender:'Club chairman'};if(body.includes('has signed'))return{subject:'Transfer confirmed',sender:'Club secretary'};return{subject:body.split('\n')[0].split('.')[0],sender:'Club secretary'}}

export function opponentName(teamId:number,index:number){return firstNames[(teamId*3+index)%26]+" "+surnames[(teamId*7+index*3)%26]}

/** Mark every existing message as read without deleting reports or changing stable IDs. */
export function markAllMailRead(input:Career):Career{return {...input,readMailIds:input.inbox.map((_,i)=>input.inbox.length-1-i)}}
