# API Contracts

## Overview

The Gamification Widget Layout feature is **frontend-only** and requires **zero backend changes**. All data is fetched from existing APIs and SignalR events.

## No New Endpoints Required

This feature reuses existing endpoints:

| Service | Endpoint | Method | Description | Status |
|---------|----------|--------|-------------|---------|
| Mission Service | `/api/missions` | GET | Fetch active missions | ✅ Existing |
| Bonus Service | `/api/bonuses` | GET | Fetch active bonuses | ✅ Existing |
| Mini Game Service | `/api/minigames` | GET | Fetch available mini games | ✅ Existing |
| Tournament Service | `/api/tournaments` | GET | Fetch active tournaments | ✅ Existing |
| Level Service | `/api/levels` | GET | Fetch user level progress | ✅ Existing |
| Jackpot Service | `/api/jackpots` | GET | Fetch active jackpots | ✅ Existing |
| Achievement Service | `/api/achievements` | GET | Fetch user achievements | ✅ Existing |
| VIP Service | `/api/vip-tier` | GET | Fetch VIP tier info | ✅ Existing |
| Activity Service | `/api/activity-feed` | GET | Fetch recent activity | ✅ Existing |

## SignalR Hub

Reuses existing `/hubs/progress` hub with existing events:

| Event | Payload | Description | Status |
|-------|---------|-------------|---------|
| `MissionProgressUpdated` | `{ userId, missionId, progress }` | Mission progress change | ✅ Existing |
| `MissionCompleted` | `{ userId, missionId, xpEarned, pointsEarned }` | Mission completed | ✅ Existing |
| `LevelUpAchieved` | `{ userId, newLevel, rewards }` | User leveled up | ✅ Existing |
| `BadgeEarned` | `{ userId, badgeId, badgeName }` | Badge unlocked | ✅ Existing |
| `BonusClaimed` | `{ userId, bonusId, value }` | Bonus claimed | ✅ Existing |
| `JackpotWon` | `{ userId, jackpotId, tier, amount }` | Jackpot won | ✅ Existing |
| `CurrencyUpdated` | `{ userId, coins, gems, diamonds }` | Currency balance updated | ✅ Existing |

## Client-Side Only Storage

The following data is stored in **localStorage** (client-side only, no backend persistence):

| Key | Type | Max Size | Description |
|-----|------|----------|-------------|
| `smartico_theme` | `ThemeConfig` | ~200 bytes | User theme preferences |
| `smartico_widget_layout` | `WidgetLayoutConfig` | ~500 bytes | Widget order, visibility, size modes |
| `smartico_animation_intensity` | `'none' \| 'subtle' \| 'moderate' \| 'full'` | ~20 bytes | Animation preference |

**Total localStorage usage:** ~720 bytes (<1KB)

## No Backend Changes Required

✅ **Zero database migrations**
✅ **Zero new API endpoints**
✅ **Zero backend code changes**
✅ **Zero infrastructure changes**

This is a **pure presentation layer feature** that aggregates existing data and enhances the UI/UX.

---

**Last Updated:** 2025-11-12
