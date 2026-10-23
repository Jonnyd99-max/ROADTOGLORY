import {newCareer,nextSeason} from './testCareer';
import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {playRound,assistantPick,validTeam,migrateCareer} from './engine';
import {gameMonth,monthlyMarket,refreshMarket,sellPlayer,saleOffer,loanPlayer,recallPlayer} from './market';
import {saveCareer,loadCareer} from './storage';

it('generates a repeatable 32-player monthly market across every position',()=>{
 const g=newCareer();expect(g.market).toHaveLength(32);expect(monthlyMarket(g)).toEqual(g.market);
 expect(new Set(g.market.map(p=>p.id)).size).toBe(32);expect(new Set(g.market.map(p=>p.name)).size).toBe(32);
 expect(new Set(g.market.map(p=>p.position)).size).toBe(4);
 expect(monthlyMarket({...g,seed:42})).not.toEqual(g.market);
 let next=g;for(let i=0;i<3;i++)next=playRound(assistantPick(next));expect(next.market).toEqual(g.market);
 next=playRound(assistantPick(next));expect(gameMonth(next)).toBe('2026-09');expect(next.market).toHaveLength(32);
 expect(next.market.every(p=>!g.market.some(old=>old.id===p.id))).toBe(true);
 const snapshot=structuredClone(next);refreshMarket(next);expect(next).toEqual(snapshot);
});
it('extends legacy markets once without removing existing listings or duplicating signed players',()=>{
 const old=newCareer();old.market=old.market.slice(0,9);delete old.marketMonth;
 const owned=old.market.pop()!;old.squad.push(owned);
 const updated=migrateCareer(old);expect(updated.market).toHaveLength(32-1); // 32 total unique generated players, one now owned
 expect(updated.market.some(p=>p.id===owned.id)).toBe(false);
 expect(old.market.every(p=>updated.market.some(x=>x.id===p.id))).toBe(true);
 expect(migrateCareer(updated)).toEqual(updated);
});
it('sells players once, updates selection, finances and mail, and protects squad cover',()=>{
 const initial=newCareer(),id=initial.squad[0].id,offer=saleOffer(initial,initial.squad[0]);
 const sold=sellPlayer(initial,id);expect(sold.cash).toBe(initial.cash+offer.fee);expect(sold.squad).toHaveLength(21);expect(sold.selection).not.toContain(id);expect(sold.ledger[0].amount).toBe(offer.fee);expect(sold.inbox[0]).toContain('Player sold');expect(initial.squad).toHaveLength(22);
 expect(()=>sellPlayer(sold,id)).toThrow('unavailable');expect(()=>sellPlayer(sold,initial.squad[1].id)).toThrow('Keep enough');
 expect(sellPlayer({...initial,cash:-20000},id).cash).toBe(-20000+offer.fee);
});
it('loans exclude players from selection and assistant picks and pay exactly half wages weekly',async()=>{
 const initial=newCareer(),id=initial.squad[0].id;let g=loanPlayer(initial,id,4);const p=g.squad.find(p=>p.id===id)!;
 expect(p.loan?.returnRound).toBe(4);expect(g.selection).not.toContain(id);expect(g.cash).toBe(initial.cash);
 expect(validTeam({...g,selection:initial.selection})).toBe(false);
 g=assistantPick(g);expect(g.selection).not.toContain(id);expect(validTeam(g)).toBe(true);
 const after=playRound(g);expect(after.squad.find(p=>p.id===id)!.loan?.weeksPlayed).toBe(1);
 expect(after.ledger.find(t=>t.label.startsWith('Loan wage'))?.amount).toBe(Math.floor(p.wage*.5));
 expect(after.cash).toBe(initial.cash+after.ledger.reduce((sum,t)=>sum+t.amount,0));
 expect(()=>loanPlayer(g,id,4)).toThrow('Recall');expect(()=>sellPlayer(g,id)).toThrow('Recall');
 await saveCareer(after,'loan');expect(await loadCareer('loan')).toEqual(after);
});
it('loans develop deterministically and return automatically with baseline growth preserved',()=>{
 const start=newCareer(),id=start.squad[0].id;start.squad[0].age=18;start.squad[0].potential=90;
 const run=()=>{let g=assistantPick(loanPlayer(start,id,12));for(let i=0;i<12;i++)g=playRound(assistantPick(g));return g};
 const result=run(),p=result.squad.find(p=>p.id===id)!;
 expect(result).toEqual(run());expect(p.loan).toBeUndefined();expect(p.ability).toBeGreaterThan(start.squad[0].ability);expect(p.ability).toBeLessThanOrEqual(p.potential);expect(p.startingAbility).toBe(start.squad[0].startingAbility);
 expect(result.ledger.filter(t=>t.label.startsWith('Loan wage'))).toHaveLength(12);expect(result.inbox.some(m=>m.includes('Loan completed'))).toBe(true);
});
it('recalls cleanly, caps growth at potential, and finishes late-season loans before ageing',()=>{
 const start=newCareer(),id=start.squad[0].id;start.squad[0].potential=start.squad[0].ability;
 let g=assistantPick(loanPlayer(start,id,8));g=playRound(assistantPick(g));expect(g.squad[0].ability).toBe(start.squad[0].ability);
 g=recallPlayer(g,id);expect(g.squad[0].loan).toBeUndefined();expect(()=>recallPlayer(g,id)).toThrow('not on loan');
 const after=playRound(g);expect(after.ledger.filter(t=>t.label.startsWith('Loan wage'))).toHaveLength(1);
 let late={...newCareer(),round:40};late=assistantPick(loanPlayer(late,id,12));expect(late.squad[0].loan!.returnRound).toBe(42);
 late=playRound(playRound(late));expect(late.squad[0].loan).toBeUndefined();expect(nextSeason(late).squad.every(p=>!p.loan)).toBe(true);
 expect(()=>loanPlayer({...newCareer(),round:42},id,4)).toThrow('next season');expect(()=>loanPlayer(start,id,3)).toThrow('4, 8 or 12');
});
