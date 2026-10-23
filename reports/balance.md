# Balance and promotion milestone

Five deterministic careers, three seasons each. New matchdays simulate all eight divisions. Seed data: `balance-before.json` (previous rules) and `balance-latest.json` (current rules).

| Seed | Previous year-three cash | Current year-three cash | Current fanbase | Current tier / finish | Average ability |
| --- | ---: | ---: | ---: | --- | ---: |
| 17 | £895,235 | £67,613 | 3,660 | Tier 7 / 20 | 60.7 |
| 81 | £741,281 | £117,933 | 4,307 | Tier 8 / 1 | 59.3 |
| 2026 | £761,789 | £67,759 | 3,593 | Tier 8 / 6 | 57.5 |
| 2040 | £727,983 | £110,367 | 3,907 | Tier 8 / 5 | 56.5 |
| 9901 | £919,471 | £70,539 | 3,491 | Tier 8 / 3 | 59.6 |

## Method and findings

The controlled manager uses the starting squad, youth training and the assistant’s available XI. Form and morale are held neutral each league week to keep this benchmark focused on the economy; fitness-based rotation, injuries and bans remain active. Dedicated management tests cover form and morale effects. It tries one upgrade per facility each week in the order recovery, food, drink, training, stadium, retaining £25,000 after purchases; stadium investment requires demand to exceed capacity. Contracts are extended to ten years solely in the benchmark so contract expiry and recruitment do not obscure the economy measurement. No player sales, loans or recruitment occur. Results include any playable promotion ties. Year-three cash is measured after matches/playoffs but before that year's prize collection.

The previous rules paid gate/concession income without ordinary club or matchday operating costs. Cash became excessive even after buying upgrades. The new model charges division-specific overhead, ground running costs and home match operations, preserving player wages and upgrade upkeep as separate ledger entries. Higher-tier income is accompanied by higher costs and stronger opponents. The same seeds remain solvent in this controlled scenario, and cash stays below £200,000. Average squad ability stays around 57–61, with potential caps and ageing retained.

The new competition engine also derives each fixture's random stream from its identity, so the exact match outcomes differ from the earlier benchmark. This is a before/after milestone comparison, not an isolated estimate of the effect of one cost parameter.

## Limits

- This is five fixed-squad careers over three seasons, not a guarantee for all strategies, longer careers or transfer/loan exploits.
- Tier-specific wage caps, monthly wage demands and contract-renewal pressure are tested separately; the long-contract benchmark deliberately excludes them.
- Fans can outgrow the stadium; expensive expansions consume cash and create higher running costs.
- The pyramid spans Tier 8 through Tier 1. The economic benchmark remains an early-career sample; separate tests exercise all promotion and relegation boundaries. Player profiles, live halves, ratings, injuries, suspensions, form and morale are now implemented.

## Reproduction

Run `pnpm test` for the complete suite, or `pnpm exec vitest run src/balance.test.ts` for the benchmark. The test regenerates `reports/balance-latest.json` and asserts cash reconciles exactly to the ledger, remains solvent in the sampled runs and avoids the former cash buildup.

## Development and condition correction

First-team training and development loans now improve attack and defence alongside overall ability. Legacy earned growth is restored once on load; academy growth is not credited twice. Opponents use the same fatigue curve as Dragons, with full starting condition assumed for AI teams. Quick user matches and live halves now share the same minute-by-minute shot engine. Background AI-only games use midpoint team condition and retain their final result rather than detailed event logs to keep saves small. The benchmark above was regenerated after this correction.

## Eight-tier pyramid

Version 0.3.0 keeps 22 clubs in each of eight connected divisions. Every boundary exchanges the lower champion and playoff winner with the upper bottom two. Higher-tier relegated clubs now enter Tier 7, so the updated early-career benchmark has different opponents after season rollover. Structural tests cover a complete seven-promotion climb and seven-relegation descent, ongoing-playoff migration and single-tier movement for all 176 clubs. The three-season benchmark has a 90-second timeout to accommodate the larger simulated world.

## Age fatigue and rotation

Version 0.3.1 applies age-dependent fatigue, recovery and actual substitute minutes. The benchmark now uses the default 50/30/20 Balanced assistant selection. The five starting squads remain solvent, but take longer to earn promotion while the controlled benchmark forbids recruitment. This is a bounded early-career sample rather than an all-tier balance guarantee.


## Version 0.7.0 shooting and market simulation

The table above was regenerated with the shot-based engine and active rival market. No user player sales or recruitment are made in this benchmark; rival clubs can recruit market targets, and user bids are allowed to expire. Cup entry is deliberately deferred in this league economy fixture; the separate mixed-calendar test covers league/cup settlement.

All five sampled careers remain solvent and reconcile exactly to their ledgers. Different shot outcomes and rival recruitment change results and promotion paths, so the values are a milestone comparison rather than an isolated financial-rule experiment. Dedicated seeded tests vary goalkeeper ability, finishing and defending independently. The two-worker test limit avoids competition between the Monte Carlo checks and this larger benchmark on laptops.
