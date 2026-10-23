# ROAD TO GLORY: FOOTBALL DYNASTY

A playable, local-first football owner simulation built with React, TypeScript and Vite. No backend, accounts or paid APIs.

The console-style interface follows the supplied classic LMA club-information reference: silver status framing, navy panels, cyan ability bars, home/away kits, a stadium render and bottom navigation. `src/console.css` holds the presentation skin. Generated kit and stadium raster assets are bundled for offline use. Desktop and 412 × 915 phone viewport checks are recorded in `design-qa.md`.

## Setup

Install Node.js 24 and pnpm 11, then run:

```sh
pnpm install
pnpm test
pnpm dev
```

Open the printed URL with `/ROADTOGLORY/` appended. Production: `pnpm build`, then `pnpm preview`.

## Play

Start on the club overview. Open **Squad & tactics**, pick 11 players matching your formation, then **Play next match**. Every matchweek simulates all 11 fixtures, updates standings, pays wages, collects home ticket income, develops young players and adjusts fitness. Results are saved before the match report opens.

The squad is grouped GK (green), DEF (gold), MID (blue) and ATT (pink), highest current ability first within each group. New signings appear in their position group. **Assistant pick** at the top of Squad & tactics selects the highest-rated available players for the chosen formation. It uses current ability, with names breaking ties; it does not weight fitness. If a position is short, it explains the shortage and retains the current XI. Manual selection remains available afterwards.

Use Transfers to submit fee, wage and contract offers. Renew players from the squad screen. Training applies each matchweek. After 42 matches, begin another season; players age and contracts expire. Sponsorship is paid per game rather than as an annual grant. Renew your core players before advancing. The current pyramid contains Tiers 8 and 7, with promotion playoffs and relegation. Cups, player profiles/season stats, injuries, morale and live substitutions remain future work.

### Promotion chase and season rollover

Two fictional 22-club divisions run in parallel, each with 42 league matchweeks. The **League** screen switches between both tables and marks promotion/playoff/relegation positions. These are simplified game rules, not a full recreation of the real English non-league pyramid.

- Tier 8 champions go up automatically. Places 2–5 enter single-leg semifinals (2nd vs 5th, 3rd vs 4th) and a final, hosted by the higher league finisher. Level scores go straight to seeded penalties. You choose the XI/tactics and play Dragons' ties; the AI resolves the rest.
- Tier 7's bottom two go down. Clubs move between divisions with stable identities; new fixtures include the promoted and relegated clubs. Tier 7 champions stay at the top of this first two-division pyramid. There is no Tier 6 or Tier 9 simulation yet.
- At the end of the league season, the season panel leads through any playoffs. **Collect prize & begin next season** pays the season award once, records the finish/outcome, moves clubs, ages players and expires contracts. Review expiring deals first. Playoffs affect fitness, development and commercial finances but never league points.
- Promotions increase the fanbase by 10%; relegations reduce it by 10%. Existing facilities, cash, players and contracts persist. Contracts are honoured after relegation even if wages exceed the reduced budget; recruitment/renewals must then fit the lower cap.

| Terms | Tier 8 | Tier 7 |
| --- | --- | --- |
| Weekly wage cap | £2,600 | £4,200 |
| Ticket price | £9 | £11 |
| Sponsor per game / win / draw bonus | £250 / £150 / £50 | £550 / £300 / £100 |
| Fan change: win / draw / defeat | +45 / +12 / −8 | +60 / +16 / −10 |
| Regular club costs per matchweek | £500 + £0.65 per stadium place | £1,000 + £1 per stadium place |
| Home match operations per attendee | £2.70 | £3.20 |
| League prize: 1st / 2nd–5th / 6th–10th / other | £8k / £4k / £2k / £1k | £18k / £10k / £5k / £2.5k |
| Promotion bonus | £8,000 | Not applicable |

Club costs cover staff, utilities, travel and the ground; home match operations cover match staffing and gate services. These are separate from player wages and facility upkeep, all itemised in the ledger. Tier 7 opponents and monthly recruits are stronger; new market wage demands also rise. Tier 7 unlocks stadium levels 4 and 5 (4,000/5,500 capacity, £90k/£140k to build, £400/£650 weekly facility upkeep). Relegation never removes already-built stands.

Existing saves keep all current fixtures, results, cash and players. Migration deterministically reconstructs only the previously unseen division's completed matchweeks; new costs are charged prospectively.

