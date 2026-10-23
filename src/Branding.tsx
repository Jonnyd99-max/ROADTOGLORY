import {useId} from 'react';
import {clubIdentity,type ClubIdentity} from './identity';
import type {Career} from './engine';
function Symbol({icon}:{icon:ClubIdentity['badgeIcon']}){switch(icon){
 case 'Football':return <g fill="none" stroke="currentColor" strokeWidth="3"><circle cx="60" cy="58" r="22"/><path d="m60 44 12 9-5 14H53l-5-14 12-9Zm0-8v8m21 5-9 4m1 23-6-9M47 76l6-9M39 49l9 4"/></g>;
 case 'Star':return <path d="m60 32 7 17 19 2-14 13 4 19-16-10-16 10 4-19-14-13 19-2Z" fill="currentColor"/>;
 case 'Castle':return <path d="M35 37h10v9h10v-9h10v9h10v-9h10v17h-5v30H40V54h-5Zm19 47h12V66H54Z" fill="currentColor" fillRule="evenodd"/>;
 case 'Eagle':return <path d="m60 44-13 9-24-16 12 24 16 7-5 17 14-9 14 9-5-17 16-7 12-24-24 16-9-9 6-8-10-4Z" fill="currentColor"/>;
 case 'Lion':return <g fill="currentColor"><path d="m60 31 10 7 11 1 2 13 6 9-8 10-4 13-17 8-17-8-4-13-8-10 6-9 2-13 11-1Z"/><path d="m45 48 9 3m21-3-9 3m-13 17 7 7 7-7" fill="none" stroke="#171923" strokeWidth="4"/></g>;
 default:return <path d="m39 84 5-18-13-10 17 1 7-12-10-15 18 7 18-5-5 13 12 8-16 5-6 13 12 8-17 1-4 11-7-9Zm24-39 8-2-4 7Z" fill="currentColor" fillRule="evenodd"/>;
}}
function tint(hex:string,amount:number){const n=parseInt(hex.slice(1),16);return '#'+[n>>16&255,n>>8&255,n&255].map(c=>Math.round(amount>=0?c+(255-c)*amount:c*(1+amount)).toString(16).padStart(2,'0')).join('')}
export function Crest({identity:i,className=''}:{identity:ClubIdentity;className?:string}){
 const id='crest'+useId().replace(/[^a-zA-Z0-9_-]/g,''),shape=i.badgeShape==='Shield'?'M13 8Q60 15 107 8v65c0 28-27 48-47 59C40 121 13 101 13 73Z':i.badgeShape==='Diamond'?'M60 5 114 68 60 134 6 68Z':'M60 8a57 57 0 1 1 0 114 57 57 0 1 1 0-114Z';
 return <svg className={'custom-crest crest-sculpted '+className} viewBox="0 0 140 160" role="img" aria-label={`${i.clubName} crest · ${i.badgeIcon} on ${i.badgeShape.toLowerCase()}`}><defs>
 <linearGradient id={id+'metal'} x1="0" y1="0" x2="1" y2="1"><stop stopColor={tint(i.accent,.8)}/><stop offset=".22" stopColor={i.accent}/><stop offset=".43" stopColor={tint(i.accent,-.5)}/><stop offset=".55" stopColor={tint(i.accent,.85)}/><stop offset=".7" stopColor={i.accent}/><stop offset="1" stopColor={tint(i.accent,-.6)}/></linearGradient>
 <radialGradient id={id+'face'} cx=".3" cy=".18" r=".9"><stop stopColor={tint(i.primary,.3)}/><stop offset=".55" stopColor={i.primary}/><stop offset="1" stopColor={tint(i.primary,-.68)}/></radialGradient>
 <linearGradient id={id+'gloss'} x2=".7" y2="1"><stop stopColor="white" stopOpacity=".5"/><stop offset=".45" stopColor="white" stopOpacity=".03"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient>
 <linearGradient id={id+'ribbon'} x2="0" y2="1"><stop stopColor={tint(i.secondary,.32)}/><stop offset=".45" stopColor={i.secondary}/><stop offset="1" stopColor={tint(i.secondary,-.55)}/></linearGradient>
 <clipPath id={id+'clip'}><path d={shape}/></clipPath>
 <filter id={id+'shadow'} x="-35%" y="-25%" width="180%" height="180%"><feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#000" floodOpacity=".6"/></filter>
 </defs><ellipse cx="73" cy="147" rx="39" ry="5" fill="#000" opacity=".25"/>
 <g transform="translate(9 6)" filter={`url(#${id}shadow)`}>
 {[4,3,2,1].map(depth=><path key={depth} d={shape} transform={`translate(${depth*.45} ${depth})`} fill={tint(i.accent,-.75)} stroke={tint(i.accent,-.65)} strokeWidth="8"/>)}
 <path d={shape} fill={`url(#${id}face)`} stroke={`url(#${id}metal)`} strokeWidth="8"/>
 <path d={shape} fill="none" stroke={tint(i.accent,.7)} strokeWidth=".8" transform="translate(3 4) scale(.95 .94)" opacity=".9"/>
 <g clipPath={`url(#${id}clip)`}><path d="M-5 0h132v43Q70 19-5 74Z" fill={`url(#${id}gloss)`}/><path d="M-5 124Q64 87 126 117v31H-5Z" fill="#000" opacity=".2"/>
 <g transform="translate(1 2)" color={tint(i.accent,-.8)}><Symbol icon={i.badgeIcon}/></g><g transform="translate(0 -1)" color={tint(i.accent,.8)}><Symbol icon={i.badgeIcon}/></g><g color={i.accent}><Symbol icon={i.badgeIcon}/></g>
 <path d="m20 94 10-5h60l10 5-4 22H24Z" fill="#000" opacity=".4"/><path d="M23 91h74v23H23Z" rx="3" fill={`url(#${id}ribbon)`} stroke={`url(#${id}metal)`} strokeWidth="1.3"/>
 <path d="M26 93h68" stroke="white" strokeOpacity=".28"/>
 <text x="60" y="107" textAnchor="middle" fontFamily="Tahoma, sans-serif" fontSize="12" letterSpacing="1.6" fontWeight="bold" fill="#000" transform="translate(.7 1)">{i.initials.toUpperCase()}</text><text x="60" y="107" textAnchor="middle" fontFamily="Tahoma, sans-serif" fontSize="12" letterSpacing="1.6" fontWeight="bold" fill={tint(i.accent,.25)}>{i.initials.toUpperCase()}</text>
 </g></g></svg>;
}
export function ClubCrest({career:g,className=''}:{career:Career;className?:string}){return g.identity?.customised?<Crest identity={clubIdentity(g)} className={className}/>:<img className={className} src={import.meta.env.BASE_URL+'crest.svg'} alt={`${clubIdentity(g).clubName} crest`}/>}
export function Kit({identity:i,away=false}:{identity:ClubIdentity;away?:boolean}){
 const id='kit'+useId().replace(/[^a-zA-Z0-9_-]/g,''),pattern=away?i.awayPattern:i.homePattern,base=away?i.awayPrimary:i.primary,contrast=away?i.awaySecondary:i.secondary;
 const shirt='M48 20Q57 15 67 10Q80 19 93 10Q106 15 112 20L143 39Q140 55 128 72L111 61Q108 96 113 157Q80 164 47 157Q52 96 49 61L32 72Q20 57 17 39Z';
 return <svg className="custom-kit kit-sculpted" viewBox="0 0 190 270" role="img" aria-label={`${away?'Away':'Home'} kit · ${pattern.toLowerCase()}`}><defs>
 <clipPath id={id+'shirt'}><path d={shirt}/></clipPath>
 <clipPath id={id+'shorts'}><path d="M48 170Q80 174 112 170l8 52-33 2-7-28-7 28-33-2Z"/></clipPath>
 <linearGradient id={id+'body'} x2="1" y2="0"><stop stopColor="#000" stopOpacity=".6"/><stop offset=".23" stopColor="#fff" stopOpacity=".14"/><stop offset=".44" stopColor="#fff" stopOpacity=".26"/><stop offset=".67" stopColor="#000" stopOpacity=".09"/><stop offset=".84" stopColor="#fff" stopOpacity=".14"/><stop offset="1" stopColor="#000" stopOpacity=".65"/></linearGradient>
 <linearGradient id={id+'vertical'} x2=".2" y2="1"><stop stopColor="#fff" stopOpacity=".22"/><stop offset=".26" stopColor="#fff" stopOpacity="0"/><stop offset=".7" stopColor="#000" stopOpacity=".04"/><stop offset="1" stopColor="#000" stopOpacity=".5"/></linearGradient>
 <linearGradient id={id+'fold'} x2="1" y2="0"><stop stopColor="#000" stopOpacity=".4"/><stop offset=".4" stopColor="#fff" stopOpacity=".22"/><stop offset=".62" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity="0"/></linearGradient>
 <linearGradient id={id+'collar'} x2="0" y2="1"><stop stopColor={tint(i.accent,.45)}/><stop offset=".5" stopColor={i.accent}/><stop offset="1" stopColor={tint(i.accent,-.4)}/></linearGradient>
 <pattern id={id+'weave'} width="3" height="3" patternUnits="userSpaceOnUse"><path d="m0 0 1 1m1 1 1-1m0 2 1 1" stroke="#fff" strokeOpacity=".12" strokeWidth=".35"/></pattern>
 <filter id={id+'shadow'} x="-35%" y="-20%" width="180%" height="170%"><feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity=".6"/></filter>
 </defs><ellipse cx="98" cy="260" rx="56" ry="6" fill="#000" opacity=".26"/>
 <g transform="translate(15 1)">
 <g filter={`url(#${id}shadow)`}>
 <path d={shirt} fill={base}/>
 <g clipPath={`url(#${id}shirt)`}>
 {pattern==='Stripes'&&[24,49,74,99,124].map(x=><rect key={x} x={x} width="12" height="170" fill={contrast}/>)}
 {pattern==='Hoops'&&[30,58,86,114,142].map(y=><rect key={y} y={y} width="160" height="13" fill={contrast}/>)}
 {pattern==='Sash'&&<path d="m10 0 23-5 132 150-21 19Z" fill={contrast}/>}
 {pattern==='Halves'&&<path d="M80 0h80v170H80Z" fill={contrast}/>}
 <path d={shirt} fill={`url(#${id}body)`}/><path d={shirt} fill={`url(#${id}vertical)`}/>
 <path d="M49 48Q57 64 59 88L54 156H46Q55 82 49 48" fill={`url(#${id}fold)`}/>
 <path d="M111 48Q99 71 106 116l5 43h-14Q101 109 99 85Z" fill={`url(#${id}fold)`}/>
 <path d="M72 78Q64 116 71 160h8Q72 122 81 74Z" fill={`url(#${id}fold)`} opacity=".65"/>
 <path d="m25 43 18 9-3 18-18-9Z" fill="#000" opacity=".18"/><path d="m122 49 20-9-6 22-18 10Z" fill="#000" opacity=".22"/>
 <path d={shirt} fill={`url(#${id}weave)`}/>
 <path d="M50 46q5 17 0 37M110 46q-5 17 0 37" fill="none" stroke={tint(base,-.45)} strokeWidth="1.2"/><path d="M51 47q5 17 0 34M109 47q-5 17 0 34" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth=".5"/>
 <path d="M20 58 33 68 40 57M120 57l9 11 12-14" fill="none" stroke={i.accent} strokeWidth="3"/><path d="M49 154Q80 161 111 154" fill="none" stroke={i.accent} strokeWidth="2"/>
 <path d="M50 151Q80 158 110 151" stroke="#fff" strokeOpacity=".18" strokeDasharray="1 2" fill="none"/>
 </g>
 <path d="M67 10Q80 20 93 10L89 28Q80 33 71 28Z" fill={tint(contrast,-.7)}/>
 <path d="M67 10q13 11 26 0l-3 9-10 13-10-13Z" fill={`url(#${id}collar)`}/><path d="M72 15q8 5 16 0l-8 11Z" fill={tint(contrast,-.5)}/>
 <path d="m52 20 13-6m30 0 13 6" stroke="#fff" strokeOpacity=".25" strokeWidth="1"/>
 <g transform="translate(94 41) scale(.13)"><path d="M13 8h94v66c0 28-27 48-47 58C40 122 13 102 13 74Z" fill={contrast} stroke={i.accent} strokeWidth="7"/><g color={i.accent}><Symbol icon={i.badgeIcon}/></g></g>
 <path d="m58 48 7-4 7 4-7 3Z" fill={i.accent} opacity=".85"/>
 <g clipPath={`url(#${id}shorts)`}><path d="M35 165h90v65H35Z" fill={contrast}/><path d="M35 165h90v65H35Z" fill={`url(#${id}body)`}/><path d="M35 165h90v65H35Z" fill={`url(#${id}vertical)`}/><path d="M35 165h90v65H35Z" fill={`url(#${id}weave)`}/><path d="m49 170 5 55m57-55-5 55" stroke={i.accent} strokeWidth="3"/><path d="M80 177v18" stroke="#000" strokeOpacity=".35" strokeWidth="2"/><path d="M47 173q33 4 66 0" stroke="#fff" strokeOpacity=".25" fill="none"/></g>
 <path d="M49 170q31 5 63 0" stroke={tint(contrast,-.5)} strokeWidth="4" fill="none"/>
 <g fill={base}><path d="M48 232h22l-2 20-8 6H44l3-8Z"/><path d="M91 232h22l2 18 3 8h-17l-8-6Z"/></g><g stroke={i.accent} strokeWidth="3"><path d="M48 236h22m21 0h22"/></g><g fill={`url(#${id}body)`}><path d="M48 232h22l-2 20-8 6H44l3-8Z"/><path d="M91 232h22l2 18 3 8h-17l-8-6Z"/></g>
 </g></g></svg>;
}
export function KitDisplay({career:g}:{career:Career}){return g.identity?.customised?<div className="custom-kit-pair"><Kit identity={clubIdentity(g)}/><Kit identity={clubIdentity(g)} away/></div>:<img src={import.meta.env.BASE_URL+'kits.png'} alt={`${clubIdentity(g).clubName} home and away kits`}/>}
