import {recordClubMatch} from './clubHistory';
import {settlePlayerManagement} from './management';
import type {Career,Fixture,Player,PlayerSeasonStats} from './engine';
export const emptyStats=(season:number):PlayerSeasonStats=>({season,appearances:0,starts:0,minutes:0,goals:0,assists:0,ratingTotal:0,ratedAppearances:0,cleanSheets:0});
export function recordPlayerMatch(g:Career,f:Fixture){
 if(f.ratings)return;
 const starters=f.starters??g.selection;
 for(const p of g.squad){const minutes=f.minutes?.[p.id]??(f.minutes?0:starters.includes(p.id)?90:0);if(minutes===0)continue;
 p.stats??=[];let row=p.stats.find(s=>s.season===g.season);if(!row){row=emptyStats(g.season);p.stats.push(row)}
 row.appearances++;row.starts+=Number(starters.includes(p.id));row.minutes+=minutes;row.goals+=(f.goals??[]).filter(e=>e.teamId===0&&e.playerId===p.id).length;
 }
 const ratings=settlePlayerManagement(g,f);
 for(const r of ratings){const p=g.squad.find(p=>p.id===r.playerId)!,row=p.stats!.find(s=>s.season===g.season)!;row.assists=(row.assists??0)+r.assists;row.ratingTotal=(row.ratingTotal??0)+r.rating;row.ratedAppearances=(row.ratedAppearances??0)+1;if((p.position==='GK'||p.position==='DEF')&&r.minutes>=60&&f.score![f.home===0?1:0]===0)row.cleanSheets=(row.cleanSheets??0)+1}
 recordClubMatch(g,f);
}
export function playerTotals(p:Player){return (p.stats??[]).reduce((total,s)=>({season:0,appearances:total.appearances+s.appearances,starts:total.starts+s.starts,minutes:total.minutes+s.minutes,goals:total.goals+s.goals,assists:(total.assists??0)+(s.assists??0),ratingTotal:(total.ratingTotal??0)+(s.ratingTotal??0),ratedAppearances:(total.ratedAppearances??0)+(s.ratedAppearances??0),cleanSheets:(total.cleanSheets??0)+(s.cleanSheets??0)}),emptyStats(0))}
