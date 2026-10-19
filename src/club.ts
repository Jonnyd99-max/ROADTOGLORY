import {random,transact,type Career,type Fixture,type Player} from './engine';

export type FacilityKind='stadium'|'training'|'recovery'|'food'|'drink';
export interface MatchdayReport {season:number;round:number;home:boolean;result:'win'|'draw'|'loss';fansBefore:number;fansAfter:number;capacity:number;demand:number;attendance:number;turnedAway:number;tickets:number;food:number;drink:number;sponsorBase:number;sponsorBonus:number;upkeep:number}
export interface ClubDevelopment {fans:number;facilities:Record<FacilityKind,number>;history:MatchdayReport[]}
export const facilities:FacilityKind[]=['stadium','training','recovery','food','drink'];
export const facilityNames:Record<FacilityKind,string>={stadium:'Stadium expansion',training:'Training facilities',recovery:'Recovery facilities',food:'Food concession',drink:'Drink concession'};
const costs:Record<FacilityKind,number[]>={stadium:[15000,30000,55000],training:[12000,24000,40000],recovery:[8000,16000,30000],food:[6000,12000,22000],drink:[5000,10000,18000]};
const maintenance:Record<FacilityKind,number[]>={stadium:[0,75,150,225],training:[0,75,160,280],recovery:[0,50,110,190],food:[0,35,80,140],drink:[0,30,70,125]};
export const sponsor={name:'Manchester Trade Co.',tier:8,base:250,winBonus:150,drawBonus:50};
export function fanChange(result:'win'|'draw'|'loss'){return result==='win'?45:result==='draw'?12:-8}
export function initialClub(g?:Career):ClubDevelopment {
 let fans=1000;
 if(g)for(const f of g.fixtures.filter(f=>f.score&&(f.home===0||f.away===0)).sort((a,b)=>a.round-b.round)){const [a,b]=f.home===0?f.score!:[f.score![1],f.score![0]];fans=Math.max(250,fans+fanChange(a>b?'win':a===b?'draw':'loss'))}
 return{fans,facilities:{stadium:0,training:0,recovery:0,food:0,drink:0},history:[]};
}
export const clubState=(g:Career)=>g.club??initialClub(g);
export function ensureClub(g:Career){g.club??=initialClub(g);return g.club}
export const stadiumCapacity=(g:Career)=>[1200,1450,1950,2750][clubState(g).facilities.stadium];
export const weeklyUpkeep=(g:Career)=>facilities.reduce((n,kind)=>n+maintenance[kind][clubState(g).facilities[kind]],0);
export const forecastDemand=(g:Career)=>Math.round(clubState(g).fans*.82+100);
export function stadiumAdvice(g:Career){const demand=forecastDemand(g),capacity=stadiumCapacity(g);return demand>=capacity?'Demand exceeds capacity — consider expanding.':demand>=capacity*.9?'Close to capacity — monitor your next home crowds.':'Room to grow — your current capacity covers expected demand.'}
export function trainingChance(g:Career,p:Player){return p.loan||p.age>=25||p.ability>=p.potential?0:Math.min(.8,(g.training==='Youth development'?.22:.08)+(g.selection.includes(p.id)?.06:0)+clubState(g).facilities.training*.04)}
export const recoveryPoints=(g:Career)=>(g.training==='Recovery'?18:10)+clubState(g).facilities.recovery*3;
export function upgradeQuote(g:Career,kind:FacilityKind){if(!facilities.includes(kind))throw Error('Unknown facility');const level=clubState(g).facilities[kind];return{level,maxed:level>=3,cost:costs[kind][level]??0,currentUpkeep:maintenance[kind][level],nextUpkeep:maintenance[kind][Math.min(3,level+1)]}}
export function facilityEffect(g:Career,kind:FacilityKind,next=false){const level=Math.min(3,clubState(g).facilities[kind]+(next?1:0));if(kind==='stadium')return`${[1200,1450,1950,2750][level].toLocaleString('en-GB')} capacity`;if(kind==='training')return`+${level*4} percentage points to home development chance`;if(kind==='recovery')return`+${level*3} fitness restored each matchweek`;if(kind==='food')return`£${[0,.55,.9,1.25][level].toFixed(2)} net per home attendee`;return`£${[0,.45,.75,1.05][level].toFixed(2)} net per home attendee`}
export function upgradeFacility(input:Career,kind:FacilityKind):Career{const g=structuredClone(input),state=ensureClub(g),quote=upgradeQuote(g,kind);if(quote.maxed)throw Error('Facility is already fully upgraded');transact(g,`${facilityNames[kind]} · Level ${quote.level+1}`,-quote.cost);state.facilities[kind]++;g.inbox.unshift(`Facility upgraded · ${facilityNames[kind]}\n\nLevel ${state.facilities[kind]} is now operational. ${facilityEffect(g,kind)}. Purchase cost: £${quote.cost.toLocaleString('en-GB')}. Total upkeep for this facility is now £${quote.nextUpkeep} per matchweek.`);return g}
/** Apply once for the club's completed fixture, independently of match RNG. */
export function processClubMatch(g:Career,f:Fixture){
 if(!f.score||(f.home!==0&&f.away!==0))throw Error('Completed Dragons fixture required');
 const state=ensureClub(g);if(state.history.some(x=>x.season===g.season&&x.round===f.round))throw Error('Matchday finances already processed');
 const home=f.home===0,[goals,against]=home?f.score:[f.score[1],f.score[0]],result=goals>against?'win':goals===against?'draw':'loss',r=random(g.seed+g.season*31+f.round*509+2027);
 const fansBefore=state.fans,capacity=stadiumCapacity(g),demand=home?Math.round(fansBefore*(.74+r()*.16)+60+r()*50):0,attendance=Math.min(capacity,demand),turnedAway=Math.max(0,demand-capacity);
 const tickets=attendance*9,food=Math.floor(attendance*[0,.55,.9,1.25][state.facilities.food]),drink=Math.floor(attendance*[0,.45,.75,1.05][state.facilities.drink]);
 const sponsorBonus=result==='win'?sponsor.winBonus:result==='draw'?sponsor.drawBonus:0,upkeep=weeklyUpkeep(g);
 if(home){transact(g,`${attendance} tickets × £9`,tickets);if(food)transact(g,'Food concession · net sales',food);if(drink)transact(g,'Drink concession · net sales',drink)}
 transact(g,`${sponsor.name} · Tier 8 match payment`,sponsor.base);if(sponsorBonus)transact(g,`${sponsor.name} · ${result} bonus`,sponsorBonus);
 if(upkeep){g.cash-=upkeep;g.ledger.unshift({round:g.round,label:'Facilities upkeep',amount:-upkeep})}
 state.fans=Math.max(250,state.fans+fanChange(result));
 state.history.unshift({season:g.season,round:f.round,home,result,fansBefore,fansAfter:state.fans,capacity,demand,attendance,turnedAway,tickets,food,drink,sponsorBase:sponsor.base,sponsorBonus,upkeep});state.history=state.history.slice(0,84);
 g.inbox.unshift(`Club & commercial report · Matchweek ${f.round+1}\n\nFanbase: ${fansBefore.toLocaleString('en-GB')} → ${state.fans.toLocaleString('en-GB')} (${state.fans-fansBefore>=0?'+':''}${state.fans-fansBefore}).\n${home?`Attendance: ${attendance.toLocaleString('en-GB')} / ${capacity.toLocaleString('en-GB')}. Unmet demand: ${turnedAway.toLocaleString('en-GB')}.\nTicket income: £${tickets.toLocaleString('en-GB')}. Food net income: £${food}. Drink net income: £${drink}.`:'Away fixture: no home gate or concession income.'}\nSponsor: £${sponsor.base} match payment + £${sponsorBonus} result bonus.\nFacilities upkeep: £${upkeep}.\n\n${stadiumAdvice(g)}`);
}
