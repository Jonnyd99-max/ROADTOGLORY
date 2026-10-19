import {random,schedule,table,validTeam,simulateFixture,finishWeek,transact,type Career,type Club,type Fixture} from './engine';
import {refreshMarket} from './market';
import {clubState} from './club';
import {division,tierOf,type Tier} from './division';

export interface DivisionSeason {tier:Tier;clubs:Club[];fixtures:Fixture[]}
export interface Playoffs {stage:'semifinals'|'final'|'complete';fixtures:Fixture[];winner?:number}
export interface SeasonRecord {season:number;tier:Tier;position:number;points:number;outcome:string;nextTier:Tier;prize:number;playoffWinner:string}
export interface Competition {other:DivisionSeason;playoffs?:Playoffs;history:SeasonRecord[]}
export function fixturesFor(clubs:Club[]){return schedule().map(f=>({...f,home:clubs[f.home].id,away:clubs[f.away].id}))}
const names=['Highfell City','Westhaven Town','Ridgewater Athletic','Copperdale United','Newford Albion','Grange Park','Crownfield Town','Briarstone FC','Harbour Vale','Eastcastle Rovers','Mereford Athletic','Southbank City','Clifton Heath','Wrenbury Town','Silverdale Albion','Fairbourne United','Hillcrest Rangers','Darnton FC','Stourfield Borough','Millhaven Rovers','Northgate Athletic','Kingsford City'];
export function ensureCompetition(g:Career){
 if(g.competition)return g.competition;
 const tier:Tier=tierOf(g)===8?7:8,used=new Set(g.clubs.map(c=>c.id));let id=22;
 const clubs=names.map((name,index)=>{while(used.has(id))id++;const club={id:id++,name,strength:(tier===7?58:44)+(index*7%18)};return club});
 const other={tier,clubs,fixtures:fixturesFor(clubs)};
 g.competition={other,history:[]};
 // Reconstruct only the previously unseen division; never alter the user's results or cash.
 for(let round=0;round<Math.min(g.round,42);round++)for(const f of other.fixtures.filter(f=>f.round===round))simulateFixture(g,f,clubs);
 return g.competition;
}
export function otherTable(g:Career){const other=ensureCompetition(structuredClone(g)).other;return table({...g,clubs:other.clubs,fixtures:other.fixtures})}
export function playOtherRound(g:Career){const other=ensureCompetition(g).other;for(const f of other.fixtures.filter(f=>f.round===g.round))simulateFixture(g,f,other.clubs)}
function lowerDivision(g:Career):DivisionSeason{return tierOf(g)===8?{tier:8,clubs:g.clubs,fixtures:g.fixtures}:ensureCompetition(g).other}
function lowerTable(g:Career){const lower=lowerDivision(g);return table({...g,clubs:lower.clubs,fixtures:lower.fixtures})}
function aiStage(g:Career){const comp=ensureCompetition(g),p=comp.playoffs!,lower=lowerDivision(g);for(const f of p.fixtures.filter(f=>!f.score&&f.round===(p.stage==='semifinals'?42:43))){simulateFixture(g,f,lower.clubs);resolveDraw(g,f)}advanceBracket(g)}
export function resolveDraw(g:Career,f:Fixture){if(f.score![0]!==f.score![1])return;const r=random(g.seed+g.season*41+f.home*19+f.away*29+f.round);f.winner=r()<.5?f.home:f.away;f.decidedBy='penalties'}
export const fixtureWinner=(f:Fixture)=>f.winner??(f.score![0]>f.score![1]?f.home:f.away);
function advanceBracket(g:Career){const p=ensureCompetition(g).playoffs!;if(p.stage==='semifinals'){const semis=p.fixtures.filter(f=>f.round===42);const winners=semis.map(fixtureWinner),ranking=lowerTable(g).map(c=>c.id);winners.sort((a,b)=>ranking.indexOf(a)-ranking.indexOf(b));p.fixtures.push({round:43,home:winners[0],away:winners[1]});p.stage='final'}else{p.winner=fixtureWinner(p.fixtures.find(f=>f.round===43)!);p.stage='complete'}}
export function prepareFinale(g:Career){
 const comp=ensureCompetition(g);if(!comp.playoffs){const rows=lowerTable(g);comp.playoffs={stage:'semifinals',fixtures:[{round:42,home:rows[1].id,away:rows[4].id},{round:42,home:rows[2].id,away:rows[3].id}]};g.inbox.unshift(`Promotion playoffs\n\nTier 8 champions go up automatically. Places 2–5 enter single-leg semifinals (2nd vs 5th, 3rd vs 4th), then a final. The higher league finisher hosts; tied matches go to penalties. The winner also goes up. Tier 7's bottom two come down.`)}
 while(comp.playoffs.stage!=='complete'){
  const stageRound=comp.playoffs.stage==='semifinals'?42:43;
  if(comp.playoffs.fixtures.some(f=>f.round===stageRound&&(f.home===0||f.away===0)))break;
  aiStage(g);
 }
}
export function playoffPending(g:Career){if(g.round!==42)return false;const copy=structuredClone(g);prepareFinale(copy);return copy.competition!.playoffs!.stage!=='complete'}
export function playPlayoff(input:Career):Career{
 if(input.round!==42)throw Error('Finish the league season first');if(!validTeam(input))throw Error('Select 11 players matching your formation');const g=structuredClone(input);prepareFinale(g);const p=g.competition!.playoffs!;
 if(p.stage==='complete')throw Error('Playoffs complete');
 const stageRound=p.stage==='semifinals'?42:43,lower=lowerDivision(g);
 // Use the same team, fitness, finance and training model as a league week.
 g.round=stageRound;
 for(const f of p.fixtures.filter(f=>f.round===stageRound&&!f.score)){simulateFixture(g,f,lower.clubs);resolveDraw(g,f);if(f.home===0||f.away===0)g.inbox.unshift(`Playoff ${p.stage==='semifinals'?'semifinal':'final'}\n\n${lower.clubs.find(c=>c.id===f.home)!.name} ${f.score!.join('–')} ${lower.clubs.find(c=>c.id===f.away)!.name}.${f.decidedBy?' Decided on penalties.':''}`)}
 finishWeek(g);g.round=42;g.postseasonWeeks=(g.postseasonWeeks??0)+1;advanceBracket(g);prepareFinale(g);refreshMarket(g);return g;
}
export function settleSeason(g:Career){
 prepareFinale(g);const comp=g.competition!;if(comp.playoffs!.stage!=='complete')throw Error('Complete your promotion playoffs first');
 const active={tier:tierOf(g),clubs:g.clubs,fixtures:g.fixtures},other=comp.other,lower=lowerDivision(g),upper=active.tier===7?active:other;
 const lowerRows=table({...g,clubs:lower.clubs,fixtures:lower.fixtures}),upperRows=table({...g,clubs:upper.clubs,fixtures:upper.fixtures});
 const promoted=[lowerRows[0].id,comp.playoffs!.winner!],relegated=upperRows.slice(-2).map(c=>c.id),position=table(g).findIndex(c=>c.id===0)+1,row=table(g).find(c=>c.id===0)!,config=division(g);
 const nextTier:Tier=promoted.includes(0)?7:relegated.includes(0)?8:active.tier;
 const prize=config.prizes[position===1?0:position<=5?1:position<=10?2:3]+(nextTier<active.tier?config.promotionBonus:0);
 const outcome=nextTier<active.tier?'Promoted':nextTier>active.tier?'Relegated':position===1?'Champions':'Stayed in division';
 transact(g,`${g.season} season prize · Tier ${active.tier} · ${outcome}`,prize);
 if(nextTier!==active.tier)clubState(g).fans=Math.max(250,Math.round(clubState(g).fans*(nextTier<active.tier?1.1:.9)));
 const winner=lower.clubs.find(c=>c.id===comp.playoffs!.winner)!.name;
 comp.history.unshift({season:g.season,tier:active.tier,position,points:row.points,outcome,nextTier,prize,playoffWinner:winner});
 const all=[...lower.clubs,...upper.clubs];
 const newLower=[...lower.clubs.filter(c=>!promoted.includes(c.id)),...all.filter(c=>relegated.includes(c.id))];
 const newUpper=[...upper.clubs.filter(c=>!relegated.includes(c.id)),...all.filter(c=>promoted.includes(c.id))];
 // Club identity persists; strengths are refreshed within the division's range.
 const rebuild=(clubs:Club[],tier:Tier)=>clubs.map(c=>({...c,strength:c.id===0?c.strength:(tier===7?58:44)+((c.id*7+g.season)%18)}));
 const lowerNext=rebuild(newLower,8),upperNext=rebuild(newUpper,7);
 g.tier=nextTier;g.clubs=nextTier===8?lowerNext:upperNext;g.fixtures=fixturesFor(g.clubs);
 comp.other={tier:nextTier===8?7:8,clubs:nextTier===8?upperNext:lowerNext,fixtures:fixturesFor(nextTier===8?upperNext:lowerNext)};delete comp.playoffs;
 g.inbox.unshift(`${outcome} · Season review\n\nFinished ${position} in Tier ${active.tier} with ${row.points} points. Prize and promotion payments: £${prize.toLocaleString('en-GB')}. Next season: Tier ${nextTier}, ${division(g).name}. Wage budget: £${division(g).wageBudget.toLocaleString('en-GB')}/week. Playoff winner: ${winner}.`);
}

