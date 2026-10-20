import type {Fixture,Goal} from './engine';
export type Point={x:number;y:number};
export function halfGoals(f:Fixture,from:number,to:number){return (f.goals??[]).filter(e=>e.minute>from&&e.minute<=to)}
export function scoreAtGoal(f:Fixture,goal:Goal):[number,number]{const goals=f.goals??[];const index=goals.indexOf(goal);return goals.slice(0,index+1).reduce<[number,number]>((s,e)=>{s[e.teamId===f.home?0:1]++;return s},[0,0])}
const formation:Point[]=[{x:55,y:190},{x:150,y:65},{x:145,y:145},{x:145,y:235},{x:150,y:315},{x:255,y:70},{x:245,y:150},{x:245,y:230},{x:255,y:310},{x:365,y:150},{x:365,y:235}];
export function dotPosition(index:number,home:boolean,progress:number,attacking:boolean):Point{const p=formation[index],push=attacking?Math.min(progress/5,1)*115:-Math.min(progress/5,1)*35;const x=Math.max(35,Math.min(600,p.x+push));return{x:home?x:640-x,y:p.y+Math.sin(progress*.9+index)*6}}
/** Replay choreography illustrates a recorded goal; it never changes the simulation. */
export function ballPosition(progress:number,home:boolean,scorerIndex:number):Point{if(progress>=5.2)return{x:home?616:24,y:190};const actors=[6,8,7,scorerIndex],time=Math.min(5.2,Math.max(0,progress)),stage=Math.min(3,Math.floor(time/1.3)),mix=(time-stage*1.3)/1.3;const a=dotPosition(actors[stage],home,time,true),b=stage===3?{x:home?616:24,y:190}:dotPosition(actors[stage+1],home,time,true);return{x:a.x+(b.x-a.x)*mix,y:a.y+(b.y-a.y)*mix}}
interface ReplayPoint extends Point {actor?:number}
export const replayScenes:{label:string;points:ReplayPoint[]}[]=[
 {label:'Through ball — in behind the defence!',points:[{x:240,y:145,actor:6},{x:345,y:235,actor:7},{x:525,y:180,actor:-1},{x:616,y:188}]},
 {label:'Down the wing — a cross into the box!',points:[{x:280,y:305,actor:8},{x:485,y:320,actor:8},{x:555,y:188,actor:-1},{x:616,y:180}]},
 {label:'Space opens up — a shot from distance!',points:[{x:265,y:130,actor:6},{x:340,y:225,actor:7},{x:430,y:160,actor:-1},{x:616,y:201}]},
 {label:'Corner swung into the danger area!',points:[{x:604,y:30,actor:8},{x:550,y:175,actor:-1},{x:616,y:193}]},
 {label:'The keeper parries it — a chance on the rebound!',points:[{x:290,y:245,actor:7},{x:475,y:178,actor:-1},{x:601,y:182},{x:543,y:210,actor:-1},{x:616,y:200}]},
 {label:'A free kick — straight towards goal!',points:[{x:445,y:145,actor:-1},{x:616,y:181}]},
];
export function replayVariant(f:Fixture,goal:Goal){const index=(f.goals??[]).indexOf(goal),hash=f.round*13+f.home*7+f.away*11;return (hash+Math.max(0,index))%replayScenes.length}
const mirror=(p:Point,home:boolean):Point=>({x:home?p.x:640-p.x,y:p.y});
export function replayBall(progress:number,home:boolean,variant:number):Point{const points=replayScenes[variant].points,t=Math.max(0,Math.min(1,progress/5.2))*(points.length-1),i=Math.min(points.length-2,Math.floor(t)),mix=t-i,a=points[i],b=points[i+1];return mirror({x:a.x+(b.x-a.x)*mix,y:a.y+(b.y-a.y)*mix},home)}
export function replayPlayer(index:number,home:boolean,progress:number,attacking:boolean,variant:number,scorerIndex:number):Point{
 const scene=replayScenes[variant],targets=scene.points.filter(p=>p.actor===index||(p.actor===-1&&index===scorerIndex));
 if(attacking&&targets.length){const t=Math.min(1,Math.max(0,progress/4.3))*(targets.length-1),i=Math.floor(t),a=targets[i],b=targets[Math.min(targets.length-1,i+1)],mix=t-i;return mirror({x:a.x+(b.x-a.x)*mix,y:a.y+(b.y-a.y)*mix},home)}
 return dotPosition(index,home,progress,attacking);
}
