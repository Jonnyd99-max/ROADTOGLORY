import {simulateMatchMinute,teamModel} from './matchModel';
import {nextFixture,playCup} from './cup';
import {tacticalEffects,tacticalReport,staffQuality} from './clubSystems';
import {conditionFactor} from './development';
import {available,performanceFactor} from './management';
import {random,validTeam,clubById,opponentName,playRound,type Career,type Fixture,type Goal} from './engine';
import {playPlayoff} from './competition';
export interface LiveMatch {starters?:string[];fixture:Fixture;minute:number;lineup:string[];used:string[];substitutions:number;tactic:string;minutes:Record<string,number>;decisions:string[]}
export function startMatch(input:Career):Career {
 if(input.activeMatch)throw Error('Resume your current match');
 if(!validTeam(input))throw Error('Select eleven players matching your formation');
 const fixture=nextFixture(input);
 if(!fixture||fixture.score)throw Error('No match available');
 const g=structuredClone(input);g.activeMatch={fixture:{...fixture,score:[0,0],goals:[]},minute:0,starters:[...g.selection],lineup:[...g.selection],used:[],substitutions:0,tactic:g.tactic,minutes:{},decisions:[]};return g;
}
export function changeMentality(input:Career,tactic:string){if(!['Balanced','Attacking','Defensive'].includes(tactic))throw Error('Unknown mentality');const g={...input,activeMatch:input.activeMatch?structuredClone(input.activeMatch):undefined},m=g.activeMatch;if(!m||m.minute>=90)throw Error('No active match');m.tactic=tactic;m.decisions.push(`${m.minute}′ · Mentality: ${tactic}`);return g}
export function substitute(input:Career,off:string,on:string){const g={...input,activeMatch:input.activeMatch?structuredClone(input.activeMatch):undefined},m=g.activeMatch;if(!m||m.minute>=90)throw Error('No active match');const a=g.squad.find(p=>p.id===off),b=g.squad.find(p=>p.id===on);if(m.substitutions>=5)throw Error('Five substitutions already used');if(!a||!b||!m.lineup.includes(off)||m.lineup.includes(on)||m.used.includes(on)||!available(b)||a.position!==b.position)throw Error('Choose an available replacement in the same position');m.lineup=m.lineup.map(id=>id===off?on:id);if(m.minute===0)m.starters=[...m.lineup];m.used.push(off);m.substitutions++;m.decisions.push(`${m.minute}′ · ${b.name} on for ${a.name}`);return g}
export function advanceMatch(input:Career,duration=15):Career {
 if(!Number.isInteger(duration)||duration<1||duration>90)throw Error('Invalid match duration');
 const g={...input,activeMatch:input.activeMatch?structuredClone(input.activeMatch):undefined},m=g.activeMatch;const limit=m?.fixture.competition==='cup'&&m.minute>=90?120:90;if(!m||m.minute>=limit)throw Error('No active match');
 for(let minute=m.minute+1;minute<=Math.min(limit,m.minute+duration);minute++){
  const team=g.squad.filter(p=>m.lineup.includes(p.id));for(const p of team)m.minutes[p.id]=(m.minutes[p.id]??0)+1;
  simulateMatchMinute(g,m.fixture,minute,teamModel(g,m.fixture.home,minute),teamModel(g,m.fixture.away,minute));
 }
 m.minute=Math.min(limit,m.minute+duration);return g;
}
export function finishMatch(input:Career):Career {
 let m=input.activeMatch;if(!m||(m.minute!==90&&!(m.minute===120&&m.fixture.competition==='cup')))throw Error('Play to full time first');if(m.minute===90&&m.fixture.competition==='cup'&&m.fixture.score![0]===m.fixture.score![1]){input=advanceMatch(input,30);m=input.activeMatch!;m.decisions.push('90′ · Scores level: thirty minutes of extra time played.');}const g=structuredClone(input);delete g.activeMatch;
 // Settlement applies age-dependent fatigue and recovery to the recorded minutes exactly once.
 const resolved=structuredClone(m.fixture);resolved.duration=m.minute;resolved.tacticalReport=tacticalReport(input);resolved.minutes={...m.minutes};resolved.starters=[...(m.starters??input.selection)];g.tactic=m.tactic;const result=resolved.competition==='cup'?playCup(g,resolved):g.round<42?playRound(g,resolved):playPlayoff(g,resolved);result.lastPlayed=[...result.fixtures,...(result.cup?.fixtures??[]),...(result.competition?.playoffs?.fixtures??[])].find(f=>f.round===resolved.round&&f.home===resolved.home&&f.away===resolved.away)??resolved;if(m.decisions.length)result.inbox[0]+=`\n\nMatchday decisions\n${m.decisions.join('\n')}`;return result;
}
export function goalRecords(f:Fixture):Goal[]{if(f.goals)return f.goals;return (f.score??[0,0]).flatMap((count,side)=>Array.from({length:count},()=>({minute:0,teamId:side===0?f.home:f.away,playerName:'Scorer not recorded (older match)'})))}

export function playHalf(g:Career){const minute=g.activeMatch?.minute;if(minute===undefined)throw Error("No active match");return advanceMatch(g,minute<45?45-minute:90-minute)}
export function simulateGame(g:Career){const started=g.activeMatch?g:startMatch(g);return finishMatch(started.activeMatch!.minute>=90?started:advanceMatch(started,90-started.activeMatch!.minute))}
