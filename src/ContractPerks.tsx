import {perks,wageQuote,type Perk} from './negotiation';
import type {Player} from './engine';
const money=(n:number)=>`£${n.toLocaleString('en-GB')}`;
export function ContractPerks({player,asking,years,wage,perk,onPerk,onWage,cash,fee=0}:{player:Player;asking:number;years:number;wage:number;perk:Perk;onPerk:(p:Perk)=>void;onWage:(w:number)=>void;cash:number;fee?:number}){
 const q=wageQuote(player,asking,years,perk);
 return <section className="contract-package"><label>One-off contract perk<select aria-label="Contract perk" value={perk} onChange={e=>onPerk(e.target.value as Perk)}>{Object.entries(perks).map(([id,p])=><option key={id} value={id}>{p.name}{p.cost?` · ${money(p.cost)} upfront`:''}</option>)}</select></label><p>Asking wage {money(asking)}/week · Acceptable wage with this package: <strong className="gold">{money(q.minimum)}/week or more</strong>.</p>{wage!==q.minimum&&<button type="button" className="secondary" onClick={()=>onWage(q.minimum)}>Offer {money(q.minimum)}/week</button>}<p className="muted">Perk paid once on signing: {money(q.cost)}. Cash after fees and perk: {money(cash-fee-q.cost)}. Total {years}-year package: {money(wage*52*years+q.cost)} plus any transfer fee.</p><p className="muted">Players value perks differently. Wage reductions are capped at 35%; longer contracts spread the perk’s value over more weeks. Perks are non-refundable.</p></section>;
}
