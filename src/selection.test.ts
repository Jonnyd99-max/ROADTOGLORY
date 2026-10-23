import {newCareer} from './testCareer';
import {it,expect} from 'vitest';
import {orderedSquad,assistantPick,validTeam,positionOrder,signPlayer} from './engine';
it('groups a new signing with his position and orders by current ability',()=>{
 const initial=newCareer(),p=initial.market[0],g=signPlayer(initial,p.id,p.ability*110,p.wage,2),snapshot=structuredClone(g.squad);
 const sorted=orderedSquad(g.squad);expect(g.squad).toEqual(snapshot);
 expect(sorted.map(p=>positionOrder.indexOf(p.position))).toEqual(sorted.map(p=>positionOrder.indexOf(p.position)).sort((a,b)=>a-b));
 for(const pos of positionOrder){const group=sorted.filter(p=>p.position===pos);expect(group.map(p=>p.ability)).toEqual(group.map(p=>p.ability).sort((a,b)=>b-a))}
 expect(sorted.filter(x=>x.position===p.position).some(x=>x.id===p.id)).toBe(true);
});
it.each(['4-4-2','4-3-3','3-5-2','5-3-2'])('assistant picks highest-rated legal XI for %s',formation=>{
 const original={...newCareer(),formation},g=assistantPick(original);expect(validTeam(g)).toBe(true);expect(g.selection).toHaveLength(11);expect(new Set(g.selection).size).toBe(11);
 const required=[1,...formation.split('-').map(Number)];
 positionOrder.forEach((pos,i)=>{const expected=orderedSquad(g.squad).filter(p=>p.position===pos).slice(0,required[i]).map(p=>p.id);expect(g.selection.filter(id=>g.squad.find(p=>p.id===id)!.position===pos)).toEqual(expected)});
 expect(original.selection).toEqual(newCareer().selection);expect(assistantPick(original).selection).toEqual(g.selection);
});
it('reports shortages without changing the current XI',()=>{
 const g=newCareer();g.squad=g.squad.filter(p=>p.position!=='GK');const selection=[...g.selection];expect(()=>assistantPick(g)).toThrow('Not enough GK');expect(g.selection).toEqual(selection);
 expect(()=>assistantPick({...newCareer(),formation:'invalid'})).toThrow('supported formation');
});
it('values current ability and new arrivals while balancing readiness',()=>{
 const g=newCareer(),keepers=g.squad.filter(p=>p.position==='GK');keepers[0].ability=99;keepers[0].fitness=35;expect(assistantPick(g).selection).toContain(keepers[0].id);
 const p={...g.market.find(p=>p.position==='DEF')!,ability:98};g.squad.push(p);expect(assistantPick(g).selection).toContain(p.id);
});
