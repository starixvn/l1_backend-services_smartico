# Gift Code Bonus Integration Flow

> **Scenario:** Operator offers 50 free spins via gift code for eligible slot games with 5x turnover requirement

---

## 📋 Bonus Requirements

**Bonus Details:**
- **Reward:** 50 free spins
- **Eligible Games:** starburst_1, starburst_2, starburst_vip
- **Distribution:** Gift code redemption
- **Wagering Requirement:** 5x turnover on winnings
- **Example:** If player wins $20 from free spins → must wager $100 (5 × $20) to claim winnings

---

## 🔄 Complete Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 GIFT CODE BONUS FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: BONUS SETUP (Smartico Back Office)                   │
│  ├─ Campaign manager creates bonus campaign                    │
│  ├─ Defines eligible games, turnover rules                     │
│  └─ Generates gift codes                                       │
│                                                                 │
│  PHASE 2: CODE REDEMPTION (Player Action)                      │
│  ├─ Player enters gift code in casino                          │
│  ├─ Casino validates → sends to Smartico                       │
│  ├─ Smartico validates & activates bonus                       │
│  └─ Webhook sent → Casino credits free spins                   │
│                                                                 │
│  PHASE 3: FREE SPINS USAGE (Player Plays)                      │
│  ├─ Player uses free spins on eligible games                   │
│  ├─ Casino sends game_round events → Smartico                  │
│  ├─ Smartico tracks: spins used, total winnings                │
│  └─ Free spins depleted → Bonus balance locked                 │
│                                                                 │
│  PHASE 4: TURNOVER TRACKING (Wagering Period)                  │
│  ├─ Player places bets (any game)                              │
│  ├─ Casino sends bet_placed events → Smartico                  │
│  ├─ Smartico tracks: total wagered vs requirement              │
│  ├─ Progress: $45 wagered / $100 required → 45%                │
│  └─ Widget shows real-time progress                            │
│                                                                 │
│  PHASE 5: COMPLETION (Wagering Met)                            │
│  ├─ Player reaches 5x turnover requirement                     │
│  ├─ Smartico sends bonus_completed webhook                     │
│  └─ Casino unlocks bonus winnings → real money                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Phase 1: Bonus Setup in Back Office

### Campaign Configuration

**Smartico Back Office → Bonus Manager:**

```
┌─────────────────────────────────────────────────────────────────┐
│  CREATE BONUS CAMPAIGN                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Campaign Name: [50 Free Spins - Starburst Promo]              │
│                                                                 │
│  Bonus Type: [Free Spins ▼]                                    │
│                                                                 │
│  Free Spins Amount: [50]                                        │
│                                                                 │
│  Eligible Games:                                                │
│  ☑ starburst_1                                                  │
│  ☑ starburst_2                                                  │
│  ☑ starburst_vip                                                │
│                                                                 │
│  Distribution Method: [Gift Code ▼]                            │
│                                                                 │
│  Wagering Requirement:                                          │
│  └─ Type: [Turnover (Multiplier) ▼]                            │
│  └─ Multiplier: [5x] (on winnings)                             │
│  └─ Apply To: [Same eligible games only ▼]                     │
│     Options:                                                    │
│     • Same eligible games only (prevents bonus abuse)           │
│     • Any slots games                                           │
│     • Any games                                                 │
│                                                                 │
│  Expiry:                                                        │
│  └─ Free Spins: [7 days] after activation                      │
│  └─ Wagering: [30 days] after free spins completed             │
│                                                                 │
│  Gift Code Generation:                                          │
│  └─ Quantity: [1000] codes                                     │
│  └─ Prefix: [STAR50-]                                           │
│  └─ Single Use: [Yes ▼]                                        │
│                                                                 │
│  [Generate Codes]  [Save Campaign]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Generated Gift Codes

```
Campaign ID: bonus_campaign_12345
Generated Codes:
├─ STAR50-ABCD1234 (unused)
├─ STAR50-EFGH5678 (unused)
├─ STAR50-IJKL9012 (unused)
└─ ... (997 more)

