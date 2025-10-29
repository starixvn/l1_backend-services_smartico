# Smartico Public API - Comprehensive Analysis

## Overview

The **Smartico Public API** (`@smartico/public-api` v0.0.307) is a TypeScript-based gamification platform API that enables operators to build custom gamification UI components with smartico.ai as the backend system. The API supports both HTTP and WebSocket protocols and can be used in both front-end (browser) and back-end (Node.js) contexts.

---

## Architecture

### Core Components

1. **SmarticoAPI** - Main HTTP-based API class
2. **WSAPI** - WebSocket-based API wrapper with real-time updates
3. **Protocol System** - Request/Response pattern using ClassId enums
4. **Caching Layer** - Built-in caching with configurable TTL

### Communication Patterns

- **HTTP Protocol**: REST-like request/response using the `ProtocolRequest` and `ProtocolResponse` interfaces
- **WebSocket Protocol**: Real-time bidirectional communication with push notifications
- **Message Structure**: Each message has a unique `cid` (ClassId) for routing and identification

---

## API Modules & Features

### 1. **Core Module** (ClassId: 1-200)

**Purpose**: Foundation services for authentication, identification, and system configuration

#### Key APIs:
- `coreIdentifyUser()` - User identification and profile retrieval
- `coreIdentifyLabel()` - Label/brand configuration retrieval
- `coreGetTranslations()` - Multi-language translation support
- `coreReportCustomEvent()` - Custom event tracking
- `coreChangeUsername()` - Update user's public username
- `coreCheckSegments()` - Segment membership validation

#### Features:
- Environment-based routing (multiple DNS environments)
- Cloudfront CDN integration for static assets
- Avatar management with domain handling
- Multi-language support with fallback to English

---

### 2. **Missions & Badges Module** (ClassId: 500-544)

**Purpose**: Achievement system for missions (tasks) and badges

#### Key APIs:
- `missionsGetItems()` - Retrieve all missions for user
- `badgetsGetItems()` - Retrieve all badges for user
- `missionOptIn()` - Opt-in to a mission
- `missionClaimPrize()` - Claim reward for completed mission
- `achGetCategories()` - Get mission/badge categories
- `getRelatedItemsForGame()` - Get missions/tournaments related to specific game

#### Data Structures:
- **Achievement Types**: Mission vs Badge
- **Achievement Status**: Active, Completed, Available, etc.
- **Task Types**: Various task definitions
- **Categories**: Organizational structure for achievements
- **Scheduled Missions**: Time-based mission availability

#### Features:
- Real-time updates on mission completion
- Progress tracking with multiple tasks per mission
- Prize claiming system
- Category-based organization
- Game-specific achievement filtering

---

### 3. **Tournaments Module** (ClassId: 517-522)

**Purpose**: Competitive leaderboard-based tournaments

#### Key APIs:
- `tournamentsGetLobby()` - Get all active tournament instances
- `tournamentsGetInfo()` - Get detailed tournament info with leaderboard
- `registerInTournament()` - Register user in tournament

#### Features:
- Instance-based tournament system
- Real-time leaderboard updates
- Player positions with avatar support
- Registration status tracking
- Multiple tournament types
- Prize structure definition
- Tournament metadata with custom data support

---

### 4. **Leaderboard Module** (ClassId: 505-506)

**Purpose**: Global and periodic leaderboards

#### Key APIs:
- `leaderboardGet()` - Get leaderboard by period type

#### Features:
- **Period Types**: Daily, Weekly, Monthly, All-Time
- Previous period snapshots
- User position tracking
- Top player listings with avatars
- Real-time score updates

---

### 5. **Store Module** (ClassId: 509-516, 541-542)

**Purpose**: Virtual store for purchasing items with in-game currency

#### Key APIs:
- `storeGetItems()` - Get all store items
- `storeGetCategories()` - Get store categories
- `buyStoreItem()` - Purchase a store item
- `storeGetPurchasedItems()` - Get purchase history

#### Features:
- Category-based organization
- Purchase type tracking (gems, diamonds, points)
- Stock management
- Price definitions
- Purchase history with pagination
- Error codes for failed purchases
- Real-time inventory updates

---

### 6. **Mini-Games Module (SAW)** (ClassId: 700-717)

**Purpose**: Spin-and-win style mini-games (wheels, scratch cards, etc.)

#### Key APIs:
- `sawGetTemplates()` - Get available mini-games
- `sawSpinRequest()` - Play a mini-game (single spin)
- `sawSpinBatchRequest()` - Play multiple spins at once
- `doAcknowledgeRequest()` - Acknowledge prize win
- `getSawWinningHistory()` - Get win history

