# SabaONE Gamification Platform - Operator Guide

**Version:** 1.0.0
**Created:** 2025-11-30
**Audience:** Casino Operators, Game Providers, Marketing Teams

---

## Welcome to SabaONE

SabaONE's Back Office is a powerful, no-code platform that empowers your marketing and operations teams to create, manage, and optimize gamification campaigns without requiring technical expertise or developer support.

**Transform your player engagement from weeks to hours** - create missions, bonuses, tournaments, jackpots, player progression systems, and badges all from a single, intuitive interface.

---

## Platform Features at a Glance

| Feature | Description | Business Impact |
|---------|-------------|-----------------|
| **Missions** | Task-based campaigns with triggers, goals, and rewards | Drive specific player behaviors |
| **Jackpots** | Progressive and fixed jackpots with multiple tiers | Create excitement and big-win opportunities |
| **Level System** | XP-based player progression with tiers | Long-term player retention |
| **Badges** | Achievement system with unlock criteria | Gamify player actions |
| **Tournaments** | Competitive events with leaderboards | Community engagement |
| **Bonuses** | Deposit matches, free spins, cashback | Player acquisition and reactivation |

---

## Feature 1: Missions - Drive Player Actions

### What It Is

Missions are task-based campaigns where players complete specific actions to earn rewards. Each mission contains one or more tasks, and players receive XP and optional bonuses upon completion.

### Business Value

- **Targeted Behavior**: Guide players toward specific games, bet amounts, or activities
- **Engagement Boost**: Give players clear goals and progress tracking
- **Cross-Promotion**: Promote new games or underperforming slots through mission tasks
- **Retention**: Regular missions keep players coming back

### How It Works

```
Mission: "Weekend Warrior"
├── Task 1: Place 5 bets of $100+ on Slots → 50 Free Spins
├── Task 2: Wager $500 total → No reward (progress only)
└── Task 3: Win 3 times on any game → 100 Free Spins

Completion Reward: 500 XP (contributes to player level)
```

### Example Scenarios

#### Scenario A: New Game Launch Promotion

**Situation**: Your casino just added "Dragon's Fortune" slot and wants to drive initial engagement.

**Solution**: Create a "Dragon's Fortune Discovery" mission:

| Task | Trigger | Goal | Reward |
|------|---------|------|--------|
| "Try Dragon's Fortune" | Bet Placed on dragon-fortune | 10 spins | 25 Free Spins |
| "Big Spender" | Bet Placed ($10+ min) on dragon-fortune | Wager $100 | 50 Free Spins |
| "Lucky Dragon" | Win on dragon-fortune | 5 wins | $10 Cash Bonus |

**Completion XP**: 1,000 XP
**Schedule**: Launch week only
**Target**: All Players

**Expected Outcome**: 40-60% of active players try the new game within first week.

---

#### Scenario B: Weekend Engagement Boost

**Situation**: Player activity drops on weekends. You want to increase Saturday-Sunday betting.

**Solution**: Create recurring "Weekend Warrior" missions:

| Task | Trigger | Goal | Reward |
|------|---------|------|--------|
| "Saturday Starter" | Deposit Made | Deposit $50+ | 25% Deposit Match |
| "Spin Master" | Bet Placed | 100 total spins | 50 Free Spins |
| "High Roller Hour" | Bet Placed ($25+ min) | 10 bets | Entry to VIP Tournament |

**Completion XP**: 500 XP
**Schedule**: Every Saturday 00:00 - Sunday 23:59 (recurring)
**Target**: All Players

**Expected Outcome**: 25-35% increase in weekend wagering activity.

---

#### Scenario C: VIP Player Retention

**Situation**: VIP players have been less active lately. You want to re-engage them with exclusive challenges.

**Solution**: Create "VIP Exclusive Challenge" mission:

