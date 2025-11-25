# SabaONE Backend Integration Guide

> **Technical guide for backend developers integrating casino platforms with SabaONE's gamification engine**

---

## 📋 Overview

This guide covers the backend integration between your casino platform and SabaONE. You'll learn:

1. How SabaONE identifies and tracks players
2. What events to send to SabaONE
3. How SabaONE manages bonuses, levels, and progress
4. API events and webhook implementation

**Integration Time:** 2-3 days for basic integration

---

## 🔑 Player Identity Model

### How SabaONE Identifies Players

SabaONE uses a **composite identifier** to uniquely track players across multiple casino operators:

```
UNIQUE PLAYER IDENTIFIER = operatorId + playerId
```

**Example:**
```
Operator: "lucky-casino"
Player:   "player_123"
→ SabaONE ID: "lucky-casino:player_123"
```

### Why Composite Keys?

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-TENANT ISOLATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Players are unique per operator                              │
│  ✓ Same playerId can exist in different operators               │
│  ✓ Data never mixes between operators                           │
│  ✓ Complete data isolation guaranteed                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Real-World Scenarios

**Scenario 1: Same Player ID Across Operators**
```
Operator A: "lucky-casino" → player_123
Operator B: "betmax"        → player_123

These are DIFFERENT players:
- lucky-casino:player_123 ≠ betmax:player_123
- Each has separate progress, missions, bonuses
- Zero data leakage between operators
```

**Scenario 2: How SabaONE Knows Which Operator**
```
When you send an event:
POST https://api.sabaone.com/v1/events
Headers: {
  "Authorization": "Bearer YOUR_API_KEY"  // API key identifies YOUR operator
}
Body: {
  "event": "bet_placed",
  "playerId": "player_123",
  "amount": 50
}

SabaONE receives:
→ Decodes API key → knows operator is "lucky-casino"
→ Routes event to lucky-casino:player_123
→ Updates ONLY that player's progress
```

**Scenario 3: Widget Authentication**
```
Your backend generates JWT token containing:
{
  "operatorId": "lucky-casino",
  "playerId": "player_123"
}

Widget receives token:
→ Extracts both IDs
→ Loads data for lucky-casino:player_123 only
```

---

## 📡 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  YOUR CASINO                           SABAONE                  │
│  ┌─────────────────────┐              ┌─────────────────────┐  │
│  │                     │              │                     │  │
│  │  Player Activity ───┼─── Events ──►│ Gamification       │  │
│  │  (Bets, Deposits)   │   (API)      │ Engine             │  │
│  │                     │              │                     │  │
│  │                     │              │ ├─ Missions        │  │
│  │                     │              │ ├─ Bonuses         │  │
│  │                     │              │ ├─ Tournaments     │  │
│  │                     │              │ └─ Levels          │  │
│  │                     │              │                     │  │
│  │  Backend Systems ◄──┼── Webhooks ──│ Rewards & Events   │  │
│  │  (Update Balance)   │              │ (Mission complete) │  │
│  │                     │              │                     │  │
│  └─────────────────────┘              └─────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Step 1: Player Profile Sync

### Initial Player Registration

When a player registers at your casino, sync their profile to SabaONE.

**API Endpoint:**
```
POST https://api.sabaone.com/v1/players/sync
```

**Request:**
```json
{
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "username": "lucky_player",
  "tier": "new",
  "currency": "USD",
  "country": "US",
  "language": "en",
  "registeredAt": "2025-01-15T10:00:00Z",
  "custom": {
    "favGameType": "slots",
    "depositCount": 0
  }
}
```

**Response:**
```json
{
  "success": true,
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "status": "active"
}
```

### Player Profile Updates

Update player profiles when important attributes change.

**API Endpoint:**
```
PATCH https://api.sabaone.com/v1/players/{playerId}
```

**Request:**
```json
{
  "tier": "vip",
  "custom": {
    "vipUpgradedAt": "2025-01-20T14:00:00Z"
  }
}
```

**When to Update:**
- ✅ VIP tier changes
- ✅ Currency changes
- ✅ Country/compliance updates
- ✅ Custom metadata updates

---

## 📤 Step 2: Send Events to SabaONE

### Event Types

Send player activity events to trigger gamification rules:

| Event Type | When to Send | Impact |
|------------|-------------|--------|
| `player_login` | Player logs in | Daily login missions |
| `bet_placed` | Player places a bet | Wagering missions, progress tracking |
| `deposit` | Player makes a deposit | Deposit bonuses, tier upgrades |
| `game_round_completed` | Game round ends | Game-specific missions |
| `withdrawal` | Player withdraws funds | Compliance tracking |
| `custom_event` | Any custom trigger | Custom mission rules |