#### Features:
- Multiple game types (wheel, slot, etc.)
- Dynamic jackpot support
- Spin availability tracking
- Prize pool management
- Buy-in mechanisms (points, gems, diamonds)
- Batch spin support
- Win acknowledgment system
- Custom game layouts and themes
- Real-time spin count updates
- Game difficulty levels

---

### 7. **Jackpots Module** (ClassId: 800-812)

**Purpose**: Progressive jackpot system

#### Key APIs:
- `jackpotGet()` - Get active jackpots (with real-time pot values)
- `potGet()` - Get latest pot values
- `jackpotOptIn()` - Opt-in to jackpot
- `jackpotOptOut()` - Opt-out from jackpot
- `getJackpotWinners()` - Get jackpot winners history
- `getJackpotEligibleGames()` - Get games eligible for jackpot

#### Features:
- Multiple jackpot types (must drop, network, standalone)
- Temperature indicators (hot, warm, cold)
- Contribution tracking
- Game-specific jackpots
- Opt-in/opt-out mechanism
- Winner history
- Eligible games listing
- Real-time pot updates (1-second cache)
- Push notifications on wins

---

### 8. **Inbox Module** (ClassId: 513-514, 529-536)

**Purpose**: User messaging and notification system

#### Key APIs:
- `getInboxMessages()` - Get messages with pagination
- `getInboxMessageBody()` - Get message content from CDN
- `getInboxUnreadCount()` - Get unread message count
- `markInboxMessageAsRead()` - Mark message as read
- `markAllInboxMessagesAsRead()` - Mark all as read
- `markUnmarkInboxMessageAsFavorite()` - Favorite/unfavorite message
- `deleteInboxMessage()` - Delete message
- `deleteAllInboxMessages()` - Delete all messages

#### Features:
- Category-based filtering
- Star/favorite system
- Unread tracking
- Pagination (max 20 per request)
- CDN-based message body storage
- Real-time new message notifications
- Bulk operations (read all, delete all)

---

### 9. **Levels Module** (ClassId: 500-501)

**Purpose**: User progression and leveling system

#### Key APIs:
- `levelsGet()` - Get all available levels
- `getLevelCurrent()` - Get current level with progress
- `getUserGamificationInfo()` - Get level counters and stats

#### Features:
- Point-based progression
- Multiple level definitions
- Progress tracking
- Extra counters (custom per client)
- Ordinal positioning
- Required points per level
- Level metadata and rewards

---

### 10. **Bonuses Module** (ClassId: 600-603)

**Purpose**: Bonus management and claiming

#### Key APIs:
- `bonusesGetItems()` - Get available bonuses
- `bonusClaimItem()` - Claim a bonus

#### Features:
- Bonus status tracking
- Template-based bonuses
- Claim mechanism
- Real-time updates on claim
- Status codes for success/failure

---

### 11. **Raffle Module** (ClassId: 902-909)

**Purpose**: Prize draw and raffle system

#### Key APIs:
- `getRaffles()` - Get active raffles
- `getRaffleDrawRun()` - Get specific draw run details
- `getRaffleDrawRunsHistory()` - Get draw history
- `claimRafflePrize()` - Claim won prize

#### Features:
- Multiple draw types
- Draw execution tracking
- Prize winner listings
- Ticket management
- Draw state management
- Prize claiming system
- Historical draw data

---

### 12. **Custom Sections Module** (ClassId: 523-524)

**Purpose**: Dynamic UI sections configuration

#### Key APIs:
- `customSectionsGet()` - Get custom sections configuration

#### Features:
- Custom section types
- Dynamic UI configuration
- Section metadata
- Visibility rules

---

## Technical Details

### Request/Response Protocol

```typescript
interface ProtocolRequest {
  cid: ClassId;           // Message type identifier
  api_key: string;        // Label API key
  brand_key: string;      // Brand API key
  ext_user_id: string;    // External user identifier
  uuid: string;           // Request UUID
  ts: number;             // Timestamp
  force_language?: string; // Optional language override
}

interface ProtocolResponse {
  cid: ClassId;           // Response type identifier
  errCode?: number;       // Error code (0 = success)
  errMsg?: string;        // Error message
  // ... response-specific fields
}
```

### Environment Configuration

- **Multi-environment support**: Environment ID embedded in API key (last character)
- **DNS routing**: Automatic environment-based DNS suffix
- **URLs**:
  - Public API: `https://papi{ENV_ID}.smartico.ai/services/public`
  - WebSocket: `wss://api{ENV_ID}.smartico.ai/websocket/services`
  - Avatar CDN: `https://img{ENV_ID}.smr.vc`
  - Cloudfront CDN: Multiple domains with automatic replacement