### Balance benchmark

`pnpm test` includes a repeatable three-season check across five seeds. It keeps a fixed squad on long contracts, trades no players, invests in facilities with a £25k reserve and uses assistant selection/youth training. This isolates the economy; it is not a full human-career or transfer-market evaluation. Before/after results and limitations are in [reports/balance.md](reports/balance.md). The latest run ends year three at £52k–£116k rather than the earlier £728k–£919k. Wider career playtesting is still useful.

### Fans, facilities and sponsorship

Open **Facilities** from the navigation or the fanbase link on the overview. New clubs start with 1,000 fans. A win adds 45, a draw adds 12 and a defeat loses 8, with a 250-fan floor. Existing careers infer starting fan changes from completed fixtures without changing historical cash or paying retrospective sponsorship.

Expected home demand is 82% of the fanbase plus 100 visiting/casual supporters; actual crowds vary deterministically around that estimate. Attendance never exceeds capacity. The page shows the last home attendance, occupancy, unmet demand and advice on when to expand. Expansion creates capacity, rather than adding fans automatically.

Upgrades are immediate, have three levels, persist across seasons and require enough cash. The purchase confirmation shows the one-off price, next benefit, weekly upkeep and remaining cash. Operating costs are paid every matchweek, home and away.

| Facility | Level 1 / 2 / 3 purchase cost | Level 1 / 2 / 3 total upkeep per week | Effects at levels 1 / 2 / 3 |
| --- | --- | --- | --- |
| Stadium | £15k / £30k / £55k | £75 / £150 / £225 | Capacity 1,450 / 1,950 / 2,750 |
| Training | £12k / £24k / £40k | £75 / £160 / £280 | +4 / +8 / +12 percentage points of home development chance |
| Recovery | £8k / £16k / £30k | £50 / £110 / £190 | +3 / +6 / +9 weekly fitness recovery |
| Food concession | £6k / £12k / £22k | £35 / £80 / £140 | £0.55 / £0.90 / £1.25 net per home attendee |
| Drink concession | £5k / £10k / £18k | £30 / £70 / £125 | £0.45 / £0.75 / £1.05 net per home attendee |

Concession rates include stock costs; fixed upkeep is charged separately. Concessions pay only on home fixtures. Training affects eligible under-25 players at Dragons, up to their potential; players on loan use the host development model instead. Fitness is capped at 100.

The fictional Tier 8 sponsor **Manchester Trade Co.** pays £250 for every league game, plus £150 for a win or £50 for a draw, home or away. The former £35,000 annual grant is removed. Club/commercial inbox reports and the match centre show fan changes, crowds, concessions, sponsor payments and upkeep; every cash movement is itemised in Finances. Facility, fan and sponsor values are game-balance choices for this division, not researched real-club accounts.

### Transfers, sales and development loans

- **Scout players:** 32 fictional players covering every position, searchable by name and position. Each new in-game calendar month produces a deterministic fresh pool; unbought listings are replaced on the first weekly advance into that month. Refreshing the browser never rerolls players. Existing careers expand automatically while preserving current listings and signed players.
- **Sell & loan:** accept an immediate offer from a fictional club to sell a player. Cash, wage commitments, selection and inbox update immediately. Sale valuations account for ability, potential and age; purchase and sale prices differ.
- **Loan out:** choose 4, 8 or 12 matchweeks, ending no later than the final matchweek. The host reimburses 50% of wages, rounded down, with each contribution recorded in the ledger. Full wage commitments remain reserved against the current division wage budget for the player's return. Loaned players cannot play for Dragons or be picked by the assistant.
- **Loan watch:** see host, return date, matchweeks played and loan-specific ability growth; recall for free at any time. Regular first-team football offers a 35% weekly growth chance under 25 and 12% otherwise, capped at potential. Players on loan receive this development instead of home training. Growth remains visible in the blue/green bars after return, with inbox progress and return reports.
- Selling or loaning cannot leave too few available players to field the chosen formation. Recruit cover or change formation first. Players on loan must be recalled before selling. All transfers and loans save automatically.

Open **Inbox**, then select **Read message** for the full message. Unread counts and read status persist with the career. New development reports name players who improve that week.

Ability bars show starting ability in blue and net earned growth as a green extension, with a numeric `+N` label. Overview, squad and training use the same bar. Training lists starting/current/potential ratings. Under-25 players receive an 8% weekly growth chance (22% with Youth development), plus 6% when selected in the starting XI, capped at potential. Starting ratings and read mail migrate automatically in existing version-one saves. Older players can decline; this shortens the blue bar and shows a negative change.

