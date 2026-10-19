import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {abilitySegments,newCareer,playRound,migrateCareer,mailId,markMailRead,unreadCount} from './engine';
import {saveCareer,loadCareer} from './storage';

it('preserves starting ratings while training and games produce visible earned growth',async()=>{
 const initial=newCareer(2026);let g={...initial,training:'Youth development'};
 for(let i=0;i<20;i++)g=playRound(g);
 const grown=g.squad.filter(p=>p.ability>(p.startingAbility??p.ability));
 expect(grown.length).toBeGreaterThan(0);
 for(const p of g.squad){expect(p.startingAbility).toBe(initial.squad.find(x=>x.id===p.id)!.ability);expect(p.ability).toBeLessThanOrEqual(p.potential);const segments=abilitySegments(p);expect(segments.blue+segments.green).toBe(p.ability)}
 expect(g.inbox.some(m=>m.startsWith('Development report'))).toBe(true);
 await saveCareer(g,'growth');expect(await loadCareer('growth')).toEqual(g);
});
it('migrates old saves using original generated ratings without losing earned growth',async()=>{
 const initial=newCareer();let old=newCareer();for(let i=0;i<20;i++)old=playRound(old);
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