### Event Payloads

**API Endpoint:**
```
POST https://api.sabaone.com/v1/events
```

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

#### Player Login
```json
{
  "event": "player_login",
  "playerId": "player_123",
  "timestamp": "2025-01-15T10:30:00Z",
  "metadata": {
    "device": "mobile",
    "platform": "ios"
  }
}
```

#### Bet Placed
```json
{
  "event": "bet_placed",
  "playerId": "player_123",
  "amount": 50.00,
  "currency": "USD",
  "gameType": "slots",
  "gameId": "starburst",
  "provider": "netent",
  "timestamp": "2025-01-15T14:30:00Z",
  "metadata": {
    "betId": "bet_789",
    "roundId": "round_456"
  }
}
```

**Game Types:**
- `slots` - Slot machines
- `table` - Table games (blackjack, roulette)
- `live` - Live dealer games
- `sports` - Sports betting

#### Deposit
```json
{
  "event": "deposit",
  "playerId": "player_123",
  "amount": 100.00,
  "currency": "USD",
  "method": "card",
  "timestamp": "2025-01-15T09:00:00Z",
  "metadata": {
    "transactionId": "txn_123",
    "isFirstDeposit": false
  }
}
```

**Payment Methods:**
- `card` - Credit/debit card
- `crypto` - Cryptocurrency
- `bank` - Bank transfer
- `ewallet` - E-wallet (PayPal, Skrill, etc.)

#### Game Round Completed
```json
{
  "event": "game_round_completed",
  "playerId": "player_123",
  "gameId": "starburst",
  "gameType": "slots",
  "betAmount": 10.00,
  "winAmount": 25.00,
  "currency": "USD",
  "timestamp": "2025-01-15T14:35:00Z",
  "metadata": {
    "roundId": "round_456",
    "spinsCount": 1,
    "isBigWin": false
  }
}
```

**Note:** `winAmount` can be 0 for losses.

#### Withdrawal
```json
{
  "event": "withdrawal",
  "playerId": "player_123",
  "amount": 500.00,
  "currency": "USD",
  "method": "bank",
  "status": "pending",
  "timestamp": "2025-01-15T16:00:00Z",
  "metadata": {
    "transactionId": "withdrawal_789"
  }
}
```

**Withdrawal Status:**
- `pending` - Awaiting approval
- `approved` - Approved, processing
- `rejected` - Rejected

#### Custom Events
```json
{
  "event": "custom_event",
  "playerId": "player_123",
  "eventName": "tournament_joined",
  "timestamp": "2025-01-15T12:00:00Z",
  "metadata": {
    "tournamentId": "weekend_battle",
    "entryFee": 10.00
  }
}
```

---

## 📥 Step 3: Receive Webhooks from SabaONE

### Webhook Events

SabaONE sends webhooks when gamification events occur:

| Webhook Event | When Triggered | Action Required |
|---------------|----------------|-----------------|
| `mission_completed` | Player completes a mission | Award reward to player |
| `bonus_awarded` | Player earns a bonus | Credit player account |
| `level_up` | Player levels up | Update player tier, notify player |
| `tournament_prize` | Player wins tournament | Credit prize to player |
| `jackpot_won` | Player wins jackpot | Credit jackpot amount |
| `achievement_unlocked` | Player unlocks achievement | Notify player, show badge |

### Webhook Configuration

**Register your webhook endpoint:**
```
POST https://api.sabaone.com/v1/webhooks
```

**Request:**
```json
{
  "url": "https://your-casino.com/webhooks/sabaone",
  "events": [
    "mission_completed",
    "bonus_awarded",
    "level_up",
    "tournament_prize",
    "jackpot_won",
    "achievement_unlocked"
  ],
  "secret": "your-webhook-secret-for-signature-verification"
}
```

### Webhook Payloads

**Webhook Headers:**
```
X-SabaONE-Signature: sha256_hash_of_payload
Content-Type: application/json
```

#### Mission Completed
```json
{
  "event": "mission_completed",
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "missionId": "weekend_warrior",
  "missionName": "Weekend Warrior",
  "reward": {
    "type": "free_spins",
    "amount": 50,
    "gameId": "starburst",
    "expiresAt": "2025-01-22T23:59:59Z"
  },
  "timestamp": "2025-01-15T15:00:00Z"
}
```

