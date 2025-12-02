# SabaONE Risk Controls Guide for Operators

**Version:** 1.0.0
**Created:** 2025-12-02
**Audience:** Casino Operators, Risk Managers, Compliance Officers, Marketing Teams

---

## Overview

Risk controls are essential safeguards that protect your casino from financial losses, fraud, and abuse when running gamification campaigns. This guide explains the risk control features available in SabaONE and provides best practices for configuring them.

**Why Risk Controls Matter:**
- **Financial Protection**: Prevent runaway costs from misconfigured campaigns
- **Fraud Prevention**: Block bonus abuse, multi-accounting, and exploitation
- **Regulatory Compliance**: Meet responsible gambling requirements
- **Sustainable Growth**: Ensure promotions drive profit, not losses

---

## Risk Control Categories

| Category | Purpose | Applies To |
|----------|---------|------------|
| **Spending Limits** | Cap total reward costs | All campaigns |
| **Participation Limits** | Control who can participate | Missions, Tournaments, Bonuses |
| **Claim Limits** | Restrict reward frequency | Bonuses, Missions |
| **Velocity Controls** | Detect abnormal behavior | All campaigns |
| **Eligibility Rules** | Filter qualified players | All campaigns |
| **Abuse Detection** | Flag suspicious activity | All campaigns |

---

## 1. Spending Limits

### Global Budget Controls

Set organization-wide spending caps to prevent excessive reward distribution.

| Control | Description | Recommended Setting |
|---------|-------------|---------------------|
| **Monthly Budget** | Maximum total rewards per month | Based on revenue (5-15% of GGR) |
| **Weekly Budget** | Maximum total rewards per week | Monthly budget / 4 |
| **Daily Budget** | Maximum total rewards per day | Weekly budget / 7 |

**Warning Thresholds:**
- **80%** - Warning notification to marketing team
- **90%** - Critical alert to management
- **100%** - Over-budget warning on all new campaigns

**Configuration Example:**
```
Monthly Budget: $50,000
Weekly Budget: $12,500
Daily Budget: $1,800

Alerts: marketing@casino.com, risk@casino.com
```

### Campaign-Level Budgets

Set individual caps per campaign to isolate risk.

| Control | Description | Use Case |
|---------|-------------|----------|
| **Total Campaign Budget** | Maximum rewards for entire campaign | Limit exposure on new campaigns |
| **Daily Campaign Cap** | Maximum rewards per day | Prevent single-day spikes |
| **Per-Player Cap** | Maximum rewards per player | Prevent single-player abuse |

**Example: Mission Campaign Budget**
```
Campaign: "Weekend Warrior"
Total Budget: $5,000
Daily Cap: $1,000
Per-Player Cap: $100
Action at Cap: Pause campaign (or continue without rewards)
```

### Jackpot-Specific Controls

| Control | Description | Recommended Setting |
|---------|-------------|---------------------|
| **Max Jackpot Value** | Cap per tier to prevent runaway growth | 10-50x seed amount |
| **Seed Amount** | Initial value after reset | Based on expected trigger frequency |
| **Contribution Rate** | % of bets added to jackpot | 0.01% - 1% of wager |

**Risk Calculation for Progressive Jackpots:**
```
Expected Daily Growth = (Daily Wagering Volume) x (Contribution Rate)
Days to Max Value = (Max Value - Seed) / Expected Daily Growth

Example:
Daily Wagering: $100,000
Contribution Rate: 0.1%
Seed: $1,000
Max Value: $10,000

Daily Growth: $100,000 x 0.1% = $100/day
Days to Max: ($10,000 - $1,000) / $100 = 90 days
```

---

## 2. Participation Limits

### Player Eligibility Filters

Restrict campaign access to qualified players only.

| Filter | Description | Risk Mitigation |
|--------|-------------|-----------------|
| **Account Age** | Minimum days since registration | Blocks new fraud accounts |
| **Verified Account** | Require KYC completion | Prevents multi-accounting |
| **Deposit History** | Minimum total deposits | Ensures real players |
| **Activity Level** | Minimum bets/logins | Filters inactive accounts |
| **Tier/Level** | VIP status requirement | Targets valuable players |
| **Country Exclusion** | Block specific regions | Regulatory compliance |

