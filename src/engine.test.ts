import {describe,it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {newCareer,schedule,playRound,table,transact} from './engine';
import {saveCareer,loadCareer} from './storage';
describe('vertical slice',()=>{
it('schedules 22 clubs home and away over 42 rounds',()=>{const fs=schedule();expect(fs).toHaveLength(462);for(let r=0;r<42;r++){const round=fs.filter(f=>f.round===r);expect(new Set(round.flatMap(f=>[f.home,f.away])).size).toBe(22)}for(let a=0;a<22;a++)for(let b=0;b<22;b++)if(a!==b)expect(fs.filter(f=>f.home===a&&f.away===b)).toHaveLength(1)});
it('plays deterministic results without mutating the source',()=>{const g=newCareer();expect(playRound(g)).toEqual(playRound(g));expect(g.round).toBe(0);expect(playRound(g).fixtures.filter(f=>f.score)).toHaveLength(11)});
it('updates standings, wages, gate income and saves the loop',async()=>{const g=playRound(newCareer());expect(table(g).every(t=>t.played===1)).toBe(true);expect(table(g).reduce((s,t)=>s+t.gf,0)).toBe(table(g).reduce((s,t)=>s+t.ga,0));expect(g.cash).toBe(75000+g.ledger.reduce((s,t)=>s+t.amount,0));await saveCareer(g);expect(await loadCareer()).toEqual(g)});
it('rejects invalid financial transactions',()=>{const g=newCareer();expect(()=>transact(g,'bad',-75001)).toThrow();expect(()=>transact(g,'bad',NaN)).toThrow();expect(g.cash).toBe(75000)});
it('awards wins, draws and goal difference correctly',()=>{const g=newCareer();g.fixtures=[{round:0,home:0,away:1,score:[3,1]},{round:1,home:1,away:0,score:[2,2]}];expect(table(g).find(t=>t.id===0)).toMatchObject({points:4,won:1,drawn:1,gd:2,gf:5,ga:3})});
});
