# Pulsyn Lab — Live Competition Platform Strategy

## The Concept

**Pulsyn Lab** is a live, visible, bookable competition platform where data engineers compete in real-time, everything is recorded, and the community watches and votes.

### Key Differentiators

| Feature | Traditional Competition | Pulsyn Lab |
|---|---|---|
| Visibility | Submissions reviewed privately | Everything live and recorded |
| Participation | Submit code/results | Book a lab session, compete live |
| Community | Judges decide | Community votes + objective metrics |
| Transparency | Black box scoring | Real-time metrics dashboard |
| Engagement | Wait for results | Watch competitors work live |

---

## Competition Categories (Strict Acceptance Criteria)

### 1. Most Rows Replicated (40% of score)

**Criteria:**
- Total rows replicated during 1-hour session
- Sustained rows/sec (not burst)
- Data integrity must be 100%
- No pre-loaded data allowed

**Measurement:**
```
Score = (total_rows × 0.4) + (rows_per_sec × 0.3) + (data_integrity × 0.3)
```

**Anti-cheat:**
- Source data randomized per session
- Checksums verified on target
- Pre-loaded data detection (row count before start = 0)
- Network traffic monitoring

### 2. Most Tools Tested (30% of score)

**Criteria:**
- Count unique Pulsyn features used in session
- Each tool must produce working output
- Documentation of each tool usage required

**Tools that count:**
- CLI commands (pipeline, connector, billing, benchmark)
- MCP tools (all 26)
- API endpoints (direct HTTP calls)
- Masking rules (hash, replace, format-preserving, redact)
- Transforms (uppercase, lowercase, custom)
- Filters (equals, not_equals, contains, gt, lt)
- Checkpoint operations (save, restore, list)
- Schema discovery (tables, columns, primary keys)
- Data sampling
- Certification benchmarks

**Measurement:**
```
Score = unique_tools_used × 100
Bonus = (tools_with_output × 50)
```

### 3. Multi-Replication Master (20% of score)

**Criteria:**
- Unique source→target engine pairs completed
- Each pair must complete successfully
- Checkpoint recovery demonstrated for each
- Cross-engine data integrity verified

**Valid engine pairs:**
- PostgreSQL → MySQL
- PostgreSQL → MongoDB
- MySQL → PostgreSQL
- MySQL → Oracle
- Oracle → SQL Server
- SQL Server → Snowflake
- MongoDB → PostgreSQL
- (and all other combinations)

**Measurement:**
```
Score = unique_engine_pairs × 500
Bonus = (checkpoint_recovery_demos × 200)
Bonus = (cross_engine_integrity × 300)
```

### 4. Community Choice (10% of score)

**Criteria:**
- Session must be publicly visible
- Likes and comments counted
- Quality of presentation matters
- Community voting period: 48 hours after session

**Measurement:**
```
Score = (likes × 10) + (substantive_comments × 20)
```

**Anti-gaming:**
- One like per user per session
- Comments must be ≥20 characters
- Bot detection on likes
- Account age requirement (≥7 days)

---

## The Lab Experience

### For Competitors

1. **Book a slot** — Choose a 1-hour time slot
2. **Get environment** — Pulsyn provides Docker container with pre-loaded datasets
3. **Compete live** — Your session is recorded and visible to all viewers
4. **Get feedback** — Real-time metrics, chat comments, community engagement
5. **See results** — Leaderboard updates in real-time
6. **Win prizes** — Top performers win cash prizes

### For Viewers

1. **Browse live sessions** — See who's competing right now
2. **Watch in real-time** — Terminal output, metrics dashboard, timeline
3. **Engage** — Like sessions, leave comments, ask questions
4. **Vote** — Community Choice voting after sessions end
5. **Learn** — Watch top performers, learn techniques
6. **Get inspired** — See what's possible with Pulsyn

### Session Recording

Every session records:
- **Terminal output** — All CLI commands and responses
- **Metrics timeline** — rows/sec, integrity, tools used over time
- **API calls** — Every HTTP request made
- **MCP interactions** — Every MCP tool invocation
- **Chat history** — All viewer comments and likes
- **Final score** — Breakdown by category

---

## Top 10 Live Finals

### Selection Process

1. **Weekly leaderboard** — Top 10 from each week qualify
2. **Combined score** — All categories weighted
3. **Minimum sessions** — Must have completed ≥3 lab sessions
4. **Community engagement** — Must have ≥50 likes across sessions

### Finals Format

| Phase | Duration | Description |
|---|---|---|
| **Setup** | 15 min | Finalists get environment, rules explained |
| **Challenge 1** | 30 min | Speed round — most rows wins |
| **Challenge 2** | 30 min | Tools round — most features used wins |
| **Challenge 3** | 30 min | Multi-engine round — most pairs wins |
| **Community Vote** | 48 hours | Viewers vote for Community Choice |
| **Awards** | 30 min | Live ceremony, prizes distributed |

### Finals Prizes

| Place | Prize | Additional |
|---|---|---|
| 1st (Grand Champion) | $10,000 | Trophy, featured interview, case study |
| 2nd-5th | $1,000 each | Certificate, social media feature |
| 6th-10th | $500 each | Certificate |
| Community Choice | $2,000 | Special trophy |
| Best Newcomer | $500 | First-time competitor award |

