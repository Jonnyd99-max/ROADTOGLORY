import {it,expect} from 'vitest';
import 'fake-indexeddb/auto';
import {newCareer,migrateCareer,markAllMailRead,unreadCount,playRound,type Career} from './engine';
import {clubIdentity,defaultIdentity,updateIdentity,type ClubIdentity} from './identity';
import {saveCareer,loadCareer} from './storage';
import {monthlyMarket} from './market';
import {ensureSeasonMarkets} from './seasonMarket';
import {ensureAcademy,developAcademy} from './academy';
const design:ClubIdentity={...defaultIdentity,clubName:'Manchester Lions FC',shortName:'Lions',stadiumName:'Lion Park',trainingName:'Carrington Academy',initials:'MLFC',badgeShape:'Circle',badgeIcon:'Lion',primary:'#226644',secondary:'#112233',accent:'#eeddaa',homePattern:'Stripes',awayPattern:'Hoops'};
it('starts new careers with optional identity setup and defaults older saves without resetting them',()=>{
 const g=newCareer();expect(g.identitySetupComplete).toBe(false);const old=structuredClone(g);delete old.identity;delete old.identitySetupComplete;const loaded=migrateCareer(old);expect(clubIdentity(loaded)).toEqual(defaultIdentity);expect(loaded.identitySetupComplete).toBeUndefined();expect(loaded.fixtures).toEqual(old.fixtures);expect(loaded.cash).toBe(old.cash);
});
it('renames the persistent club and saves the entire crest and kit design without changing gameplay',async()=>{
 const g=newCareer(),out=updateIdentity(g,design);expect(out.clubs.find(c=>c.id===0)?.name).toBe(design.clubName);expect(out.identity).toMatchObject({...design,customised:true});expect(out.identitySetupComplete).toBe(true);expect(out.cash).toBe(g.cash);expect(out.squad).toEqual(g.squad);expect(out.fixtures).toEqual(g.fixtures);expect(out.club).toEqual(g.club);expect(g.clubs[0].name).toBe(defaultIdentity.clubName);
 await saveCareer(out,'identity-test');expect(await loadCareer('identity-test')).toEqual(out);
});
it('allows later rebranding without changing historic emails, cash, facilities or results',()=>{
 const g=playRound({...newCareer(),identitySetupComplete:true}),next=updateIdentity(g,design);expect(next.inbox).toEqual(g.inbox);expect(next.ledger).toEqual(g.ledger);expect(next.club).toEqual(g.club);expect(next.fixtures).toEqual(g.fixtures);
 expect(()=>updateIdentity({...g,activeMatch:{} as Career['activeMatch']},design)).toThrow('Finish');
});
it('rejects invalid names, colours, shapes and patterns without changing the career',()=>{
 const g=newCareer(),before=structuredClone(g);for(const patch of [{clubName:' '},{initials:'TOOLONG'},{primary:'red'},{badgeShape:'Unknown'},{awayPattern:'Unknown'}])expect(()=>updateIdentity(g,{...design,...patch} as ClubIdentity)).toThrow();expect(g).toEqual(before);
});
it('marks all messages read with stable IDs while retaining every original report',async()=>{
 const g=playRound(newCareer()),read=markAllMailRead(g);expect(unreadCount(read)).toBe(0);expect(read.inbox).toEqual(g.inbox);expect(read.readMailIds).toHaveLength(g.inbox.length);expect(markAllMailRead(read)).toEqual(read);expect(unreadCount(g)).toBeGreaterThan(0);await saveCareer(read,'read-all');expect(unreadCount((await loadCareer('read-all'))!)).toBe(0);expect(unreadCount(playRound(read))).toBe(1);
});
it('unlocks old capped players once while leaving ability and naturally generated 90 potential unchanged',()=>{
 const g=newCareer();delete g.potentialRules;const all=[g.squad[0],g.market[0],g.academy!.players[0],g.academy!.prospects[0],g.seasonMarkets!.freeAgents[0],g.seasonMarkets!.loans[0]];all.forEach(p=>p.potential=90);g.squad[1].potential=75;const ability=g.squad[0].ability,loaded=migrateCareer(g);expect(loaded.squad[0].potential).toBe(99);expect(loaded.squad[0].ability).toBe(ability);expect(loaded.squad[1].potential).toBe(75);expect(loaded.academy!.players[0].potential).toBe(99);expect(loaded.seasonMarkets!.loans[0].potential).toBe(99);expect(migrateCareer(loaded)).toEqual(loaded);const fresh=newCareer();fresh.squad[0].potential=90;expect(migrateCareer(fresh).squad[0].potential).toBe(90);
});
it('generates elite potential above 90 without exceeding 99 and develops towards 99',()=>{
 const potentials:number[]=[];for(let seed=1;seed<=20;seed++){const g=newCareer(seed);g.tier=1;g.market=monthlyMarket(g);delete g.seasonMarkets;ensureSeasonMarkets(g);g.academy!.level=3;g.season++;delete g.academy;ensureAcademy(g);potentials.push(...g.market.map(p=>p.potential),...g.seasonMarkets!.loans.map(p=>p.potential));}
 expect(Math.max(...potentials)).toBeGreaterThan(90);expect(Math.max(...potentials)).toBeLessThanOrEqual(99);
 const g=newCareer(),p=g.academy!.players[0];p.ability=98;p.attack=98;p.defence=98;p.startingAbility=98;p.potential=99;g.academy!.level=3;for(let week=0;week<100;week++){g.round=week;developAcademy(g)}expect(p.ability).toBe(99);expect(p.attack).toBe(99);
});
