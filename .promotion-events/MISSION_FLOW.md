# Mission-Based Gamification Flow

> **Scenario:** Weekend mission for table games - "Win 200 hands of Blackjack to earn $50 bonus"

---

## 📋 Mission Requirements

**Mission Details:**
- **Mission Name:** "Blackjack Master Weekend"
- **Objective:** Win 200 hands of Blackjack
- **Eligible Games:** Blackjack (all variants)
- **Active Period:** Saturday & Sunday only
- **Reward:** $50 cash bonus (no wagering required)
- **Target Audience:** All players (or specific tier: VIP, Gold, etc.)

---

## 🔄 Complete Mission Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MISSION FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: MISSION SETUP (Smartico Back Office)                 │
│  ├─ Campaign manager creates mission                           │
│  ├─ Defines game rules, win conditions                         │
│  └─ Sets schedule (weekend only)                               │
│                                                                 │
│  PHASE 2: MISSION ACTIVATION (Weekend Starts)                  │
│  ├─ Smartico automatically activates mission                   │
│  ├─ Players see mission in widget                              │
│  └─ No opt-in required (auto-enrolled)                         │
│                                                                 │
│  PHASE 3: PROGRESS TRACKING (Player Plays)                     │
│  ├─ Player plays blackjack and wins hands                      │
│  ├─ Casino sends game_round events → Smartico                  │
│  ├─ Smartico tracks wins vs goal                               │
│  └─ Widget shows real-time progress                            │
│                                                                 │
│  PHASE 4: MISSION COMPLETION (Goal Reached)                    │
│  ├─ Player wins 200th hand                                     │
│  ├─ Smartico sends mission_completed webhook                   │
│  └─ Casino credits $50 bonus to player                         │
│                                                                 │
│  PHASE 5: EXPIRY (Weekend Ends)                                │
│  ├─ Mission expires at Sunday 23:59                            │
│  ├─ Incomplete missions reset for next weekend                 │
│  └─ Completed missions remain in history                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Phase 1: Mission Setup in Back Office

### Campaign Configuration

**Smartico Back Office → Mission Builder:**

```
┌─────────────────────────────────────────────────────────────────┐
│  CREATE MISSION                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Mission Name: [Blackjack Master Weekend]                      │
│                                                                 │
│  Mission Type: [Win Hands ▼]                                   │
│  Options:                                                       │
│  • Win Hands (count winning rounds)                            │
│  • Play Rounds (count all rounds)                              │
│  • Reach Wagering Amount (cumulative bets)                     │
│  • Win Amount (cumulative winnings)                            │
│  • Consecutive Wins (streak tracking)                          │
│                                                                 │
│  Game Filter:                                                   │
│  └─ Game Type: [Table Games ▼]                                 │
│  └─ Specific Games:                                             │
│     ☑ Blackjack Classic                                         │
│     ☑ Blackjack VIP                                             │
│     ☑ Blackjack Multi-Hand                                      │
│     ☐ Roulette                                                  │
│     ☐ Baccarat                                                  │
│                                                                 │
│  Goal:                                                          │
│  └─ Win [200] hands                                             │
│                                                                 │
│  Reward:                                                        │
│  └─ Type: [Cash Bonus ▼]                                       │
│  └─ Amount: [$50]                                               │
│  └─ Wagering Required: [No ▼] (instant withdrawable)           │
│                                                                 │
│  Schedule:                                                      │
│  └─ Recurring: [Weekly ▼]                                       │
│  └─ Active Days: ☐ Mon ☐ Tue ☐ Wed ☐ Thu ☐ Fri ☑ Sat ☑ Sun   │
│  └─ Start Time: [00:00] Saturday                                │
│  └─ End Time: [23:59] Sunday                                    │
│  └─ Timezone: [UTC-5 / EST ▼]                                  │
│                                                                 │
│  Target Audience:                                               │
│  └─ Player Tier: [All Players ▼]                               │
│     Options:                                                    │
│     • All Players                                               │
│     • VIP Only                                                  │
│     • Gold & Above                                              │
│     • New Players (< 30 days)                                   │
│     • Custom Segment                                            │
│                                                                 │
│  Additional Rules:                                              │
│  ☐ Minimum bet per hand: [$___]                                │
│  ☐ Maximum reward per player: [1] (prevent farming)            │
│  ☐ Exclude bonus funds bets                                    │
│                                                                 │
│  [Preview]  [Save Draft]  [Publish]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mission Created

```
Mission ID: mission_12345
Mission Name: "Blackjack Master Weekend"
Status: Published
Next Activation: Saturday, Jan 25, 2025 00:00 EST
Target Players: ~5,000 eligible players
Estimated Cost: $50 × 500 completions = $25,000 max
```

---

## 🚀 Phase 2: Mission Activation

### Saturday 00:00 - Auto Activation

**Smartico automatically:**

1. **Activates mission** for all eligible players
2. **Creates mission instances** for each player
3. **Sends activation webhook** (optional)

**Webhook: Mission Activated (Optional)**

```http
POST https://your-casino.com/webhooks/smartico
X-Smartico-Signature: sha256_hash