**Reward Types:**
- `free_spins` - Free spins on specific game
- `bonus_balance` - Bonus money with wagering
- `cash_bonus` - Cash without wagering
- `points` - Loyalty points

#### Bonus Awarded
```json
{
  "event": "bonus_awarded",
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "bonusId": "deposit_bonus_100",
  "bonusName": "100% Deposit Match",
  "reward": {
    "type": "bonus_balance",
    "amount": 100.00,
    "currency": "USD",
    "wageringRequirement": 30,
    "expiresAt": "2025-01-22T23:59:59Z"
  },
  "timestamp": "2025-01-15T10:00:00Z"
}
```

**Note:** `wageringRequirement` is multiplier (30x means player must wager 30 × bonus amount).

#### Level Up
```json
{
  "event": "level_up",
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "previousLevel": 5,
  "newLevel": 6,
  "reward": {
    "type": "cash_bonus",
    "amount": 25.00,
    "currency": "USD"
  },
  "timestamp": "2025-01-15T18:00:00Z"
}
```

#### Tournament Prize
```json
{
  "event": "tournament_prize",
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "tournamentId": "weekend_slots_battle",
  "tournamentName": "Weekend Slots Battle",
  "rank": 2,
  "prize": {
    "type": "cash",
    "amount": 500.00,
    "currency": "USD"
  },
  "timestamp": "2025-01-15T20:00:00Z"
}
```

#### Jackpot Won
```json
{
  "event": "jackpot_won",
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "jackpotId": "mega_jackpot",
  "jackpotName": "Mega Jackpot",
  "prize": {
    "type": "cash",
    "amount": 5000.00,
    "currency": "USD"
  },
  "timestamp": "2025-01-15T21:30:00Z"
}
```

### Webhook Security

**Verify webhook signatures:**

1. Extract signature from header: `X-SabaONE-Signature`
2. Compute HMAC-SHA256 of payload using your webhook secret
3. Compare computed signature with received signature
4. Only process webhook if signatures match

**Webhook Response:**
- Respond with `200 OK` within 5 seconds
- Process webhook asynchronously after responding
- Implement idempotency (webhooks may retry)

---

## 🎮 How SabaONE Manages Gamification

### Mission Progress Tracking

**Flow:**
1. You send events (bets, deposits, logins) → SabaONE
2. SabaONE matches events against active mission rules
3. Progress is updated automatically
4. When mission completes → Webhook sent to you

**Example:**
```
Mission: "Bet $100 on slots this weekend"
Rule: SUM(bet_placed WHERE gameType='slots' AND weekend) >= 100

Player events:
├─ Sat 10am: bet_placed, amount=25, gameType='slots' → Progress: 25%
├─ Sat 2pm:  bet_placed, amount=30, gameType='slots' → Progress: 55%
├─ Sun 5pm:  bet_placed, amount=45, gameType='slots' → Progress: 100%
└─ Mission completed! → Webhook sent

You receive webhook → Award free spins
```

### Bonus Management

**Flow:**
1. Campaign manager creates bonus in SabaONE Back Office
2. Bonus rules trigger when conditions met (e.g., first deposit)
3. SabaONE sends `bonus_awarded` webhook to your backend
4. You credit the bonus to player's account

**Example:**
```
Bonus: "100% First Deposit Match (up to $200)"
Rule: ON deposit WHERE isFirstDeposit=true THEN award 100% match up to 200

Player deposits $150:
├─ You send: deposit event, amount=150, isFirstDeposit=true
├─ SabaONE: Matches bonus rule → Calculates 100% of 150 = 150
├─ SabaONE: Sends webhook → bonus_awarded, amount=150
└─ You: Credit $150 bonus to player wallet
```

### Player Level & Progress

**Flow:**
1. SabaONE tracks player XP (experience points) based on activity
2. XP accumulates from events (bets, missions, tournaments)
3. When XP threshold reached → Player levels up
4. Level up triggers webhook with rewards

**Example:**
```
Level system:
├─ Level 1-2: 1000 XP needed
├─ Level 2-3: 2000 XP needed
├─ Level 3-4: 3000 XP needed

Player earns XP:
├─ Bet $10 → +10 XP
├─ Complete mission → +500 XP
├─ Daily login → +50 XP

Player accumulates 1000 XP:
└─ SabaONE: level_up webhook sent (level 1 → 2)
```

### Real-Time Updates

SabaONE provides real-time progress updates via:
- **Widget:** Players see live progress on missions, levels, bonuses
- **API:** Query current player state anytime
- **Webhooks:** Get notified immediately when events occur

---

## 🔒 Security & Best Practices