---

## Legal Analysis (Enhanced)

### Why This Is NOT Gambling

| Factor | Gambling | Pulsyn Lab |
|---|---|---|
| **Outcome determination** | Chance | Skill (measured metrics) |
| **Entry fee purpose** | Wager | Infrastructure cost |
| **Prize source** | Pool of wagers | Sponsor funding + entry fees |
| **Transparency** | House edge hidden | All metrics public |
| **Skill element** | None/minimal | Dominant factor |
| **Regulation** | Gambling license required | No license needed |

### Legal Precedents Supporting This Structure

1. **UIGEA Exemption (US)** — Skill-based competitions exempt
2. **UK Gambling Act 2005** — Skill competitions exempt when fees cover costs
3. **EU Consumer Rights Directive** — Clear disclosure requirements met
4. **Trade Promotion Laws (AU)** — Permits may be needed for prizes >$A3,000

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| **"Entry fee = wager" claim** | Call it "infrastructure fee". Document actual costs. Show it doesn't fund prizes. |
| **"Skill vs chance" debate** | All outcomes measured objectively. No random elements. |
| **"Under 18" participation** | Age verification at registration. Block minors. |
| **"Bot gaming" of Community Choice** | Account age requirement, bot detection, one vote per user. |
| **"Cheating" accusations** | Full session recording, anti-cheat detection, replay system. |

### Jurisdiction-Specific Notes

| Jurisdiction | Status | Action |
|---|---|---|
| **US (all 50 states)** | ✅ Legal | No action needed |
| **UK** | ✅ Legal | No action needed |
| **EU (most)** | ✅ Legal | Check Italy/Spain for notification |
| **Australia** | ⚠️ Check | Permits needed for prizes >$A3,000 |
| **Canada (Quebec)** | ⚠️ Check | File with Regie or exclude |
| **China** | ❌ Exclude | Complex gaming laws |
| **Japan** | ❌ Exclude | Prize laws require restructuring |
| **South Korea** | ❌ Exclude | Online gaming regulations |

---

## Commercial Model

### Revenue Streams

| Stream | Calculation | Monthly |
|---|---|---|
| **Lab session fees** | 500 sessions × $5 | $2,500 |
| **Sponsorships** | 5 sponsors × $5,000 | $25,000 (one-time) |
| **Post-competition conversions** | 200 users × $499/mo | $99,800 |
| **Enterprise challenges** | 5 companies × $2,000 | $10,000 |
| **Total Year 1** | | $1.2M ARR |

### Cost Structure

| Item | Cost | Notes |
|---|---|---|
| **Prize pool** | $40,000 | Funded by sponsors + entry fees |
| **Infrastructure** | $10,000/month | Cloud compute for lab environments |
| **Legal review** | $5,000 | One-time |
| **Marketing** | $5,000 | Content, community management |
| **Payment processing** | 2.9% + $0.30 | Stripe fees |
| **Total Year 1** | $150,000 | |

### ROI

| Metric | Value |
|---|---|
| **Investment** | $150,000 |
| **Year 1 Revenue** | $1,200,000 |
| **ROI** | 700% |
| **Payback** | 2 months |

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

- [ ] Build lab environment Docker containers
- [ ] Implement session recording system
- [ ] Create real-time metrics dashboard
- [ ] Build booking system
- [ ] Set up payment processing
- [ ] Consult with attorney

### Phase 2: Launch (Weeks 5-8)

- [ ] Soft launch with 50 beta testers
- [ ] Fix bugs, improve UX
- [ ] Secure 2-3 sponsors
- [ ] Build community features (chat, likes, comments)
- [ ] Create marketing materials

### Phase 3: Competition (Weeks 9-16)

- [ ] Open lab sessions to public
- [ ] Run weekly leaderboards
- [ ] Collect community feedback
- [ ] Iterate on scoring formula
- [ ] Prepare for finals

### Phase 4: Finals (Week 17-18)

- [ ] Select top 10 finalists
- [ ] Organize live-streamed event
- [ ] Distribute prizes
- [ ] Publish case studies
- [ ] Plan Season 2

---

## Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| **Lab sessions booked** | 500+ in first month | Booking system |
| **Unique competitors** | 1,000+ | Registration data |
| **Average viewers per session** | 50+ | Analytics |
| **Community engagement** | 10,000+ likes/comments | Engagement tracking |
| **Post-competition signups** | 200+ paying users | Conversion tracking |
| **Media coverage** | 5+ articles/mentions | Media monitoring |
| **Sponsor satisfaction** | 4+ sponsors renew | Sponsor feedback |

---

## Key Takeaways

1. **Visibility is the differentiator** — Everything recorded and live
2. **Strict criteria prevent ambiguity** — Measurable, objective, transparent
3. **Community engagement drives virality** — Likes, comments, voting
4. **Legal structure is sound** — Skill-based, not gambling
5. **Commercial model is proven** — Sponsor + entry fee + conversion
6. **Top 10 finals create excitement** — Live-streamed, high-stakes
7. **Season model sustains engagement** — Repeat competitions, growing community