{
  "event": "mission_activated",
  "missionId": "mission_12345",
  "missionName": "Blackjack Master Weekend",
  "activatedAt": "2025-01-25T00:00:00Z",
  "expiresAt": "2025-01-26T23:59:59Z",
  "eligiblePlayersCount": 5234,
  "timestamp": "2025-01-25T00:00:01Z"
}
```

**Casino Action (Optional):**
```
1. Send push notification to all players:
   "New Weekend Mission: Win 200 Blackjack hands and earn $50!"
2. Display banner on website
3. Send email to VIP players
```

### Player Widget Display

When player logs in on Saturday:

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 ACTIVE MISSIONS                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🃏 Blackjack Master Weekend                                    │
│                                                                 │
│  Objective: Win 200 hands of Blackjack                          │
│                                                                 │
│  Progress:                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░ 0%                                    │
│  0 / 200 hands won                                              │
│                                                                 │
│  Reward: 💰 $50 Cash Bonus                                      │
│                                                                 │
│  ⏰ Ends: Sunday, 11:59 PM                                      │
│  ⏱️ Time Remaining: 1 day 23 hours                             │
│                                                                 │
│  [Play Blackjack] →                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Phase 3: Progress Tracking

### Step 1: Player Plays Blackjack

**Player Action:**
```
Player opens: Blackjack Classic
Places bet: $10.00
Receives cards: Ace + King = Blackjack! (WIN)
Wins: $15.00
```

### Step 2: Casino Sends Game Round Event

**Casino → Smartico:**

```http
POST https://api.smartico.ai/v1/events
Authorization: Bearer YOUR_API_KEY

{
  "event": "game_round_completed",
  "playerId": "player_123",
  "gameId": "blackjack_classic",
  "gameType": "table",
  "betAmount": 10.00,
  "winAmount": 15.00,
  "currency": "USD",
  "timestamp": "2025-01-25T10:15:00Z",
  "metadata": {
    "roundId": "round_001",
    "outcome": "win",
    "handType": "blackjack",
    "dealerCard": "9"
  }
}
```

**Important Fields:**
- `gameType: "table"` - Smartico filters by game type
- `gameId: "blackjack_classic"` - Must match eligible games
- `winAmount > betAmount` - Determines if it's a win
- `metadata.outcome: "win"` - Explicit win indicator (recommended)

### Step 3: Smartico Processes Event

**Smartico Internal Logic:**

```
Event Received: game_round_completed
Player: player_123
Game: blackjack_classic

Step 1: Find Active Missions for Player
└─ Mission: mission_12345 (Blackjack Master Weekend)
   └─ Status: active
   └─ Eligible Games: [blackjack_classic, blackjack_vip, blackjack_multihand]
   └─ Match: ✓ YES

Step 2: Check Win Condition
└─ Win Amount: $15.00
└─ Bet Amount: $10.00
└─ Result: WIN ✓

Alternative check (if metadata provided):
└─ metadata.outcome: "win" ✓

Step 3: Update Mission Progress
└─ Previous: 0 / 200 hands
└─ New: 1 / 200 hands
└─ Progress: 0.5%

Step 4: Save Progress
└─ No webhook sent (not completed yet)
└─ Widget auto-updates via real-time connection
```

### Step 4: Widget Updates in Real-Time

**Player sees progress update immediately:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 ACTIVE MISSIONS                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🃏 Blackjack Master Weekend                                    │
│                                                                 │
│  Objective: Win 200 hands of Blackjack                          │
│                                                                 │
│  Progress:                                                      │
│  ▓░░░░░░░░░░░░░░░░░░░░░░░ 0.5%                                  │
│  1 / 200 hands won  (+1 just now!)                             │
│                                                                 │
│  Reward: 💰 $50 Cash Bonus                                      │
│                                                                 │
│  ⏰ Ends: Sunday, 11:59 PM                                      │
│  ⏱️ Time Remaining: 1 day 22 hours                             │
│                                                                 │
│  Keep playing! 🎲                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Player Continues Playing

**Over the weekend:**

```
Sat 10:15 AM: Win hand 1   → 1/200 (0.5%)
Sat 10:20 AM: Win hand 2   → 2/200 (1%)
Sat 10:25 AM: Lose hand    → 2/200 (1%) [No progress]
Sat 10:30 AM: Win hand 3   → 3/200 (1.5%)
... (continues throughout weekend)
Sun 8:00 PM: Win hand 150  → 150/200 (75%)
Sun 9:30 PM: Win hand 200  → 200/200 (100%) ✓ COMPLETED!
```

**Progress Milestones (Optional Webhooks):**

Smartico can send progress webhooks at milestones:

```http
POST https://your-casino.com/webhooks/smartico

