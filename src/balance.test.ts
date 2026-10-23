import {newCareer,nextSeason} from './testCareer';
import {it,expect} from 'vitest';
import {writeFileSync,mkdirSync} from 'node:fs';
import {assistantPick,playRound,table,type Career} from './engine';
import {playoffPending,playPlayoff} from './competition';
import {clubState,upgradeFacility,forecastDemand,stadiumCapacity} from './club';

// Controlled benchmark: fixed squad, no trading, no expired contracts.
// Form/morale are held neutral to isolate economy; availability and rotation remain active.
it('runs repeatable three-season economy benchmarks',()=>{
 const samples=[];
 for(const seed of [17,81,2026,2040,9901]){
  let g:Career=newCareer(seed);g.training='Youth development';g.squad.forEach(p=>p.contract=10);
  for(let season=0;season<3;season++){
   for(let week=0;week<42;week++){
    for(const p of g.squad){p.morale=60;p.recentRatings=[]}
    for(const kind of ['recovery','food','drink','training','stadium'] as const){
     if(kind==='stadium'&&forecastDemand(g)<stadiumCapacity(g))continue;
     try{const upgraded=upgradeFacility(g,kind);if(upgraded.cash>=25000)g=upgraded}catch{/* retain a cash reserve */}
    }
    g=playRound(assistantPick(g));
   }
   while(playoffPending(g))g=playPlayoff(assistantPick(g));
   samples.push({seed,season:g.season,tier:g.tier,cash:g.cash,fans:clubState(g).fans,position:table(g).findIndex(c=>c.id===0)+1,averageAbility:+(g.squad.reduce((n,p)=>n+p.ability,0)/g.squad.length).toFixed(1),capacity:stadiumCapacity(g)});
   expect(g.cash).toBe(75000+g.ledger.reduce((n,t)=>n+t.amount,0));
   if(season<2)g=nextSeason(g);
  }
 }
 mkdirSync('reports',{recursive:true});
 writeFileSync('reports/balance-latest.json',JSON.stringify(samples,null,2)+'\n');
 console.log(JSON.stringify(samples));
 expect(Math.max(...samples.filter(s=>s.season===2028).map(s=>s.cash))).toBeLessThan(200000);
 expect(Math.min(...samples.map(s=>s.cash))).toBeGreaterThan(0);
},90000);