Export: [CSV] [Excel] [API]
```

---

## 🔑 Phase 2: Gift Code Redemption

### Step 1: Player Enters Code

**Player Action:**
```
Player in casino website → Promotions → Enter Gift Code
Input: STAR50-ABCD1234
Click: [Redeem]
```

### Step 2: Casino Validates & Sends to Smartico

**API Call from Casino → Smartico:**

```http
POST https://api.smartico.ai/v1/gift-codes/redeem
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "giftCode": "STAR50-ABCD1234",
  "playerId": "player_123",
  "operatorId": "lucky-casino"
}
```

### Step 3: Smartico Validates Code

**Smartico Validation:**
```
✓ Code exists
✓ Code not already used
✓ Code not expired
✓ Player eligible (not blacklisted, age verified, etc.)
```

**Response:**

```json
{
  "success": true,
  "bonusActivated": true,
  "bonusId": "bonus_instance_78910",
  "campaignId": "bonus_campaign_12345",
  "reward": {
    "type": "free_spins",
    "amount": 50,
    "eligibleGames": ["starburst_1", "starburst_2", "starburst_vip"],
    "expiresAt": "2025-01-29T23:59:59Z"
  },
  "wageringRequirement": {
    "type": "turnover_multiplier",
    "multiplier": 5,
    "appliesTo": "winnings"
  }
}
```

### Step 4: Webhook Sent to Casino

**Smartico → Casino Webhook:**

```http
POST https://your-casino.com/webhooks/smartico
X-Smartico-Signature: sha256_hash
Content-Type: application/json

{
  "event": "bonus_activated",
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "bonusId": "bonus_instance_78910",
  "campaignId": "bonus_campaign_12345",
  "activatedAt": "2025-01-22T10:00:00Z",
  "reward": {
    "type": "free_spins",
    "amount": 50,
    "eligibleGames": ["starburst_1", "starburst_2", "starburst_vip"],
    "betPerSpin": 1.00,
    "currency": "USD",
    "expiresAt": "2025-01-29T23:59:59Z"
  },
  "wageringRequirement": {
    "type": "turnover_multiplier",
    "multiplier": 5,
    "appliesTo": "winnings"
  },
  "timestamp": "2025-01-22T10:00:00Z"
}
```

### Step 5: Casino Credits Free Spins

**Casino Backend Action:**

```
1. Validate webhook signature
2. Credit 50 free spins to player account
   └─ Games: starburst_1, starburst_2, starburst_vip
   └─ Expires: 2025-01-29
3. Create bonus tracking record:
   └─ bonusId: bonus_instance_78910
   └─ status: active
   └─ spinsRemaining: 50
   └─ totalWinnings: 0
   └─ wageringRequired: (to be calculated after spins)
   └─ wageringProgress: 0
4. Notify player: "50 free spins activated!"
```

---

## 🎰 Phase 3: Free Spins Usage

### Step 1: Player Uses Free Spins

**Player Action:**
```
Player opens: starburst_1
Uses free spin → Wins $0.50
Uses free spin → Wins $2.00
... (continues until 50 spins used)
```

### Step 2: Casino Tracks Game Rounds

**Casino → Smartico Events:**

For each free spin:

```http
POST https://api.smartico.ai/v1/events
Authorization: Bearer YOUR_API_KEY

{
  "event": "game_round_completed",
  "playerId": "player_123",
  "gameId": "starburst_1",
  "gameType": "slots",
  "betAmount": 0.00,
  "winAmount": 0.50,
  "currency": "USD",
  "isFreeRound": true,
  "bonusId": "bonus_instance_78910",
  "timestamp": "2025-01-22T10:05:00Z",
  "metadata": {
    "roundId": "round_001",
    "freeSpinNumber": 1,
    "freeSpinsRemaining": 49
  }
}
```

**Important Fields:**
- `betAmount: 0.00` - No real money bet
- `isFreeRound: true` - Indicates free spin
- `bonusId` - Links to bonus campaign
- `winAmount` - Winnings from this spin

### Step 3: Smartico Tracks Progress

**Smartico Internal Tracking:**

```
Bonus: bonus_instance_78910
├─ Free Spins Used: 25 / 50
├─ Free Spins Remaining: 25
├─ Total Winnings So Far: $18.50
└─ Status: in_progress
```

### Step 4: All Free Spins Completed

**After 50th spin:**

```http
POST https://api.smartico.ai/v1/events

