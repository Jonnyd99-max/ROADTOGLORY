import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {newCareer,playRound,migrateCareer,nextSeason,type Career} from './engine';
import {clubState,processClubMatch,upgradeFacility,stadiumCapacity,trainingChance,recoveryPoints,weeklyUpkeep,facilities,upgradeQuote} from './club';
import {saveCareer,loadCareer} from './storage';

function result(score:[number,number],home=true){const g=newCareer();processClubMatch(g,{round:0,home:home?0:1,away:home?1:0,score});return g}
it('wins and draws attract fans, losses reduce fans with a floor',()=>{
 expect(clubState(result([2,0])).fans).toBe(1045);expect(clubState(result([1,1])).fans).toBe(1012);expect(clubState(result([0,2])).fans).toBe(992);
 const g=newCareer();g.club!.fans=250;processClubMatch(g,{round:0,home:0,away:1,score:[0,1]});expect(g.club!.fans).toBe(250);
});
it('pays league-sized sponsor income per game with correct home and away result bonuses',()=>{
 const cases:[number,number,boolean,number][]=[[2,0,true,400],[1,1,true,300],[0,2,true,250],[0,2,false,400],[1,1,false,300],[2,0,false,250]];
 for(const [a,b,home,total] of cases){const g=result([a,b],home);expect(g.ledger.filter(t=>t.label.startsWith('Manchester Trade')).reduce((sum,t)=>sum+t.amount,0)).toBe(total);if(!home)expect(g.club!.history[0].attendance).toBe(0)}
 const g=result([1,0]);const snapshot=structuredClone(g);expect(()=>processClubMatch(g,{round:0,home:0,away:1,score:[1,0]})).toThrow('already processed');expect(g).toEqual(snapshot);
});
it('caps crowds at actual stadium capacity and records unmet demand and ticket income',()=>{
 const g=newCareer();g.club!.fans=5000;processClubMatch(g,{round:0,home:0,away:1,score:[1,0]});expect(g.club!.history[0]).toMatchObject({attendance:1200,capacity:1200,tickets:10800});expect(g.club!.history[0].turnedAway).toBeGreaterThan(0);
 let expanded=upgradeFacility(newCareer(),'stadium');expanded.club!.fans=5000;processClubMatch(expanded,{round:0,home:0,away:1,score:[1,0]});expect(expanded.club!.history[0].attendance).toBe(1450);expect(stadiumCapacity(expanded)).toBe(1450);
 const low=newCareer();low.club!.fans=300;processClubMatch(low,{round:0,home:0,away:1,score:[1,0]});expect(low.club!.history[0].attendance).toBeLessThan(g.club!.history[0].attendance);
});
it('food and drink generate net income only at home with separate upkeep',()=>{
 const build=()=>upgradeFacility(upgradeFacility(newCareer(),'food'),'drink');
 const home=build(),away=build();processClubMatch(home,{round:0,home:0,away:1,score:[1,0]});processClubMatch(away,{round:0,home:1,away:0,score:[0,1]});
 const report=home.club!.history[0];expect(report.food).toBe(Math.floor(report.attendance*.55));expect(report.drink).toBe(Math.floor(report.attendance*.45));expect(report.upkeep).toBe(65);
 expect(away.club!.history[0]).toMatchObject({food:0,drink:0,tickets:0,upkeep:65});
 expect(home.cash).toBe(75000+home.ledger.reduce((s,t)=>s+t.amount,0));expect(away.cash).toBe(75000+away.ledger.reduce((s,t)=>s+t.amount,0));
});
it('charges exact upgrade prices, upkeep and caps levels without mutating input',()=>{
 const initial=newCareer(),upgraded=upgradeFacility(initial,'training');expect(upgraded.cash).toBe(63000);expect(initial.club!.facilities.training).toBe(0);expect(upgraded.club!.facilities.training).toBe(1);expect(weeklyUpkeep(upgraded)).toBe(75);
 expect(()=>upgradeFacility({...initial,cash:11999},'training')).toThrow('Insufficient');
 let rich={...newCareer(),cash:1000000};for(const kind of facilities){for(let i=0;i<3;i++)rich=upgradeFacility(rich,kind);expect(upgradeQuote(rich,kind).maxed).toBe(true);expect(()=>upgradeFacility(rich,kind)).toThrow('fully upgraded')}
 expect(stadiumCapacity(rich)).toBe(2750);expect(rich.cash).toBe(1000000+rich.ledger.reduce((sum,t)=>sum+t.amount,0));
 expect(()=>upgradeFacility(initial,'invalid' as never)).toThrow('Unknown');
});
it('training improves the real development probability and recovery improves actual fitness',()=>{
 const g=newCareer(),young=g.squad.find(p=>p.age<25)!;const trained=upgradeFacility(g,'training');expect(trainingChance(trained,young)).toBeCloseTo(trainingChance(g,young)+.04);expect(trainingChance(trained,{...young,age:30})).toBe(0);expect(trainingChance(trained,{...young,ability:young.potential})).toBe(0);
 g.squad.forEach(p=>p.fitness=60);const recovered=upgradeFacility(g,'recovery');expect(recoveryPoints(recovered)).toBe(recoveryPoints(g)+3);
 const base=playRound(g),better=playRound(recovered);for(const p of base.squad)expect(better.squad.find(x=>x.id===p.id)!.fitness).toBe(p.fitness+3);
});
it('applies facilities, fan and sponsor effects once in the saved match loop',async()=>{
 let g=upgradeFacility(upgradeFacility(newCareer(),'food'),'training');g=playRound(g);expect(g.club!.history).toHaveLength(1);expect(g.cash).toBe(75000+g.ledger.reduce((sum,t)=>sum+t.amount,0));
 expect(g.ledger.filter(t=>t.label==='Facilities upkeep')).toHaveLength(1);await saveCareer(g,'club');expect(await loadCareer('club')).toEqual(g);
});
it('migrates prior results into fans without retroactive payments or changing existing progress',()=>{
 const old=newCareer();delete old.club;old.fixtures[0].score=[2,0];old.round=1;const migrated=migrateCareer(old);expect(clubState(migrated).fans).toBe(1045);expect(migrated.cash).toBe(old.cash);expect(migrated.ledger).toEqual(old.ledger);expect(migrated.fixtures).toEqual(old.fixtures);expect(migrated.club!.history).toEqual([]);expect(migrateCareer(migrated)).toEqual(migrated);
});
it('retains club upgrades and fans across seasons without the old annual sponsor grant',()=>{
 let g:Career=upgradeFacility(newCareer(),'stadium');for(let i=0;i<42;i++)g=playRound(g);const next=nextSeason(g);expect(next.club).toEqual(g.club);expect(next.cash).toBe(g.cash);expect(next.ledger.some(t=>t.label==='Annual sponsorship')).toBe(false);
});
