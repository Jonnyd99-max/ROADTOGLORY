import type {Career,Fixture,Player,PlayerSeasonStats} from './engine';
export const emptyStats=(season:number):PlayerSeasonStats=>({season,appearances:0,starts:0,minutes:0,goals:0});
export function recordPlayerMatch(g:Career,f:Fixture){
 const starters=f.starters??g.selection;
 for(const p of g.squad){const minutes=f.minutes?.[p.id]??(f.minutes?0:starters.includes(p.id)?90:0);if(minutes===0)continue;
 p.stats??=[];let row=p.stats.find(s=>s.season===g.season);if(!row){row=emptyStats(g.season);p.stats.push(row)}
 row.appearances++;row.starts+=Number(starters.includes(p.id));row.minutes+=minutes;row.goals+=(f.goals??[]).filter(e=>e.teamId===0&&e.playerId===p.id).length;
 }
}
export function playerTotals(p:Player){return (p.stats??[]).reduce((total,s)=>({season:0,appearances:total.appearances+s.appearances,starts:total.starts+s.starts,minutes:total.minutes+s.minutes,goals:total.goals+s.goals}),emptyStats(0))}