{
  "event": "mission_progress",
  "playerId": "player_123",
  "missionId": "mission_12345",
  "milestone": 50,
  "progress": {
    "current": 100,
    "goal": 200,
    "percentage": 50
  },
  "timestamp": "2025-01-26T14:00:00Z"
}
```

**Casino Action:**
```
Send notification: "You're halfway there! 100 more wins to earn $50!"
```

---

## ✅ Phase 4: Mission Completion

### Step 1: Final Win (200th Hand)

**Casino → Smartico:**

```http
POST https://api.smartico.ai/v1/events

{
  "event": "game_round_completed",
  "playerId": "player_123",
  "gameId": "blackjack_classic",
  "betAmount": 10.00,
  "winAmount": 20.00,
  "timestamp": "2025-01-26T21:30:00Z",
  "metadata": {
    "outcome": "win",
    "roundId": "round_200"
  }
}
```

**Smartico Calculation:**

```
Win detected: ✓
Previous progress: 199 / 200
New progress: 200 / 200
Status: COMPLETED ✓
```

### Step 2: Smartico Sends Completion Webhook

**Smartico → Casino:**

```http
POST https://your-casino.com/webhooks/smartico
X-Smartico-Signature: sha256_hash

{
  "event": "mission_completed",
  "playerId": "player_123",
  "operatorId": "lucky-casino",
  "missionId": "mission_12345",
  "missionName": "Blackjack Master Weekend",
  "progress": {
    "goal": 200,
    "achieved": 200,
    "startedAt": "2025-01-25T10:00:00Z",
    "completedAt": "2025-01-26T21:30:00Z",
    "durationHours": 37.5
  },
  "reward": {
    "type": "cash_bonus",
    "amount": 50.00,
    "currency": "USD",
    "wageringRequired": false
  },
  "timestamp": "2025-01-26T21:30:01Z"
}
```

### Step 3: Casino Credits Reward

**Casino Backend Action:**

```
1. Validate webhook signature ✓
2. Check if player already received reward (idempotency)
3. Credit $50.00 to player's real money balance
4. Create transaction record:
   └─ Type: mission_reward
   └─ Amount: $50.00
   └─ Reason: "Mission completed: Blackjack Master Weekend"
   └─ Wagering: None (instant withdrawable)
5. Notify player:
   "🎉 Mission Complete! $50 cash bonus added to your balance!"
```

### Step 4: Widget Celebration

**Player sees completion notification:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🎉 MISSION COMPLETED!                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🃏 Blackjack Master Weekend                                    │
│                                                                 │
│  ✓ Won 200 hands of Blackjack ✓                                │
│                                                                 │
│  Reward Earned:                                                 │
│  💰 $50.00 Cash Bonus                                           │
│                                                                 │
│  ✓ Added to your balance                                       │
│  ✓ Instant withdrawable (no wagering)                          │
│                                                                 │
│  Completed in: 37 hours 30 minutes                              │
│                                                                 │
│  Your new balance: $175.00                                      │
│                                                                 │
│  [View History]  [Play More] →                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⏰ Phase 5: Mission Expiry

### Sunday 23:59 - Mission Expires

**For players who didn't complete:**

**Smartico automatically:**

```
For each incomplete mission instance:
├─ Player: player_456
├─ Progress: 145 / 200 hands (72.5%)
├─ Status: expired (not completed)
└─ Action: Archive, reset progress for next week
```

**Webhook: Mission Expired (Optional)**

```http
POST https://your-casino.com/webhooks/smartico