| Task | Trigger | Goal | Reward |
|------|---------|------|--------|
| "High Stakes" | Bet Placed ($100+ min) | 20 bets | $50 Cash Bonus |
| "Multi-Game Master" | Bet Placed on 5 different games | Play 5 games | 100 Free Spins |
| "Persistence Pays" | Daily Login | 7 consecutive days | "VIP Loyalty" Badge |

**Completion XP**: 2,500 XP
**Schedule**: Monthly
**Target**: VIP Only

**Expected Outcome**: 50% VIP re-engagement rate, reduced churn.

---

## Feature 2: Jackpots - Create Big-Win Excitement

### What It Is

Jackpots are prize pools that can be won by players meeting specific trigger conditions. SabaONE supports both **Progressive** jackpots (growing with each bet) and **Fixed** jackpots (static amounts).

### Business Value

- **Player Excitement**: The chance of winning big keeps players engaged
- **Differentiation**: Unique jackpot structures set you apart from competitors
- **Revenue Driver**: Players bet more when chasing jackpots
- **Retention**: "Must-drop" jackpots create urgency and return visits

### Jackpot Types

| Type | How It Works | Best For |
|------|--------------|----------|
| **Progressive** | Grows with each qualifying bet (contribution rate) | Building excitement over time |
| **Fixed** | Static amount that doesn't change | Predictable costs, frequent wins |

### Trigger Types

| Trigger | Description | Use Case |
|---------|-------------|----------|
| **Random** | Probability-based (e.g., 0.01% chance per bet) | Classic jackpot experience |
| **Value-Based** | Triggers when bet meets threshold (e.g., $50+ bet) | Reward high-stakes players |
| **Time-Based** | Must-drop at scheduled time (hourly/daily/weekly) | Create appointment viewing |
| **Amount-Based** | Must-drop when jackpot reaches target value (e.g., $2,000) | Guaranteed excitement threshold |

### Prize Distribution Options

| Distribution | Description | Use Case |
|--------------|-------------|----------|
| **Winner Takes All** | Single winner gets entire jackpot | Maximum excitement |
| **Split Among Winners** | Top N players share the prize | More winners, more engagement |
| **Proportional to Wager** | Prize based on player's bet contribution | Fair reward for activity |

### Example Scenarios

#### Scenario A: Classic Progressive Jackpot

**Situation**: You want to create a flagship jackpot that builds excitement over time.

**Solution**: Create "Mega Fortune Jackpot" with 4 tiers:

| Tier | Seed Amount | Contribution Rate | Trigger |
|------|-------------|-------------------|---------|
| **Grand** | $10,000 | 0.1% of each bet | Random (0.0001% chance) |
| **Major** | $1,000 | 0.05% of each bet | Random (0.001% chance) |
| **Minor** | $100 | 0.03% of each bet | Random (0.01% chance) |
| **Mini** | $10 | 0.02% of each bet | Random (0.1% chance) |

**Prize Distribution**: Winner Takes All
**Reset Behavior**: Reset to Seed
**Eligible Games**: All Slots

**Expected Outcome**: Players stay longer chasing the growing jackpot.

---

#### Scenario B: Daily Must-Drop Jackpot

**Situation**: You want to guarantee daily winners to create buzz and urgency.

**Solution**: Create "Daily Drop" jackpot:

| Tier | Seed Amount | Contribution Rate | Trigger |
|------|-------------|-------------------|---------|
| **Daily Grand** | $500 | 0.2% of each bet | Time-Based (Daily at 21:00 UTC) |
| **Hourly Mini** | $25 | 0.1% of each bet | Time-Based (Hourly) |

**Prize Distribution**: Winner Takes All
**Reset Behavior**: Reset to Seed
**Eligible Games**: Featured Slots (wukong, candy-land, olympub)

**Expected Outcome**: Players return daily for guaranteed drop times, 30% increase in evening activity.

---

#### Scenario C: High-Value Must-Drop Jackpot

**Situation**: You want to guarantee a jackpot triggers when it reaches an exciting amount.

**Solution**: Create "Guaranteed $2K Drop" jackpot:

