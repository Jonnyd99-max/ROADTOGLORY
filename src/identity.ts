import type {Career} from './engine';
export const badgeShapes=['Shield','Circle','Diamond'] as const;
export const badgeIcons=['Dragon','Lion','Eagle','Football','Star','Castle'] as const;
export const kitPatterns=['Plain','Stripes','Hoops','Sash','Halves'] as const;
export interface ClubIdentity {clubName:string;shortName:string;stadiumName:string;trainingName:string;initials:string;badgeShape:typeof badgeShapes[number];badgeIcon:typeof badgeIcons[number];primary:string;secondary:string;accent:string;homePattern:typeof kitPatterns[number];awayPattern:typeof kitPatterns[number];awayPrimary:string;awaySecondary:string;customised?:boolean}
export const defaultIdentity:ClubIdentity={clubName:'Dragons Athletic FC',shortName:'Dragons',stadiumName:'Dragon’s Den',trainingName:'Training facilities',initials:'DAFC',badgeShape:'Shield',badgeIcon:'Dragon',primary:'#a51e35',secondary:'#171923',accent:'#e0ba65',homePattern:'Plain',awayPattern:'Sash',awayPrimary:'#f2e9d3',awaySecondary:'#a51e35'};
export const clubIdentity=(g:Pick<Career,'identity'|'clubs'>):ClubIdentity=>({...defaultIdentity,clubName:g.clubs.find(c=>c.id===0)?.name??defaultIdentity.clubName,...g.identity});
export function updateIdentity(input:Career,draft:ClubIdentity):Career{
 if(input.activeMatch)throw Error('Finish the match before changing club identity');
 const next={...draft};for(const key of ['clubName','shortName','stadiumName','trainingName','initials'] as const){next[key]=next[key].trim();if(!next[key]||next[key].length>(key==='initials'?4:key==='shortName'?24:50)||/[\x00-\x1f]/.test(next[key]))throw Error(`Enter a valid ${key.replace('Name',' name')} (maximum ${key==='initials'?4:key==='shortName'?24:50} characters)`);}
 if(!badgeShapes.includes(next.badgeShape)||!badgeIcons.includes(next.badgeIcon)||!kitPatterns.includes(next.homePattern)||!kitPatterns.includes(next.awayPattern))throw Error('Choose a preset crest and kit design');
 for(const key of ['primary','secondary','accent','awayPrimary','awaySecondary'] as const)if(!/^#[0-9a-f]{6}$/i.test(next[key]))throw Error('Choose valid club colours');
 const g=structuredClone(input);g.identity={...next,customised:true};g.identitySetupComplete=true;if(input.identitySetupComplete===false)g.inbox=g.inbox.map(m=>m.startsWith('Welcome')?`Welcome to ${next.clubName}\n\nBuild your dynasty at ${next.stadiumName}. Your training base is ${next.trainingName}.`:m);const club=g.clubs.find(c=>c.id===0);if(club)club.name=next.clubName;return g;
}
