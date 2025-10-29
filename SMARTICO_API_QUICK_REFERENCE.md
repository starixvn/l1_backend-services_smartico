# Smartico API Quick Reference

## 📋 Module Overview

| Module | ClassId Range | Purpose |
|--------|--------------|---------|
| Core | 1-200 | Authentication, translations, events |
| Missions & Achievements | 500-544 | Missions, badges, categories |
| Bonuses | 600-603 | Bonus management |
| Mini-Games (SAW) | 700-717 | Spin-and-win games |
| Jackpots | 800-812 | Progressive jackpots |
| Raffles | 902-909 | Prize draws |

---

## 🚀 Quick Start

### Browser (Front-End)
```javascript
// Authenticated user
_smartico.api.getMissions().then(missions => console.log(missions));

// Visitor mode (unauthenticated)
_smartico.vapi('EN').getLevels().then(levels => console.log(levels));
```

### Node.js (Back-End)
```typescript
import { SmarticoAPI } from '@smartico/public-api';

const api = new SmarticoAPI(
  'your-label-api-key',
  'your-brand-key',
  messageSender,
  { logger: console }
);

const missions = await api.missionsGetItems('user123');
```

---

## 📖 API Methods by Category

### Core APIs

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `coreIdentifyUser()` | Get user profile | ❌ |
| `coreIdentifyLabel()` | Get label/brand config | ✅ |
| `coreGetTranslations(lang, areas)` | Get translations | ✅ |
| `coreReportCustomEvent(eventType, payload)` | Track custom event | ❌ |
| `coreChangeUsername(username)` | Update username | ❌ |
| `coreCheckSegments(segment_ids)` | Check segment membership | ❌ |

---

### Missions & Badges

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getMissions({onUpdate})` | Get all missions | ✅ |
| `getBadges()` | Get all badges | ❌ |
| `getAchCategories()` | Get categories | ✅ |
| `requestMissionOptIn(mission_id)` | Opt-in to mission | ❌ |
| `requestMissionClaimReward(mission_id, completed_id)` | Claim mission reward | ❌ |
| `getRelatedItemsForGame(game_id)` | Get game-related missions/tournaments | ✅ |

---

### Levels

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getLevels()` | Get all levels | ✅ |
| `getCurrentLevel()` | Get current level with progress | ❌ |
| `getUserLevelExtraCounters()` | Get extra level counters | ❌ |

---

### Store

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getStoreItems({onUpdate})` | Get all store items | ✅ |
| `getStoreCategories()` | Get store categories | ✅ |
| `buyStoreItem(item_id)` | Purchase item | ❌ |
| `getStorePurchasedItems({limit, offset, onUpdate})` | Get purchase history | ❌ |

---

### Mini-Games (SAW)

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getMiniGames({onUpdate})` | Get available mini-games | ✅ |
| `getMiniGamesHistory({limit, offset, saw_template_id})` | Get play history | ❌ |
| `playMiniGame(template_id, {onUpdate})` | Play mini-game (single spin) | ❌ |
| `playMiniGameBatch(template_id, spin_count, {onUpdate})` | Play multiple spins | ❌ |
| `miniGameWinAcknowledgeRequest(request_id)` | Acknowledge prize win | ❌ |

---

### Tournaments

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getTournamentsList({onUpdate})` | Get active tournaments | ✅ |
| `getTournamentInstanceInfo(instance_id)` | Get tournament details | ✅ |
| `registerInTournament(instance_id)` | Register in tournament | ❌ |

---

### Leaderboards

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getLeaderBoard(periodType, getPreviousPeriod)` | Get leaderboard | ✅ |

**Period Types:**
- `LeaderBoardPeriodType.DAILY`
- `LeaderBoardPeriodType.WEEKLY`
- `LeaderBoardPeriodType.MONTHLY`
- `LeaderBoardPeriodType.ALL_TIME`

---

### Jackpots

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `jackpotGet({related_game_id, jp_template_id})` | Get jackpots (real-time) | ✅ |
| `jackpotOptIn({jp_template_id})` | Opt-in to jackpot | ❌ |
| `jackpotOptOut({jp_template_id})` | Opt-out from jackpot | ❌ |
| `getJackpotWinners({limit, offset, jp_template_id})` | Get winners | ❌ |
| `getJackpotEligibleGames({jp_template_id})` | Get eligible games | ❌ |

---

### Bonuses

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getBonuses({onUpdate})` | Get available bonuses | ❌ |
| `claimBonus(bonus_id)` | Claim bonus | ❌ |

---

### Raffles

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getRaffles({onUpdate})` | Get active raffles | ✅ |
| `getRaffleDrawRun({raffle_id, run_id})` | Get draw run details | ✅ |
| `getRaffleDrawRunsHistory({raffle_id, draw_id})` | Get draw history | ✅ |
| `claimRafflePrize({won_id})` | Claim raffle prize | ❌ |