{
  "event": "mission_expired",
  "playerId": "player_456",
  "missionId": "mission_12345",
  "progress": {
    "goal": 200,
    "achieved": 145,
    "percentage": 72.5
  },
  "expiredAt": "2025-01-26T23:59:59Z",
  "timestamp": "2025-01-27T00:00:01Z"
}
```

**Casino Action (Optional):**
```
Send notification:
"You were close! You won 145/200 hands.
Mission resets next Saturday. Try again!"
```

### Next Weekend - Mission Resets

**Saturday 00:00:**

```
Mission: mission_12345 (Blackjack Master Weekend)
Action: Auto-activate for new weekend
Players:
├─ player_123: Already completed last week → Not eligible
├─ player_456: Incomplete last week → Reset to 0/200, eligible again
└─ player_789: New player → Eligible, starts fresh
```

**If "Maximum reward per player: 1" is set:**
```
player_123 cannot participate again (already earned $50)
```

**If repeatable:**
```
player_123 starts fresh: 0/200, can earn another $50
```

---

## 📋 Summary: Complete Event & Webhook Flow

### Events Casino Sends → Smartico

| Event | When | Key Data |
|-------|------|----------|
| `game_round_completed` | After each blackjack hand | `gameId`, `winAmount`, `betAmount`, `metadata.outcome` |

**Note:** No special "mission enrollment" event needed. Smartico auto-tracks based on game activity.

### Webhooks Smartico Sends → Casino

| Webhook | When | Action Required |
|---------|------|-----------------|
| `mission_activated` (optional) | Mission goes live | Notify players (optional) |
| `mission_progress` (optional) | Milestones reached (25%, 50%, 75%) | Encourage players (optional) |
| `mission_completed` | Player reaches goal | Credit $50 reward |
| `mission_expired` (optional) | Mission ends without completion | Notify player (optional) |

---

## 🔒 Important Considerations

### Win Detection Logic

**Smartico determines "win" by:**

**Option 1: Amount Comparison (Automatic)**
```
if (winAmount > betAmount) {
  result = "win";
  incrementMissionProgress();
}
```

**Option 2: Metadata Flag (Recommended)**
```javascript
{
  "metadata": {
    "outcome": "win" | "loss" | "push"
  }
}

// Smartico checks metadata.outcome === "win"
```

**Why metadata is better:**
- Handles edge cases (pushes, ties, insurance bets)
- More explicit and accurate
- Prevents miscounting

### Handling Edge Cases

**Push/Tie in Blackjack:**
```http
{
  "event": "game_round_completed",
  "betAmount": 10.00,
  "winAmount": 10.00,  // Same as bet (push)
  "metadata": {
    "outcome": "push"  // Smartico ignores, no progress
  }
}
```

**Blackjack (1.5x payout):**
```http
{
  "betAmount": 10.00,
  "winAmount": 25.00,  // $10 bet + $15 win (1.5x)
  "metadata": {
    "outcome": "win",
    "handType": "blackjack"  // For future special bonuses
  }
}
```

**Player bets with bonus funds (if excluded):**
```http
{
  "betAmount": 10.00,
  "winAmount": 15.00,
  "metadata": {
    "outcome": "win",
    "betType": "bonus"  // Smartico can exclude if configured
  }
}
```

### Mission Variations

**Other Mission Types Available:**

```
┌─────────────────────────────────────────────────────────────────┐
│  MISSION TYPE OPTIONS                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Win Hands                                                   │
│     └─ Example: Win 200 blackjack hands                        │
│                                                                 │
│  2. Play Rounds (Any Outcome)                                   │
│     └─ Example: Play 500 slot spins                            │
│                                                                 │
│  3. Reach Wagering Amount                                       │
│     └─ Example: Wager $1,000 on any game                       │
│                                                                 │
│  4. Win Amount                                                  │
│     └─ Example: Win $500 total (cumulative)                    │
│                                                                 │
│  5. Consecutive Wins                                            │
│     └─ Example: Win 10 hands in a row                          │
│                                                                 │
│  6. Big Win Multiplier                                          │
│     └─ Example: Hit a 50x+ win                                 │
│                                                                 │
│  7. Multi-Game Combo                                            │
│     └─ Example: Win on 5 different games                       │
│                                                                 │
│  8. Daily Login Streak                                          │
│     └─ Example: Login 7 days in a row                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Smartico "Plug & Play" Philosophy

### What Casino Does (Minimal)

```
✅ CASINO RESPONSIBILITIES:

1. Send Game Round Events:
   └─ POST /v1/events (game_round_completed)
   └─ Include: gameId, betAmount, winAmount, outcome

2. Handle Mission Completed Webhook:
   └─ Receive webhook → Credit reward
   └─ No tracking logic needed

3. Optional:
   └─ Send notifications to players
   └─ Display missions in UI (or use Smartico widget)
```

### What Smartico Does (Automatic)

```
✅ SMARTICO RESPONSIBILITIES:

1. Mission Management:
   ├─ Auto-activation on schedule
   ├─ Auto-expiry when time ends
   ├─ Progress tracking per player
   ├─ Win/loss detection
   └─ Goal completion detection

2. Game Filtering:
   ├─ Validates game eligibility
   ├─ Only counts eligible games
   └─ Handles all edge cases

3. Player Targeting:
   ├─ Filters by tier/segment
   ├─ Prevents duplicate rewards
   └─ Manages eligibility rules

4. Real-Time Updates:
   ├─ Widget shows live progress
   ├─ No polling needed from casino
   └─ Push notifications via webhooks
```

### Integration Effort

**Casino needs to:**
- ✅ Already sending `game_round_completed` events (standard integration)
- ✅ Handle 1 webhook: `mission_completed`
- ✅ That's it!

**No additional code needed** beyond standard event integration.

---

**Version:** 1.0
**Last Updated:** November 22, 2025
**Status:** ✅ Production Ready
