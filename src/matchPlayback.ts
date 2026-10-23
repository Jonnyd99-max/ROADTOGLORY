import {clubIdentity} from './identity';
import {clubById,opponentName,type Career,type Fixture,type Goal} from './engine';
export const MATCH_PACE=300; // Five match minutes per second between highlights.
export const SHOT_TIME=.65;
export const CLIP_TIME=1.05;
export interface Playback {second:number;phase:'running'|'goal'|'complete';nextGoal:number;elapsed:number;shown:number}
export function playbackGoals(f:Fixture,from:number,to:number){return (f.goals??[]).filter(g=>g.minute>from&&g.minute<=to).sort((a,b)=>a.minute-b.minute)}
export function beginPlayback(from:number):Playback{return{second:from*60,phase:'running',nextGoal:0,elapsed:0,shown:0}}
/** One atomic transition per tick prevents consecutive goals being skipped by UI effects. */
export function tickPlayback(state:Playback,goals:Goal[],to:number,delta:number):Playback{
 if(state.phase==='complete'||delta<=0)return state;
 if(state.phase==='goal'){
  const elapsed=state.elapsed+delta;
  return elapsed>=CLIP_TIME?{...state,phase:'running',nextGoal:state.nextGoal+1,shown:state.shown+1,elapsed:0}:{...state,elapsed};
 }
 const next=goals[state.nextGoal],second=Math.min(to*60,state.second+delta*MATCH_PACE);
 if(next&&next.minute*60<=second)return{...state,second:next.minute*60,phase:'goal',elapsed:0};
 return {...state,second,phase:second>=to*60?'complete':'running'};
}
export function playbackScore(f:Fixture,state:Playback,from:number,goals:Goal[]):[number,number]{const counted=[...(f.goals??[]).filter(g=>g.minute<=from),...goals.slice(0,state.nextGoal+(state.phase==='goal'&&state.elapsed>=SHOT_TIME?1:0))];return counted.reduce<[number,number]>((score,g)=>{score[g.teamId===f.home?0:1]++;return score},[0,0])}
export function commentaryLine(g:Career,f:Fixture,second:number){
 const beat=Math.floor(second/90),ours=beat%3!==0,id=ours?0:(f.home===0?f.away:f.home),team=ours?clubIdentity(g).shortName:clubById(g.clubs,id).name;
 const players=g.squad.filter(p=>!p.loan&&p.position!=='GK'&&(g.activeMatch?.lineup??g.selection).includes(p.id));
 const name=ours?(players[beat%Math.max(1,players.length)]?.name.split(' ').slice(1).join(' ')??'the striker'):opponentName(id,beat%10).split(' ').slice(1).join(' ');
 return [`${team} attack.`,`${name} looks for a teammate.`,`Close from ${name}!`,`${team} push forward.`,`${name} sends it wide.`,`${team} keep possession.`,`A dangerous ball from ${name}.`,`${team} win the ball back.`][beat%8];
}