**Recommended Minimum Settings:**
```
New Player Campaigns:
  Account Age: 0 days (welcome offers)
  Verification: Email verified
  Deposit: None required

Standard Campaigns:
  Account Age: 7+ days
  Verification: KYC complete
  Deposit: $20+ lifetime deposits

VIP Campaigns:
  Account Age: 30+ days
  Verification: KYC complete
  Deposit: $500+ lifetime deposits
  Tier: Silver or above
```

### Participation Caps

Limit how many players can join a campaign.

| Control | Description | Use Case |
|---------|-------------|----------|
| **Max Participants** | Total player cap | Limited-time exclusive offers |
| **Max Per Segment** | Cap per player segment | Balance across tiers |
| **First-Come Limit** | Only first N players | Flash promotions |
| **Concurrent Limit** | Max active at same time | Tournament capacity |

**Example: Limited Tournament**
```
Tournament: "VIP Exclusive Showdown"
Max Participants: 100
Segment: VIP Only
Entry: First-come, first-served
Waitlist: Enabled
```

---

## 3. Claim Limits

### Frequency Controls

Prevent players from claiming rewards too often.

| Control | Description | Recommended Setting |
|---------|-------------|---------------------|
| **Claims Per Day** | Max claims in 24 hours | 1-3 per player |
| **Claims Per Week** | Max claims in 7 days | 3-7 per player |
| **Claims Per Month** | Max claims in 30 days | 10-20 per player |
| **Cooldown Period** | Wait time between claims | 24-72 hours |
| **Lifetime Claims** | Total claims ever | Based on bonus type |

**Example: Deposit Bonus Limits**
```
Bonus: "100% Deposit Match"
Claims Per Day: 1
Claims Per Week: 3
Claims Per Month: 5
Cooldown: 24 hours
Lifetime: 20 claims
```

### Mission Completion Limits

| Control | Description | Use Case |
|---------|-------------|----------|
| **Completions Per Period** | Max times player can complete mission | Recurring missions |
| **Completion Cooldown** | Wait time before replay | Daily/weekly missions |
| **One-Time Only** | Single completion ever | Achievement missions |

**Example: Recurring Mission**
```
Mission: "Daily Spin Challenge"
Completions Per Day: 1
Completions Per Week: 7
Reset: Daily at 00:00 UTC
```

---

## 4. Velocity Controls

### Abnormal Behavior Detection

Flag players exhibiting suspicious patterns.

| Pattern | Detection Rule | Action |
|---------|----------------|--------|
| **Rapid Completions** | Mission completed in < 1 minute | Flag for review |
| **Perfect Timing** | Claims at exact intervals | Flag for bot detection |
| **Unusual Win Rate** | Win rate > 3 standard deviations | Investigate |
| **Deposit Cycling** | Deposit → Claim → Withdraw pattern | Block bonus |
| **Multi-Device** | Same campaign from multiple devices | Verify identity |
| **Geo Mismatch** | IP location doesn't match profile | Review account |

**Velocity Thresholds:**
```
Missions:
  Max Tasks/Hour: 20 (flag if exceeded)
  Min Time to Complete: 30 seconds per task

Bonuses:
  Max Claims/Hour: 2 (hard block if exceeded)
  Deposit-to-Withdrawal Time: Minimum 24 hours

Tournaments:
  Score Increase Rate: Flag if > 200% of average
  Bets Per Minute: Max 60 (flag automated play)
```

### Response Actions

| Severity | Condition | Action |
|----------|-----------|--------|
| **Low** | Minor anomaly | Log and monitor |
| **Medium** | Suspicious pattern | Pause rewards, notify risk team |
| **High** | Confirmed abuse | Block account, void rewards |
| **Critical** | Organized fraud | Block IP range, report to authorities |

---

## 5. Bonus-Specific Risk Controls

### Wagering Requirements

Ensure players play through bonuses before withdrawing.

| Control | Description | Recommended Range |
|---------|-------------|-------------------|
| **Wagering Multiplier** | Times bonus must be wagered | 20x - 40x |
| **Applies To** | Bonus only vs Deposit + Bonus | Bonus only (lower risk) |
| **Max Bet While Wagering** | Largest allowed bet | $5 - $25 |
| **Game Contributions** | % of bet counting toward wagering | Slots: 100%, Table: 10-20% |
| **Time Limit** | Days to complete wagering | 7-30 days |
| **Max Cashout** | Maximum withdrawal from bonus | 5x - 10x bonus amount |

