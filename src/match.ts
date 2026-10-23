import {conditionFactor} from './development';
import {available,performanceFactor} from './management';
import {random,validTeam,clubById,opponentName,playRound,type Career,type Fixture,type Goal} from './engine';
import {playPlayoff} from './competition';
export interface LiveMatch {starters?:string[];fixture:Fixture;minute:number;lineup:string[];used:string[];substitutions:number;tactic:string;minutes:Record<string,number>;decisions:string[]}
export function startMatch(input:Career):Career {
 if(input.activeMatch)throw Error('Resume your current match');
 if(!validTeam(input))throw Error('Select eleven players matching your formation');
 const fixture=input.round<42?input.fixtures.find(f=>f.round===input.round&&(f.home===0||f.away===0)):input.competition?.playoffs?.fixtures.find(f=>!f.score&&(f.home===0||f.away===0));
 if(!fixture||fixture.score)throw Error('No match available');
 const g=structuredClone(input);g.activeMatch={fixture:{...fixture,score:[0,0],goals:[]},minute:0,starters:[...g.selection],lineup:[...g.selection],used:[],substitutions:0,tactic:g.tactic,minutes:{},decisions:[]};return g;
}
export function changeMentality(input:Career,tactic:string){if(!['Balanced','Attacking','Defensive'].includes(tactic))throw Error('Unknown mentality');const g={...input,activeMatch:input.activeMatch?structuredClone(input.activeMatch):undefined},m=g.activeMatch;if(!m||m.minute>=90)throw Error('No active match');m.tactic=tactic;m.decisions.push(`${m.minute}′ · Mentality: ${tactic}`);return g}
export function substitute(input:Career,off:string,on:string){const g={...input,activeMatch:input.activeMatch?structuredClone(input.activeMatch):undefined},m=g.activeMatch;if(!m||m.minute>=90)throw Error('No active match');const a=g.squad.find(p=>p.id===off),b=g.squad.find(p=>p.id===on);if(m.substitutions>=5)throw Error('Five substitutions already used');if(!a||!b||!m.lineup.includes(off)||m.lineup.includes(on)||m.used.includes(on)||!available(b)||a.position!==b.position)throw Error('Choose an available replacement in the same position');m.lineup=m.lineup.map(id=>id===off?on:id);if(m.minute===0)m.starters=[...m.lineup];m.used.push(off);m.substitutions++;m.decisions.push(`${m.minute}′ · ${b.name} on for ${a.name}`);return g}
export function advanceMatch(input:Career,duration=15):Career {
 if(!Number.isInteger(duration)||duration<1||duration>90)throw Error('Invalid match duration');
 const g={...input,activeMatch:input.activeMatch?structuredClone(input.activeMatch):undefined},m=g.activeMatch;if(!m||m.minute>=90)throw Error('No active match');
 for(let minute=m.minute+1;minute<=Math.min(90,m.minute+duration);minute++){
  const r=random(g.seed+g.season*100003+m.fixture.round*997+m.fixture.home*71+m.fixture.away*37+minute*137);
  const team=g.squad.filter(p=>m.lineup.includes(p.id));for(const p of team)m.minutes[p.id]=(m.minutes[p.id]??0)+1;
  const strength=team.reduce((sum,p)=>sum+(p.ability*.6+(p.attack+p.defence)*.2)*conditionFactor(p.fitness,m.minutes[p.id]??0,p.age,p.position)*performanceFactor(p),0)/11;
  const opponent=clubById(g.clubs,m.fixture.home===0?m.fixture.away:m.fixture.home).strength*conditionFactor(100,minute);
  for(const side of [0,1]){const ours=(side===0?m.fixture.home:m.fixture.away)===0;const difference=ours?strength-opponent:opponent-strength;const multiplier=m.tactic==='Attacking'?(ours?1.3:1.18):m.tactic==='Defensive'?(ours?.72:.8):1;
   if(r()<Math.max(.2,(side===0?1.35:1.05)+difference/23)*multiplier/90){const teamId=side===0?m.fixture.home:m.fixture.away;const candidates=team.filter(p=>p.position!=='GK');const weighted=candidates.flatMap(p=>Array.from({length:p.position==='FWD'?6:p.position==='MID'?3:1},()=>p));const scorer=weighted[Math.floor(r()*weighted.length)];const helperR=random(g.seed+g.season*47+m.fixture.round*19+minute*373+side*67);const helpers=candidates.filter(p=>p.id!==scorer.id),helper=helpers[Math.floor(helperR()*helpers.length)];const assisted=helperR()<.8;m.fixture.score![side]++;m.fixture.goals!.push({minute,teamId,playerName:ours?scorer.name:opponentName(teamId,Math.floor(r()*10)),playerId:ours?scorer.id:undefined,assistRecorded:true,assistId:ours&&assisted?helper.id:undefined,assistName:assisted?(ours?helper.name:opponentName(teamId,6)):undefined})}
  }
 }
 m.minute=Math.min(90,m.minute+duration);return g;
}
export function finishMatch(input:Career):Career {
 const m=input.activeMatch;if(!m||m.minute!==90)throw Error('Play to full time first');const g=structuredClone(input);delete g.activeMatch;
 // Settlement applies age-dependent fatigue and recovery to the recorded minutes exactly once.
 const resolved=structuredClone(m.fixture);resolved.minutes={...m.minutes};resolved.starters=[...(m.starters??input.selection)];g.tactic=m.tactic;const result=g.round<42?playRound(g,resolved):playPlayoff(g,resolved);if(m.decisions.length)result.inbox[0]+=`\n\nMatchday decisions\n${m.decisions.join('\n')}`;return result;
}
export function goalRecords(f:Fixture):Goal[]{if(f.goals)return f.goals;return (f.score??[0,0]).flatMap((count,side)=>Array.from({length:count},()=>({minute:0,teamId:side===0?f.home:f.away,playerName:'Scorer not recorded (older match)'})))}

export function playHalf(g:Career){const minute=g.activeMatch?.minute;if(minute===undefined)throw Error("No active match");return advanceMatch(g,minute<45?45-minute:90-minute)}
export function simulateGame(g:Career){const started=g.activeMatch?g:startMatch(g);return finishMatch(started.activeMatch!.minute===90?started:advanceMatch(started,90-started.activeMatch!.minute))}
