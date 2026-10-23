import {marketAsking,marketFee} from './activeMarket';
import {newCareer,nextSeason} from './testCareer';
import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {playRound,assistantPick,signPlayer,migrateCareer,type Fixture} from './engine';
import {requestScout,potentialEstimate,scoutCost,processScouting} from './scouting';
import {personality,perkAffinity,settlePlayingTime} from './personality';
import {wageQuote} from './negotiation';
import {careerRecords,clubHonours,archivePlayer} from './clubHistory';
import {recordPlayerMatch,emptyStats} from './playerStats';
import {settlePlayerManagement} from './management';
import {sellPlayer} from './market';
import {saveCareer,loadCareer} from './storage';
it('gives deterministic, nested estimates that include true potential without exposing it directly',()=>{
 for(let seed=1;seed<=20;seed++){const g=newCareer(seed),p=g.market[0];let previous=potentialEstimate(g,p);for(const level of [1,2]){g.scouting={[p.id]:{level,player:p,season:g.season,round:0}};const next=potentialEstimate(g,p);expect(next.low).toBeGreaterThanOrEqual(previous.low);expect(next.high).toBeLessThanOrEqual(previous.high);expect(next.low).toBeLessThanOrEqual(p.potential);expect(next.high).toBeGreaterThanOrEqual(p.potential);previous=next;}expect(potentialEstimate(g,p)).toEqual(previous)}
});
it('charges scouts once and completes initial then detailed reports after matchweeks inside the digest',()=>{
 const initial=newCareer(),p=initial.market[0];let g=requestScout(initial,p.id);expect(g.cash).toBe(initial.cash-scoutCost(g,1));expect(()=>requestScout(g,p.id)).toThrow('progress');expect(g.scouting![p.id].level).toBe(0);g=playRound(assistantPick(g));expect(g.scouting![p.id].level).toBe(1);expect(g.scouting![p.id].pending).toBeUndefined();expect(g.inbox[0]).toContain('Scout report');
 const before=g.cash;g=requestScout(g,p.id);expect(g.cash).toBe(before-scoutCost(g,2));g=playRound(assistantPick(g));expect(g.scouting![p.id].level).toBe(2);expect(()=>requestScout(g,p.id)).toThrow('complete');expect(initial.scouting).toBeUndefined();
});
it('retains expired-listing reports without recreating listings and rejects unaffordable research',()=>{
 const initial=newCareer(),p=initial.market[0];expect(()=>requestScout({...initial,cash:1},p.id)).toThrow('funds');const g=requestScout(initial,p.id);g.market=[];processScouting(g);expect(g.scouting![p.id].level).toBe(1);expect(g.market).toEqual([]);expect(()=>requestScout(g,p.id)).toThrow('available');const count=g.inbox.length;processScouting(g);expect(g.inbox).toHaveLength(count);
});
it('generates stable personalities and gives family players appropriate perk preferences',()=>{
 const g=newCareer();let id='';for(let n=0;n<1000;n++)if(personality({id:'person-'+n})==='Family-focused'){id='person-'+n;break}expect(id).not.toBe('');expect(personality({id})).toBe(personality({id}));expect(perkAffinity({id},'holiday')).toBeGreaterThan(perkAffinity({id},'car'));expect(g.squad.map(personality)).toEqual(newCareer().squad.map(personality));
});
it('negotiates role promises consistently with quoted wages and preserves source state on rejection',()=>{
 const g=newCareer(),p=g.market[0],q=wageQuote(p,marketAsking(g,p),2,'holiday','Key player'),out=signPlayer(g,p.id,marketFee(g,p),q.minimum,2,'holiday','Key player');expect(out.squad.find(x=>x.id===p.id)?.squadRole).toBe('Key player');expect(()=>signPlayer(g,p.id,marketFee(g,p),q.minimum-1,2,'holiday','Key player')).toThrow('Counter-offer');expect(g.squad).toHaveLength(22);
});
it('changes morale for fulfilled and unmet promises while exempting unavailable games',()=>{
 const g=newCareer(),p=g.squad[0];p.squadRole='Key player';p.morale=60;for(let n=0;n<6;n++)settlePlayingTime(p,false);expect(p.morale).toBeLessThan(60);p.roleHistory=[];p.morale=60;for(let n=0;n<6;n++)settlePlayingTime(p,true);expect(p.morale).toBeGreaterThan(60);
 p.roleHistory=[false,false,false,false,false];p.suspension=1;const morale=p.morale;g.selection=g.selection.filter(id=>id!==p.id);settlePlayerManagement(g,{round:0,home:0,away:1,score:[0,0]});expect(p.roleHistory).toHaveLength(5);expect(p.morale).toBe(morale);
});
it('retains a sold player in all-time scoring and appearance records',()=>{
 const g=newCareer(),p=g.squad[0];p.stats=[{...emptyStats(g.season),appearances:123,goals:55}];const out=sellPlayer(g,p.id),records=careerRecords(out);expect(records.scorers[0]).toMatchObject({id:p.id,goals:55,appearances:123,status:'Transferred'});expect(out.squad.some(x=>x.id===p.id)).toBe(false);expect(g.clubHistory!.players).toEqual({});
});
it('records each match once with correct home/away result records',()=>{
 const g=newCareer(),p=g.squad.find(p=>p.position==='FWD'&&g.selection.includes(p.id))!,f:Fixture={round:0,home:0,away:1,score:[4,1],goals:Array.from({length:4},(_,n)=>({minute:10+n,teamId:0,playerName:p.name,playerId:p.id}))};recordPlayerMatch(g,f);recordPlayerMatch(g,f);recordPlayerMatch(g,{round:1,home:1,away:0,score:[5,0],goals:[]});const r=careerRecords(g);expect(r.matches).toBe(2);expect(r.biggestWin).toMatchObject({goals:4,against:1,home:true});expect(r.biggestDefeat).toMatchObject({goals:0,against:5,home:false});expect(r.scorers[0].goals).toBe(4);
});
it('retires qualifying expiring veterans into the legends archive at season rollover',()=>{
 const g=newCareer(),p=g.squad[0];p.age=37;p.contract=1;p.stats=[{...emptyStats(g.season),appearances:150,goals:0}];for(const f of g.fixtures)f.score=[0,0];g.round=42;const next=nextSeason(g);expect(next.squad.some(x=>x.id===p.id)).toBe(false);expect(careerRecords(next).legends[0]).toMatchObject({id:p.id,status:'Retired',appearances:150});expect(clubHonours(next)).toHaveLength(1);
});
it('migrates available historic results and stats without inventing old departed-player records',()=>{
 const g=playRound(newCareer()),before=structuredClone(g);delete g.clubHistory;const loaded=migrateCareer(g);expect(careerRecords(loaded).matches).toBe(1);expect(loaded.fixtures).toEqual(before.fixtures);expect(loaded.cash).toBe(before.cash);expect(loaded.squad).toEqual(before.squad);expect(migrateCareer(loaded)).toEqual(loaded);
});
it('persists pending scouts, contract roles and departed-player records through save/load',async()=>{
 let g=newCareer();g.squad[0].squadRole='Rotation';g.squad[0].roleHistory=[true,false];g=requestScout(g,g.market[0].id);const p={...g.squad[1],stats:[{...emptyStats(g.season),appearances:100,goals:50}]};archivePlayer(g,p,'Retired');await saveCareer(g,'scouting-history');expect(await loadCareer('scouting-history')).toEqual(g);
});
it('derives only earned league and playoff trophies from season records',()=>{
 const g=newCareer();g.competition!.history=[{season:2026,tier:8,position:1,points:90,outcome:'Promoted',nextTier:7,prize:16000,playoffWinner:'Other'},{season:2027,tier:7,position:3,points:80,outcome:'Promoted',nextTier:6,prize:28000,playoffWinner:'Dragons'},{season:2028,tier:6,position:10,points:50,outcome:'Stayed in division',nextTier:6,prize:11000,playoffWinner:'Other'}];expect(clubHonours(g)).toHaveLength(2);expect(clubHonours(g).map(h=>h.kind)).toEqual(['League title','Playoff winners']);
});
