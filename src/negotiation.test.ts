import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {newCareer,signPlayer,renew} from './engine';
import {signFreeAgent} from './seasonMarket';
import {wageQuote,perks,type Perk} from './negotiation';
import {saveCareer,loadCareer} from './storage';
it('quotes deterministic perks with a 35 percent cap and a contract-length tradeoff',()=>{
 const p=newCareer().market[0];
 for(const perk of Object.keys(perks) as Perk[]){const q=wageQuote(p,200,1,perk);expect(q).toEqual(wageQuote(p,200,1,perk));expect(q.minimum).toBeGreaterThanOrEqual(130);expect(q.cost).toBe(perks[perk].cost)}
 expect(wageQuote(p,1000,1,'holiday').reduction).toBeGreaterThan(wageQuote(p,1000,3,'holiday').reduction);
});
it('negotiates a paid signing with lower wages and charges the perk exactly once',()=>{
 const g=newCareer(),p=g.market[0],fee=p.ability*110,q=wageQuote(p,p.wage,2,'holiday');
 const out=signPlayer(g,p.id,fee,q.minimum,2,'holiday');
 expect(out.cash).toBe(g.cash-fee-q.cost);expect(out.squad.find(x=>x.id===p.id)?.wage).toBe(q.minimum);expect(out.ledger.filter(t=>t.label.startsWith('Contract perk'))).toHaveLength(1);
 expect(()=>signPlayer(out,p.id,fee,q.minimum,2,'holiday')).toThrow('unavailable');expect(g.cash).toBe(75000);
});
it('rejects low, invalid or unaffordable packages without changing the source career',()=>{
 const g=newCareer(),p=g.market[0],before=structuredClone(g),q=wageQuote(p,p.wage,2,'holiday');
 expect(()=>signPlayer(g,p.id,p.ability*110,q.minimum-1,2,'holiday')).toThrow('Counter-offer');
 expect(()=>signPlayer(g,p.id,p.ability*110,NaN,2,'holiday')).toThrow('rejected');
 expect(()=>signPlayer(g,p.id,p.ability*110,q.minimum,2,'invalid' as Perk)).toThrow('valid');
 expect(()=>signPlayer({...g,cash:p.ability*110+1499},p.id,p.ability*110,q.minimum,2,'holiday')).toThrow('funds');
 expect(g).toEqual(before);
});
it('uses perks for renewals while retaining weekly wage budget checks',()=>{
 const g=newCareer(),p=g.squad[0],q=wageQuote(p,Math.ceil(p.wage*1.1),3,'car'),out=renew(g,p.id,q.minimum,3,'car');
 expect(out.cash).toBe(g.cash-8000);expect(out.squad[0].wage).toBe(q.minimum);expect(()=>renew(g,p.id,3000,3,'car')).toThrow('budget');expect(g.squad[0].wage).toBe(p.wage);
});
it('preserves a free-agent perk package through save/load and reserves only weekly wages',async()=>{
 const g=newCareer(),p=g.seasonMarkets!.freeAgents[0],q=wageQuote(p,p.wage,2,'holiday'),out=signFreeAgent(g,p.id,q.minimum,2,'holiday');
 expect(out.cash).toBe(g.cash-1500);expect(out.squad.find(x=>x.id===p.id)?.contractPackage).toEqual({perk:'holiday',cost:1500,years:2,wage:q.minimum});
 await saveCareer(out,'perks-test');expect(await loadCareer('perks-test')).toEqual(out);
});
it('accepts any whole-pound wage above the package counter-offer',()=>{
 const g=newCareer(),p=g.market[0],q=wageQuote(p,p.wage,2,'car');const out=signPlayer(g,p.id,p.ability*110,q.minimum+3,2,'car');expect(out.squad.find(x=>x.id===p.id)?.wage).toBe(q.minimum+3);
});