---

### Inbox

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getInboxMessages({from, to, onlyFavorite, categoryId, onUpdate})` | Get messages | ❌ |
| `getInboxUnreadCount({onUpdate})` | Get unread count | ❌ |
| `getInboxMessageBody(messageGuid)` | Get message content | ❌ |
| `markInboxMessageAsRead(messageGuid)` | Mark as read | ❌ |
| `markAllInboxMessagesAsRead()` | Mark all as read | ❌ |
| `markUnmarkInboxMessageAsFavorite(messageGuid, mark)` | Favorite/unfavorite | ❌ |
| `deleteInboxMessage(messageGuid)` | Delete message | ❌ |
| `deleteAllInboxMessages()` | Delete all messages | ❌ |

---

### Custom Sections

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getCustomSections()` | Get custom UI sections | ✅ |

---

### User Profile

| Method | Description | Visitor Mode |
|--------|-------------|--------------|
| `getUserProfile()` | Get current user profile | ❌ |
| `checkSegmentMatch(segment_id)` | Check single segment | ❌ |
| `checkSegmentListMatch(segment_ids)` | Check multiple segments | ❌ |

---

## 🎯 Real-Time Updates

### Using onUpdate Callbacks

```javascript
// Mini-games with real-time updates
_smartico.api.getMiniGames({
  onUpdate: (updatedGames) => {
    console.log('Mini-games updated:', updatedGames);
  }
}).then(games => {
  console.log('Initial games:', games);
});

// Missions with real-time updates
_smartico.api.getMissions({
  onUpdate: (updatedMissions) => {
    console.log('Missions updated:', updatedMissions);
  }
}).then(missions => {
  console.log('Initial missions:', missions);
});
```

### Auto-Update Triggers

| Module | Update Trigger |
|--------|----------------|
| Mini-Games | Spin count changes, new spins issued |
| Missions | Opt-in, prize claim, achievement reload |
| Tournaments | Registration |
| Store Items | Purchase |
| Inbox | New message received |
| Bonuses | Bonus claimed |
| Raffles | Prize claimed |

---

## 📊 Response Types

### Success Response
```typescript
{
  cid: ClassId.SOME_RESPONSE,
  errCode: 0,
  // ... data fields
}
```

### Error Response
```typescript
{
  cid: ClassId.SOME_RESPONSE,
  errCode: 123,
  errMsg: "Error description"
}
```

---

## 🔧 Common Error Codes

### Mini-Games (SAW)
| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | No spins available |
| 2 | Prize pool empty |
| 3 | Not enough points |
| 4 | Max spins reached |
| 5 | Template not active |
| 6 | Not in segment |
| 7 | Not enough gems |
| 8 | Not enough diamonds |

---

## ⚙️ Configuration

### Cache TTL (seconds)
- Default: 30s
- Jackpot templates: 30s
- Jackpot pots: 1s (real-time)
- Translations: 60s (configurable)
- Label info: 60s (configurable)

### Pagination Limits
- Max items per request: 20
- Default limit: 20 (inbox), 10 (inbox legacy)

---

## 🌍 Multi-Language Support

```javascript
// Get translations
_smartico.api.getTranslations('DE').then(({translations}) => {
  console.log(translations);
});

// Force language for specific call
api.missionsGetItems('user123', 'FR');
```

---

## 📦 TypeScript Types

All methods return properly typed responses. Key type patterns:

```typescript
// List responses
TMissionOrBadge[]
TLevel[]
TStoreItem[]
TMiniGameTemplate[]

// Detail responses
TTournamentDetailed
LeaderBoardDetailsT
TUserProfile

// Action responses
TMissionOptInResult: { err_code: number, err_message: string }
TBuyStoreItemResult: { err_code: number, err_message: string }
TMiniGamePlayResult: { err_code: number, err_message?: string, prize_id?: number }
```

---

## 🔗 Related Resources

- [Full API Documentation](docs/classes/WSAPI.md)
- [TypeDoc Generated Docs](docs/)
- [Games Catalog API](https://help.smartico.ai/welcome/technical-guides/games-catalog-api)
- [Front-End Integration Guide](https://help.smartico.ai/welcome/technical-guides/front-end-integration)

---

## 📝 Notes

- ✅ **Visitor Mode**: Allows unauthenticated access to public data (levels, missions, tournaments, etc.)
- 🔄 **Real-Time**: WebSocket-based WSAPI provides automatic updates
- 💾 **Caching**: Built-in intelligent caching reduces API calls
- 🌐 **CDN**: Automatic CloudFront CDN for static assets and avatars
- 🔒 **Security**: API key-based authentication for server-to-server
- 📱 **Multi-Platform**: Works in browser and Node.js

---

**Version**: 0.0.307  
**Package**: `@smartico/public-api`  
**License**: ISC