| Tier | Seed Amount | Contribution Rate | Trigger |
|------|-------------|-------------------|---------|
| **Mega Drop** | $500 | 0.15% of each bet | Amount-Based ($2,000) |

**Prize Distribution**: Proportional to Wager
**Configuration**:
- Max Winners: 10
- Minimum Wager to Qualify: $10
- Max Percentage Per Player: 50%

**Reset Behavior**: Reset to Seed
**Eligible Games**: All Slots

**Expected Outcome**: When jackpot approaches $2,000, player activity spikes as everyone wants to qualify for the drop.

---

#### Scenario D: Tournament-Style Split Jackpot

**Situation**: You want multiple winners to increase excitement and social proof.

**Solution**: Create "Lucky 10 Jackpot":

| Tier | Seed Amount | Contribution Rate | Trigger |
|------|-------------|-------------------|---------|
| **Lucky 10** | $1,000 | 0.1% of each bet | Random (0.001% chance) |

**Prize Distribution**: Split Among Winners
- Max Winners: 10
- Winner Percentages: [30%, 20%, 15%, 10%, 8%, 6%, 5%, 3%, 2%, 1%]

**Reset Behavior**: Reset to Seed

**Expected Outcome**: 10 winners per jackpot creates social buzz and "it could be me" mentality.

---

## Feature 3: Player Level System - Long-Term Retention

### What It Is

The Level System creates a progression path where players earn XP (experience points) from various activities and advance through levels and tiers. Each level can unlock rewards, and each tier provides ongoing benefits.

### Business Value

- **Long-Term Retention**: Players invest in their progression and don't want to lose it
- **Loyalty Program**: VIP tiers with exclusive benefits reward top players
- **Behavior Shaping**: XP rules incentivize desired activities (deposits, bets, tournament play)
- **Engagement Depth**: Progress bars and level-ups create satisfaction loops

### XP Sources

| Activity | Example XP Rule | Daily Cap |
|----------|-----------------|-----------|
| **Wagering** | 1 XP per $10 wagered | 1,000 XP |
| **Deposits** | 5 XP per $10 deposited | No cap |
| **Mission Completion** | Varies per mission (0-100,000 XP) | No cap |
| **Tournament Win** | 200 XP per win | No cap |
| **Tournament Participation** | 50 XP per entry | No cap |
| **Daily Login** | 10 XP per day | 10 XP |
| **Badge Unlock** | Varies per badge | No cap |

### Tier Structure Example

| Tier | Levels | Benefits |
|------|--------|----------|
| **Bronze** | 1-10 | Standard experience |
| **Silver** | 11-25 | 2% Cashback Boost |
| **Gold** | 26-50 | 5% Cashback Boost, VIP Support |
| **Platinum** | 51-75 | 8% Cashback Boost, VIP Support, Exclusive Tournaments |
| **Diamond** | 76-100 | 15% Cashback Boost, VIP Support, Exclusive Tournaments, Higher Limits |

### Example Scenario: Complete VIP Program

**Situation**: You want to create a comprehensive loyalty program that rewards long-term players.

**Solution**: Create "VIP Progression 2025" Level System:

**Basic Configuration**:
- Max Level: 100
- Progression Curve: Exponential (1.5x multiplier)
- Base XP: 100 (Level 1→2 requires 100 XP)

**XP Earning Rules**:
| Activity | XP | Cap |
|----------|----|----|
| Bet | 1 XP per $10 wagered | 1,000 XP/day |
| Deposit | 5 XP per $10 deposited | None |
| Tournament Participation | 50 XP | None |
| Tournament Win | 200 XP | None |
| Daily Login | 10 XP | 10 XP/day |

**Level-Up Rewards**:
| Level | Reward |
|-------|--------|
| 10 | 50 Free Spins |
| 25 | $25 Cash Bonus |
| 50 | "Gold Celebration" Bonus Package |
| 75 | "Platinum Exclusive" Bonus Package |
| 100 | "Diamond VIP" Ultimate Package |

