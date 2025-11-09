# Data Model: Jackpot System

**Version**: 1.0
**Created**: 2025-11-09
**Status**: Final
**Document Type**: Data Model Specification

---

## Overview

This document defines the data structures, entities, and their relationships for the Jackpot System feature. All entities are based on the Smartico API schema and include validation rules, state transitions, and relationship mappings.

---

## Entity Relationship Diagram

```
┌─────────────────────────────┐
│   JackpotDetails            │
│  (Template Configuration)   │
├─────────────────────────────┤
│ • jp_template_id (PK)       │
│ • jp_public_meta            │
│ • pot (FK to JackpotPot)    │
│ • registration_count        │
└──────────────┬──────────────┘
               │
               │ owns (1-to-many)
               │
       ┌───────▼──────────┐
       │  JackpotPot      │
       │ (Current Instance)│
       ├──────────────────┤
       │ • jp_pot_id (PK) │
       │ • jp_template_id │◄──┐
       │ (FK)             │   │
       │ • current_pot_   │   │ references
       │   amount         │   │
       └──────────────────┘   │
                              │
       ┌──────────────────────┴─┐
       │                        │
┌──────▼──────────────────┐  ┌─▼─────────────────────┐
│ JackpotOptInRecord      │  │  JackpotWinner        │
│ (User Registration)     │  │  (Pot Result)         │
├─────────────────────────┤  ├──────────────────────┤
│ • user_id (PK)          │  │ • jp_pot_id (FK)      │
│ • jp_template_id (PK)   │  │ • winner (embedded)   │
│ • opted_in_ts           │  │ • win_date_ts         │
│ • opt_out_ts (nullable) │  │ • is_me               │
└─────────────────────────┘  └──────────────────────┘
```

---

## Entity: JackpotDetails (Template Configuration)

**Purpose**: Represents a jackpot template with all configuration and the current pot state. This is the primary entity users interact with when browsing jackpots.

### Attributes

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-----------------|
| `jp_template_id` | `number` | Yes | Unique identifier for jackpot template | Must be positive integer; globally unique |
| `jp_type_id` | `JackpotType` | Yes | Type of jackpot (MultiUser=1, Personal=2) | Must be 1 or 2 (enum) |
| `jp_currency` | `string` | Yes | Base currency of jackpot pool | Format: 3-50 chars (e.g., "Points", "Gems", "USD") |
| `user_currency` | `string` | Yes | User's wallet currency for conversion display | Format: 3-50 chars (e.g., "USD", "EUR", "Points") |
| `contribution_type` | `JackpotContributionType` | Yes | How users contribute (Fixed=1, Percentage=2) | Must be 1 or 2 (enum) |
| `contribution_value` | `number` | Yes | Contribution amount or percentage | Must be >= 0.01; if Fixed in base currency units, if Percentage as decimal (0.1 = 0.1%) |
| `pot` | `JackpotPot` | Yes | Current pot state object | Must not be null; contains all pot-related fields |
| `registration_count` | `number` | Yes | Number of users opted in to this jackpot | Must be >= 0; for Personal jackpots, always 1 (self) |
| `is_opted_in` | `boolean` | Yes | Whether current user is opted in | True if user has active opt-in record, False otherwise |
| `ach_related_game_allow_all` | `boolean` | Yes | Whether jackpot applies to all games | Simplified for MVP: always True |
| `expose_winners_over_api` | `boolean` | Yes | Whether winners are publicly visible | Controls if winners display in UI/API |
| `jp_public_meta` | `JackpotPublicMeta` | Yes | Metadata for UI display | Must contain name, description, and image_url |