{
  "event": "game_round_completed",
  "playerId": "player_123",
  "gameId": "starburst_2",
  "betAmount": 0.00,
  "winAmount": 1.50,
  "isFreeRound": true,
  "bonusId": "bonus_instance_78910",
  "metadata": {
    "freeSpinNumber": 50,
    "freeSpinsRemaining": 0,
    "allSpinsCompleted": true
  }
}
```

### Step 5: Smartico Calculates Wagering

**Smartico Internal:**

```
Bonus: bonus_instance_78910
├─ Free Spins Used: 50 / 50 ✓ COMPLETED
├─ Total Winnings: $20.00
├─ Wagering Multiplier: 5x
├─ Wagering Required: $20.00 × 5 = $100.00
├─ Wagering Progress: $0.00 / $100.00 (0%)
└─ Status: wagering_phase
```

### Step 6: Webhook to Casino

**Smartico → Casino:**

```http
POST https://your-casino.com/webhooks/smartico

{
  "event": "bonus_free_spins_completed",
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "bonusId": "bonus_instance_78910",
  "freeSpinsUsed": 50,
  "totalWinnings": 20.00,
  "currency": "USD",
  "wageringRequirement": {
    "type": "turnover_multiplier",
    "baseAmount": 20.00,
    "multiplier": 5,
    "requiredWagering": 100.00,
    "currentWagering": 0.00,
    "progress": 0,
    "expiresAt": "2025-02-21T23:59:59Z"
  },
  "timestamp": "2025-01-22T11:30:00Z"
}
```

### Step 7: Casino Locks Bonus Winnings

**Casino Backend Action:**

```
1. Credit $20 to player bonus balance (locked)
2. Update bonus tracking:
   └─ status: wagering_required
   └─ bonusBalance: $20.00 (locked)
   └─ wageringRequired: $100.00
   └─ wageringProgress: $0.00
   └─ expiresAt: 2025-02-21
3. Notify player:
   "Free spins completed! You won $20.00
    Wager $100.00 to unlock your winnings.
    Progress: $0 / $100 (0%)"
```

---

## 📊 Phase 4: Turnover Tracking

### Step 1: Player Places Bets

**Player Action:**
```
Player must play ONLY eligible games (Starburst games)
Places bet: $10.00 on Starburst
Places bet: $15.00 on Starburst 2
Places bet: $20.00 on Starburst VIP
... (continues until 5x requirement met)
```

**Important:** Turnover only counts on the same games eligible for free spins to prevent bonus abuse.

### Step 2: Casino Sends Bet Events

**Casino → Smartico:**

```http
POST https://api.smartico.ai/v1/events