**Example: Deposit Match Bonus**
```
Bonus: "100% Match up to $200"
Wagering: 30x bonus amount
Applies To: Bonus only
Max Bet: $10
Game Contributions:
  - Slots: 100%
  - Table Games: 10%
  - Live Casino: 10%
  - Excluded: Blackjack, Roulette
Time Limit: 14 days
Max Cashout: $1,000 (5x bonus)
```

### Free Spins Controls

| Control | Description | Recommended Setting |
|---------|-------------|---------------------|
| **Spin Value** | Value per free spin | $0.10 - $1.00 |
| **Winnings Cap** | Max winnings from spins | $50 - $500 |
| **Winnings Destination** | Real balance vs Locked | Locked (with wagering) |
| **Eligible Games** | Which games for free spins | Specific low-volatility slots |
| **Expiry** | Time to use spins | 24-72 hours |

**Example: Free Spins Offer**
```
Offer: "50 Free Spins on Dragon's Fortune"
Spin Value: $0.20
Total Value: $10
Max Winnings: $100
Winnings: Locked until 5x wagering complete
Eligible Games: dragon-fortune only
Expiry: 48 hours
```

### Cashback Controls

| Control | Description | Recommended Setting |
|---------|-------------|---------------------|
| **Cashback %** | Percentage of losses returned | 5% - 20% |
| **Minimum Loss** | Loss threshold to qualify | $50 - $100 |
| **Maximum Cashback** | Cap per period | $100 - $1,000 |
| **Calculation Period** | Daily, weekly, monthly | Weekly |
| **Wagering on Cashback** | Requirement before withdrawal | 1x - 5x |

**Example: VIP Cashback**
```
Tier: Gold
Cashback: 10% of weekly net losses
Minimum Loss: $100
Maximum Cashback: $500/week
Wagering: 1x cashback amount
Credit: Every Monday 08:00 UTC
```

---

## 6. Mission-Specific Risk Controls

### Task Validation Rules

Ensure tasks are completed legitimately.

| Control | Description | Use Case |
|---------|-------------|----------|
| **Minimum Bet Amount** | Bets below threshold don't count | Prevent minimal stake abuse |
| **Maximum Bet Amount** | Cap bets that count | Prevent whale distortion |
| **Time Between Bets** | Minimum seconds between qualifying bets | Block scripted play |
| **Unique Sessions** | Require different game sessions | Prevent quick cycling |
| **Real Money Only** | Exclude bonus/free play bets | Ensure actual risk |

**Example: High-Value Mission**
```
Mission: "High Roller Challenge"
Task: Place 10 bets of $100+

Validation Rules:
  Minimum Bet: $100
  Maximum Bet: $1,000 (bets above count as $1,000)
  Time Between Bets: 30 seconds minimum
  Real Money Only: Yes
  Bonus Bets: Do not count
```

### XP Earning Limits

Prevent XP farming and abuse.

| Control | Description | Recommended Setting |
|---------|-------------|---------------------|
| **Daily XP Cap** | Maximum XP earnable per day | 1,000 - 5,000 XP |
| **XP Per Action Cap** | Maximum XP per single action | 100 - 500 XP |
| **Minimum Wager for XP** | Bet threshold to earn XP | $1 - $10 |
| **XP Cooldown** | Time between XP grants | 1-5 seconds |

**Example: Level System XP Limits**
```
XP Rules:
  Wagering: 1 XP per $10
    Daily Cap: 1,000 XP
    Minimum Bet: $1

  Deposits: 5 XP per $10
    Daily Cap: None
    Minimum Deposit: $20

  Daily Login: 10 XP
    Daily Cap: 10 XP (one per day)

  Tournament Win: 200 XP
    Daily Cap: 1,000 XP (5 wins)
```

---

## 7. Tournament-Specific Risk Controls

### Entry Controls

| Control | Description | Use Case |
|---------|-------------|----------|
| **Entry Fee** | Cost to participate | Filter serious players |
| **Buy-in Limit** | Max re-buys allowed | Cap player investment |
| **Account Requirements** | Eligibility criteria | Quality assurance |
| **Previous Performance** | Win rate threshold | Fraud prevention |

### Scoring Controls

| Control | Description | Use Case |
|---------|-------------|----------|
| **Minimum Bet for Points** | Bets below don't score | Prevent low-stakes gaming |
| **Maximum Bet for Points** | Cap scoring per bet | Level playing field |
| **Score Multiplier Cap** | Max score per action | Prevent outlier wins |
| **Bonus Play Exclusion** | Bonus bets don't score | Ensure fair competition |