### Nested Structure: JackpotPublicMeta

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Display name of jackpot (e.g., "Mega Jackpot") |
| `description` | `string` | Yes | User-friendly description of jackpot rules |
| `image_url` | `string` | Yes | Thumbnail image URL for jackpot card |
| `winner_template` | `JackpotHtmlTemplate` | No | HTML template displayed when user wins |
| `not_winner_template` | `JackpotHtmlTemplate` | No | HTML template displayed when draw completes (user didn't win) |
| `placeholder1` | `string` | No | Custom field 1 (operator-defined) |
| `placeholder2` | `string` | No | Custom field 2 (operator-defined) |
| `custom_data` | `string` | No | Custom JSON data for specialized UI needs |

### Validation Rules

```typescript
interface JackpotDetailsValidation {
  // Type validation
  jp_template_id: number > 0;
  jp_type_id: JackpotType (1 | 2);
  contribution_type: JackpotContributionType (1 | 2);

  // Currency validation
  jp_currency: string with length 3-50;
  user_currency: string with length 3-50;
  contribution_value: decimal >= 0.01;

  // Meta validation
  jp_public_meta: {
    name: length 1-255,
    description: length 1-1000,
    image_url: valid HTTP(S) URL
  };

  // State validation
  pot: JackpotPot (must be present);
  is_opted_in: boolean;
  registration_count: number >= 0;

  // Consistency checks
  if (jp_type_id === JackpotType.Personal) {
    registration_count === 1; // Personal jackpots only track self
  }

  if (contribution_type === JackpotContributionType.Fixed) {
    contribution_value must be in base currency units;
  }

  if (contribution_type === JackpotContributionType.Percentage) {
    contribution_value: 0.01 to 100 (represents decimal percentage);
  }
}
```

### State Transitions

```
[Template Created]
         ↓
    [Active] ←──────────────────────┐
     ↓   ↑                          │
     ├─→ [Pool Growing]             │
     │    ↓                          │
     ├─→ [Explosion in Progress] ──→ [Pot Exploded] (new pot created)
     ↓
[Archived/Disabled]
```

### Relationship to Other Entities

- **JackpotPot**: Embeds current pot instance (1-to-1)
- **JackpotOptInRecord**: Multiple records reference this template (1-to-many)
- **JackpotWinner**: Winners reference associated pot (indirectly through pot ID)

### Example Values

```json
{
  "jp_template_id": 1,
  "jp_type_id": 1,
  "jp_currency": "Points",
  "user_currency": "USD",
  "contribution_type": 2,
  "contribution_value": 5.0,
  "pot": {
    "jp_template_id": 1,
    "jp_pot_id": 101,
    "current_pot_amount": 50000,
    "current_pot_amount_user_currency": 500.00,
    "current_pot_temperature": 2,
    "explode_date_ts": 1731195600000
  },
  "registration_count": 312,
  "is_opted_in": true,
  "ach_related_game_allow_all": true,
  "expose_winners_over_api": true,
  "jp_public_meta": {
    "name": "Mega Jackpot",
    "description": "Join thousands of players competing for a massive shared prize pool!",
    "image_url": "https://cdn.example.com/jackpots/mega-jackpot.png",
    "winner_template": {
      "id": "winner_default",
      "content": "<div>Congratulations! You won {{amount}} {{currency}}!</div>"
    },
    "not_winner_template": {
      "id": "not_winner_default",
      "content": "<div>Better luck next time! {{winner}} won this round.</div>"
    },
    "placeholder1": "next_draw_date",
    "placeholder2": "all_time_winners_count",
    "custom_data": "{\"sponsorBrand\":\"BetKing\",\"promoCode\":\"MEGA25\"}"
  }
}
```

---

## Entity: JackpotPot (Current Pot Instance)

**Purpose**: Represents the current instance of a jackpot pot with pool amount, temperature, and explosion metadata. Each time a jackpot explodes (draws a winner), a new pot is created.

### Attributes

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-----------------|
| `jp_pot_id` | `number` | Yes | Unique identifier for this pot instance | Must be positive integer; unique per template |
| `jp_template_id` | `number` | Yes | Foreign key to parent template | Must reference valid JackpotDetails |
| `current_pot_amount` | `number` | Yes | Current pool amount in jackpot currency | Must be >= 0; typically decimal with 2 places |
| `current_pot_amount_user_currency` | `number` | Yes | Current pool amount in user's wallet currency | Must be >= 0; pre-calculated conversion |
| `current_pot_temperature` | `JackPotTemperature` | Yes | Heat level of pool (COLD=0, WARM=1, HOT=2, BURNING=3) | Must be 0-3 (enum); calculated server-side |
| `explode_date_ts` | `number` | Yes | Unix timestamp when pot exploded/will explode | Milliseconds since epoch; 13 digits |

### Validation Rules

```typescript
interface JackpotPotValidation {
  // Primary key validation
  jp_pot_id: number > 0;
  jp_template_id: number > 0;

  // Amount validation
  current_pot_amount: decimal >= 0 with max 2 decimal places;
  current_pot_amount_user_currency: decimal >= 0 with max 2 decimal places;

  // State validation
  current_pot_temperature: JackPotTemperature (0 | 1 | 2 | 3);
  explode_date_ts: number > 0 and valid timestamp;

  // Relationship validation
  jp_template_id must reference existing JackpotDetails;

  // Consistency checks
  if (current_pot_amount === 0) {
    current_pot_temperature === 0; // COLD when empty
  }

  // Currency conversion check
  conversion_ratio = current_pot_amount_user_currency / current_pot_amount;
  conversion_ratio must be reasonable (typically 0.001 to 100);
}
```

### Temperature Calculation Algorithm

Temperature is calculated based on current pot amount vs configured thresholds:

```csharp
// From spec and research: Temperature formula
decimal COLD_threshold = (minAmount - seedAmount) / 2;
decimal HOT_threshold = minAmount + 0.5m * (maxAmount - minAmount);

if (currentPot < COLD_threshold)
    return JackPotTemperature.COLD;      // 0

if (currentPot < minAmount)
    return JackPotTemperature.WARM;      // 1

if (currentPot < HOT_threshold)
    return JackPotTemperature.HOT;       // 2

return JackPotTemperature.BURNING;       // 3
```

**Example**:
- min_amount = 5,000, max_amount = 10,000, seed_amount = 1,000
- COLD_threshold = (5,000 - 1,000) / 2 = 2,000
- HOT_threshold = 5,000 + 0.5 * (10,000 - 5,000) = 7,500
- Pool = 1,500 → **COLD** (< 2,000)
- Pool = 3,000 → **WARM** (2,000 ≤ x < 5,000)
- Pool = 6,000 → **HOT** (5,000 ≤ x < 7,500)
- Pool = 9,000 → **BURNING** (≥ 7,500)

### State Transitions

```
[Pot Created - COLD]
         ↓ (user contributions)
    [COLD/WARM/HOT] ←──┐
     ↓                 │
    [HOT] ──────────→ [BURNING]
     ↓
[Explosion Triggered] ──→ [New Pot Created]
```

### Relationship to Other Entities

- **JackpotDetails**: Child of template (many-to-1)
- **JackpotWinner**: Winner records reference this pot (1-to-many)
- **JackpotOptInRecord**: Users contributing to this pot are tracked separately

### Example Values

```json
{
  "jp_pot_id": 101,
  "jp_template_id": 1,
  "current_pot_amount": 50000,
  "current_pot_amount_user_currency": 500.00,
  "current_pot_temperature": 2,
  "explode_date_ts": 1731195600000
}
```

---

## Entity: JackpotOptInRecord (User Registration Tracking)

**Purpose**: Records when a user opts into a jackpot and tracks their registration status. This entity is created on opt-in and updated (marked inactive) on opt-out.

### Attributes

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-----------------|
| `user_id` | `string` | Yes | User identifier (UUID or alphanumeric) | Length 1-255; must reference valid user |
| `jp_template_id` | `number` | Yes | Jackpot template ID (composite key) | Must be positive integer |
| `opted_in_ts` | `number` | Yes | Unix timestamp when user opted in | Milliseconds since epoch; 13 digits; not future date |
| `opt_out_ts` | `number` | No | Unix timestamp when user opted out (nullable) | Milliseconds since epoch; null if currently opted in |
| `is_active` | `boolean` | Implied | Whether record is active (derived: opt_out_ts === null) | True if opt_out_ts is null, False otherwise |

### Validation Rules

```typescript
interface JackpotOptInRecordValidation {
  // Composite primary key
  (user_id, jp_template_id): must be unique pair;
  user_id: string length 1-255;
  jp_template_id: number > 0;

  // Timestamp validation
  opted_in_ts: number > 0 and not in future;
  opt_out_ts: number > 0 or null;

  // Relationship validation
  user_id must reference existing User;
  jp_template_id must reference existing JackpotDetails;

  // State consistency
  if (opt_out_ts !== null) {
    opt_out_ts > opted_in_ts; // Can't opt out before opting in
  }

  // No duplicate active opt-ins
  only one record per (user_id, jp_template_id) can have opt_out_ts === null;
}
```

### State Transitions

```
[User Not Opted In]
         ↓ (click "Opt In")
    [Record Created: opted_in_ts=now, opt_out_ts=null]
         ↓ (user is now opted in)
    [User Opted In] ←─────────────────┐
         ↓ (click "Opt Out")           │
    [Record Updated: opt_out_ts=now]   │
         ↓                              │
    [User Not Opted In] ──(re-opt-in)──┘
```

### Relationship to Other Entities

- **JackpotDetails**: References template (many-to-1)
- **User**: References user (many-to-1)
- No direct reference to JackpotWinner (but winners must have active opt-in at time of explosion)

### Database Constraints

```sql
-- Composite primary key
PRIMARY KEY (user_id, jp_template_id)

-- Foreign keys
FOREIGN KEY (jp_template_id) REFERENCES jackpot_templates(jp_template_id)
FOREIGN KEY (user_id) REFERENCES users(user_id)

-- Unique active records per user per template
UNIQUE (user_id, jp_template_id) WHERE opt_out_ts IS NULL

-- Indexes for performance
INDEX idx_user_opted_in (user_id) WHERE opt_out_ts IS NULL
INDEX idx_template_opted_in (jp_template_id) WHERE opt_out_ts IS NULL
```

### Example Values

**Opt-In Record (Active)**:
```json
{
  "user_id": "user_abc123",
  "jp_template_id": 1,
  "opted_in_ts": 1731100000000,
  "opt_out_ts": null,
  "is_active": true
}
```

**Opt-In Record (Inactive - Historical)**:
```json
{
  "user_id": "user_abc123",
  "jp_template_id": 1,
  "opted_in_ts": 1731000000000,
  "opt_out_ts": 1731050000000,
  "is_active": false
}
```

---

## Entity: JackpotWinner (Winner Records)

**Purpose**: Records jackpot winners when a pot explodes and a draw occurs. Multiple winners per pot are supported with positional ranking (1st, 2nd, 3rd place).

### Attributes

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-----------------|
| `jp_pot_id` | `number` | Yes | Pot instance that was drawn | Must be positive integer; references JackpotPot |
| `is_me` | `boolean` | Yes | Flag indicating current logged-in user is winner | True only for querying user; False for all others |
| `public_username` | `string` | Yes | Username of winner (masked unless is_me=true) | Length 1-255; masked format "J***n" for others |
| `avatar_id` | `string` | Yes | Avatar identifier for winner's profile picture | Length 1-255 |
| `winning_amount_jp_currency` | `number` | Yes | Prize amount in jackpot's base currency | Must be >= 0; typically decimal with 2 places |
| `winning_amount_wallet_currency` | `number` | Yes | Prize amount in user's wallet currency | Must be >= 0; pre-calculated conversion |
| `winning_position` | `number` | Yes | Rank position (1=first, 2=second, 3=third, etc.) | Must be positive integer >= 1 |
| `win_date_ts` | `number` | Yes | Unix timestamp when winner was drawn | Milliseconds since epoch; 13 digits |

### Validation Rules

```typescript
interface JackpotWinnerValidation {
  // Foreign key validation
  jp_pot_id: number > 0 and references JackpotPot;

  // Identity validation
  is_me: boolean;
  public_username: string length 1-255;

  // If is_me === false:
  //   public_username must be masked (format: "X***X" or "A***e")
  // If is_me === true:
  //   public_username can be full name (unmasked)

  avatar_id: string length 1-255;

  // Amount validation
  winning_amount_jp_currency: decimal >= 0 with max 2 places;
  winning_amount_wallet_currency: decimal >= 0 with max 2 places;

  // Position validation
  winning_position: number >= 1;

  // No duplicate winners per position per pot
  UNIQUE (jp_pot_id, winning_position);

  // Timestamp validation
  win_date_ts: number > 0 and not in future;

  // Consistency checks
  if (winning_amount_jp_currency === 0) {
    // May happen in some lottery models, but validate against pot
  }

  conversion_ratio = winning_amount_wallet_currency / winning_amount_jp_currency;
  conversion_ratio must be reasonable (typically 0.001 to 100);

  winning_position sequence should be continuous (1, 2, 3...) per pot;
}
```

### Relationship to Other Entities

- **JackpotPot**: Winner references pot (many-to-1)
- **JackpotDetails**: Indirectly referenced through pot's jp_template_id
- **User**: Winner references user indirectly through public_username (historical record only)

### Data Consistency Notes

- **Immutability**: Winner records are append-only; never updated or deleted
- **Anonymization**: Non-current users have masked usernames; current user sees full name (is_me=true)
- **Multi-Winner Support**: Single pot can have multiple winners with different positions
- **Historical Accuracy**: All winner data preserved for winner leaderboard

### Example Values

**Winner Record (Current User)**:
```json
{
  "jp_pot_id": 101,
  "is_me": true,
  "public_username": "SarahJones",
  "avatar_id": "avatar_12345",
  "winning_amount_jp_currency": 50000,
  "winning_amount_wallet_currency": 500.00,
  "winning_position": 1,
  "win_date_ts": 1731195600000
}
```

**Winner Record (Other User - Masked)**:
```json
{
  "jp_pot_id": 101,
  "is_me": false,
  "public_username": "J***n",
  "avatar_id": "avatar_67890",
  "winning_amount_jp_currency": 10000,
  "winning_amount_wallet_currency": 100.00,
  "winning_position": 1,
  "win_date_ts": 1731190000000
}
```

**Winner List (Mixed)**:
```json
[
  {
    "jp_pot_id": 101,
    "is_me": true,
    "public_username": "SarahJones",
    "avatar_id": "avatar_12345",
    "winning_amount_jp_currency": 50000,
    "winning_amount_wallet_currency": 500.00,
    "winning_position": 1,
    "win_date_ts": 1731195600000
  },
  {
    "jp_pot_id": 101,
    "is_me": false,
    "public_username": "M***e",
    "avatar_id": "avatar_67890",
    "winning_amount_jp_currency": 10000,
    "winning_amount_wallet_currency": 100.00,
    "winning_position": 2,
    "win_date_ts": 1731195600000
  },
  {
    "jp_pot_id": 101,
    "is_me": false,
    "public_username": "A***a",
    "avatar_id": "avatar_11111",
    "winning_amount_jp_currency": 5000,
    "winning_amount_wallet_currency": 50.00,
    "winning_position": 3,
    "win_date_ts": 1731195600000
  }
]
```

---

## Enumeration: JackpotType

| Value | Name | Description |
|-------|------|-------------|
| 1 | MultiUser | Shared jackpot pool among all opted-in users; higher collective prizes |
| 2 | Personal | Individual jackpot pool per user; isolated experience |

### Usage

- Determines how registration count is tracked
- Affects UI display (showing other users vs personal only)
- Controls winner announcement scope

### Example

```json
{
  "jp_type_id": 1,
  "type_name": "MultiUser",
  "description": "Shared pool grows with all users' contributions"
}
```

---

## Enumeration: JackpotContributionType

| Value | Name | Description |
|-------|-------|-------------|
| 1 | Fixed | User contributes fixed amount per bet (e.g., 10 points per bet) |
| 2 | Percentage | User contributes percentage of bet amount (e.g., 5% of bet) |

### Usage

- Determines how contribution_value is interpreted
- Affects gameplay balance calculations
- Controls UI messaging ("5 points per bet" vs "5% of each bet")

### Calculation Examples

**Fixed (Type=1)**:
```
User bet: 100 points
contribution_value: 10 (meaning 10 points)
Contribution deducted: 10 points
Remaining bet: 100 points
```

**Percentage (Type=2)**:
```
User bet: 100 points
contribution_value: 5.0 (meaning 5%)
Contribution deducted: 100 * (5.0 / 100) = 5 points
Remaining bet: 100 points
```

---

## Enumeration: JackPotTemperature

| Value | Name | Description | Pool Status |
|-------|------|-------------|------------|
| 0 | COLD | Pool is very small, growing slowly | seed_amount < current_pot < (min_amount - seed_amount) / 2 |
| 1 | WARM | Pool halfway to explosion threshold | (min_amount - seed_amount) / 2 ≤ current_pot < min_amount |
| 2 | HOT | Pool in explosion range, approaching max | min_amount ≤ current_pot < min_amount + 0.5 * (max_amount - min_amount) |
| 3 | BURNING | Pool very hot, explosion imminent | current_pot ≥ min_amount + 0.5 * (max_amount - min_amount) |

### Visual Indicators

| Temperature | Color | Icon | Animation |
|-------------|-------|------|-----------|
| COLD | Blue (#3B82F6) | 🧊 | Static |
| WARM | Yellow (#FBBF24) | ☀️ | Gentle pulse |
| HOT | Orange (#F97316) | 🔥 | Faster pulse |
| BURNING | Red (#EF4444) | 🌋 | Rapid pulse + glow |

### Usage

- Server calculates temperature based on min/max/seed amounts
- Frontend displays temperature with visual feedback
- Helps communicate urgency to users ("pool is about to explode!")

---

## Data Flow Diagrams

### User Opt-In Flow

```
[User Views Jackpot]
       ↓
[Fetch JackpotDetails via API]
       ↓ (contains pot + registration_count + is_opted_in)
[Display Jackpot Card]
       ↓
[User Clicks "Opt In"]
       ↓
[POST JackpotsOptinRequest(user_id, jp_template_id)]
       ↓
[Create JackpotOptInRecord]
       ↓
[Increment RegistrationCount for MultiUser]
       ↓
[Return updated JackpotDetails with is_opted_in=true]
       ↓
[Show confirmation + update button to "Opt Out"]
       ↓
[Broadcast registration count update via SignalR]
```

### User Places Bet (with Contribution)

```
[User Opted In to Jackpot]
       ↓
[User Places Bet]
       ↓
[Validate user has sufficient balance for: bet + contribution]
       ↓
[Calculate contribution]
├─ if (Fixed): use contribution_value directly
└─ if (Percentage): calculate contribution_value % of bet
       ↓
[Deduct bet + contribution from user balance]
       ↓
[Add contribution to JackpotPot.current_pot_amount]
       ↓
[Check if temperature changed]
       ↓
[Broadcast JackpotPoolUpdated via SignalR]
       ├─ current_pot_amount
       ├─ current_pot_amount_user_currency
       ├─ current_pot_temperature (if changed)
       └─ registration_count
       ↓
[Continue with normal bet processing]
```

### Pot Explosion Flow

```
[Current Pot Reaches Threshold]
       ↓
[Backend Explosion Handler Triggered]
       ↓
[Draw Winners (external system)]
       ↓
[Create JackpotWinner records for each winner]
       ↓
[Award winning amounts to winner balances]
       ↓
[Update JackpotPot: explode_date_ts = now]
       ↓
[Create new JackpotPot instance]
       ↓
[Reset current_pot_amount to seed_amount]
       ↓
[Reset current_pot_temperature to COLD]
       ↓
[Broadcast JackpotExploded + Winners via SignalR]
       ├─ JackpotExploded(template_id, pot_id, final_amount)
       └─ JackpotWinnerAnnounced(template_id, winner_list)
       ↓
[Update JackpotDetails: pot = new_pot]
       ↓
[Users see "Explosion! Check winners" notification]
```

---

## API Contract Mapping

### Smartico API Response → Data Model

| Smartico Field | Maps To | Entity |
|---|---|---|
| `jp_template_id` | `jp_template_id` | JackpotDetails |
| `jp_type_id` | `jp_type_id` | JackpotDetails |
| `jp_public_meta` | `jp_public_meta` | JackpotDetails |
| `jp_currency` | `jp_currency` | JackpotDetails |
| `user_currency` | `user_currency` | JackpotDetails |
| `contribution_type` | `contribution_type` | JackpotDetails |
| `contribution_value` | `contribution_value` | JackpotDetails |
| `pot` (object) | `pot` | JackpotPot |
| `pot.jp_pot_id` | `jp_pot_id` | JackpotPot |
| `pot.current_pot_amount` | `current_pot_amount` | JackpotPot |
| `pot.current_pot_amount_user_currency` | `current_pot_amount_user_currency` | JackpotPot |
| `pot.current_pot_temperature` | `current_pot_temperature` | JackpotPot |
| `pot.explode_date_ts` | `explode_date_ts` | JackpotPot |
| `is_opted_in` | `is_opted_in` | JackpotDetails |
| `registration_count` | `registration_count` | JackpotDetails |
| `ach_related_game_allow_all` | `ach_related_game_allow_all` | JackpotDetails |
| `expose_winners_over_api` | `expose_winners_over_api` | JackpotDetails |

---

## Validation Summary

### Critical Validations

1. **Uniqueness**
   - Only one active JackpotOptInRecord per (user_id, jp_template_id)
   - No duplicate JackpotWinner positions per pot

2. **Consistency**
   - JackpotPot.jp_template_id must exist in JackpotDetails
   - Temperature calculation must match thresholds
   - User currency conversion must be reasonable ratio

3. **Temporal**
   - opted_in_ts cannot be in future
   - opt_out_ts > opted_in_ts (if present)
   - win_date_ts cannot be in future
   - explode_date_ts cannot be in future (or recent past)

4. **Business Logic**
   - Personal jackpots always have registration_count = 1
   - Fixed contributions in base currency units >= 0.01
   - Percentage contributions between 0.01 and 100
   - Pool amounts always >= 0

---

## Appendix: Type Definitions (TypeScript)

```typescript
// Enums
export enum JackpotType {
  MultiUser = 1,
  Personal = 2
}

export enum JackpotContributionType {
  Fixed = 1,
  Percentage = 2
}

export enum JackPotTemperature {
  COLD = 0,
  WARM = 1,
  HOT = 2,
  BURNING = 3
}

// Interfaces
export interface JackpotHtmlTemplate {
  id: string;
  content: string;
}

export interface JackpotPublicMeta {
  name: string;
  description: string;
  image_url: string;
  winner_template?: JackpotHtmlTemplate;
  not_winner_template?: JackpotHtmlTemplate;
  placeholder1?: string;
  placeholder2?: string;
  custom_data?: string;
}

export interface JackpotPot {
  jp_template_id: number;
  jp_pot_id: number;
  current_pot_amount: number;
  current_pot_amount_user_currency: number;
  current_pot_temperature: JackPotTemperature;
  explode_date_ts: number;
}

export interface JackpotDetails {
  jp_template_id: number;
  jp_type_id: JackpotType;
  jp_public_meta: JackpotPublicMeta;
  jp_currency: string;
  user_currency: string;
  contribution_type: JackpotContributionType;
  contribution_value: number;
  pot: JackpotPot;
  is_opted_in: boolean;
  ach_related_game_allow_all: boolean;
  registration_count: number;
  expose_winners_over_api: boolean;
}

export interface JackpotOptInRecord {
  user_id: string;
  jp_template_id: number;
  opted_in_ts: number;
  opt_out_ts: number | null;
  is_active: boolean; // derived: opt_out_ts === null
}

export interface JackPotWinner {
  is_me: boolean;
  public_username: string;
  winning_amount_jp_currency: number;
  winning_amount_wallet_currency: number;
  winning_position: number;
  avatar_id: string;
}

export interface JackpotWinnerHistory {
  jp_pot_id: number;
  win_date_ts: number;
  winner: JackPotWinner;
}
```

---

## Change History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-09 | Initial data model document. Documented all 4 core entities: JackpotDetails, JackpotPot, JackpotOptInRecord, JackpotWinner. Included validation rules, state transitions, relationships, and example values based on Smartico API schema. |

---

**Document Status**: Ready for Implementation
**Last Updated**: 2025-11-09
**Review Status**: Final ✓
