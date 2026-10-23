import type {Player} from './engine';
export const squadRoles=['Key player','Regular starter','Rotation','Prospect'] as const;
export type SquadRole=typeof squadRoles[number];
export const personalities=['Ambitious','Loyal','Professional','Family-focused','Easy-going'] as const;
export const personalityHash=(id:string)=>[...id].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,17);
export const personality=(p:Pick<Player,'id'>)=>personalities[personalityHash(p.id)%personalities.length];
export const preferredRole=(p:Pick<Player,'age'|'ability'>):SquadRole=>p.age<21?'Prospect':p.ability>=75?'Key player':p.ability>=60?'Regular starter':'Rotation';
export const roleTarget:Record<SquadRole,number>={'Key player':.75,'Regular starter':.6,Rotation:.25,Prospect:.1};
export function perkAffinity(p:Pick<Player,'id'>,perk:string){const trait=personality(p);if(trait==='Family-focused')return perk==='holiday'?1.65:perk==='house'?1.4:.7;if(trait==='Ambitious')return perk==='car'?1.6:perk==='house'?1.1:.75;if(trait==='Loyal')return perk==='house'?1.5:perk==='holiday'?1.1:.8;if(trait==='Easy-going')return perk==='holiday'?1.4:1;return 1;}
export const personalityNotes={Ambitious:'Values status perks and regular starts.',Loyal:'Values a settled home and a long-term place at the club.',Professional:'Responds to a fair package and clear playing-time expectations.','Family-focused':'Values family holidays and a home more than a car.','Easy-going':'Values holidays and is more patient about rotation.'};
export function roleWage(asking:number,role?:SquadRole){if(!role)return asking;if(!squadRoles.includes(role))throw Error('Choose a valid squad role');return Math.ceil(asking*(role==='Key player'?.95:role==='Prospect'?1.08:role==='Rotation'?1.04:1));}
export function settlePlayingTime(p:Player,started:boolean){if(!p.squadRole)return;const prior=p.roleHistory??[],target=roleTarget[p.squadRole];p.roleHistory=[...prior,started].slice(-8);if(p.roleHistory.length<6)return;const rate=p.roleHistory.filter(Boolean).length/p.roleHistory.length,met=rate>=target,trait=personality(p);p.morale=Math.max(10,Math.min(95,(p.morale??60)+(met?1:trait==='Ambitious'?-3:trait==='Easy-going'?-1:-2)));}