**Example: Fair Tournament Setup**
```
Tournament: "Weekly Slot Championship"
Entry: Free
Re-buys: Not applicable

Scoring:
  Method: Total Wagering
  Minimum Bet: $1 (bets below don't count)
  Maximum Bet: $100 (counts as $100 max)
  Bonus Bets: Excluded

Anti-Fraud:
  Max Score Per Minute: 500 points
  Unusual Activity: Auto-flag and review
```

---

## 8. Jackpot-Specific Risk Controls

### Trigger Probability Management

| Jackpot Type | Recommended Trigger Range | Risk Level |
|--------------|---------------------------|------------|
| **Mini** | 1 in 1,000 - 1 in 10,000 | Low |
| **Minor** | 1 in 10,000 - 1 in 100,000 | Low-Medium |
| **Major** | 1 in 100,000 - 1 in 1,000,000 | Medium |
| **Grand** | 1 in 1,000,000 - 1 in 10,000,000 | High |

### Must-Drop Risk Management

| Trigger Type | Risk | Mitigation |
|--------------|------|------------|
| **Time-Based** | Predictable, can be gamed | Randomize within window |
| **Amount-Based** | Players wait for threshold | Set reasonable cap |
| **Random** | Lowest risk | Verify RNG integrity |

**Example: Balanced Jackpot Setup**
```
Jackpot: "Fortune's Favor"
Type: Progressive

Tiers:
  Mini:
    Seed: $25
    Max: $250
    Trigger: Random (1 in 5,000)
    Expected Hits: 20/day

  Minor:
    Seed: $100
    Max: $1,000
    Trigger: Random (1 in 50,000)
    Expected Hits: 2/day

  Major:
    Seed: $500
    Max: $5,000
    Trigger: Random (1 in 500,000)
    Expected Hits: 1/week

  Grand:
    Seed: $2,000
    Max: $20,000
    Trigger: Amount-Based ($20,000)
    Expected Hits: 1/month

Risk Budget: $2,000/day average
```

---

## 9. Anti-Fraud Controls

### Multi-Account Detection

| Signal | Detection Method | Response |
|--------|------------------|----------|
| **Same Device** | Device fingerprint match | Block second account |
| **Same IP** | IP address match | Flag for review |
| **Same Payment** | Payment method match | Block bonus claims |
| **Similar Patterns** | Behavioral analysis | Investigate |
| **Referral Abuse** | Self-referral detection | Void referral bonus |

### Bonus Abuse Prevention

| Abuse Type | Detection | Prevention |
|------------|-----------|------------|
| **Bonus Hunting** | Only claims bonuses, no real play | Require play history |
| **Arbitrage** | Exploits bonus math | Proper wagering requirements |
| **Collusion** | Coordinated play in tournaments | Pattern detection |
| **Bot Play** | Automated betting | CAPTCHA, velocity limits |
| **Chip Dumping** | Transferring funds via game | Monitor peer-to-peer games |

**Recommended Anti-Fraud Settings:**
```
Account Verification:
  Email: Required for all bonuses
  Phone: Required for bonuses > $50
  KYC: Required for withdrawals > $100

Device Limits:
  Max Accounts Per Device: 1
  Max Accounts Per IP: 2 (same household)
  Max Accounts Per Payment Method: 1

Behavioral:
  Min Real Play Before Bonus: 10 bets
  Min Account Age for Major Bonus: 7 days
  Win Verification: Manual review > $1,000
```

---

## 10. Responsible Gambling Controls

### Player Protection Limits

| Control | Description | Regulatory Requirement |
|---------|-------------|------------------------|
| **Deposit Limits** | Max deposits per day/week/month | Many jurisdictions |
| **Loss Limits** | Max losses per period | Some jurisdictions |
| **Session Limits** | Max play time per session | Some jurisdictions |
| **Reality Checks** | Periodic play-time notifications | Most jurisdictions |
| **Self-Exclusion** | Voluntary account suspension | All jurisdictions |

### Campaign Restrictions for At-Risk Players

| Player Status | Campaign Access | Recommendation |
|---------------|-----------------|----------------|
| **Self-Excluded** | No campaigns | Mandatory |
| **Cooling Off** | No campaigns | Mandatory |
| **Deposit Limited** | No deposit bonuses | Recommended |
| **Loss Limited** | Reduced campaign access | Recommended |
| **Reality Check Active** | Continue with warnings | Optional |

