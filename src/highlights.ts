import type {Fixture,Goal} from './engine';
export type Point={x:number;y:number};
export function halfGoals(f:Fixture,from:number,to:number){return (f.goals??[]).filter(e=>e.minute>from&&e.minute<=to)}
export function scoreAtGoal(f:Fixture,goal:Goal):[number,number]{const goals=f.goals??[];const index=goals.indexOf(goal);return goals.slice(0,index+1).reduce<[number,number]>((s,e)=>{s[e.teamId===f.home?0:1]++;return s},[0,0])}
const formation:Point[]=[{x:55,y:190},{x:150,y:65},{x:145,y:145},{x:145,y:235},{x:150,y:315},{x:255,y:70},{x:245,y:150},{x:245,y:230},{x:255,y:310},{x:365,y:150},{x:365,y:235}];
export function dotPosition(index:number,home:boolean,progress:number,attacking:boolean):Point{const p=formation[index],push=attacking?Math.min(progress/5,1)*115:-Math.min(progress/5,1)*35;const x=Math.max(35,Math.min(600,p.x+push));return{x:home?x:640-x,y:p.y+Math.sin(progress*.9+index)*6}}
/** Replay choreography illustrates a recorded goal; it never changes the simulation. */
export function ballPosition(progress:number,home:boolean,scorerIndex:number):Point{if(progress>=5.2)return{x:home?616:24,y:190};const actors=[6,8,7,scorerIndex],time=Math.min(5.2,Math.max(0,progress)),stage=Math.min(3,Math.floor(time/1.3)),mix=(time-stage*1.3)/1.3;const a=dotPosition(actors[stage],home,time,true),b=stage===3?{x:home?616:24,y:190}:dotPosition(actors[stage+1],home,time,true);return{x:a.x+(b.x-a.x)*mix,y:a.y+(b.y-a.y)*mix}}
