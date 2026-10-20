import {random,validTeam,clubById,opponentName,playRound,type Career,type Fixture,type Goal} from './engine';
import {playPlayoff} from './competition';
export interface LiveMatch {fixture:Fixture;minute:number;lineup:string[];used:string[];substitutions:number;tactic:string;minutes:Record<string,number>;decisions:string[]}
export function startMatch(input:Career):Career {
 if(input.activeMatch)throw Error('Resume your current match');
 if(!validTeam(input))throw Error('Select eleven players matching your formation');
 const fixture=input.round<42?input.fixtures.find(f=>f.round===input.round&&(f.home===0||f.away===0)):input.competition?.playoffs?.fixtures.find(f=>!f.score&&(f.home===0||f.away===0));
 if(!fixture||fixture.score)throw Error('No match available');
 const g=structuredClone(input);g.activeMatch={fixture:{...fixture,score:[0,0],goals:[]},minute:0,lineup:[...g.selection],used:[],substitutions:0,tactic:g.tactic,minutes:{},decisions:[]};return g;
}
export function changeMentality(input:Career,tactic:string){if(!['Balanced','Attacking','Defensive'].includes(tactic))throw Error('Unknown mentality');const g=structuredClone(input),m=g.activeMatch;if(!m||m.minute>=90)throw Error('No active match');m.tactic=tactic;m.decisions.push(`${m.minute}′ · Mentality: ${tactic}`);return g}
export function substitute(input:Career,off:string,on:string){const g=structuredClone(input),m=g.activeMatch;if(!m||m.minute>=90)throw Error('No active match');const a=g.squad.find(p=>p.id===off),b=g.squad.find(p=>p.id===on);if(m.substitutions>=5)throw Error('Five substitutions already used');if(!a||!b||!m.lineup.includes(off)||m.lineup.includes(on)||m.used.includes(on)||b.loan||a.position!==b.position)throw Error('Choose an available replacement in the same position');m.lineup=m.lineup.map(id=>id===off?on:id);m.used.push(off);m.substitutions++;m.decisions.push(`${m.minute}′ · ${b.name} on for ${a.name}`);return g}
export function advanceMatch(input:Career):Career {
 const g=structuredClone(input),m=g.activeMatch;if(!m||m.minute>=90)throw Error('No active match');
 for(let minute=m.minute+1;minute<=m.minute+15;minute++){
  const r=random(g.seed+g.season*100003+m.fixture.round*997+m.fixture.home*71+m.fixture.away*37+minute*137);
  const team=g.squad.filter(p=>m.lineup.includes(p.id));for(const p of team)m.minutes[p.id]=(m.minutes[p.id]??0)+1;
  const strength=team.reduce((sum,p)=>sum+(p.ability*.6+(p.attack+p.defence)*.2)*(.6+Math.max(35,p.fitness-(m.minutes[p.id]??0)*.18)/250),0)/11;
  const opponent=clubById(g.clubs,m.fixture.home===0?m.fixture.away:m.fixture.home).strength;
  for(const side of [0,1]){const ours=(side===0?m.fixture.home:m.fixture.away)===0;const difference=ours?strength-opponent:opponent-strength;const multiplier=m.tactic==='Attacking'?(ours?1.3:1.18):m.tactic==='Defensive'?(ours?.72:.8):1;
   if(r()<Math.max(.2,(side===0?1.35:1.05)+difference/23)*multiplier/90){const teamId=side===0?m.fixture.home:m.fixture.away;const candidates=team.filter(p=>p.position!=='GK');const weighted=candidates.flatMap(p=>Array.from({length:p.position==='FWD'?6:p.position==='MID'?3:1},()=>p));const scorer=weighted[Math.floor(r()*weighted.length)];m.fixture.score![side]++;m.fixture.goals!.push({minute,teamId,playerName:ours?scorer.name:opponentName(teamId,Math.floor(r()*10)),playerId:ours?scorer.id:undefined})}
  }
 }
 m.minute+=15;return g;
}
export function finishMatch(input:Career):Career {
 const m=input.activeMatch;if(!m||m.minute!==90)throw Error('Play to full time first');const g=structuredClone(input);delete g.activeMatch;
 // Weekly recovery uses the actual minutes played, including substituted players.
 for(const p of g.squad){const minutes=m.minutes[p.id]??0;p.fitness-=Math.round(minutes/90*14)-(g.selection.includes(p.id)?14:0)}
 g.tactic=m.tactic;const result=g.round<42?playRound(g,m.fixture):playPlayoff(g,m.fixture);result.inbox.unshift(`Matchday decisions\n\n${m.decisions.join('\n')||'No changes made.'}`);return result;
}
export function goalRecords(f:Fixture):Goal[]{if(f.goals)return f.goals;return (f.score??[0,0]).flatMap((count,side)=>Array.from({length:count},()=>({minute:0,teamId:side===0?f.home:f.away,playerName:'Scorer not recorded (older match)'})))}