## Saves and offline play

IndexedDB autosaves every decision on this browser/device. Career provides a separate manual save slot, restore and JSON export for safekeeping. JSON import is not yet available. Browser data deletion removes local careers. A service worker caches the production app after its first online visit. Install from your browser menu on Android/desktop. Offline support is a production-build feature, not the Vite dev server. Font fallbacks remain available offline.

## GitHub Pages

Vite base is `/ROADTOGLORY/`, matching this repository. CI tests and builds pushes and pull requests. Deployment is **manual only**: choose GitHub Actions as the Pages source in repository settings, then run **Deploy to GitHub Pages (manual)**. That workflow reruns tests before uploading and deploying. No deployment was triggered during development.

## Architecture and testing

- `src/engine.ts`: pure deterministic simulation, scheduling, finance, development and negotiations. Seed defaults to 2026; each round derives a repeatable RNG from seed, season and round.
- `src/storage.ts`: versioned IndexedDB adapter.
- `src/market.ts`: monthly player generation, sales, loans, wage contributions and loan development/returns.
- `src/club.ts`: fans, attendance, facilities, upkeep, concessions and sponsor economy.
- `src/Facilities.tsx`: upgrade and commercial-report screens.
- `src/division.ts`: tier-specific economy settings.
- `src/competition.ts`: parallel division, playoffs, promotion/relegation and season settlement.
- `src/Season.tsx`: postseason flow and career history.
- `src/main.tsx`: presentation and commands.
- Tests cover fixture uniqueness and round participation, deterministic results, standings, transaction invariants, save roundtrips, manual/autosave isolation, recruitment, selection and a complete season.

Cash can become negative through wages; recruitment requires available cash. Ticket income is £9 per attendee in Tier 8 and £11 in Tier 7, capped by the current stadium capacity (initially 1,200). Opponents use division-scaled strength ratings. All clubs and players are fictional. Player growth is deliberately simple in this first version.

### Interactive matchday
Play next match starts a saved match with a first half and second half, with a half-time pause. Change mentality or make up to five substitutions in the same position. Decisions change future goal chances and player fitness affects performance. Confirm the full-time result to settle the matchweek, league table and club finances. Match progress resumes automatically after reopening. Goal reports separate home and away scorers and name players; older saves retain scores but cannot recover previously unrecorded scorers. Playoff matches use the same interactive flow.

Use Play first half / Play second half for half-time decisions, or Simulate game to settle the whole match immediately. Saved matches stopped at an old interval continue to the next half boundary. Open player names in the dashboard or squad to see profiles, season appearances, starts, minutes, goals, career totals and development. Stats start from this update; unknown historical appearances and loan matches are not invented.

### Stand-by-stand stadium construction
Facilities now includes a ground builder. Select North, East, South or West, then choose open terrace, covered terrace or seated stand and add 250, 500 or 1,000 places (or change style with no capacity increase). Preview the proposed ground and confirm to pay. The dashboard ground view reflects each stand, roof, seating and capacity. All existing paid capacity is preserved exactly. League limits remain 2,750 in Tier 8 and 5,500 in Tier 7. Quotes show added upkeep and cash remaining; extra capacity also increases running costs. Style affects build and upkeep costs, not ticket price.

### Goal highlights and stadium view
Play first half / Play second half now show animated top-down goal replays with numbered teams, passing, a shot and a flashing GOAL banner naming the actual scorer. Pause playback, replay a finished period or skip to the result. Goalless halves show a summary. Completed match reports also offer Watch goal highlights. Replays illustrate recorded goals and do not alter the outcome or charge match finances again. Reduced-motion preferences disable flashing and movement. The stadium is now shown from an angled 3D-style view, with raised terraces, seats, roofs and floodlights reflecting stand upgrades.

### Fast match clock and commentary
Each half now plays from 00:00–45:00 or 45:00–90:00 at five match minutes per real second, pausing automatically for every recorded goal. Goal clips last about 1.05 seconds (0.65 seconds of action and a 0.4-second celebration) with a short GOAL banner. One sequential playback queue handles every goal, including multiple goals in one minute. Fast cosmetic commentary uses your players and the opposition between clips. Pause/resume, replay the finished period or skip straight to the result. Playback does not alter simulation results or financial transactions.

