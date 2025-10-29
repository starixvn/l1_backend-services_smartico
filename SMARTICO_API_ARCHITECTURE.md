# Smartico API - Technical Architecture

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                       │
│  (Browser/Node.js)                                          │
└────────────────────┬───────────────────┬────────────────────┘
                     │                   │
                     │ HTTP              │ WebSocket
                     ▼                   ▼
┌────────────────────────────┐  ┌──────────────────────────┐
│     SmarticoAPI Class      │  │      WSAPI Class         │
│  (HTTP Request/Response)   │  │  (Real-time Updates)     │
└────────────────────────────┘  └──────────────────────────┘
                     │                   │
                     │                   │
                     ▼                   ▼
         ┌─────────────────────────────────────┐
         │       Protocol Layer (ClassId)       │
         │  - Request/Response Routing          │
         │  - Message Identification            │
         │  - Error Handling                    │
         └─────────────────────────────────────┘
                     │
                     ▼
         ┌─────────────────────────────────────┐
         │        Caching Layer (OCache)        │
         │  - TTL-based caching                 │
         │  - Context separation                │
         │  - Automatic invalidation            │
         └─────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│              Smartico Backend Services                      │
│  - papi{ENV}.smartico.ai (HTTP)                            │
│  - api{ENV}.smartico.ai (WebSocket)                        │
└────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│                   CDN Layer                                 │
│  - img{ENV}.smr.vc → CloudFront (Avatars)                  │
│  - static{ENV}.smr.vc → CloudFront (Assets)                │
│  - Inbox CDN (Message bodies)                              │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow

### HTTP Request Flow

```
┌─────────┐                                           ┌──────────┐
│ Client  │                                           │ Backend  │
└────┬────┘                                           └─────┬────┘
     │                                                      │
     │ 1. buildMessage(user_id, ClassId.XXX_REQUEST)       │
     ├─────────────────────────────────────────────────────┤
     │                                                      │
     │ 2. send<Response>(message, ClassId.XXX_RESPONSE)    │
     ├─────────────────────────────────────────────────────>
     │                                                      │
     │   ┌──────────────────────────────┐                  │
     │   │ Message Structure:           │                  │
     │   │ - cid: ClassId               │                  │
     │   │ - api_key: string            │                  │
     │   │ - brand_key: string          │                  │
     │   │ - ext_user_id: string        │                  │
     │   │ - uuid: string               │                  │
     │   │ - ts: timestamp              │                  │
     │   │ - ...payload                 │                  │
     │   └──────────────────────────────┘                  │
     │                                                      │
     │              3. Process & Validate                   │
     │                                                      ├──┐
     │                                                      │  │
     │                                                      │<─┘
     │                                                      │
     │ 4. Response (JSON)                                   │
     │<─────────────────────────────────────────────────────┤
     │                                                      │
     │   ┌──────────────────────────────┐                  │
     │   │ Response Structure:          │                  │
     │   │ - cid: ClassId               │                  │
     │   │ - errCode: number            │                  │
     │   │ - errMsg?: string            │                  │
     │   │ - ...response data           │                  │
     │   └──────────────────────────────┘                  │
     │                                                      │
     │ 5. Cache & Return to caller                          │
     ├──┐                                                   │
     │<─┘                                                   │
     │                                                      │
```

### WebSocket Real-Time Flow

```
┌─────────┐                                           ┌──────────┐
│ Client  │                                           │ Backend  │
└────┬────┘                                           └─────┬────┘
     │                                                      │
     │ 1. WebSocket Connection Established                  │
     ├──────────────────────────────────────────────────────┤
     │                                                      │
     │ 2. Subscribe to events (via tracker.on())            │
     ├──────────────────────────────────────────────────────┤
     │                                                      │
     │                                                      │
     │              ⏰ User Action Triggers Event            │
     │                                                      │
     │                                                      │
     │ 3. PUSH: SAW_SPINS_COUNT_PUSH                       │
     │<─────────────────────────────────────────────────────┤
     │                                                      │
     │ 4. Update local cache                                │
     ├──┐                                                   │
     │<─┘                                                   │
     │                                                      │
     │ 5. Call onUpdate callback                            │
     ├──┐                                                   │
     │<─┘                                                   │
     │                                                      │
     │ 6. UI updates automatically                          │
     ├──┐                                                   │
     │<─┘                                                   │
     │                                                      │
```

