// Baseline regression fixtures deliberately isolate league systems from the optional new calendar.
import {newCareer as create,nextSeason as advance,type Career} from './engine';
export function newCareer(seed=2026){const g=create(seed);g.cup!.deferred=true;g.supporters!.rivalId=-1;return g;}
export function nextSeason(g:Career){const result=advance(g);result.cup!.deferred=true;result.supporters!.rivalId=-1;return result;}