### Caching Strategy

- **Default cache TTL**: 30 seconds for most data
- **Jackpot cache**: 
  - Templates: 30 seconds
  - Pot values: 1 second (for real-time updates)
- **Cache contexts**: Separate contexts for Translations, LabelInfo, WSAPI
- **Cache invalidation**: Automatic on relevant events (opt-in, purchase, etc.)

### Real-Time Updates (WSAPI)

The WSAPI wrapper provides automatic cache updates via WebSocket push notifications:

- **SAW_SPINS_COUNT_PUSH**: Update mini-game spin counts
- **RELOAD_ACHIEVEMENTS_EVENT**: Refresh missions
- **TOURNAMENT_REGISTER_RESPONSE**: Refresh tournaments
- **BUY_SHOP_ITEM_RESPONSE**: Refresh store items
- **CLIENT_ENGAGEMENT_EVENT_NEW**: Refresh inbox messages
- **JP_WIN_PUSH**: Clear jackpot cache on wins
- **CLAIM_BONUS_RESPONSE**: Refresh bonuses

### Usage Modes

#### 1. Front-End (Browser)

```javascript
// Via global _smartico object
_smartico.api.getLevels().then(levels => {
  console.log(levels);
});

// Visitor mode (non-authenticated)
_smartico.vapi('EN').getLevels().then(levels => {
  console.log(levels);
});
```

#### 2. Back-End (Node.js)

```typescript
import { SmarticoAPI } from '@smartico/public-api';

const api = new SmarticoAPI(
  'label-api-key',
  'brand-api-key',
  messageSender,
  { logger: console }
);

const response = await api.missionsGetItems('user123');
```

---

## Error Handling

### Common Error Codes

- **SAW (Mini-Games)**:
  - `SAW_OK (0)`: Success
  - `SAW_NO_SPINS`: No spins available
  - `SAW_PRIZE_POOL_EMPTY`: Prize pool empty
  - `SAW_NOT_ENOUGH_POINTS`: Insufficient points
  - `SAW_NO_BALANCE_GEMS`: Insufficient gems
  - `SAW_NOT_IN_SEGMENT`: User not in segment

- **Store**:
  - Various purchase error codes

- **Tournaments**:
  - Registration error codes
  - Registration status tracking

---

## Data Transformation Layer

The API includes transformation functions (e.g., `SAWTemplatesTransform`, `UserAchievementTransform`) that convert raw protocol responses into clean, typed objects for easier consumption in UIs.

---

## Security & Authentication

- **API Key based**: Label and Brand API keys required
- **User identification**: External user ID for server-to-server
- **WebSocket auth**: Inherited from HTTP session
- **HTTPS/WSS**: Encrypted transport
- **CORS support**: Configured for cross-origin requests

---

## Pagination

Most listing APIs support pagination:
- **Default limit**: 20 items
- **Max limit**: 20 items per request
- **Offset-based**: Use offset for pagination
- **Examples**: Inbox messages, store history, mini-game history

---

## Best Practices

1. **Use WSAPI for front-end**: Provides automatic caching and real-time updates
2. **Implement onUpdate callbacks**: For reactive UI updates
3. **Respect cache TTLs**: Don't poll unnecessarily
4. **Handle errors gracefully**: Check errCode in responses
5. **Use visitor mode for public data**: No authentication required
6. **Language support**: Always provide language code for translations
7. **Jackpot updates**: Poll every 1-2 seconds for real-time pot values
8. **Avatar URLs**: Use provided helper functions for correct domain

---

## Dependencies

```json
{
  "md5-typescript": "^1.0.5",
  "typescript-map": "^0.1.0"
}
```

---

## Build & Distribution

- **Build tool**: Microbundle
- **Output formats**: CommonJS (cjs) and Modern ESM (mjs)
- **TypeScript**: Full type definitions included
- **Documentation**: TypeDoc generated

---

## Summary

The Smartico Public API is a comprehensive gamification platform offering:

- ✅ **12 major feature modules** (Missions, Tournaments, Store, Mini-Games, Jackpots, etc.)
- ✅ **60+ API methods** covering all gamification aspects
- ✅ **Real-time updates** via WebSocket
- ✅ **Built-in caching** for performance
- ✅ **Multi-language support**
- ✅ **Both authenticated and visitor modes**
- ✅ **Type-safe TypeScript implementation**
- ✅ **Comprehensive error handling**
- ✅ **Flexible deployment** (browser & Node.js)

The API follows a consistent request/response protocol pattern with automatic environment routing, making it easy to integrate gamification features into any platform.

