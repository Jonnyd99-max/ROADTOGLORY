import {newCareer,nextSeason} from './testCareer';
import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {playRound,migrateCareer,table,assistantPick,type Career} from './engine';
import {leagueDivisions,fixturesFor,prepareFinale,playPlayoff,playoffPending} from './competition';
import {tiers,divisions,type Tier} from './division';
import {saveCareer,loadCareer} from './storage';
function rank(g:Career,position:number){
 const all=leagueDivisions(g);for(const d of all){const order=d.clubs.filter(c=>c.id!==0).map(c=>c.id);if(d.tier===g.tier)order.splice(position-1,0,0);for(const f of d.fixtures)f.score=order.indexOf(f.home)<order.indexOf(f.away)?[2,0]:[0,2];}
 g.round=42;delete g.competition!.brackets;delete g.competition!.playoffs;return g;
}
function career(tier:Tier,position:number){
 const g=newCareer(81),all=leagueDivisions(g);g.squad.forEach(p=>p.contract=100);
 const target=all.find(d=>d.tier===tier)!,bottom=all.find(d=>d.tier===8)!;
 if(tier!==8){const replaced=target.clubs[0];target.clubs[0]=bottom.clubs[0];bottom.clubs[0]=replaced;target.fixtures=fixturesFor(target.clubs);bottom.fixtures=fixturesFor(bottom.clubs);}
 g.tier=tier;g.clubs=target.clubs;g.fixtures=target.fixtures;g.competition!.divisions=all.filter(d=>d.tier!==tier);g.competition!.other=all.find(d=>d.tier===(tier===8?7:tier+1))!;
 return rank(g,position);
}
function check(g:Career){const all=leagueDivisions(g);expect(all).toHaveLength(8);const ids=all.flatMap(d=>d.clubs.map(c=>c.id));expect(ids).toHaveLength(176);expect(new Set(ids).size).toBe(176);expect(ids.filter(id=>id===0)).toHaveLength(1);for(const d of all){expect(d.clubs).toHaveLength(22);expect(d.fixtures).toHaveLength(462);expect(d.fixtures.every(f=>d.clubs.some(c=>c.id===f.home)&&d.clubs.some(c=>c.id===f.away))).toBe(true)}}
it('promotes champions at every boundary and relegates the bottom two at every upper tier',()=>{
 for(const tier of tiers){const g=career(tier,1),next=nextSeason(g);expect(next.tier).toBe(Math.max(1,tier-1));check(next);expect(next.competition!.history[0].prize).toBe(divisions[tier].prizes[0]+divisions[tier].promotionBonus);}
 for(const tier of tiers){const g=career(tier,22),next=nextSeason(g);expect(next.tier).toBe(Math.min(8,tier+1));check(next)}
});
it('supports an entire climb to Tier 1 and relegation back to Tier 8 without losing club identity',()=>{
 let g=newCareer();g.squad.forEach(p=>p.contract=100);
 for(let tier=7;tier>=1;tier--){g=nextSeason(rank(g,1));expect(g.tier).toBe(tier);check(g)}
 for(let tier=2;tier<=8;tier++){g=nextSeason(rank(g,22));expect(g.tier).toBe(tier);check(g)}
 expect(g.competition!.history).toHaveLength(14);expect(g.ledger.filter(t=>t.label.includes('season prize'))).toHaveLength(14);
});
it('plays promotion semifinals and final in Tier 7 to earn Tier 6 football',()=>{
 let g=assistantPick(career(7,2));const rows=table(g);prepareFinale(g);expect(playoffPending(g)).toBe(true);expect(()=>nextSeason(g)).toThrow('playoffs');
 while(playoffPending(g)){const p=g.competition!.playoffs!,round=p.stage==='semifinals'?42:43,f=p.fixtures.find(f=>f.round===round&&(f.home===0||f.away===0))!;g=playPlayoff(assistantPick(g),{...f,score:f.home===0?[3,0]:[0,3]});}
 expect(g.competition!.playoffs!.winner).toBe(0);expect(table(g)).toEqual(rows);expect(nextSeason(g).tier).toBe(6);
});
it('preserves a legacy Tier 7 season and an old Tier 8 playoff bracket during migration',async()=>{
 const g=career(7,2);prepareFinale(g);const old=g.competition!;delete old.brackets;delete old.divisions;old.playoffs={stage:'complete',fixtures:[],winner:old.other.clubs[1].id};
 const before=structuredClone(g),loaded=migrateCareer(g);expect(loaded.fixtures).toEqual(before.fixtures);expect(loaded.cash).toBe(before.cash);expect(loaded.ledger).toEqual(before.ledger);expect(loaded.squad).toEqual(before.squad);expect(loaded.competition!.brackets![8]).toEqual(before.competition!.playoffs);expect(loaded.competition!.playoffs!.stage).toBe('semifinals');check(loaded);
 await saveCareer(loaded,'pyramid');expect(await loadCareer('pyramid')).toEqual(loaded);expect(migrateCareer(loaded)).toEqual(loaded);
});
it('moves every AI club at most one tier and exactly two clubs across each boundary',()=>{
 const g=career(8,10),before=leagueDivisions(g),locations=new Map(before.flatMap(d=>d.clubs.map(c=>[c.id,d.tier] as const))),next=nextSeason(g);check(next);
 for(const d of leagueDivisions(next)){let up=0,down=0;for(const c of d.clubs){const old=locations.get(c.id)!;expect(Math.abs(old-d.tier)).toBeLessThanOrEqual(1);if(old>d.tier)up++;if(old<d.tier)down++;}expect(up).toBe(d.tier<8?2:0);expect(down).toBe(d.tier>1?2:0)}
});
it('simulates all divisions without extra Dragons wages or commercial charges',()=>{
 const g=newCareer();g.round=5;const copy=migrateCareer(g);for(const d of leagueDivisions(copy).filter(d=>d.tier!==8))expect(d.fixtures.filter(f=>f.score)).toHaveLength(55);expect(copy.cash).toBe(g.cash);expect(copy.ledger).toEqual(g.ledger);
});

it('plays the next league match after Tier 6 promotion and applies its budget and income',()=>{
 const next=nextSeason(career(7,1));expect(divisions[next.tier!].wageBudget).toBe(8000);
 const played=playRound(assistantPick(next));expect(played.round).toBe(1);expect(played.club!.history[0].tier).toBe(6);expect(played.club!.history[0].sponsorBase).toBe(1400);expect(played.cash).toBe(75000+played.ledger.reduce((n,t)=>n+t.amount,0));
});
