import {useId} from 'react';
import {clubIdentity,type ClubIdentity} from './identity';
import type {Career} from './engine';
/** Original heraldic symbols, kept bold enough to read on a shirt-sized crest. */
function Symbol({icon}:{icon:ClubIdentity['badgeIcon']}){switch(icon){
 case 'Dragon':return <g fill="currentColor" strokeLinejoin="round">
 {/* Swept bat wing, long neck, horned profile and coiled tail. */}
 <path d="M48 62 29 27Q48 29 62 46L61 30Q78 41 82 56L65 65Z"/>
 <path d="M43 72C32 67 22 72 21 81c-1 8 10 10 15 4-9 2-11-3-6-6 7-4 13 1 19 0l5-8Zm8-3c-3-9 0-17 8-19 6-2 11 0 14-6l-1-11 9 6 6-12 3 13 12 5-2 8-11 1 7 6-13-1c-5 4-6 9-11 14l5 8 12-2 7 6-10-2-5 4-9-1-9-11-6 1-4 10 10 1 5 5-11-2-6 3-8-5 4-15Z"/>
 <path d="m70 59 10 7 10-3 7 4-9 1-8 3-12-7Zm-18 9-8 8-8-1-5 5 11-1 9-5Z"/>
 <path d="m53 49-6-8 1 13m8-1-5-8 1 12m8-2-5-7 1 11" fill="none" stroke="#101a20" strokeOpacity=".65" strokeWidth="1.4"/>
 <path d="M35 34q18 9 27 24M46 44l-3 12m10-6-1 11m13-15 3 13M64 66q5-8 10-12" fill="none" stroke="#101a20" strokeOpacity=".6" strokeWidth="1.6" strokeLinecap="round"/>
 <path d="m84 43 6 2-5 3Zm9 6h6l-2 2h-5Z" fill="#101a20"/>
 <path d="m99 55 5-3-2 5 5 2-7 2 2-3Z" opacity=".9"/>
 </g>;
 case 'Lion':return <g fill="currentColor" strokeLinejoin="round">
 <path d="M60 27 69 32 78 30 82 39 90 44 86 54 92 63 84 70 81 82 69 82 60 90 51 82 39 82 36 70 28 63 34 54 30 44 38 39 42 30 51 32Z"/>
 <path d="M44 42q-7-10-9 0l6 9m35-9q7-10 9 0l-6 9M45 41q15-9 30 0l-1 23-8 12H54l-8-12Z" fill="none" stroke="#101a20" strokeOpacity=".6" strokeWidth="1.8"/>
 <path d="m45 49 11 3-7 3Zm30 0-11 3 7 3ZM54 61h12l-6 6Z" fill="#101a20"/>
 <path d="M60 66v6m0-1q-7 6-12-2m12 2q7 6 12-2M40 59l9 2m-9 5 9-1m31-6-9 2m9 5-9-1M46 76l5 6m23-6-5 6" fill="none" stroke="#101a20" strokeOpacity=".8" strokeWidth="1.7" strokeLinecap="round"/>
 <path d="M51 43q9-4 18 0" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1.3"/>
 </g>;
 case 'Eagle':return <g fill="currentColor" strokeLinejoin="round">
 <path d="M57 51Q43 48 25 31l1 10 18 15-23-12 5 12 20 8-18-4 7 10 18 1Z"/>
 <path d="M57 51Q43 48 25 31l1 10 18 15-23-12 5 12 20 8-18-4 7 10 18 1Z" transform="translate(120 0) scale(-1 1)"/>
 <path d="M55 46q-2-9 7-12l11 5-7 5-3-1q7 12 2 23l7 12-9-3-3 13-3-13-9 3 7-12q-6-11 0-20Z"/>
 <path d="m54 70-9 6-5-1 3 4 9-2m14-7 9 6 5-1-3 4-9-2" fill="none" stroke="currentColor" strokeWidth="2"/>
 <path d="m29 39 23 19m-24-7 23 13m40-25L68 58m24-7L69 64M57 48v17m6-17v17" fill="none" stroke="#101a20" strokeOpacity=".45" strokeWidth="1.2"/>
 <path d="m62 38 4 1-3 2Z" fill="#101a20"/>
 </g>;
 case 'Football':return <g>
 <circle cx="60" cy="58" r="25" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
 <g fill="#101a20" fillOpacity=".85" stroke="#101a20" strokeWidth="1.2" strokeLinejoin="round"><path d="m60 46 11 8-4 13H53l-4-13Z"/><path d="m49 35-6 11-7 2q3-9 13-13Zm22 0 6 11 7 2q-3-9-13-13ZM36 64l10 3 5 12q-10-4-15-15Zm48 0-10 3-5 12q10-4 15-15ZM55 82l5-9 5 9Z"/><path d="M60 46V34m11 20 12-6m-16 19 7 12m-21-12-7 12m3-25-12-6" fill="none"/></g>
 <ellipse cx="52" cy="43" rx="8" ry="3" fill="#fff" opacity=".25" transform="rotate(-30 52 43)"/>
 </g>;
 case 'Star':return <g fill="currentColor">
 <path d="m60 28 9 20 22 2-17 15 5 22-19-11-19 11 5-22-17-15 22-2Z"/>
 <path d="m60 28 1 32 8-12ZM91 50 61 60l13 5ZM79 87 61 60l-1 16ZM41 87 61 60l-15 5ZM29 50 61 60l-10-12Z" fill="#101a20" opacity=".3"/>
 <path d="m60 28 1 32 30-10M61 60l18 27M61 60 41 87M61 60 29 50" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth=".8"/>
 </g>;
 case 'Castle':return <g fill="currentColor" strokeLinejoin="round">
 <path d="M29 45h7v7h7v-7h7v21h-4v18h28V66h-4V45h7v7h7v-7h7v21h-4v22H33V66h-4Z"/>
 <path d="M46 34h7v7h7v-7h7v7h7v-7h7v16h-6v35H51V50h-5Z" transform="translate(-3 0)"/>
 <path d="M56 88V72a7 7 0 0 1 14 0v16M37 61h5v10h-5m37-10h5v10h-5M56 49h5v10h-5m10-10h5v10h-5" fill="#101a20" opacity=".8"/>
 <path d="M60 33V23l13 3-13 4" fill="none" stroke="currentColor" strokeWidth="2"/>
 <path d="M34 78h15m25 0h12M49 62h25M49 65h25" stroke="#101a20" strokeOpacity=".35" strokeWidth="1.1"/>
 </g>;
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