{
  "event": "bet_placed",
  "playerId": "player_123",
  "amount": 10.00,
  "currency": "USD",
  "gameType": "slots",
  "gameId": "starburst_1",  // Must be eligible game!
  "timestamp": "2025-01-22T14:00:00Z",
  "metadata": {
    "betId": "bet_001",
    "activeBonusId": "bonus_instance_78910"
  }
}
```

**Smartico Validation:**

If player bets on non-eligible game:

```http
POST https://api.smartico.ai/v1/events
{
  "event": "bet_placed",
  "gameId": "book_of_dead",  // NOT eligible!
  "metadata": { "activeBonusId": "bonus_instance_78910" }
}
```

**Smartico Response:**

```json
{
  "success": true,
  "wageringContribution": 0.00,
  "message": "Bet placed but does not contribute to wagering. Only bets on eligible games count.",
  "eligibleGames": ["starburst_1", "starburst_2", "starburst_vip"]
}
```

**Key Point:** Bets on non-eligible games are accepted but don't count toward wagering requirement.

### Step 3: Smartico Updates Wagering Progress

**Smartico Internal Calculation:**

```
Bonus: bonus_instance_78910
├─ Wagering Required: $100.00
├─ Eligible Games: starburst_1, starburst_2, starburst_vip
├─ Wagering Progress:
│  ├─ Bet 1: $10.00 on starburst_1 ✓ → +$10.00 = $10.00 (10%)
│  ├─ Bet 2: $15.00 on starburst_2 ✓ → +$15.00 = $25.00 (25%)
│  ├─ Bet 3: $20.00 on starburst_vip ✓ → +$20.00 = $45.00 (45%)
│  ├─ Bet 4: $50.00 on book_of_dead ✗ → +$0.00 = $45.00 (45%) [Not eligible]
│  └─ ... continues
└─ Status: wagering_phase
```

**Note:** Only bets on eligible games (starburst_1, starburst_2, starburst_vip) count toward wagering.

### Step 4: Real-Time Widget Updates

**Player Widget Display:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🎁 ACTIVE BONUS                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  50 Free Spins - Starburst Promo                                │
│                                                                 │
│  ✓ Free Spins: 50/50 completed                                 │
│  💰 Winnings: $20.00 (locked)                                   │
│                                                                 │
│  📊 Wagering Progress:                                          │
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░ 45%                                   │
│                                                                 │
│  $45.00 / $100.00 wagered                                       │
│  $55.00 remaining to unlock                                     │
│                                                                 │
│  ⏰ Expires: Jan 21, 2025                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Progress Milestones (Optional)

**Smartico can send progress webhooks:**

```http
POST https://your-casino.com/webhooks/smartico

{
  "event": "bonus_wagering_progress",
  "playerId": "player_123",
  "bonusId": "bonus_instance_78910",
  "milestone": 50,
  "wageringProgress": {
    "required": 100.00,
    "completed": 50.00,
    "remaining": 50.00,
    "percentage": 50
  },
  "timestamp": "2025-01-22T16:00:00Z"
}
```

**Casino Action:**
```
Notify player: "Halfway there! $50 more to unlock your $20 bonus!"
```

---

## ✅ Phase 5: Wagering Completed

### Step 1: Final Bet Reaches 100%

**Casino → Smartico:**

```http
POST https://api.smartico.ai/v1/events

{
  "event": "bet_placed",
  "playerId": "player_123",
  "amount": 25.00,
  "currency": "USD",
  "gameType": "slots",
  "gameId": "starburst_vip",  // Eligible game!
  "timestamp": "2025-01-23T10:00:00Z",
  "metadata": {
    "betId": "bet_050",
    "activeBonusId": "bonus_instance_78910"
  }
}
```

**Smartico Calculation:**

```
Game: starburst_vip ✓ (eligible)
Wagering Progress: $75.00 + $25.00 = $100.00
Required: $100.00
Status: COMPLETED ✓
```

### Step 2: Smartico Sends Completion Webhook

**Smartico → Casino:**

```http
POST https://your-casino.com/webhooks/smartico

{
  "event": "bonus_wagering_completed",
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "bonusId": "bonus_instance_78910",
  "campaignId": "bonus_campaign_12345",
  "wageringCompleted": {
    "required": 100.00,
    "completed": 100.00,
    "completedAt": "2025-01-23T10:00:30Z"
  },
  "bonusWinnings": {
    "amount": 20.00,
    "currency": "USD",
    "status": "ready_to_unlock"
  },
  "timestamp": "2025-01-23T10:00:30Z"
}
```

### Step 3: Casino Unlocks Winnings

**Casino Backend Action:**

```
1. Validate webhook signature
2. Move $20.00 from bonus balance → real money balance
3. Update bonus record:
   └─ status: completed
   └─ completedAt: 2025-01-23T10:00:30Z
   └─ bonusBalance: $0.00
   └─ realMoneyBalance: +$20.00
4. Create transaction record:
   └─ type: bonus_conversion
   └─ amount: $20.00
   └─ reason: "Wagering completed: 50 Free Spins - Starburst Promo"