---

## 🗂️ Module Organization

### File Structure
```
smartico-api/
├── src/
│   ├── Base/                    # Core protocol definitions
│   │   ├── ClassId.ts           # Message type enums
│   │   ├── ProtocolMessage.ts   # Base message interface
│   │   ├── ProtocolRequest.ts   # Request interface
│   │   └── ProtocolResponse.ts  # Response interface
│   │
│   ├── Core/                    # Core services
│   │   ├── GetTranslationsRequest.ts
│   │   ├── GetTranslationsResponse.ts
│   │   ├── ResponseIdentify.ts
│   │   └── ...
│   │
│   ├── Missions/                # Achievement system
│   │   ├── GetAchievementMapRequest.ts
│   │   ├── GetAchievementMapResponse.ts
│   │   ├── AchievementOptinRequest.ts
│   │   └── ...
│   │
│   ├── Tournaments/             # Tournament system
│   ├── Store/                   # Virtual store
│   ├── MiniGames/              # SAW mini-games
│   ├── Jackpots/               # Jackpot system
│   ├── Leaderboard/            # Leaderboards
│   ├── Inbox/                  # Messaging
│   ├── Bonuses/                # Bonus system
│   ├── Raffle/                 # Raffle system
│   ├── Level/                  # Level system
│   ├── CustomSections/         # Custom UI
│   │
│   ├── WSAPI/                  # WebSocket wrapper
│   │   ├── WSAPI.ts            # Main WSAPI class
│   │   └── WSAPITypes.ts       # Type definitions
│   │
│   ├── SmarticoAPI.ts          # Main HTTP API class
│   ├── OCache.ts               # Caching layer
│   ├── IntUtils.ts             # Utilities
│   └── index.ts                # Exports
│
├── docs/                       # TypeDoc documentation
├── package.json
└── tsconfig.json
```

---

## 🔌 ClassId Routing System

### Message Type Categories

```typescript
enum ClassId {
  // System (1-100)
  PING = 1,
  PONG = 2,
  INIT = 3,
  INIT_RESPONSE = 4,
  IDENTIFY = 5,
  IDENTIFY_RESPONSE = 6,
  
  // Client Actions (100-199)
  CLIENT_ENGAGEMENT_IMPRESSION_REQUEST = 103,
  CLIENT_ENGAGEMENT_ACTION_REQUEST = 104,
  CLIENT_SET_CUSTOM_USERNAME_REQUEST = 159,
  CLIENT_SET_CUSTOM_USERNAME_RESPONSE = 160,
  
  // Achievements & Gamification (500-599)
  GET_LEVEL_MAP_REQUEST = 500,
  GET_ACHIEVEMENT_MAP_REQUEST = 502,
  GET_LEADERS_BOARD_REQUEST = 505,
  GET_SHOP_ITEMS_REQUEST = 509,
  GET_TOURNAMENT_LOBBY_REQUEST = 517,
  
  // Bonuses (600-699)
  GET_BONUSES_REQUEST = 600,
  CLAIM_BONUS_REQUEST = 602,
  
  // Mini-Games - SAW (700-799)
  SAW_GET_SPINS_REQUEST = 700,
  SAW_DO_SPIN_REQUEST = 702,
  SAW_AKNOWLEDGE_REQUEST = 704,
  
  // Jackpots (800-899)
  JP_GET_JACKPOTS_REQUEST = 800,
  JP_OPTIN_REQUEST = 804,
  JP_WIN_PUSH = 808,
  
  // Raffles (900-999)
  RAF_GET_RAFFLES_REQUEST = 902,
  RAF_CLAIM_PRIZE_REQUEST = 908,
}
```

### Request-Response Pairing

Each request has a corresponding response with `+1` ClassId:

