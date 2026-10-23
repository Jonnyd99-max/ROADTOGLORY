import type {Player} from './engine';
export const perks={none:{name:'No perk',cost:0},holiday:{name:'Family holiday',cost:1500},car:{name:'Luxury car',cost:8000},house:{name:'House',cost:40000}} as const;
export type Perk=keyof typeof perks;
export interface ContractPackage {perk:Perk;cost:number;years:number;wage:number}
export function wageQuote(player:Pick<Player,'id'>,asking:number,years:number,perk:Perk='none'){
 if(!Object.prototype.hasOwnProperty.call(perks,perk))throw Error('Choose a valid contract perk');
 if(!Number.isInteger(years)||years<1||years>3)throw Error('Choose a 1–3 year contract');
 const gift=perks[perk],preference=.8+([...player.id].reduce((n,c)=>n+c.charCodeAt(0),0)%5)*.1;
 const reduction=Math.min(Math.floor(asking*.35),Math.floor(gift.cost*preference/(52*years)));
 return {minimum:Math.max(1,asking-reduction),cost:gift.cost,reduction,name:gift.name};
}
export function agreePackage(p:Player,asking:number,wage:number,years:number,perk:Perk='none'):ContractPackage{
 const q=wageQuote(p,asking,years,perk);
 if(!Number.isInteger(wage)||wage<q.minimum)throw Error(`Offer rejected. Counter-offer: £${q.minimum}/week${perk==='none'?'':` with ${q.name.toLowerCase()}`}.`);
 return {perk,cost:q.cost,years,wage};
}
