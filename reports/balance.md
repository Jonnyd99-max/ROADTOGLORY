# Balance and promotion milestone

Five deterministic careers, three seasons each. New matchdays also simulate both divisions. Seed data: `balance-before.json` (previous rules) and `balance-latest.json` (current rules).

| Seed | Previous year-three cash | Current year-three cash | Current fanbase | Current tier / finish | Average ability |
| --- | ---: | ---: | ---: | --- | ---: |
| 17 | £895,235 | £72,929 | 4,250 | Tier 7 / 11 | 60.7 |
| 81 | £741,281 | £112,997 | 3,501 | Tier 7 / 19 | 59.3 |
| 2026 | £761,789 | £107,622 | 4,104 | Tier 7 / 12 | 57.5 |
| 2040 | £727,983 | £115,356 | 4,300 | Tier 8 / 1 | 56.7 |
| 9901 | £919,471 | £127,907 | 4,544 | Tier 7 / 5 | 59.6 |

## Method and findings

The controlled manager uses the starting squad, youth training and the assistant’s available XI. Form and morale are held neutral each league week to keep this benchmark focused on the economy; fitness-based rotation, injuries and bans remain active. Dedicated management tests cover form and morale effects. It tries one upgrade per facility each week in the order recovery, food, drink, training, stadium, retaining £25,000 after purchases; stadium investment requires demand to exceed capacity. Contracts are extended to ten years solely in the benchmark so contract expiry and recruitment do not obscure the economy measurement. No player sales, loans or recruitment occur. Results include any playable promotion ties. Year-three cash is measured after matches/playoffs but before that year's prize collection.

The previous rules paid gate/concession income without ordinary club or matchday operating costs. Cash became excessive even after buying upgrades. The new model charges division-specific overhead, ground running costs and home match operations, preserving player wages and upgrade upkeep as separate ledger entries. Higher-tier income is accompanied by higher costs and stronger opponents. The same seeds remain solvent in this controlled scenario, and cash stays below £200,000. Average squad ability stays around 57–61, with potential caps and ageing retained.

The new competition engine also derives each fixture's random stream from its identity, so the exact match outcomes differ from the earlier benchmark. This is a before/after milestone comparison, not an isolated estimate of the effect of one cost parameter.

## Limits

- This is five fixed-squad careers over three seasons, not a guarantee for all strategies, longer careers or transfer/loan exploits.
- The Tier 7 cap, monthly wage demands and contract-renewal pressure are tested separately; the long-contract benchmark deliberately excludes them.
- Fans can outgrow the stadium; expensive expansions consume cash and create higher running costs.
- The pyramid currently ends at Tier 7 and Tier 8. Deeper divisions remain future work. Player profiles, live halves, ratings, injuries, suspensions, form and morale are now implemented.

## Reproduction

Run `pnpm test` for the complete suite, or `pnpm exec vitest run src/balance.test.ts` for the benchmark. The test regenerates `reports/balance-latest.json` and asserts cash reconciles exactly to the ledger, remains solvent in the sampled runs and avoids the former cash buildup.

## Development and condition correction

First-team training and development loans now improve attack and defence alongside overall ability. Legacy earned growth is restored once on load; academy growth is not credited twice. Opponents use the same fatigue curve as Dragons, with full starting condition assumed for AI teams. The quick simulation samples midpoint condition, while live halves update condition each minute. The benchmark above was regenerated after this correction.