### API Authentication

```
Headers:
  Authorization: Bearer YOUR_API_KEY

✅ DO:
  - Store API keys in environment variables
  - Rotate API keys regularly
  - Use HTTPS for all API calls

❌ DON'T:
  - Hardcode API keys in source code
  - Expose API keys in frontend code
  - Share API keys via insecure channels
```

### Webhook Security

```
✅ DO:
  1. Verify webhook signatures using HMAC-SHA256
  2. Use HTTPS only for webhook endpoints
  3. Implement idempotency (webhooks may retry)
  4. Respond quickly (< 5 seconds)
  5. Process webhooks asynchronously

❌ DON'T:
  - Accept webhooks without signature verification
  - Use HTTP for webhook endpoints
  - Block response waiting for long operations
```

### Data Privacy

```
✅ DO:
  - Send hashed/pseudonymized player identifiers
  - Use HTTPS for all API calls
  - Implement rate limiting
  - Log events for debugging (anonymized)

❌ DON'T:
  - Send personally identifiable information (PII)
  - Send payment card details
  - Send passwords or credentials
  - Expose sensitive data in logs
```

### Error Handling

**Implement retry logic for failed events:**
- Use exponential backoff (1s, 2s, 4s, 8s)
- Maximum 3-5 retry attempts
- Queue events for later if API is down
- Log failed events for debugging

**Handle webhook failures:**
- SabaONE will retry failed webhooks (3 attempts)
- Return 200 OK even if internal processing fails
- Process webhooks in background queue
- Store webhook failures for manual review

---

## 🚀 Integration Checklist

### Phase 1: Setup (Day 1)
- [ ] Get SabaONE API credentials (API key, webhook secret)
- [ ] Set up environment variables
- [ ] Configure webhook endpoint URL
- [ ] Test webhook signature verification

### Phase 2: Player Sync (Day 2)
- [ ] Implement player profile sync on registration
- [ ] Test player creation in SabaONE
- [ ] Implement player profile update logic
- [ ] Verify player data in SabaONE dashboard

### Phase 3: Events (Day 3)
- [ ] Implement event sending to SabaONE
- [ ] Send `player_login` events
- [ ] Send `bet_placed` events
- [ ] Send `deposit` events
- [ ] Verify events in SabaONE dashboard

### Phase 4: Webhooks (Day 4)
- [ ] Implement webhook endpoint
- [ ] Implement webhook signature verification
- [ ] Handle `mission_completed` webhook
- [ ] Handle `bonus_awarded` webhook
- [ ] Handle `level_up` webhook
- [ ] Verify rewards credited correctly

### Phase 5: Testing (Day 5)
- [ ] End-to-end testing with test players
- [ ] Verify all event types
- [ ] Verify all webhook types
- [ ] Load testing (if high volume)

### Phase 6: Go Live
- [ ] Enable for 10% of players (canary)
- [ ] Monitor error logs
- [ ] Monitor webhook delivery
- [ ] Scale to 100% of players

---

## 📊 Integration Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION OVERVIEW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: PLAYER SYNC                                            │
│  ├─ On registration → POST /players/sync                        │
│  └─ On profile change → PATCH /players/{id}                     │
│                                                                 │
│  STEP 2: SEND EVENTS                                            │
│  ├─ Player login → POST /events (player_login)                  │
│  ├─ Player bets → POST /events (bet_placed)                     │
│  ├─ Player deposits → POST /events (deposit)                    │
│  └─ Game rounds → POST /events (game_round_completed)           │
│                                                                 │
│  STEP 3: RECEIVE WEBHOOKS                                       │
│  ├─ Mission completed → Credit rewards                          │
│  ├─ Bonus awarded → Credit bonus                                │
│  ├─ Level up → Update tier                                      │
│  └─ Tournament/Jackpot → Credit prizes                          │
│                                                                 │
│  TIMELINE: 5 days development + 1 day go-live                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📞 Support

**Technical Support:**
- 📧 Email: [integration@sabaone.com](mailto:integration@sabaone.com)
- 💬 Slack: Join our integration channel
- 📚 Docs: [docs.sabaone.com](https://docs.sabaone.com)

**API Reference:**
- REST API: [docs.sabaone.com/api](https://docs.sabaone.com/api)
- Webhook Events: [docs.sabaone.com/webhooks](https://docs.sabaone.com/webhooks)
- SDKs: [github.com/sabaone](https://github.com/sabaone)

---

**Version:** 1.0
**Last Updated:** November 22, 2025
**Status:** ✅ Production Ready