The pitch stays still between goal clips while the clock and commentary continue. Goal replays vary between through balls, wing crosses, long shots, corners, rebounds and free kicks, with different ball paths and player positions. Adjacent goals use different scenes; replaying the same match preserves the same sequences. Replay speed remains about one second per goal.

### Squad management, medical reports and performances
- Assistant pick now ranks available players by ability, fitness, form and morale. Squad and half-time assistant reports explain fatigue, rotation options, low morale, poor form and positional shortages.
- Injuries are assessed in the full-time medical report. They last 1–3 club matchweeks; recovery facilities reduce their risk and duration. Injured players cannot start or come on. Rested players recover while the club plays, and wages continue.
- Bookings are tracked. Every five bookings brings a one-match suspension; a sending-off brings a two-match suspension. Discipline is resolved in the post-match report and bans affect following fixtures. Existing bans are served before new bans are assigned; playoff fixtures count. Outstanding bans carry across seasons, while bookings reset and injuries clear during the off-season.
- Every participating Dragons player receives a deterministic rating out of ten, with goals, assists, minutes, cards, medical notes and a Dragons player-of-the-match award in the match report. The player profile includes recent ratings, season averages, assists and clean sheets (GK/DEF with 60+ minutes in a team clean sheet).
- Last-five ratings and morale influence match strength. Results, performances and playing time change morale; repeated omission from the side reduces it. Defaults are neutral for existing saves. No historical ratings or medical incidents are invented.
- These systems work in instant simulations, interactive halves and playoffs. Goal highlight speed and presentation are unchanged.

### Seasonal free agents and loan market
Transfers now has separate Free agents and Loan market tabs, each with 32 seeded players across all positions. Both lists are generated once when a season begins and retain unsold players throughout that season. The existing paid transfer market still refreshes monthly. Old saves receive their current season's pools once without changing cash, squad or results.
Free agents charge no transfer/signing fee; negotiate their minimum weekly wage and a 1–3 year contract within the division wage budget. They cannot be resold until the following season, preventing instant free-agent cash farming.
Incoming loans have an upfront arrangement fee and a minimum 50% parent-wage contribution. Only the agreed contribution is charged in weekly wages. Up to three incoming loans can be held at once. Borrowed players can be selected, trained and play in playoffs, but cannot be sold, loaned out or permanently renewed. They return before the next season begins. Early return is available from the loan market when squad cover permits; fees are not refunded and returned players are not relisted that season. Existing outgoing development loans continue to work separately.

### Youth academy and quieter correspondence
Academy is a separate youth squad (up to 24 players), starting with eight youngsters and a 16-player seasonal intake. Enrol prospects or add a named player of any whole-number age from 0 to 99. Youth training happens automatically after each club matchweek, including playoffs, without consuming first-team squad places or individual player wages. Starting ability stays blue; earned growth appears green. All youth age once at the season change and the prospect list refreshes.
First-team promotion requires age 16+, an agreed 1–3 year contract, minimum wage and room within the first-team wage budget. Under-16 players are rejected in paid transfers, free-agent deals, incoming loans and first-team selection too. Academy graduates preserve earned growth and cannot be sold until the following season. Academy coaching has three paid upgrades; additional upkeep is included in normal facilities upkeep. Higher levels increase training chances and future intake potential. Release youth players through a confirmation when space is needed.
Routine match, development, academy, medical, discipline, market and commercial updates now arrive as one weekly digest with the result and finances at the top. Season-transition updates are also combined. Existing routine emails are grouped in the inbox view without deleting raw messages or changing their stable IDs, and unread badges count conversations. Mark all read is available. Direct signing and investment confirmations remain separate.

### Version 0.2.1: contract packages

Overview displays the running version and UTC build timestamp. The label describes the app currently loaded, including offline/PWA copies.

Paid signings, free agents and contract renewals support a one-off family holiday (£1,500), luxury car (£8,000) or house (£40,000). Players value perks deterministically; their value is spread over 52 weeks per contract year and wage reductions are capped at 35%. The negotiation panel shows the acceptable weekly wage, upfront cost, remaining cash and total contract commitment before confirmation. Lower offers produce a counter-offer. Accepted perks are charged once to the ledger and recorded in the player profile; only weekly pay counts towards the wage budget. Perks are non-refundable. Incoming loans retain parent-club wage contribution rules.
