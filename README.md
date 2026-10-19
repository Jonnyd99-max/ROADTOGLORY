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

Use Transfers to submit fee, wage and contract offers. Renew players from the squad screen. Training applies each matchweek. After 42 matches, begin another season; players age, contracts expire and sponsorship pays £35,000. Renew your core players before advancing. This version stays in Tier 8; multi-tier promotion, cups, injuries and live substitutions are future work.

### Transfers, sales and development loans

- **Scout players:** 32 fictional players covering every position, searchable by name and position. Each new in-game calendar month produces a deterministic fresh pool; unbought listings are replaced on the first weekly advance into that month. Refreshing the browser never rerolls players. Existing careers expand automatically while preserving current listings and signed players.
- **Sell & loan:** accept an immediate offer from a fictional club to sell a player. Cash, wage commitments, selection and inbox update immediately. Sale valuations account for ability, potential and age; purchase and sale prices differ.
- **Loan out:** choose 4, 8 or 12 matchweeks, ending no later than the final matchweek. The host reimburses 50% of wages, rounded down, with each contribution recorded in the ledger. Full wage commitments remain reserved against the £2,600 budget for the player's return. Loaned players cannot play for Dragons or be picked by the assistant.
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
- `src/main.tsx`: presentation and commands.
- Tests cover fixture uniqueness and round participation, deterministic results, standings, transaction invariants, save roundtrips, manual/autosave isolation, recruitment, selection and a complete season.

Cash can become negative through wages; recruitment requires available cash. Ticket income is £9 per attendee capped at 1,200. Opponents use stable squad-strength ratings. All clubs and players are fictional. Player growth is deliberately simple in this first version.
