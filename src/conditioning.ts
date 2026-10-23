import type {Player} from './engine';
export function matchFatigue(p:Pick<Player,'age'|'position'>){const base=p.age<=21?24:p.age<=27?27:p.age<=31?31:p.age<=35?35:39;return p.position==='GK'?Math.round(base*.6):base}
export function ageRecovery(p:Pick<Player,'age'>,base:number){return Math.max(4,base+(p.age<=21?2:p.age<=27?0:p.age<=31?-2:p.age<=35?-4:-6))}
export const matchFitness=(p:Pick<Player,'age'|'position'|'fitness'>,minutes:number)=>Math.max(35,Math.min(100,p.fitness)-matchFatigue(p)*Math.max(0,Math.min(90,minutes))/90);
