import {random,type Career,type Player,type Fixture,type Position} from './engine';
export interface MatchRating {playerId:string;name:string;position:Position;minutes:number;goals:number;assists:number;rating:number;yellow:boolean;red:boolean;injury?:string}
export const formRating=(p:Player)=>p.recentRatings?.length?p.recentRatings.reduce((a,b)=>a+b,0)/p.recentRatings.length:6.5;
export const morale=(p:Player)=>p.morale??60;
export function availability(p:Player){const statuses:string[]=[];if(p.loan)statuses.push('On loan');if(p.injury&&p.injury.weeks>0)statuses.push(`${p.injury.name} · ${p.injury.weeks} matchweek${p.injury.weeks===1?'':'s'}`);if((p.suspension??0)>0)statuses.push(`Suspended · ${p.suspension} match${p.suspension===1?'':'es'}`);return statuses.join(' · ')||'Available'}
export const available=(p:Player)=>!p.loan&&!(p.injury&&p.injury.weeks>0)&&!(p.suspension&&p.suspension>0);
export const performanceFactor=(p:Player)=>Math.max(.9,Math.min(1.1,1+(formRating(p)-6.5)*.025+(morale(p)-60)/1000));
export const selectionScore=(p:Player)=>p.ability*(.6+.4*p.fitness/100)*performanceFactor(p);
const hash=(id:string)=>[...id].reduce((n,c)=>n*31+c.charCodeAt(0),7)>>>0;
const clamp=(n:number,low:number,high:number)=>Math.max(low,Math.min(high,n));
/** Called once at settlement. Existing absences serve this fixture; new absences start next fixture. */
export function settlePlayerManagement(g:Career,f:Fixture){
 const ours=f.score![f.home===0?0:1],against=f.score![f.home===0?1:0],win=ours>against,draw=ours===against;
 for(const p of g.squad){if(p.injury){p.injury.weeks--;if(p.injury.weeks<=0){delete p.injury;g.inbox.unshift(`Medical update · ${p.name}\n\nFit to return to the squad.`)}}if(p.suspension)p.suspension=Math.max(0,p.suspension-1)}
 for(const [i,goal] of (f.goals??[]).entries()){if(goal.teamId!==0||goal.assistRecorded)continue;if(f.minutes){goal.assistRecorded=true;continue}const helpers=g.squad.filter(p=>p.position!=='GK'&&p.id!==goal.playerId&&(f.starters??g.selection).includes(p.id));const r=random(g.seed+f.round*73+i*311);const helper=helpers[Math.floor(r()*helpers.length)];if(helper&&r()<.8){goal.assistId=helper.id;goal.assistName=helper.name}goal.assistRecorded=true}
 const ratings:MatchRating[]=[];let injuryAssigned=false;
 for(const p of g.squad){const minutes=f.minutes?.[p.id]??((f.starters??g.selection).includes(p.id)?90:0);if(p.loan)continue;
  if(!minutes){if(available(p)){p.unusedMatches=(p.unusedMatches??0)+1;if(p.unusedMatches>2)p.morale=clamp(morale(p)-1,10,95)}continue}
  const r=random(g.seed+g.season*1009+f.round*10007+hash(p.id));
  const goals=(f.goals??[]).filter(e=>e.teamId===0&&e.playerId===p.id).length,assists=(f.goals??[]).filter(e=>e.teamId===0&&e.assistId===p.id).length;
  const defensive=p.position==='GK'||p.position==='DEF',clean=against===0&&minutes>=60;
  const rating=Math.round(clamp(6.2+(win?.4:draw?.05:-.4)+goals*.85+assists*.5+(defensive?(clean?.65:-against*.14):0)+(r()-.5)*1.1,3,10)*10)/10;
  const yellow=p.position!=='GK'&&r()<.13,red=p.position!=='GK'&&r()<.006;
  if(yellow){p.yellows=(p.yellows??0)+1;if(p.yellows>=5){p.yellows=0;p.suspension=Math.max(p.suspension??0,1);g.inbox.unshift(`Suspension · ${p.name}\n\nFive bookings: misses the next club match.`)}}
  if(red){p.suspension=Math.max(p.suspension??0,2);g.inbox.unshift(`Suspension · ${p.name}\n\nSent off: a two-match ban starts with the next fixture.`)}
  let injury:string|undefined;
  const recovery=g.club?.facilities.recovery??0,risk=.018*(1+(100-p.fitness)/40)*(minutes/90)*(1-recovery*.12);
  if(!injuryAssigned&&r()<risk){const names=['Bruised ankle','Hamstring strain','Twisted knee'];const weeks=Math.max(1,1+Math.floor(r()*3)-Math.floor(recovery/2));p.injury={name:names[Math.floor(r()*names.length)],weeks};injury=p.injury.name;injuryAssigned=true;g.inbox.unshift(`Medical update · ${p.name}\n\n${injury}: unavailable for ${weeks} matchweek${weeks===1?'':'s'}. Recovery facilities reduce injury risk and lay-off length.`)}
  p.recentRatings=[...(p.recentRatings??[]),rating].slice(-5);p.unusedMatches=0;p.morale=clamp(morale(p)+(win?3:draw?0:-3)+(rating>=7.5?2:rating<5.5?-2:0)+1,10,95);
  ratings.push({playerId:p.id,name:p.name,position:p.position,minutes,goals,assists,rating,yellow,red,injury});
 }
 f.ratings=ratings;f.playerOfMatch=[...ratings].sort((a,b)=>b.rating-a.rating||b.goals-a.goals||b.minutes-a.minutes||a.playerId.localeCompare(b.playerId))[0]?.playerId;
 if(ratings.length)g.inbox.unshift(`Assistant match report · Matchweek ${f.round+1}\n\nDragons player of the match: ${ratings.find(p=>p.playerId===f.playerOfMatch)!.name}.\n${ratings.map(p=>`${p.name}: ${p.rating.toFixed(1)} · ${p.goals} goals · ${p.assists} assists${p.red?' · sent off':p.yellow?' · booked':''}${p.injury?' · '+p.injury:''}`).join('\n')}`);
 return ratings;
}
export function assistantAdvice(g:Career){const advice:string[]=g.squad.filter(p=>!available(p)).map(p=>`${p.name}: ${availability(p)}.${g.selection.includes(p.id)?' Choose a replacement.':''}`),selected=g.squad.filter(p=>g.selection.includes(p.id));
 for(const p of selected){if(!available(p))continue;
  const cover=g.squad.filter(q=>q.position===p.position&&available(q)&&!g.selection.includes(q.id)).sort((a,b)=>selectionScore(b)-selectionScore(a))[0];
  if(p.fitness<78)advice.push(`${p.name} is tired (${p.fitness}%). ${cover&&cover.fitness>p.fitness?`Rotate with ${cover.name} (${cover.fitness}% fitness).`:'No fresher cover in this position.'}`);
  if(formRating(p)<6)advice.push(`${p.name} is out of form (${formRating(p).toFixed(1)} over recent games).`);
  if(morale(p)<40)advice.push(`${p.name} has low morale (${morale(p)}/100); regular minutes and good results can help.`);
 }
 for(const [i,pos] of (['GK','DEF','MID','FWD'] as const).entries()){const need=[1,...g.formation.split('-').map(Number)][i],count=g.squad.filter(p=>p.position===pos&&available(p)).length;if(count<need)advice.push(`${pos}: only ${count} available, need ${need}. Change formation, recruit, or recall a loan player.`)}
 return advice.length?advice:['Your selected XI is fit and available. Assistant pick balances ability, fitness, recent form and morale in each position.'];
}
