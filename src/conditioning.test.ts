import {newCareer} from './testCareer';
import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {finishWeek,assistantPick,type Player} from './engine';
import {matchFatigue,ageRecovery,matchFitness} from './conditioning';
import {selectionModes,selectionScore} from './management';
import {startMatch,playHalf,substitute,simulateGame} from './match';
import {saveCareer,loadCareer} from './storage';
it('makes older outfield players tire more and recover less, with lower goalkeeper fatigue',()=>{
 const p={age:20,position:'MID' as const,fitness:100};expect(matchFatigue(p)).toBeLessThan(matchFatigue({...p,age:33}));expect(ageRecovery(p,19)).toBeGreaterThan(ageRecovery({age:33},19));expect(matchFatigue({...p,position:'GK'})).toBeLessThan(matchFatigue(p));expect(matchFitness({...p,age:33},90)).toBeLessThan(matchFitness(p,90));
});
it('keeps recovery upgrades valuable without restoring every full-match player to 100',()=>{
 const g=newCareer();g.club!.facilities.recovery=3;g.squad.forEach(p=>{p.age=33;p.fitness=100});const younger=g.squad.find(p=>p.position==='DEF')!;younger.age=20;
 finishWeek(g);for(const p of g.squad.filter(p=>g.selection.includes(p.id)&&p.position!=='GK'))expect(p.fitness).toBeLessThan(100);const older=g.squad.find(p=>g.selection.includes(p.id)&&p.position==='MID')!;expect(younger.fitness).toBeGreaterThan(older.fitness);
});
it('applies fatigue once to actual substitute minutes and gives resting players recovery only',()=>{
 let g=startMatch(newCareer());g.squad.forEach(p=>{p.age=27;p.fitness=80});const off=g.squad.find(p=>g.selection.includes(p.id)&&p.position==='FWD')!,on=g.squad.find(p=>!g.selection.includes(p.id)&&p.position==='FWD')!;
 g=playHalf(g);g=substitute(g,off.id,on.id);const result=simulateGame(g),a=result.squad.find(p=>p.id===off.id)!,b=result.squad.find(p=>p.id===on.id)!;expect(a.fitness).toBe(b.fitness);expect(a.fitness).toBe(77);const rested=result.squad.find(p=>!g.selection.includes(p.id)&&p.id!==on.id&&!p.loan)!;expect(rested.fitness).toBe(90);expect(result.ledger.filter(t=>t.label==='Weekly player wages')).toHaveLength(1);
});
it('prioritises each assistant selection mode within positions without changing the source XI',()=>{
 const g=newCareer(),[a,b]=g.squad.filter(p=>p.position==='GK');Object.assign(a,{ability:90,fitness:50,recentRatings:[5,5]});Object.assign(b,{ability:60,fitness:100,recentRatings:[9,9]});const before=[...g.selection];
 expect(assistantPick(g,'Rating').selection).toContain(a.id);for(const mode of ['Balanced','Fitness','Form'] as const)expect(assistantPick(g,mode).selection).toContain(b.id);expect(g.selection).toEqual(before);
 for(const mode of selectionModes){a.injury={name:'Test injury',weeks:1};expect(assistantPick(g,mode).selection).not.toContain(a.id);delete a.injury}
 expect(()=>assistantPick(g,'Invalid' as never)).toThrow('supported');
});
it('stores the chosen assistant mode and uses neutral form for unrated players',async()=>{
 const g=assistantPick(newCareer(),'Form');expect(g.assistantMode).toBe('Form');expect(selectionScore({...g.squad[0],recentRatings:[]},'Form')).toBe(6.5);expect(selectionScore(g.squad[0],'Balanced')).toBeCloseTo(g.squad[0].ability*.5+g.squad[0].fitness*.3+13);
 await saveCareer(g,'assistant-mode');const loaded=await loadCareer('assistant-mode');expect(loaded).toEqual(g);expect(assistantPick(loaded!).assistantMode).toBe('Form');
});
it('keeps fitness bounded and minute-based fatigue proportional for every age band',()=>{
 for(const age of [16,21,22,27,28,31,32,35,36,40]){const p={age,position:'MID' as const,fitness:100};expect(matchFitness(p,45)).toBeCloseTo((100+matchFitness(p,90))/2);expect(matchFitness({...p,fitness:35},90)).toBe(35);expect(ageRecovery(p,0)).toBeGreaterThanOrEqual(4)}
});
