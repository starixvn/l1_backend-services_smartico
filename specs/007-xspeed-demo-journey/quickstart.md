# xSpeed Demo Journey - Quickstart Guide

## Prerequisites

- Backoffice API running on port 5120
- MongoDB running on localhost:27017
- Backend API running on port 5227 (for player dashboard)
- Frontend running on port 5173

## Quick Setup

### 1. Setup Complete xSpeed Journey

Single command to create all xSpeed entities:

```bash
curl -X POST "http://localhost:5120/api/demo/setup/xspeed-velocity-program?activate=true"
```

**Response:**
```json
{
  "scenarioId": "xspeed-velocity-program",
  "scenarioName": "xSpeed Velocity Program (Complete)",
  "success": true,
  "message": "Successfully created 11 entities",
  "createdEntities": [
    { "type": "BadgeSeries", "name": "Velocity Tiers", "status": "Active" },
    { "type": "Badge", "name": "Ignition Badge", "status": "Active" },
    { "type": "Badge", "name": "Cruiser Badge", "status": "Active" },
    { "type": "Badge", "name": "Turbo Badge", "status": "Active" },
    { "type": "Badge", "name": "Supersonic Badge", "status": "Active" },
    { "type": "Mission", "name": "The Daily Driver", "status": "Active" },
    { "type": "Mission", "name": "The Explorer", "status": "Active" },
    { "type": "Mission", "name": "The Table Tactician", "status": "Active" },
    { "type": "Mission", "name": "The Whale Challenge", "status": "Active" },
    { "type": "Jackpot", "name": "Hourly Prize Drop", "status": "Active" },
    { "type": "Jackpot", "name": "Daily Pot", "status": "Active" },
    { "type": "Jackpot", "name": "Mega Pot", "status": "Active" }
  ]
}
```

### 2. View in Player Dashboard

Open the player dashboard at `http://localhost:5173`:

- **Missions Widget**: Shows level-gated missions
- **Jackpots Widget**: Shows xSpeed Mystery Drop jackpots
- **Badges Widget**: Shows Velocity Tier achievement badges

## Phased Rollout Demo

For demonstrating phased rollout:

### Phase 1: Soft Launch
```bash
curl -X POST "http://localhost:5120/api/demo/setup/xspeed-phase-1?activate=true"
```
Creates: Ignition + Cruiser badges, Daily Driver mission

### Phase 2: Expansion
```bash
curl -X POST "http://localhost:5120/api/demo/setup/xspeed-phase-2?activate=true"
```
Adds: Turbo + Supersonic badges, Table Tactician mission, Hourly jackpot

### Phase 3: Full Velocity
```bash
curl -X POST "http://localhost:5120/api/demo/setup/xspeed-phase-3?activate=true"
```
Adds: Explorer + Whale missions, Daily + Mega jackpots

## Verify Setup

### List All Scenarios
```bash
curl "http://localhost:5120/api/demo/scenarios"
```

Look for xSpeed scenarios:
- `xspeed-velocity-program`
- `xspeed-phase-1`
- `xspeed-phase-2`
- `xspeed-phase-3`

### Check Created Entities

**Missions:**
```bash
curl "http://localhost:5227/api/missions?userId=demo-user"
```

**Jackpots:**
```bash
curl "http://localhost:5227/api/jackpots?userId=demo-user"
```

**Badges:**
```bash
curl "http://localhost:5227/api/badges?userId=demo-user"
```

## Cleanup

To remove demo data:
```bash
curl -X DELETE "http://localhost:5120/api/demo/cleanup"
```

## xSpeed Entities Reference

### Velocity Tiers
| Tier | Name | XP Required | Key Unlock |
|------|------|-------------|------------|
| 1 | Ignition | 0 | Daily Driver Mission |
| 2 | Cruiser | 500 | Explorer Mission, Hourly Jackpot |
| 3 | Turbo | 5,000 | Table Tactician Mission |
| 4 | Supersonic | 25,000 | Whale Challenge |

### Missions
| Mission | Level | Task | Reward |
|---------|-------|------|--------|
| Daily Driver | 1+ | Login + Wager $50 on Slots | 10 Free Spins |
| Explorer | 2+ | Play 5 Keno/Lottery rounds | 50 XP + Badge |
| Table Tactician | 3+ | Win 5 consecutive hands | $10 Cash |
| Whale Challenge | 4+ | Wager $5,000 weekly | VIP Package |

### Jackpots
| Jackpot | Trigger | Description |
|---------|---------|-------------|
| Hourly Prize Drop | Every 60 mins | Surprise drops throughout the day |
| Daily Pot | 8-10 PM daily | Prime-time jackpot window |
| Mega Pot | At $50,000 | Life-changing jackpot |

## Troubleshooting

### "Operator context not found" (401)
Ensure backoffice API has demo operator middleware configured.

### Entities not visible in dashboard
1. Check backend API is running on port 5227
2. Verify MongoDB connection
3. Check browser console for API errors

### Duplicate entities
Run cleanup before re-running setup:
```bash
curl -X DELETE "http://localhost:5120/api/demo/cleanup"
curl -X POST "http://localhost:5120/api/demo/setup/xspeed-velocity-program?activate=true"
```

---

*Generated with [Claude Code](https://claude.com/claude-code)*
