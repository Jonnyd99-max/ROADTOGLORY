import type {Career} from './engine';
export type Tier=7|8;
export const divisions={
 8:{name:'Northern Division One',wageBudget:2600,ticketPrice:9,sponsorBase:250,winBonus:150,drawBonus:50,fanWin:45,fanDraw:12,fanLoss:8,runningBase:500,costPerSeat:.65,costPerAttendee:2.7,prizes:[8000,4000,2000,1000],promotionBonus:8000},
 7:{name:'Northern Premier Division',wageBudget:4200,ticketPrice:11,sponsorBase:550,winBonus:300,drawBonus:100,fanWin:60,fanDraw:16,fanLoss:10,runningBase:1000,costPerSeat:1,costPerAttendee:3.2,prizes:[18000,10000,5000,2500],promotionBonus:0}
} as const;
export const tierOf=(g:Pick<Career,'tier'>):Tier=>g.tier??8;
export const division=(g:Pick<Career,'tier'>)=>divisions[tierOf(g)];