```typescript
ClassId.GET_ACHIEVEMENT_MAP_REQUEST = 502
ClassId.GET_ACHIEVEMENT_MAP_RESPONSE = 503

ClassId.SAW_DO_SPIN_REQUEST = 702
ClassId.SAW_DO_SPIN_RESPONSE = 703
```

---

## 💾 Caching Strategy

### Cache Contexts

```typescript
enum ECacheContext {
  Translations,   // Translation data
  LabelInfo,      // Label/brand configuration
  WSAPI,          // WSAPI data (missions, store, etc.)
}
```

### Cache Key Structure

```
{contextKey}_{user_specific_data}
```

Examples:
- `missions` → All missions for current user
- `saw` → All mini-games for current user
- `EN-label123-brand456` → English translations
- `jackpots_123:game-id` → Jackpots filtered by template and game

### Cache Invalidation Events

```typescript
// Automatic invalidation on events
ClassId.MISSION_OPTIN_RESPONSE → Clear missions cache
ClassId.BUY_SHOP_ITEM_RESPONSE → Clear store & store history cache
ClassId.SAW_DO_SPIN_RESPONSE → Clear SAW & SAW history cache
ClassId.JP_WIN_PUSH → Clear all jackpot caches
ClassId.LOGOUT_RESPONSE → Clear all WSAPI context
```

---

## 🌐 Environment & DNS System

### API Key Format
```
XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX{E}
                                    ↑
                                    Environment ID
```

### DNS Resolution

| Env ID | DNS Suffix | Environment |
|--------|------------|-------------|
| 1 | (none) | Production |
| 2 | (none) | Production (default) |
| 3 | `3` | Staging/Dev |
| 4 | `4` | Staging/Dev |
| ... | ... | ... |

### URL Patterns

```
Public API:  https://papi{ENV_ID}.smartico.ai/services/public
WebSocket:   wss://api{ENV_ID}.smartico.ai/websocket/services
Avatar CDN:  https://img{ENV_ID}.smr.vc
```

Examples:
- Env 2 (prod): `https://papi.smartico.ai/services/public`
- Env 3 (dev): `https://papi3.smartico.ai/services/public`

---

## 🔒 Authentication Flow

### Server-to-Server (Node.js)

```typescript
// 1. Initialize API with keys
const api = new SmarticoAPI(
  'label-api-key',
  'brand-api-key',
  messageSender
);

// 2. Every request includes authentication
const message = {
  api_key: 'label-api-key',
  brand_key: 'brand-api-key',
  ext_user_id: 'user123',
  cid: ClassId.GET_ACHIEVEMENT_MAP_REQUEST,
  // ... other fields
};

// 3. Backend validates keys and user
```

### Browser (WebSocket)

```typescript
// 1. Smartico tracker handles authentication
_smartico.init({
  label_api_key: 'xxx',
  brand_key: 'xxx',
  user_ext_id: 'user123'
});

// 2. API inherits authentication from tracker
_smartico.api.getMissions();

// 3. WebSocket connection authenticated via session
```

---

## 🎯 Data Transformation Pattern

### Raw Protocol → Transformed Types

```typescript
// Raw API response
interface GetAchievementMapResponse {
  cid: ClassId;
  errCode: number;
  achievements: UserAchievement[];  // Complex nested structure
}

// Transform function
function UserAchievementTransform(
  achievements: UserAchievement[]
): TMissionOrBadge[] {
  // Flatten structure
  // Add computed fields
  // Format for UI consumption
  return transformedData;
}

// Usage
const rawData = await api.missionsGetItems('user123');
const transformed = UserAchievementTransform(rawData.achievements);
```

### Transformation Benefits

1. **Simplified Structure**: Flatten complex nested objects
2. **Computed Fields**: Add UI-friendly properties
3. **Type Safety**: Strong TypeScript types for UI
4. **Consistency**: Uniform data structure across modules

---

## ⚡ Performance Optimizations

### 1. Request Batching
```typescript
// Batch multiple spins into one request
await api.sawSpinBatchRequest(user_id, template_id, 10);
```

