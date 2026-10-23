import {clubIdentity} from './identity';
import {academyUpkeep} from './academy';
import {division,tierOf,groundLimits,type Tier} from './division';
import {random,transact,type Career,type Fixture,type Player} from './engine';

export type FacilityKind='stadium'|'training'|'recovery'|'food'|'drink';
export interface MatchdayReport {season:number;round:number;home:boolean;result:'win'|'draw'|'loss';fansBefore:number;fansAfter:number;capacity:number;demand:number;attendance:number;turnedAway:number;tickets:number;food:number;drink:number;sponsorBase:number;sponsorBonus:number;upkeep:number;runningCosts?:number;matchCosts?:number;ticketPrice?:number;tier?:Tier}
export type StandSide='North'|'East'|'South'|'West';
export type StandStyle='Open terrace'|'Covered terrace'|'Seated stand';
export interface StadiumStand {side:StandSide;capacity:number;style:StandStyle}
export interface ClubDevelopment {stands?:StadiumStand[];stadiumUpkeep?:number;fans:number;facilities:Record<FacilityKind,number>;history:MatchdayReport[]}
export const facilities:FacilityKind[]=['stadium','training','recovery','food','drink'];
export const facilityNames:Record<FacilityKind,string>={stadium:'Stadium expansion',training:'Training facilities',recovery:'Recovery facilities',food:'Food concession',drink:'Drink concession'};
const costs:Record<FacilityKind,number[]>={stadium:[15000,30000,55000,90000,140000],training:[12000,24000,40000],recovery:[8000,16000,30000],food:[6000,12000,22000],drink:[5000,10000,18000]};
const maintenance:Record<FacilityKind,number[]>={stadium:[0,75,150,225,400,650],training:[0,75,160,280],recovery:[0,50,110,190],food:[0,35,80,140],drink:[0,30,70,125]};
export const sponsor={name:'Manchester Trade Co.',tier:8,base:250,winBonus:150,drawBonus:50};
export function sponsorFor(g:Career){const d=division(g);return{name:sponsor.name,tier:tierOf(g),base:d.sponsorBase,winBonus:d.winBonus,drawBonus:d.drawBonus}}
export function fanChange(result:'win'|'draw'|'loss',g?:Career){const d=division(g??{});return result==='win'?d.fanWin:result==='draw'?d.fanDraw:-d.fanLoss}
export function initialClub(g?:Career):ClubDevelopment {
 let fans=1000;
 if(g)for(const f of g.fixtures.filter(f=>f.score&&(f.home===0||f.away===0)).sort((a,b)=>a.round-b.round)){const [a,b]=f.home===0?f.score!:[f.score![1],f.score![0]];fans=Math.max(250,fans+fanChange(a>b?'win':a===b?'draw':'loss'))}
 return{fans,facilities:{stadium:0,training:0,recovery:0,food:0,drink:0},history:[]};
}
export const clubState=(g:Career)=>g.club??initialClub(g);
export function ensureClub(g:Career){g.club??=initialClub(g);return g.club}
export const stadiumCapacity=(g:Career)=>stadiumStands(g).reduce((sum,s)=>sum+s.capacity,0);
export const weeklyUpkeep=(g:Career)=>facilities.reduce((n,kind)=>n+(kind==='stadium'?(clubState(g).stadiumUpkeep??maintenance.stadium[clubState(g).facilities.stadium]):maintenance[kind][clubState(g).facilities[kind]]),0)+academyUpkeep(g);
export const clubRunningCosts=(g:Career)=>division(g).runningBase+Math.round(stadiumCapacity(g)*division(g).costPerSeat);
export const forecastDemand=(g:Career)=>Math.round(clubState(g).fans*.82+100);
export function stadiumAdvice(g:Career){const demand=forecastDemand(g),capacity=stadiumCapacity(g);return demand>=capacity?'Demand exceeds capacity — consider expanding.':demand>=capacity*.9?'Close to capacity — monitor your next home crowds.':'Room to grow — your current capacity covers expected demand.'}
export function trainingChance(g:Career,p:Player){return p.loan||p.age>=25||p.ability>=p.potential?0:Math.min(.8,(g.training==='Youth development'?.22:.08)+(g.selection.includes(p.id)?.06:0)+clubState(g).facilities.training*.04)}
export const recoveryPoints=(g:Career)=>(g.training==='Recovery'?18:10)+clubState(g).facilities.recovery*3;
export function upgradeQuote(g:Career,kind:FacilityKind){if(!facilities.includes(kind))throw Error('Unknown facility');const level=clubState(g).facilities[kind];const maxLevel=kind==='stadium'&&tierOf(g)<=7?5:3;return{level,maxLevel,maxed:level>=maxLevel,cost:costs[kind][level]??0,currentUpkeep:maintenance[kind][level],nextUpkeep:maintenance[kind][Math.min(maintenance[kind].length-1,level+1)]}}
export function facilityEffect(g:Career,kind:FacilityKind,next=false){const level=Math.min(kind==='stadium'?5:3,clubState(g).facilities[kind]+(next?1:0));if(kind==='stadium')return`${[1200,1450,1950,2750,4000,5500][level].toLocaleString('en-GB')} capacity`;if(kind==='training')return`+${level*4} percentage points to home development chance`;if(kind==='recovery')return`+${level*3} fitness restored each matchweek`;if(kind==='food')return`£${[0,.55,.9,1.25][level].toFixed(2)} net per home attendee`;return`£${[0,.45,.75,1.05][level].toFixed(2)} net per home attendee`}
export const facilityName=(g:Career,kind:FacilityKind)=>kind==='training'?clubIdentity(g).trainingName:facilityNames[kind];
export function upgradeFacility(input:Career,kind:FacilityKind):Career{if(kind==='stadium'&&input.club?.stands)throw Error('Use the stand-by-stand stadium builder');const g=structuredClone(input),state=ensureClub(g),quote=upgradeQuote(g,kind);if(quote.maxed)throw Error('Facility is already fully upgraded');transact(g,`${facilityName(g,kind)} · Level ${quote.level+1}`,-quote.cost);state.facilities[kind]++;if(kind==='stadium'){delete state.stands;delete state.stadiumUpkeep;}g.inbox.unshift(`Facility upgraded · ${facilityName(g,kind)}\n\nLevel ${state.facilities[kind]} is now operational. ${facilityEffect(g,kind)}. Purchase cost: £${quote.cost.toLocaleString('en-GB')}. Total upkeep for this facility is now £${quote.nextUpkeep} per matchweek.`);return g}
/** Apply once for the club's completed fixture, independently of match RNG. */
export function processClubMatch(g:Career,f:Fixture){
 if(!f.score||(f.home!==0&&f.away!==0))throw Error('Completed club fixture required');
 const config=division(g),deal=sponsorFor(g),state=ensureClub(g);if(state.history.some(x=>x.season===g.season&&x.round===f.round))throw Error('Matchday finances already processed');
 const home=f.home===0,[goals,against]=home?f.score:[f.score[1],f.score[0]],result=goals>against?'win':goals===against?'draw':'loss',r=random(g.seed+g.season*31+f.round*509+2027);
 const fansBefore=state.fans,capacity=stadiumCapacity(g),demand=home?Math.round(fansBefore*(.74+r()*.16)+60+r()*50):0,attendance=Math.min(capacity,demand),turnedAway=Math.max(0,demand-capacity);
 const tickets=attendance*config.ticketPrice,food=Math.floor(attendance*[0,.55,.9,1.25][state.facilities.food]),drink=Math.floor(attendance*[0,.45,.75,1.05][state.facilities.drink]);
 const sponsorBonus=result==='win'?deal.winBonus:result==='draw'?deal.drawBonus:0,upkeep=weeklyUpkeep(g),runningCosts=clubRunningCosts(g),matchCosts=home?Math.round(attendance*config.costPerAttendee):0;
 if(home){transact(g,`${attendance} tickets × £${config.ticketPrice}`,tickets);if(food)transact(g,'Food concession · net sales',food);if(drink)transact(g,'Drink concession · net sales',drink)}
 transact(g,`${deal.name} · Tier ${deal.tier} match payment`,deal.base);if(sponsorBonus)transact(g,`${deal.name} · ${result} bonus`,sponsorBonus);
 if(upkeep){g.cash-=upkeep;g.ledger.unshift({round:g.round,label:'Facilities upkeep',amount:-upkeep})}
 for(const [label,cost] of [['Club running costs',runningCosts],['Matchday operations',matchCosts]] as const){if(cost){g.cash-=cost;g.ledger.unshift({round:g.round,label,amount:-cost})}}
 state.fans=Math.max(250,state.fans+fanChange(result,g));
 state.history.unshift({season:g.season,round:f.round,home,result,fansBefore,fansAfter:state.fans,capacity,demand,attendance,turnedAway,tickets,food,drink,sponsorBase:deal.base,sponsorBonus,upkeep,runningCosts,matchCosts,ticketPrice:config.ticketPrice,tier:deal.tier});state.history=state.history.slice(0,84);
 g.inbox.unshift(`Club & commercial report · Matchweek ${f.round+1}\n\nFanbase: ${fansBefore.toLocaleString('en-GB')} → ${state.fans.toLocaleString('en-GB')} (${state.fans-fansBefore>=0?'+':''}${state.fans-fansBefore}).\n${home?`Attendance: ${attendance.toLocaleString('en-GB')} / ${capacity.toLocaleString('en-GB')}. Unmet demand: ${turnedAway.toLocaleString('en-GB')}.\nTicket income: £${tickets.toLocaleString('en-GB')}. Food net income: £${food}. Drink net income: £${drink}.`:'Away fixture: no home gate or concession income.'}\nSponsor: £${deal.base} match payment + £${sponsorBonus} result bonus.\nFacilities upkeep: £${upkeep}. Running costs: £${runningCosts}. Matchday operations: £${matchCosts}.\n\n${stadiumAdvice(g)}`);
}