**Demotion Rules** (Optional):
- Inactive for 90 days: Drop one tier
- 7-day warning before demotion
- XP preserved within demoted tier

**Expected Outcome**: 40% increase in player lifetime value, 60% reduction in VIP churn.

---

## Feature 4: Badges - Gamify Achievements

### What It Is

Badges are visual achievements that players unlock by meeting specific criteria. They add a collection/achievement layer to your platform, encouraging players to complete challenges and show off their accomplishments.

### Business Value

- **Engagement**: Players enjoy collecting badges and showing them off
- **Behavior Incentives**: Badges guide players toward desired actions
- **Social Proof**: Badge collections create bragging rights
- **Retention**: Hidden badges create discovery and return visits

### Badge Unlock Criteria

| Criteria Type | Example | Use Case |
|---------------|---------|----------|
| **MissionCompleted** | Complete 100 missions | Reward mission engagement |
| **WagerAmount** | Wager $10,000 total | Reward high activity |
| **DepositAmount** | Deposit $5,000 total | Reward deposits |
| **BetCount** | Place 1,000 bets | Reward frequency |
| **TournamentWins** | Win 50 tournaments | Reward skill |
| **LoginStreak** | Login 30 days in a row | Reward consistency |
| **LevelReached** | Reach level 50 | Tie to progression |
| **TierReached** | Reach Gold tier | Tie to VIP status |
| **GamePlayed** | Play Wukong 100 times | Promote specific games |
| **FirstDeposit** | Make first deposit | Welcome new players |

### Badge Rewards

| Reward Type | Description |
|-------------|-------------|
| **None** | Prestige only (badge is the reward) |
| **XP Boost** | Temporary XP multiplier (e.g., 1.5x for 24 hours) |
| **Free Spins** | Spin credits on any or specific games |
| **Cash** | Direct cash/credit bonus |
| **Bonus Template** | Link to existing bonus offer |

### Example Scenario: Badge Collection System

**Situation**: You want to create an achievement system that encourages diverse player behavior.

**Solution**: Create multiple badge series:

**"Slots Master" Collection**:
| Badge | Criteria | Reward |
|-------|----------|--------|
| Slot Beginner | Play 100 slot spins | 10 Free Spins |
| Slot Intermediate | Play 1,000 slot spins | 50 Free Spins |
| Slot Expert | Play 10,000 slot spins | 200 Free Spins |
| Slot Master | Play 100,000 slot spins | $100 Cash + 1.5x XP Boost (48h) |

**"High Roller" Collection**:
| Badge | Criteria | Reward |
|-------|----------|--------|
| Rising Star | Wager $1,000 total | 25 Free Spins |
| Big Spender | Wager $10,000 total | $50 Cash |
| High Roller | Wager $100,000 total | "VIP Package" Bonus |
| Whale | Wager $1,000,000 total | Exclusive Status + Dedicated Manager |

**"Loyalty Legend" Collection**:
| Badge | Criteria | Reward |
|-------|----------|--------|
| First Steps | First Deposit | 50 Free Spins |
| Coming Back | Login 7 days in a row | 2x XP Boost (24h) |
| Dedicated | Login 30 days in a row | $25 Cash |
| Loyalty Legend | Login 365 days total | "Legend" Exclusive Badge + $500 Cash |

**Hidden Badge** (Secret):
| Badge | Criteria | Reward |
|-------|----------|--------|
| Lucky 777 | Win 777 times total | $77.77 Cash + Rare Badge |

**Expected Outcome**: 25% increase in daily logins, 35% increase in cross-game exploration.

---

## Feature 5: Tournaments - Competitive Engagement

### What It Is

Tournaments are competitive events where players compete against each other on leaderboards for prizes. They create excitement, community, and appointment viewing.

### Business Value