**Responsible Gambling Configuration:**
```
Self-Excluded Players:
  - Block all campaign participation
  - Block all marketing communications
  - Remove from segment targeting

Deposit-Limited Players:
  - Block deposit bonus campaigns
  - Allow free-to-enter tournaments
  - Allow badge/achievement campaigns

High-Risk Indicators:
  - Chasing losses (increasing bets after losses)
  - Extended sessions (> 4 hours)
  - Rapid deposit increases

Action: Reduce promotional contact, show RG resources
```

---

## 11. Risk Control Checklist

Use this checklist when creating any new campaign:

### Pre-Launch Checklist

**Budget Controls:**
- [ ] Total campaign budget set
- [ ] Daily/weekly caps configured
- [ ] Per-player caps defined
- [ ] Alert recipients assigned

**Eligibility Controls:**
- [ ] Account age requirement set
- [ ] Verification level defined
- [ ] Deposit history threshold set
- [ ] Geographic restrictions applied
- [ ] Excluded player segments defined

**Claim Controls:**
- [ ] Frequency limits configured
- [ ] Cooldown periods set
- [ ] Lifetime limits defined (if applicable)

**Anti-Abuse Controls:**
- [ ] Minimum bet thresholds set
- [ ] Velocity limits configured
- [ ] Multi-account detection enabled
- [ ] Wagering requirements defined (bonuses)

**Responsible Gambling:**
- [ ] Self-excluded players blocked
- [ ] At-risk player restrictions applied
- [ ] RG messaging included where required

### Post-Launch Monitoring

**Daily Review:**
- [ ] Participation vs expectations
- [ ] Spend vs budget
- [ ] Unusual activity flags
- [ ] Player complaints

**Weekly Review:**
- [ ] ROI analysis
- [ ] Fraud detection reports
- [ ] Velocity alert summary
- [ ] Budget utilization

---

## 12. Risk Scenarios and Responses

### Scenario 1: Budget Exceeded

**Situation:** Campaign spending reaches 100% of budget mid-day.

**Immediate Actions:**
1. Review if legitimate (high participation) or abuse
2. If legitimate: Consider budget increase or let complete naturally
3. If abuse: Pause campaign, investigate flagged accounts

**Prevention:**
- Set conservative initial budgets
- Enable daily caps
- Configure alerts at 80% and 90%

### Scenario 2: Suspected Multi-Accounting

**Situation:** Multiple accounts claiming same bonus from similar IPs.

**Immediate Actions:**
1. Flag all suspected accounts
2. Pause bonus claims pending review
3. Compare device fingerprints, payment methods
4. If confirmed: Void bonuses, warn/ban accounts

**Prevention:**
- Require KYC for significant bonuses
- Implement device fingerprinting
- Limit accounts per payment method

### Scenario 3: Jackpot Not Triggering

**Situation:** Progressive jackpot reaches maximum value without trigger.

**Immediate Actions:**
1. Verify trigger mechanism working correctly
2. If amount-based: Should trigger at max value
3. If probability-based: Review RNG, may need manual drop

**Prevention:**
- Set reasonable max values
- Use amount-based triggers as backstop
- Monitor jackpot growth rate

### Scenario 4: Tournament Collusion

**Situation:** Suspicious score patterns suggest coordinated play.

**Immediate Actions:**
1. Review flagged player accounts
2. Compare play patterns, timing, devices
3. If confirmed: Disqualify players, redistribute prizes
4. Document for future detection improvement

**Prevention:**
- Implement score velocity limits
- Flag statistical anomalies
- Review top-10 finishers manually

---

## Summary: Risk Control Best Practices

1. **Start Conservative**: Set lower limits initially, increase based on data
2. **Layer Controls**: Use multiple overlapping controls (no single point of failure)
3. **Monitor Continuously**: Review dashboards daily during active campaigns
4. **React Quickly**: Pause suspicious campaigns immediately, investigate later
5. **Document Everything**: Keep records for compliance and pattern detection
6. **Learn and Adapt**: Update controls based on observed abuse patterns
7. **Balance UX and Security**: Don't make legitimate play frustrating

---

## Support

For risk control configuration assistance or fraud investigation support, contact:
- **Risk Team:** risk@sabaone.com
- **Compliance:** compliance@sabaone.com
- **Technical Support:** support@sabaone.com

---

*Document Version: 1.0.0 | Last Updated: 2025-12-02*
