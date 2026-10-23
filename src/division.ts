import type {Career} from './engine';
export type Tier=1|2|3|4|5|6|7|8;
export const tiers:Tier[]=[1,2,3,4,5,6,7,8];
export const divisions={
 1:{name:'Premier Division',wageBudget:150000,ticketPrice:45,sponsorBase:70000,winBonus:25000,drawBonus:8000,fanWin:450,fanDraw:110,fanLoss:60,runningBase:20000,costPerSeat:1.8,costPerAttendee:7,prizes:[2500000,1500000,900000,500000],promotionBonus:0},
 2:{name:'Championship Division',wageBudget:90000,ticketPrice:35,sponsorBase:38000,winBonus:14000,drawBonus:4500,fanWin:330,fanDraw:85,fanLoss:45,runningBase:13000,costPerSeat:1.6,costPerAttendee:6,prizes:[1000000,650000,400000,250000],promotionBonus:500000},
 3:{name:'League One Division',wageBudget:50000,ticketPrice:28,sponsorBase:18000,winBonus:6500,drawBonus:2200,fanWin:250,fanDraw:60,fanLoss:35,runningBase:8000,costPerSeat:1.4,costPerAttendee:5,prizes:[450000,280000,160000,100000],promotionBonus:220000},
 4:{name:'League Two Division',wageBudget:28000,ticketPrice:22,sponsorBase:8000,winBonus:3000,drawBonus:1000,fanWin:180,fanDraw:45,fanLoss:25,runningBase:4500,costPerSeat:1.25,costPerAttendee:4.5,prizes:[180000,110000,65000,40000],promotionBonus:100000},
 5:{name:'National Division',wageBudget:15000,ticketPrice:17,sponsorBase:3500,winBonus:1400,drawBonus:450,fanWin:120,fanDraw:30,fanLoss:18,runningBase:2500,costPerSeat:1.1,costPerAttendee:4,prizes:[80000,45000,25000,15000],promotionBonus:45000},
 6:{name:'National North Division',wageBudget:8000,ticketPrice:14,sponsorBase:1400,winBonus:650,drawBonus:200,fanWin:85,fanDraw:22,fanLoss:14,runningBase:1600,costPerSeat:1.05,costPerAttendee:3.6,prizes:[35000,20000,11000,6500],promotionBonus:25000},
 8:{name:'Northern Division One',wageBudget:2600,ticketPrice:9,sponsorBase:250,winBonus:150,drawBonus:50,fanWin:45,fanDraw:12,fanLoss:8,runningBase:500,costPerSeat:.65,costPerAttendee:2.7,prizes:[8000,4000,2000,1000],promotionBonus:8000},
 7:{name:'Northern Premier Division',wageBudget:4200,ticketPrice:11,sponsorBase:550,winBonus:300,drawBonus:100,fanWin:60,fanDraw:16,fanLoss:10,runningBase:1000,costPerSeat:1,costPerAttendee:3.2,prizes:[18000,10000,5000,2500],promotionBonus:18000}
} as const;
export const tierOf=(g:Pick<Career,'tier'>):Tier=>g.tier??8;
export const division=(g:Pick<Career,'tier'>)=>divisions[tierOf(g)];

export const strengthRanges:Record<Tier,[number,number]>={8:[44,61],7:[58,75],6:[64,79],5:[68,82],4:[72,85],3:[76,88],2:[79,92],1:[82,95]};
export const clubStrength=(tier:Tier,id:number,season=0)=>{const [low,high]=strengthRanges[tier];return low+((id*7+season)%(high-low+1))};
export const groundLimits:Record<Tier,number>={8:2750,7:5500,6:10000,5:15000,4:22000,3:30000,2:45000,1:65000};