- **Community Building**: Players compete and compare with others
- **Appointment Viewing**: Scheduled tournaments drive return visits
- **Increased Wagering**: Competition motivates higher activity
- **Social Buzz**: Leaderboards and winners create shareable moments

### Tournament Types

| Type | Description | Best For |
|------|-------------|----------|
| **Leaderboard** | Ranked by points, wins, or wagering | Ongoing competition |
| **Bracket** | Single/double elimination | Event-style tournaments |
| **Time-Based** | Highest score in time window | Quick engagement |

### Example Scenario: Weekly Slot Tournament

**Situation**: You want to create recurring weekly competition on your slot games.

**Solution**: Create "Friday Night Slot Wars":

**Configuration**:
- Duration: Every Friday 18:00 - 23:59
- Entry: Free (all players eligible)
- Scoring: Total wagering amount on eligible slots
- Eligible Games: wukong, candy-land, olympub, dragon-fortune

**Prize Pool**:
| Position | Prize |
|----------|-------|
| 1st | $500 Cash |
| 2nd | $250 Cash |
| 3rd | $100 Cash |
| 4th-10th | 100 Free Spins each |
| 11th-50th | 25 Free Spins each |

**Tie-Breaking**: First to achieve score wins

**Expected Outcome**: 50% increase in Friday evening wagering, strong community engagement.

---

## Getting Started: Your First Campaign

### Step 1: Define Your Goal

What player behavior do you want to encourage?
- More deposits? → Deposit bonus or deposit-triggered mission
- Try new games? → Game-specific mission with eligible games
- Return daily? → Daily login rewards or login streak badges
- Big wins excitement? → Progressive jackpot
- Long-term loyalty? → Level system with tier benefits

### Step 2: Choose Your Feature

| Goal | Best Feature |
|------|--------------|
| Drive specific actions | Mission |
| Create big-win excitement | Jackpot |
| Build long-term loyalty | Level System |
| Gamify achievements | Badges |
| Create competition | Tournament |
| Reward deposits | Bonus |

### Step 3: Configure and Test

1. Navigate to the appropriate section in Back Office
2. Click "Create New [Mission/Jackpot/etc.]"
3. Fill in the configuration fields
4. Use "Save as Draft" to save progress
5. Preview your campaign to verify settings
6. Click "Publish" when ready to go live

### Step 4: Monitor and Optimize

1. View real-time metrics on the Active Campaigns dashboard
2. Track participation, completion, and ROI
3. Adjust parameters based on performance
4. Use A/B testing to optimize rewards and thresholds

---

## Best Practices

### Missions
- Keep tasks achievable but challenging (70-80% should complete)
- Use multiple tasks to create a journey
- Offer variety: combine betting, depositing, and playing tasks
- Schedule recurring missions for predictable engagement

### Jackpots
- Use multiple tiers to give more winning opportunities
- Time-based triggers create appointment viewing
- Amount-based triggers guarantee excitement thresholds
- Progressive jackpots build over time; fixed jackpots are predictable

### Level System
- Make early levels fast to achieve (hook new players)
- Space out rewards to maintain motivation
- Tier benefits should be meaningful and exclusive
- Consider demotion rules carefully (can frustrate players)

### Badges
- Create collections for thematic grouping
- Mix easy and hard badges
- Use hidden badges for surprise and discovery
- Tie badge rewards to your business goals

### General Tips
- Start small and iterate based on data
- A/B test reward amounts before committing
- Target segments appropriately (VIP vs all players)
- Monitor ROI and adjust spending if needed

---

## Support and Resources

- **In-App Help**: Tooltips on every configuration field
- **Draft Recovery**: Auto-save protects your work
- **Analytics Dashboard**: Real-time campaign performance
- **A/B Testing**: Built-in experimentation framework

For additional support, contact your SabaONE account manager.

---

**Ready to transform your player engagement?**

Log in to the SabaONE Back Office and create your first campaign today.

---

*Document Version: 1.0.0 | Last Updated: 2025-11-30*
