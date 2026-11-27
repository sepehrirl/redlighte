# Redlighte Game platform

## Game integration contract

All playable titles must use the shared Redlighte Game identity and result pipeline.

### Frontend registration

Add each game to `game/game-registry.js` with:
- stable `id` (lowercase, URL-safe);
- display name, category, icon and short description;
- route `/game/<id>/`.

The central registry drives the Home cards, Discover cards and Play library. Do not maintain a second hard-coded catalogue.

### Standalone game page

Create `game/<id>/index.html`. Load the shared registry and `game/game-sdk.js`. Require an authenticated Redlighte Account before play.

### Result synchronization

Submit a completed run through:

```js
await window.RedlighteGameSDK.submitResult(gameId, score);
```

The server validates the registered game ID, deduplicates run IDs, updates the user's existing `settings.game` record, maintains per-game best scores, awards bounded XP/coins, and advances daily quests. Do not write XP, coins, wins or quest progress directly from game clients.

For friend challenges, preserve the `?challenge=<id>` query parameter; the SDK submits the score to the challenge endpoint after the run is saved.

### Backend registration

When introducing a new game, update all of these together:
1. `game/game-registry.js`
2. `worker/game-api.js` — `GAME_IDS` and `WIN_THRESHOLDS`
3. `game/phase2.js` — challenge selector options
4. `game/sw.js` — offline route precache

The result endpoint uses client-reported scores. It prevents accidental duplicate submissions and applies server-side reward thresholds, but it is not a tamper-proof competitive anti-cheat system. Do not describe scores as cryptographically verified.

### Compatibility

Keep existing account fields (`gamesPlayed`, `xp`, `coins`, `wins`, `achievements`, `playedOriginals`, `game2048`) intact. Extend `settings.game`; never replace it with a new unrelated profile or local-only save.