### 2. Intelligent Caching
```typescript
// First call: Hits backend
const levels1 = await api.getLevels();

// Second call (within 30s): Returns cached
const levels2 = await api.getLevels(); // Instant!
```

### 3. CDN for Static Assets
```typescript
// Automatic CloudFront replacement
const avatarUrl = 'https://img.smr.vc/avatar.png';
// → Transformed to: 'https://d1am61onjxtys8.cloudfront.net/avatar.png'
```

### 4. WebSocket Push Updates
```typescript
// No polling needed - push updates from server
tracker.on(ClassId.SAW_SPINS_COUNT_PUSH, (data) => {
  // Automatically update UI
});
```

---

## 🔍 Debugging & Logging

### Enable Logging

```typescript
const api = new SmarticoAPI(
  label_key,
  brand_key,
  sender,
  {
    logger: console,
    logCIDs: [
      ClassId.SAW_DO_SPIN_REQUEST,
      ClassId.SAW_DO_SPIN_RESPONSE
    ],
    logHTTPTiming: true
  }
);
```

### Log Output
```
INFO: REQ { cid: 702, uuid: "...", ... }
INFO: RES { cid: 703, errCode: 0, ... }
INFO: HTTP time, ms: 234
```

---

## 🧪 Error Handling Pattern

### Standard Error Response
```typescript
interface ProtocolResponse {
  cid: ClassId;
  errCode?: number;  // 0 = success, >0 = error
  errMsg?: string;   // Human-readable error
}
```

### Error Handling Example
```typescript
try {
  const result = await api.buyStoreItem(null, itemId);
  
  if (result.errCode === 0) {
    console.log('Purchase successful!');
  } else {
    console.error(`Purchase failed: ${result.errMsg}`);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## 🚀 Deployment Modes

### Production
```typescript
// API key ending with '1' or '2'
const api = new SmarticoAPI(
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx2',
  'brand-key',
  sender
);
// → Connects to: https://papi.smartico.ai
```

### Staging/Development
```typescript
// API key ending with '3', '4', etc.
const api = new SmarticoAPI(
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx3',
  'brand-key',
  sender
);
// → Connects to: https://papi3.smartico.ai
```

---

## 📊 Scalability Considerations

### Client-Side Caching
- Reduces server load
- 30-second default TTL
- Context-aware cache isolation

### CDN Distribution
- CloudFront for global distribution
- Multiple CDN domains (img, img3-8, static, static3-8)
- Automatic failover

### WebSocket Efficiency
- Single persistent connection
- Push-based updates (no polling)
- Automatic reconnection

### Pagination
- Max 20 items per request
- Prevents large data transfers
- Client-side pagination control

---

## 🔧 Integration Points

### 1. Message Sender (Required)
```typescript
type MessageSender = (
  message: any,
  publicApiUrl?: string,
  expectCID?: ClassId
) => Promise<any>;
```

### 2. Logger (Optional)
```typescript
interface ILogger {
  info: (msg: string, ...args: any[]) => void;
  warn: (msg: string, ...args: any[]) => void;
  error: (msg: string, ...args: any[]) => void;
  always: (msg: string, ...args: any[]) => void;
}
```

### 3. Tracker (Optional, for WSAPI)
```typescript
interface Tracker {
  label_api_key: string;
  userPublicProps: any;
  on: (callBackKey: ClassId, func: (data: any) => void) => void;
  getLabelSetting: (key: PublicLabelSettings) => any;
  triggerExternalCallBack: (callBackKey: string, payload: any) => void;
}
```

---

## 📝 Summary

The Smartico API architecture provides:

✅ **Modular Design**: Clear separation of concerns  
✅ **Type Safety**: Full TypeScript support  
✅ **Performance**: Multi-layer caching + CDN  
✅ **Real-Time**: WebSocket push notifications  
✅ **Scalability**: Pagination + efficient protocols  
✅ **Flexibility**: HTTP + WebSocket modes  
✅ **Developer-Friendly**: Clear patterns + comprehensive docs  
✅ **Production-Ready**: Error handling + logging + monitoring  

The protocol-based architecture with ClassId routing enables clean, maintainable code while supporting both request/response and push notification patterns.