5. Notify player:
   "Congratulations! $20.00 unlocked and added to your balance!"
```

### Step 4: Widget Updates

**Player Widget Display:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ BONUS COMPLETED                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  50 Free Spins - Starburst Promo                                │
│                                                                 │
│  ✓ Free Spins: 50/50 completed                                 │
│  ✓ Wagering: $100/$100 completed                                │
│  ✓ Winnings Unlocked: $20.00                                    │
│                                                                 │
│  💰 Your balance: $45.00                                        │
│                                                                 │
│  Completed: Jan 23, 2025 10:00 AM                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Summary: Complete Event & Webhook Flow

### Events Casino Sends → Smartico

| Step | Event | When | Key Data |
|------|-------|------|----------|
| 1 | `redeem_gift_code` | Player redeems code | `giftCode`, `playerId` |
| 2 | `game_round_completed` | Each free spin used | `isFreeRound: true`, `bonusId`, `winAmount` |
| 3 | `bet_placed` | Player wagers during bonus | `activeBonusId`, `amount` |

### Webhooks Smartico Sends → Casino

| Step | Webhook | When | Action Required |
|------|---------|------|-----------------|
| 1 | `bonus_activated` | Code validated | Credit free spins |
| 2 | `bonus_free_spins_completed` | All spins used | Lock winnings, start wagering |
| 3 | `bonus_wagering_progress` (optional) | Milestones (25%, 50%, 75%) | Notify player of progress |
| 4 | `bonus_wagering_completed` | Wagering requirement met | Unlock winnings to real money |

---

## 🔒 Important Considerations

### Game Eligibility Validation

**Smartico automatically enforces game eligibility:**

When player uses free spins, casino sends `game_round_completed` event:

```http
POST https://api.smartico.ai/v1/events
{
  "event": "game_round_completed",
  "playerId": "player_123",
  "gameId": "book_of_dead",  // NOT an eligible game!
  "isFreeRound": true,
  "bonusId": "bonus_instance_78910",
  "winAmount": 5.00
}
```

**Smartico validates and rejects:**

```json
{
  "success": false,
  "error": "invalid_game",
  "message": "Game 'book_of_dead' is not eligible for this bonus",
  "eligibleGames": ["starburst_1", "starburst_2", "starburst_vip"],
  "bonusId": "bonus_instance_78910"
}
```

**Casino response:**
```
1. Receive error from Smartico API
2. Revert the free spin (don't deduct from count)
3. Show error to player:
   "This free spin can only be used on Starburst games"
4. Return player to eligible games
```

**Optional: Casino can pre-validate (recommended for UX):**

Before game launch, check if game is eligible:

```http
GET https://api.smartico.ai/v1/bonuses/bonus_instance_78910/eligible-games
```

Response:
```json
{
  "bonusId": "bonus_instance_78910",
  "eligibleGames": ["starburst_1", "starburst_2", "starburst_vip"]
}
```

Then only show eligible games to player in UI:
```
Available for Free Spins:
✓ Starburst
✓ Starburst 2
✓ Starburst VIP
```

**Key Point:** Smartico enforces validation, casino just displays it nicely.

### Wagering Contribution Rules

**For this bonus:** Only eligible games count (game-specific restriction)

**Smartico Configuration for This Campaign:**
```
┌─────────────────────────────────────────────────────────────────┐
│  WAGERING CONTRIBUTION SETTINGS                                 │
│  Campaign: 50 Free Spins - Starburst Promo                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Wagering Applies To: [Same eligible games only]               │
│                                                                 │
│  Game                  Contribution Rate                        │
│  ├─ starburst_1        [100%] ───────────────────               │
│  ├─ starburst_2        [100%] ───────────────────               │
│  ├─ starburst_vip      [100%] ───────────────────               │
│  └─ All other games    [0%]   (no contribution)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**How it works:**

Casino sends bet event:
```http
POST https://api.smartico.ai/v1/events
{
  "event": "bet_placed",
  "playerId": "player_123",
  "amount": 100.00,
  "gameId": "starburst_1",  // Eligible game
  "metadata": { "activeBonusId": "bonus_instance_78910" }
}
```

Smartico validates and calculates:
```
Step 1: Check if game is eligible
  └─ Game: starburst_1
  └─ Eligible Games: [starburst_1, starburst_2, starburst_vip]
  └─ Match: ✓ YES

Step 2: Apply contribution rate
  └─ Contribution Rate: 100%
  └─ Bet Amount: $100.00
  └─ Wagering Contribution: $100.00 × 100% = $100.00

Step 3: Update progress
  └─ Previous: $0.00
  └─ New: $100.00
  └─ Required: $100.00
  └─ Status: COMPLETED ✓
```

**If player bets on non-eligible game:**
```http
POST https://api.smartico.ai/v1/events
{
  "event": "bet_placed",
  "gameId": "book_of_dead",  // NOT eligible
  "amount": 100.00,
  "metadata": { "activeBonusId": "bonus_instance_78910" }
}
```

Smartico response:
```json
{
  "success": true,
  "wageringContribution": 0.00,
  "wageringProgress": {
    "completed": 0.00,
    "required": 100.00,
    "percentage": 0
  },
  "message": "Bet accepted but does not contribute to wagering. Only eligible games count.",
  "eligibleGames": ["starburst_1", "starburst_2", "starburst_vip"]
}
```

**Example progression:**
```
Player bets:
├─ $50 on starburst_1 (100%) → +$50 wagering = $50/$100 (50%)
├─ $30 on starburst_2 (100%) → +$30 wagering = $80/$100 (80%)
├─ $100 on book_of_dead (0%) → +$0 wagering = $80/$100 (80%) [Not eligible]
├─ $20 on starburst_vip (100%) → +$20 wagering = $100/$100 (100%) ✓ COMPLETED
```

**Key Point:** Smartico enforces game restrictions to prevent bonus abuse. Casino just sends bet events.

### Expiry Handling

**Smartico automatically handles expiry:**

**Scenario 1: Free Spins Expire Before Use**

```
Player activated bonus: Jan 22, 2025
Expiry date: Jan 29, 2025 (7 days)
Player used: 20 / 50 spins
Date: Jan 30, 2025 → EXPIRED
```

**Smartico automatically:**
1. Marks bonus as expired
2. Sends webhook to casino

```http
POST https://your-casino.com/webhooks/smartico
{
  "event": "bonus_expired",
  "playerId": "player_123",
  "bonusId": "bonus_instance_78910",
  "reason": "free_spins_not_used",
  "spinsUsed": 20,
  "spinsExpired": 30,
  "expiredAt": "2025-01-30T00:00:00Z",
  "timestamp": "2025-01-30T00:00:01Z"
}
```

**Casino action:**
```
1. Validate webhook signature
2. Remove remaining free spins from player account
3. Notify player: "Your free spins have expired"
```

**Scenario 2: Wagering Expires Before Completion**

```
Wagering started: Jan 22, 2025
Expiry date: Feb 21, 2025 (30 days)
Progress: $65 / $100 wagered
Date: Feb 22, 2025 → EXPIRED
```

**Smartico automatically:**
1. Marks wagering as expired
2. Sends webhook to casino

```http
POST https://your-casino.com/webhooks/smartico
{
  "event": "bonus_wagering_expired",
  "playerId": "player_123",
  "bonusId": "bonus_instance_78910",
  "wageringProgress": {
    "required": 100.00,
    "completed": 65.00,
    "remaining": 35.00,
    "percentage": 65
  },
  "bonusBalance": 20.00,
  "expiredAt": "2025-02-22T00:00:00Z",
  "timestamp": "2025-02-22T00:00:01Z"
}
```

**Casino action:**
```
1. Validate webhook signature
2. Remove $20.00 from player bonus balance (forfeit)
3. Update bonus status: expired
4. Notify player:
   "Wagering period expired. $20.00 bonus forfeited.
    You completed $65/$100 wagering (65%)"
```

**Scenario 3: Player Tries to Use Expired Bonus**

If player somehow tries to use expired free spins:

```http
POST https://api.smartico.ai/v1/events
{
  "event": "game_round_completed",
  "isFreeRound": true,
  "bonusId": "bonus_instance_78910"  // Expired bonus
}
```

**Smartico rejects:**
```json
{
  "success": false,
  "error": "bonus_expired",
  "message": "This bonus has expired",
  "bonusId": "bonus_instance_78910",
  "expiredAt": "2025-01-30T00:00:00Z"
}
```

**Key Point:** Smartico tracks all expiry dates and sends webhooks. Casino just responds to webhooks.

### Player Balance Display

**Show clearly:**
```
┌─────────────────────────────────────┐
│  BALANCE                            │
├─────────────────────────────────────┤
│  Real Money: $25.00                 │
│  Bonus Balance: $20.00 (locked)     │
│  Free Spins: 15 remaining           │
└─────────────────────────────────────┘
```

---

## 🚀 API Reference Summary

### Gift Code Redemption
```
POST /v1/gift-codes/redeem
Body: { giftCode, playerId, operatorId }
Response: { bonusActivated, reward, wageringRequirement }
```

### Game Round Event
```
POST /v1/events
Body: {
  event: "game_round_completed",
  isFreeRound: true,
  bonusId,
  winAmount
}
```

### Bet Tracking Event
```
POST /v1/events
Body: {
  event: "bet_placed",
  amount,
  metadata: { activeBonusId }
}
```

### Query Bonus Status (Optional)
```
GET /v1/bonuses/{bonusId}/status
Response: {
  status, spinsRemaining, totalWinnings,
  wageringRequired, wageringProgress
}
```

---

## 🎯 Smartico "Plug & Play" Philosophy

### What Casino Does (Minimal Integration)

```
✅ CASINO RESPONSIBILITIES (Simple):

1. Send Events:
   └─ POST /v1/events (game rounds, bets)
   └─ Just include: bonusId in metadata

2. Handle Webhooks:
   └─ Receive webhook → Credit/debit player balance
   └─ No complex logic needed

3. Display UI (Optional):
   └─ Query eligible games for better UX
   └─ Show bonus status to players
```

### What Smartico Does (All the Heavy Lifting)

```
✅ SMARTICO RESPONSIBILITIES (Automatic):

1. Bonus Logic:
   ├─ Gift code validation
   ├─ Game eligibility enforcement
   ├─ Wagering calculation
   ├─ Contribution rate application
   ├─ Expiry tracking
   └─ Progress tracking

2. Validation:
   ├─ Rejects invalid games
   ├─ Rejects expired bonuses
   ├─ Validates all events
   └─ Returns clear error messages

3. Notifications:
   ├─ Sends webhooks for all state changes
   ├─ Provides real-time progress via widget
   └─ Handles all edge cases

4. Configuration:
   ├─ Campaign manager UI
   ├─ Gift code generation
   ├─ Rule engine configuration
   └─ No coding required
```

### Integration Effort Comparison

**Traditional Bonus System (Casino builds everything):**
```
❌ 4-6 weeks development
❌ Complex bonus engine code
❌ Game eligibility validation logic
❌ Wagering tracking system
❌ Expiry monitoring system
❌ Balance management
❌ Database schema design
❌ Testing & bug fixes
❌ Ongoing maintenance
```

**With Smartico (Plug & Play):**
```
✅ 2-3 days integration
✅ Send 3 event types
✅ Handle 4 webhook types
✅ No bonus logic needed
✅ No validation code needed
✅ No tracking needed
✅ No database changes needed
✅ Smartico handles testing
✅ Smartico handles updates
```

### Real Integration Time Breakdown

**Day 1:**
- Get API credentials
- Implement gift code redemption endpoint
- Test code validation

**Day 2:**
- Add `bonusId` to game_round_completed events
- Add `activeBonusId` to bet_placed events
- Test event sending

**Day 3:**
- Implement 4 webhook handlers
- Test end-to-end flow
- Go live

**That's it!** Smartico handles everything else.

---

**Version:** 1.0
**Last Updated:** November 22, 2025
**Status:** ✅ Production Ready
