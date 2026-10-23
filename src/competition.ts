import {digestNewMail} from './mail';
import {recordPlayerMatch} from './playerStats';
import {random,schedule,table,validTeam,simulateFixture,finishWeek,transact,type Career,type Club,type Fixture} from './engine';
import {processClubMatch} from './club';
import {refreshMarket} from './market';
import {clubState} from './club';
import {division,tierOf,tiers,clubStrength,type Tier} from './division';

export interface DivisionSeason {tier:Tier;clubs:Club[];fixtures:Fixture[]}
export interface Playoffs {stage:'semifinals'|'final'|'complete';fixtures:Fixture[];winner?:number}
export interface SeasonRecord {season:number;tier:Tier;position:number;points:number;outcome:string;nextTier:Tier;prize:number;playoffWinner:string}
export interface Competition {divisions?:DivisionSeason[];brackets?:Partial<Record<Tier,Playoffs>>;other:DivisionSeason;playoffs?:Playoffs;history:SeasonRecord[]}
export function fixturesFor(clubs:Club[]){return schedule().map(f=>({...f,home:clubs[f.home].id,away:clubs[f.away].id}))}
const names=['Highfell City','Westhaven Town','Ridgewater Athletic','Copperdale United','Newford Albion','Grange Park','Crownfield Town','Briarstone FC','Harbour Vale','Eastcastle Rovers','Mereford Athletic','Southbank City','Clifton Heath','Wrenbury Town','Silverdale Albion','Fairbourne United','Hillcrest Rangers','Darnton FC','Stourfield Borough','Millhaven Rovers','Northgate Athletic','Kingsford City'];
/** Inactive divisions are stored separately; `other` remains a legacy adjacent-division alias. */
export function leagueDivisions(g:Career):DivisionSeason[]{const c=ensureCompetition(g);return [{tier:tierOf(g),clubs:g.clubs,fixtures:g.fixtures},...(c.divisions??[])].sort((a,b)=>a.tier-b.tier)}
export function ensureCompetition(g:Career,backfill=false){
 const existing=g.competition;
 if(!backfill&&existing?.divisions?.length===7&&new Set(existing.divisions.map(d=>d.tier)).size===7&&!existing.divisions.some(d=>d.tier===tierOf(g))&&existing.divisions.includes(existing.other)&&existing.other.tier===(tierOf(g)===8?7:tierOf(g)+1))return existing;
 if(!g.competition){
  const tier:Tier=tierOf(g)===8?7:8,used=new Set(g.clubs.map(c=>c.id));let id=22;
  const clubs=names.map((name,index)=>{while(used.has(id))id++;return{id:id++,name,strength:(tier===7?58:44)+(index*7%18)}});
  const other={tier,clubs,fixtures:fixturesFor(clubs)};g.competition={other,history:[]};
 }
 const comp=g.competition;
 // Reconcile the legacy alias as well as newly introduced divisions on old saves.
 const inactive=(comp.divisions??[]).filter(d=>d.tier!==tierOf(g)&&d.tier!==comp.other.tier);
 if(comp.other.tier!==tierOf(g))inactive.push(comp.other);
 const used=new Set([...g.clubs,...inactive.flatMap(d=>d.clubs)].map(c=>c.id));
 for(const tier of tiers){if(tier===tierOf(g)||inactive.some(d=>d.tier===tier))continue;
  const clubs=names.map((name,index)=>{let id=tier*100+index+100;while(used.has(id))id++;used.add(id);return{id,name:`${['Royal','Union','Sporting','Central','New','North','West','East'][tier-1]} ${name}`,strength:clubStrength(tier,index)}});
  inactive.push({tier,clubs,fixtures:fixturesFor(clubs)});
 }
 comp.divisions=inactive.sort((a,b)=>a.tier-b.tier);
 comp.other=inactive.find(d=>d.tier===(tierOf(g)===8?7:tierOf(g)+1))!;
 // Only unseen AI fixtures are reconstructed. No Dragons results or finances change.
 for(const d of inactive)for(const f of d.fixtures)if(f.round<Math.min(g.round,42)&&!f.score)simulateFixture(g,f,d.clubs);
 return comp;
}
export function divisionTable(g:Career,tier:Tier){const d=leagueDivisions(g).find(d=>d.tier===tier)!;return table({...g,clubs:d.clubs,fixtures:d.fixtures})}
export function otherTable(g:Career){return divisionTable(g,ensureCompetition(g).other.tier)}
export function playOtherRound(g:Career){for(const d of ensureCompetition(g).divisions!)for(const f of d.fixtures.filter(f=>f.round===g.round&&!f.score))simulateFixture(g,f,d.clubs)}
function advanceBracket(g:Career,p:Playoffs,d:DivisionSeason){if(p.stage==='semifinals'){const winners=p.fixtures.filter(f=>f.round===42).map(fixtureWinner),ranking=table({...g,clubs:d.clubs,fixtures:d.fixtures}).map(c=>c.id);winners.sort((a,b)=>ranking.indexOf(a)-ranking.indexOf(b));p.fixtures.push({round:43,home:winners[0],away:winners[1]});p.stage='final'}else{p.winner=fixtureWinner(p.fixtures.find(f=>f.round===43)!);p.stage='complete'}}
function aiStage(g:Career,p:Playoffs,d:DivisionSeason){for(const f of p.fixtures.filter(f=>!f.score&&f.round===(p.stage==='semifinals'?42:43))){simulateFixture(g,f,d.clubs);resolveDraw(g,f)}advanceBracket(g,p,d)}
export function resolveDraw(g:Career,f:Fixture){if(f.score![0]!==f.score![1])return;const r=random(g.seed+g.season*41+f.home*19+f.away*29+f.round);f.winner=r()<.5?f.home:f.away;f.decidedBy='penalties'}
export const fixtureWinner=(f:Fixture)=>f.winner??(f.score![0]>f.score![1]?f.home:f.away);
export function prepareFinale(g:Career){
 const comp=ensureCompetition(g,true),all=leagueDivisions(g);
 if(!comp.brackets){comp.brackets={};if(comp.playoffs)comp.brackets[8]=comp.playoffs;}
 for(const d of all.filter(d=>d.tier>1)){
  let p=comp.brackets[d.tier];if(!p){const rows=table({...g,clubs:d.clubs,fixtures:d.fixtures});p={stage:'semifinals',fixtures:[{round:42,home:rows[1].id,away:rows[4].id},{round:42,home:rows[2].id,away:rows[3].id}]};comp.brackets[d.tier]=p;}
  while(p.stage!=='complete'){
   const stageRound=p.stage==='semifinals'?42:43;
   if(p.fixtures.some(f=>f.round===stageRound&&(f.home===0||f.away===0)))break;
   aiStage(g,p,d);
  }
 }
 comp.playoffs=tierOf(g)===1?{stage:'complete',fixtures:[]}:comp.brackets[tierOf(g)];
}
export function playoffPending(g:Career){if(g.round!==42)return false;const copy=structuredClone(g);prepareFinale(copy);return copy.competition!.playoffs!.stage!=='complete'}
export function playPlayoff(input:Career,resolved?:Fixture):Career{
 if(input.round!==42)throw Error('Finish the league season first');if(!validTeam(input))throw Error('Select 11 players matching your formation');const g=structuredClone(input),mailBefore=g.inbox.length;prepareFinale(g);const p=g.competition!.playoffs!;
 if(p.stage==='complete')throw Error('Playoffs complete');
 const stageRound=p.stage==='semifinals'?42:43,lower={tier:tierOf(g),clubs:g.clubs,fixtures:g.fixtures};
 // Use the same team, fitness, finance and training model as a league week.
 g.round=stageRound;
 for(const f of p.fixtures.filter(f=>f.round===stageRound&&!f.score)){if(resolved&&f.home===resolved.home&&f.away===resolved.away){Object.assign(f,resolved);processClubMatch(g,f)}else simulateFixture(g,f,lower.clubs);resolveDraw(g,f);if(f.home===0||f.away===0)g.inbox.unshift(`Playoff ${p.stage==='semifinals'?'semifinal':'final'}\n\n${lower.clubs.find(c=>c.id===f.home)!.name} ${f.score!.join('–')} ${lower.clubs.find(c=>c.id===f.away)!.name}.${f.decidedBy?' Decided on penalties.':''}`)}
 const played=p.fixtures.find(f=>f.round===stageRound&&(f.home===0||f.away===0))!;recordPlayerMatch(g,played);finishWeek(g);g.round=42;g.postseasonWeeks=(g.postseasonWeeks??0)+1;advanceBracket(g,p,lower);prepareFinale(g);refreshMarket(g);digestNewMail(g,mailBefore,`Weekly digest · Promotion playoff ${stageRound===42?'semifinal':'final'}`,`${lower.clubs.find(c=>c.id===played.home)!.name} ${played.score!.join(' – ')} ${lower.clubs.find(c=>c.id===played.away)!.name}${played.decidedBy?' · Decided on penalties':''}`);return g;
}
export function settleSeason(g:Career){
 prepareFinale(g);const comp=g.competition!;if(comp.playoffs!.stage!=='complete')throw Error('Complete your promotion playoffs first');
 const active={tier:tierOf(g),clubs:g.clubs,fixtures:g.fixtures},all=leagueDivisions(g),rows=table(g),position=rows.findIndex(c=>c.id===0)+1,row=rows.find(c=>c.id===0)!,config=division(g);
 const promote=new Map<Tier,number[]>(),relegate=new Map<Tier,number[]>();
 for(const d of all){const ranked=table({...g,clubs:d.clubs,fixtures:d.fixtures});if(d.tier>1)promote.set(d.tier,[ranked[0].id,comp.brackets![d.tier]!.winner!]);if(d.tier<8)relegate.set(d.tier,ranked.slice(-2).map(c=>c.id));}
 const nextTier:Tier=promote.get(active.tier)?.includes(0)?active.tier-1 as Tier:relegate.get(active.tier)?.includes(0)?active.tier+1 as Tier:active.tier;
 const prize=config.prizes[position===1?0:position<=5?1:position<=10?2:3]+(nextTier<active.tier?config.promotionBonus:0);
 const outcome=nextTier<active.tier?'Promoted':nextTier>active.tier?'Relegated':position===1?'Champions':'Stayed in division';
 transact(g,`${g.season} season prize · Tier ${active.tier} · ${outcome}`,prize);
 if(nextTier!==active.tier)clubState(g).fans=Math.max(250,Math.round(clubState(g).fans*(nextTier<active.tier?1.1:.9)));
 const winnerId=comp.brackets?.[active.tier]?.winner,winner=all.flatMap(d=>d.clubs).find(c=>c.id===winnerId)?.name??'No promotion playoff in Tier 1';
 comp.history.unshift({season:g.season,tier:active.tier,position,points:row.points,outcome,nextTier,prize,playoffWinner:winner});
 const clubs=all.flatMap(d=>d.clubs),next=all.map(d=>{
  const leaving=[...(promote.get(d.tier)??[]),...(relegate.get(d.tier)??[])];
  const arriving=[...(d.tier<8?promote.get(d.tier+1 as Tier)??[]:[]),...(d.tier>1?relegate.get(d.tier-1 as Tier)??[]:[])];
  const members=[...d.clubs.filter(c=>!leaving.includes(c.id)),...clubs.filter(c=>arriving.includes(c.id))].map(c=>({...c,strength:c.id===0?c.strength:clubStrength(d.tier,c.id,g.season)}));
  return {tier:d.tier,clubs:members,fixtures:fixturesFor(members)};
 });
 const ours=next.find(d=>d.tier===nextTier)!;g.tier=nextTier;g.clubs=ours.clubs;g.fixtures=ours.fixtures;
 comp.divisions=next.filter(d=>d.tier!==nextTier);comp.other=comp.divisions.find(d=>d.tier===(nextTier===8?7:nextTier+1))!;delete comp.playoffs;delete comp.brackets;
 g.inbox.unshift(`${outcome} · Season review\n\nFinished ${position} in Tier ${active.tier} with ${row.points} points. Prize and promotion payments: £${prize.toLocaleString('en-GB')}. Next season: Tier ${nextTier}, ${division(g).name}. Wage budget: £${division(g).wageBudget.toLocaleString('en-GB')}/week. Playoff winner: ${winner}.`);
}