export const standSides:StandSide[]=['North','East','South','West'];
export const standStyles:StandStyle[]=['Open terrace','Covered terrace','Seated stand'];
/** Older saves keep every paid-for place; distribute remainder seats without rounding loss. */
export function stadiumStands(g:Career):StadiumStand[]{const state=clubState(g);if(state.stands)return state.stands;const total=[1200,1450,1950,2750,4000,5500][state.facilities.stadium];return standSides.map((side,i)=>({side,capacity:Math.floor(total/4)+(i<total%4?1:0),style:i===3?'Seated stand':i===0?'Covered terrace':'Open terrace'}))}
export function standQuote(g:Career,side:StandSide,style:StandStyle,extra:number){
 if(!standSides.includes(side)||!standStyles.includes(style)||![0,250,500,1000].includes(extra))throw Error('Choose a valid stand design');
 const stand=stadiumStands(g).find(s=>s.side===side)!;const currentRank=standStyles.indexOf(stand.style),rank=standStyles.indexOf(style);
 if(rank<currentRank)throw Error('Choose the current style or a better stand');
 if(!extra&&rank===currentRank)throw Error('Choose added capacity or a new style');
 const maximum=groundLimits[tierOf(g)];
 if(extra>0&&stadiumCapacity(g)+extra>maximum)throw Error(`Tier ${tierOf(g)} ground limit is ${maximum.toLocaleString('en-GB')} places`);
 const rates=[40,60,90],cost=extra*rates[rank]+stand.capacity*(rates[rank]-rates[currentRank]);
 const extraUpkeep=Math.ceil(extra*.12+(stand.capacity+extra)*rank*.035-stand.capacity*currentRank*.035);
 return{cost,extraUpkeep,capacity:stand.capacity+extra,total:stadiumCapacity(g)+extra,maximum};
}
export function upgradeStand(input:Career,side:StandSide,style:StandStyle,extra:number):Career{
 if(input.activeMatch)throw Error('Finish the match before starting construction');
 const quote=standQuote(input,side,style,extra),g=structuredClone(input),state=ensureClub(g);
 state.stands=structuredClone(stadiumStands(g));state.stadiumUpkeep??=maintenance.stadium[state.facilities.stadium];
 transact(g,`${side} stand · ${style} · +${extra} places`,-quote.cost);
 Object.assign(state.stands.find(s=>s.side===side)!,{style,capacity:quote.capacity});state.stadiumUpkeep+=quote.extraUpkeep;
 g.inbox.unshift(`${clubIdentity(g).stadiumName} · ${side} stand completed\n\n${style}: ${quote.capacity.toLocaleString('en-GB')} places. Total stadium capacity: ${quote.total.toLocaleString('en-GB')}. Cost: £${quote.cost.toLocaleString('en-GB')}. Additional upkeep: £${quote.extraUpkeep} per matchweek.`);return g;
}
