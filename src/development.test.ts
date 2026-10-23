import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {assistantPick,abilitySegments,newCareer,playRound,migrateCareer,mailId,markMailRead,unreadCount} from './engine';
import {saveCareer,loadCareer} from './storage';

it('preserves starting ratings while training and games produce visible earned growth',async()=>{
 const initial=newCareer(2026);let g={...initial,training:'Youth development'};
 for(let i=0;i<20;i++)g=playRound(assistantPick(g));
 const grown=g.squad.filter(p=>p.ability>(p.startingAbility??p.ability));
 expect(grown.length).toBeGreaterThan(0);
 for(const p of g.squad){expect(p.startingAbility).toBe(initial.squad.find(x=>x.id===p.id)!.ability);expect(p.ability).toBeLessThanOrEqual(p.potential);const segments=abilitySegments(p);expect(segments.blue+segments.green).toBe(p.ability)}
 expect(g.inbox.some(m=>m.includes('Development report'))).toBe(true);
 await saveCareer(g,'growth');expect(await loadCareer('growth')).toEqual(g);
});
it('migrates old saves using original generated ratings without losing earned growth',async()=>{
 const initial=newCareer();let old=newCareer();for(let i=0;i<20;i++)old=playRound(assistantPick(old));
 for(const p of [...old.squad,...old.market])delete p.startingAbility;
 delete old.readMailIds;
 const migrated=migrateCareer(old);
 for(const p of migrated.squad)expect(p.startingAbility).toBe(initial.squad.find(x=>x.id===p.id)!.ability);
 expect(migrated.round).toBe(20);expect(migrated.cash).toBe(old.cash);expect(migrated.inbox).toEqual(old.inbox);
 expect(old.squad[0].startingAbility).toBeUndefined();
 await saveCareer(old,'legacy');expect(await loadCareer('legacy')).toEqual(migrated);
});
it('keeps read mail stable as new reports arrive and after save/load',async()=>{
 const initial=newCareer();const id=mailId(initial,0),read=markMailRead(initial,id);
 expect(unreadCount(initial)).toBe(1);expect(unreadCount(read)).toBe(0);
 expect(markMailRead(read,id).readMailIds).toEqual([id]);
 const advanced=playRound(read);expect(mailId(advanced,advanced.inbox.length-1)).toBe(id);
 expect(unreadCount(advanced)).toBe(advanced.inbox.length-1);
 await saveCareer(advanced,'mail');expect((await loadCareer('mail'))!.readMailIds).toEqual([id]);
 expect(()=>markMailRead(read,-1)).toThrow('Message unavailable');
});
it('shows decline without inventing a negative green segment',()=>{
 const p={...newCareer().squad[0],startingAbility:60,ability:58};
 expect(abilitySegments(p)).toEqual({blue:58,green:0,growth:-2});
});

import {repairDevelopment,changeAbility,conditionFactor} from './development';
it('repairs legacy development exactly once without changing ability or finances',()=>{
 const g=newCareer();const p=g.squad[0];delete p.attributeAbility;p.startingAbility=57;p.ability=69;p.attack=55;p.defence=59;
 const fixed=migrateCareer(g);expect(fixed.squad[0]).toMatchObject({ability:69,attack:67,defence:71});expect(fixed.cash).toBe(g.cash);expect(fixed.fixtures).toEqual(g.fixtures);expect(migrateCareer(fixed)).toEqual(fixed);expect(p.attack).toBe(55);
});
it('keeps future development and ageing aligned with underlying attributes',()=>{
 const p=newCareer().squad[0];const attack=p.attack,defence=p.defence,ability=p.ability;
 changeAbility(p,ability+1);expect(p.attack).toBe(attack+1);expect(p.defence).toBe(defence+1);
 changeAbility(p,ability-1);expect(p.attack).toBe(attack-1);expect(p.defence).toBe(defence-1);
});
it('does not double credit historical academy development',()=>{
 const p=newCareer().academy!.players[0];delete p.attributeAbility;p.ability+=5;p.attack+=5;p.defence+=5;const attack=p.attack;repairDevelopment(p);expect(p.attack).toBe(attack);
});
it('uses equal fatigue for equally fit teams and rewards fresher substitutes',()=>{
 expect(conditionFactor(100,90)).toBeLessThan(conditionFactor(100,0));expect(conditionFactor(100,90)).toBeGreaterThan(conditionFactor(75,90));
});

import {startMatch,advanceMatch} from './match';
it('makes a developed strong XI outperform weaker opponents across deterministic matches',()=>{
 let strongPoints=0,weakPoints=0,wins=0,losses=0;
 for(let seed=1;seed<=160;seed++)for(const ability of [78,60]){
  const g=newCareer(seed);for(const p of g.squad){p.ability=ability;p.attack=ability;p.defence=ability;p.fitness=100;p.morale=60;p.recentRatings=[]}
  for(const c of g.clubs)if(c.id!==0)c.strength=65;
  const f=g.fixtures.find(f=>f.round===0&&(f.home===0||f.away===0))!;
  const result=advanceMatch(startMatch(g),90).activeMatch!.fixture.score!;const ours=result[f.home===0?0:1],theirs=result[f.home===0?1:0],points=ours>theirs?3:ours===theirs?1:0;
  if(ability===78){strongPoints+=points;if(ours>theirs)wins++;if(ours<theirs)losses++}else weakPoints+=points;
 }
 expect(strongPoints).toBeGreaterThan(weakPoints+40);expect(wins).toBeGreaterThan(losses*2);
});
