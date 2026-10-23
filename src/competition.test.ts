import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {newCareer,playRound,nextSeason,table,assistantPick,migrateCareer,signPlayer,type Career,type Fixture} from './engine';
import {fixturesFor,prepareFinale,playPlayoff,playoffPending,resolveDraw,fixtureWinner,otherTable} from './competition';
import {division,tierOf} from './division';
import {processClubMatch,upgradeFacility,stadiumCapacity} from './club';
import {saveCareer,loadCareer} from './storage';

function ranked(tier:7|8,position:number){
 const g=newCareer(81);g.squad.forEach(p=>p.contract=3);
 if(tier===7){const upper=g.competition!.other.clubs,lower=g.clubs;g.tier=7;g.clubs=[lower[0],...upper.slice(0,21)];g.competition!.other={tier:8,clubs:[...lower.slice(1),upper[21]],fixtures:[]}}
 g.fixtures=fixturesFor(g.clubs);g.competition!.other.fixtures=fixturesFor(g.competition!.other.clubs);
 const order=g.clubs.filter(c=>c.id!==0).map(c=>c.id);order.splice(position-1,0,0);
 for(const f of g.fixtures)f.score=order.indexOf(f.home)<order.indexOf(f.away)?[2,0]:[0,2];
 for(const f of g.competition!.other.fixtures)f.score=f.home<f.away?[1,0]:[0,1];
 g.round=42;return g;
}
it('simulates both 22-club divisions in parallel without duplicating club income',()=>{
 const g=playRound(newCareer());expect(new Set([...g.clubs,...g.competition!.other.clubs].map(c=>c.id)).size).toBe(44);
 expect(g.competition!.other.fixtures.filter(f=>f.score)).toHaveLength(11);expect(otherTable(g).every(c=>c.played===1)).toBe(true);
 expect(g.ledger.filter(t=>t.label.includes('match payment'))).toHaveLength(1);expect(g.club!.history).toHaveLength(1);
});
it('promotes champions, swaps clubs and runs non-contiguous club IDs next season',()=>{
 const g=ranked(8,1),next=nextSeason(g);expect(tierOf(next)).toBe(7);expect(next.competition!.history[0]).toMatchObject({position:1,outcome:'Promoted',prize:16000});expect(next.cash).toBe(g.cash+16000);
 const all=[...next.clubs,...next.competition!.other.clubs];expect(all).toHaveLength(44);expect(new Set(all.map(c=>c.id)).size).toBe(44);expect(next.clubs.some(c=>c.id===0)).toBe(true);expect(next.competition!.other.clubs.some(c=>c.id===0)).toBe(false);
 expect(next.clubs).toHaveLength(22);expect(next.competition!.other.clubs).toHaveLength(22);
 for(const f of next.fixtures){expect(next.clubs.some(c=>c.id===f.home)).toBe(true);expect(next.clubs.some(c=>c.id===f.away)).toBe(true)}
 expect(playRound(assistantPick(next)).round).toBe(1);expect(()=>nextSeason(next)).toThrow('Finish the season');
});
it('relegates Tier 7 bottom two while honouring existing player contracts',()=>{
 const g=ranked(7,22);g.squad.forEach(p=>p.wage=190);const next=nextSeason(g);expect(tierOf(next)).toBe(8);expect(next.competition!.history[0].outcome).toBe('Relegated');expect(division(next).wageBudget).toBe(2600);expect(next.squad.every(p=>p.wage===190)).toBe(true);
 const p=next.market[0];expect(()=>signPlayer(next,p.id,p.ability*110,p.wage,2)).toThrow('budget');expect(playRound(assistantPick(next)).round).toBe(1);
});
it('promotes Tier 7 champions to Tier 6 with the correct prize',()=>{
 const next=nextSeason(ranked(7,1));expect(tierOf(next)).toBe(6);expect(next.competition!.history[0]).toMatchObject({outcome:'Promoted',prize:36000});
});
it('requires playable promotion ties and preserves the league table and saves',async()=>{
 const g=ranked(8,2);prepareFinale(g);expect(playoffPending(g)).toBe(true);expect(()=>nextSeason(g)).toThrow('playoffs');expect(()=>playPlayoff({...g,selection:[]})).toThrow('Select 11');
 const rows=table(g),after=playPlayoff(g);expect(after).toEqual(playPlayoff(g));expect(after.round).toBe(42);expect(after.postseasonWeeks).toBe(1);expect(table(after)).toEqual(rows);expect(after.competition!.playoffs!.fixtures.filter(f=>f.round===42&&f.score)).toHaveLength(2);
 await saveCareer(after,'playoffs');expect(await loadCareer('playoffs')).toEqual(after);
 let completed=after;while(playoffPending(completed))completed=playPlayoff(completed);
 const winner=completed.competition!.playoffs!.winner,next=nextSeason(completed);expect(tierOf(next)).toBe(winner===0?7:8);expect(next.competition!.history).toHaveLength(1);expect(next.ledger.filter(t=>t.label.includes('season prize'))).toHaveLength(1);
});
it('resolves drawn knockout matches on deterministic penalties without altering regulation goals',()=>{
 const g=newCareer(),f:Fixture={round:43,home:1,away:0,score:[1,1]},copy=structuredClone(f);resolveDraw(g,f);resolveDraw(g,copy);expect(f).toEqual(copy);expect(f.score).toEqual([1,1]);expect(f.decidedBy).toBe('penalties');expect([0,1]).toContain(fixtureWinner(f));
});
it('can win two player-controlled ties and earn playoff promotion and its bonus',()=>{
 let winner:Career|undefined;
 for(let seed=1;seed<=100&&!winner;seed++){let g=assistantPick(ranked(8,2));g.seed=seed;prepareFinale(g);while(playoffPending(g))g=playPlayoff(assistantPick(g));if(g.competition!.playoffs!.winner===0)winner=g}
 expect(winner).toBeDefined();expect(winner!.postseasonWeeks).toBe(2);const next=nextSeason(winner!);expect(tierOf(next)).toBe(7);expect(next.competition!.history[0]).toMatchObject({position:2,outcome:'Promoted',prize:12000});
});
it('applies Tier 7 sponsorship, ticket prices, running costs and fan growth to the ledger',()=>{
 const g=ranked(7,1);g.round=0;processClubMatch(g,{round:0,home:0,away:g.clubs[1].id,score:[2,0]});const report=g.club!.history[0];expect(report.sponsorBase+report.sponsorBonus).toBe(850);expect(g.ledger.filter(t=>t.label.includes('Manchester Trade')).reduce((n,t)=>n+t.amount,0)).toBe(850);expect(report.tickets).toBe(report.attendance*11);expect(report.fansAfter-report.fansBefore).toBe(60);expect(report.runningCosts).toBe(2200);expect(report.matchCosts).toBe(Math.round(report.attendance*3.2));expect(g.cash).toBe(75000+g.ledger.reduce((n,t)=>n+t.amount,0));
});
it('migrates unseen division results without changing existing fixtures or cash',()=>{
 let g=newCareer();for(let i=0;i<5;i++)g=playRound(assistantPick(g));delete g.competition;delete g.tier;delete g.postseasonWeeks;
 const migrated=migrateCareer(g);expect(migrated.fixtures).toEqual(g.fixtures);expect(migrated.cash).toBe(g.cash);expect(migrated.ledger).toEqual(g.ledger);expect(otherTable(migrated).every(c=>c.played===5)).toBe(true);expect(migrateCareer(migrated)).toEqual(migrated);
});
it('unlocks larger grounds in Tier 7 without resizing existing stands on relegation',()=>{
 let g:Career={...newCareer(),cash:500000,tier:7};for(let i=0;i<4;i++)g=upgradeFacility(g,'stadium');expect(stadiumCapacity(g)).toBe(4000);g.tier=8;expect(stadiumCapacity(g)).toBe(4000);expect(()=>upgradeFacility(g,'stadium')).toThrow('fully upgraded');
});

