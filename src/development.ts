import {matchFitness} from './conditioning';
import type {Position} from './engine';
import type {Player} from './engine';
/** Legacy academy growth already updated both attributes; other growth did not. */
export function repairDevelopment(p:Player){
 if(p.attributeAbility!==undefined)return;
 const growth=p.id.startsWith('academy-')?0:Math.max(0,p.ability-(p.startingAbility??p.ability));
 if(growth===0)return;
 p.attack=Math.min(99,p.attack+growth);p.defence=Math.min(99,p.defence+growth);
 p.attributeAbility=p.ability;
}
export function changeAbility(p:Player,value:number){
 repairDevelopment(p);const delta=value-p.ability;
 p.ability=value;p.attack=Math.max(1,Math.min(99,p.attack+delta));p.defence=Math.max(1,Math.min(99,p.defence+delta));p.attributeAbility=value;
}
/** Opponents and Dragons use the same condition curve and match fatigue. */
export const conditionFactor=(fitness:number,minutes=0,age=25,position:Position='MID')=>.6+matchFitness({fitness,age,position},minutes)/250;
