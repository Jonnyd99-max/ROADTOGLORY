# ROAD TO GLORY: FOOTBALL DYNASTY

A playable, local-first football owner simulation built with React, TypeScript and Vite. No backend, accounts or paid APIs.

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

Use Transfers to submit fee, wage and contract offers. Renew players from the squad screen. Training applies each matchweek. After 42 matches, begin another season; players age, contracts expire and sponsorship pays £35,000. Renew your core players before advancing. This version stays in Tier 8; multi-tier promotion, cups, injuries and live substitutions are future work.

## Saves and offline play

IndexedDB autosaves every decision on this browser/device. Career provides a separate manual save slot, restore and JSON export for safekeeping. JSON import is not yet available. Browser data deletion removes local careers. A service worker caches the production app after its first online visit. Install from your browser menu on Android/desktop. Offline support is a production-build feature, not the Vite dev server. Font fallbacks remain available offline.

## GitHub Pages

Vite base is `/ROADTOGLORY/`, matching this repository. CI tests and builds pushes and pull requests. Deployment is **manual only**: choose GitHub Actions as the Pages source in repository settings, then run **Deploy to GitHub Pages (manual)**. That workflow reruns tests before uploading and deploying. No deployment was triggered during development.

## Architecture and testing

- `src/engine.ts`: pure deterministic simulation, scheduling, finance, development and negotiations. Seed defaults to 2026; each round derives a repeatable RNG from seed, season and round.
- `src/storage.ts`: versioned IndexedDB adapter.
- `src/main.tsx`: presentation and commands.
- Tests cover fixture uniqueness and round participation, deterministic results, standings, transaction invariants, save roundtrips, manual/autosave isolation, recruitment, selection and a complete season.

Cash can become negative through wages; recruitment requires available cash. Ticket income is £9 per attendee capped at 1,200. Opponents use stable squad-strength ratings. All clubs and players are fictional. Player growth is deliberately simple in this first version.
