# Pulsyn Hero Video — Full Production Script & Storyboard

> **Duration:** 60-75 seconds
> **Style:** Dark theme, terminal-forward, clean animations
> **Music:** Ambient electronic (suggestion: Epidemic Sound "Data Flow" or Artlist "Digital Pulse")
> **Resolution:** 1920x1080 @ 30fps
> **Format:** MP4 (H.264) + WebM fallback

---

## STORYBOARD

### SCENE 1: THE PROBLEM (0:00 — 0:08)

**Visual:** Split screen. Left side shows a dashboard with stale data. Right side shows a ticking clock.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    ┌─────────────────────┐    ┌─────────────────────┐   │
│    │                     │    │                     │   │
│    │   📊 Dashboard      │    │    ⏰ 15:00         │   │
│    │                     │    │                     │   │
│    │   Last synced:      │    │    ⏱️ ticking...    │   │
│    │   15 minutes ago    │    │                     │   │
│    │                     │    │                     │   │
│    │   ⚠️ Stale data     │    │    Your data is     │   │
│    │                     │    │    15 min old       │   │
│    └─────────────────────┘    └─────────────────────┘   │
│                                                         │
│           "Your data is 15 minutes old."                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Audio:** Subtle tension tone

**Text overlay:**
- **Line 1:** "Your data is 15 minutes old." (white, large, center)
- **Line 2:** "Your competitors' isn't." (gray, smaller, below)

**Duration:** 8 seconds

**Assets needed:**
- Dark dashboard mockup (create in Figma or use existing Pulsyn dashboard)
- Clock animation (CSS or After Effects)
- Tension sound effect

---

### SCENE 2: THE SOLUTION — TERMINAL (0:08 — 0:22)

**Visual:** Terminal window with typing animation. Dark background (#0d1117). Commands appear character by character.

```
┌─────────────────────────────────────────────────────────┐
│ ● ● ●  Terminal                                    ─ □ × │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  $ pulsyn pipeline create \                             │
│      --source postgres \                                │
│      --target snowflake \                               │
│      --table "public.orders"                            │
│                                                         │
│  ✓ Pipeline created: pg-to-snowflake                    │
│                                                         │
│  $ pulsyn pipeline start pg-to-snowflake                │
│                                                         │
│  ✓ CDC engine started                                   │
│    ├─ Latency: 0.3s                                     │
│    ├─ Rows/sec: 12,847                                  │
│    ├─ Status: streaming                                 │
│    └─ Masking: email → SHA-256                          │
│                                                         │
│  $ pulsyn status                                        │
│                                                         │
│  Pipeline: pg-to-snowflake                              │
│  ├─ Source: PostgreSQL (orders_db)                      │
│  ├─ Target: Snowflake (analytics)                       │
│  ├─ Rows replicated: 1,247,893                          │
│  ├─ Uptime: 2h 34m                                      │
│  └─ Errors: 0                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Audio:** Subtle typing sounds, positive confirmation chimes

**Text overlay:**
- "3 commands. Real-time replication." (appears at 0:15)

**Duration:** 14 seconds

**Animation details:**
- Characters appear at 30ms intervals (typing effect)
- Green checkmarks appear with a subtle glow
- Stats lines slide in from left

**Assets needed:**
- Terminal font: JetBrains Mono or Fira Code
- Typing animation (After Effects or CSS)
- Sound effects: keyboard clicks, success chimes

---

### SCENE 3: AI SETUP (0:22 — 0:38)

**Visual:** Split screen. Left = AI chat (Claude/Cursor). Right = terminal output.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────────┐    ┌─────────────────────┐    │
│  │ 🤖 Claude           │    │ $ pulsyn pipeline    │    │
│  │                     │    │   create --source    │    │
│  │ User:               │    │   postgres...        │    │
│  │ "Set up PostgreSQL  │    │                     │    │
│  │  to Snowflake       │    │ ✓ Pipeline created   │    │
│  │  pipeline with      │    │                     │    │
│  │  email masking"     │    │ ✓ Masking enabled    │    │
│  │                     │    │   (email → hash)     │    │
│  │ Claude:             │    │                     │    │
│  │ "I'll create that   │    │ ✓ CDC streaming      │    │
│  │  pipeline for you.  │    │   0.3s latency       │    │
│  │  Here's what I'll   │    │                     │    │
│  │  set up:            │    │                     │    │
│  │  • Source: Postgres │    │                     │    │
│  │  • Target: Snowflake│    │                     │    │
│  │  • Masking: email   │    │                     │    │
│  │    → SHA-256        │    │                     │    │
│  │  Shall I proceed?"  │    │                     │    │
│  └─────────────────────┘    └─────────────────────┘    │
│                                                         │
│        "Or let AI do it. First CDC with MCP."           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Audio:** AI notification sounds, subtle digital ambient

**Text overlay:**
- "Or let AI set it up." (appears at 0:22)
- "First CDC platform with MCP integration." (appears at 0:30)

**Duration:** 16 seconds

**Animation details:**
- Chat messages appear with typing animation
- Terminal output syncs with chat messages
- MCP logo appears briefly (0:32 — 0:34)

**Assets needed:**
- Claude chat UI mockup
- MCP logo (from modelcontextprotocol.io)
- Sync animation between chat and terminal

---

### SCENE 4: THE DASHBOARD (0:38 — 0:50)

**Visual:** Full-screen Pulsyn dashboard. Smooth pan across different sections.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Pulsyn Dashboard                                │   │
│  ├─────────────────────────────────────────────────┤   │
│  │                                                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│  │  │ Active: 3│ │ Rows/sec │ │ Latency  │       │   │
│  │  │          │ │  12,847  │ │  0.3s    │       │   │
│  │  └──────────┘ └──────────┘ └──────────┘       │   │
│  │                                                 │   │
│  │  Pipeline: pg-to-snowflake                      │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │ ████████████████████████████████  98%   │   │   │
│  │  │ Source: PostgreSQL → Target: Snowflake   │   │   │
│  │  │ Rows: 1,247,893 | Errors: 0             │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                 │   │
│  │  Security                                       │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │ ✓ All endpoints authenticated            │   │   │
│  │  │ ✓ Rate limiting active                   │   │   │
│  │  │ ✓ IP blocking enabled                    │   │   │
│  │  │ ✓ Audit logging active                   │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│              "Monitor everything. One dashboard."       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Audio:** Smooth ambient, data visualization sounds

**Text overlay:**
- "Monitor everything. One dashboard." (appears at 0:45)

**Duration:** 12 seconds

**Animation details:**
- Dashboard loads with skeleton screens, then populates
- Numbers count up (0 → 12,847 rows/sec)
- Progress bar animates
- Security items check off one by one

**Assets needed:**
- Pulsyn dashboard screenshot or Figma mockup
- Counter animation (After Effects)
- Progress bar animation

---

### SCENE 5: THE COMPARISON (0:50 — 0:60)

**Visual:** Side-by-side comparison. Clean, bold typography.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────────┐    ┌─────────────────────┐    │
│  │                     │    │                     │    │
│  │    FIVETRAN         │    │    PULSYN           │    │
│  │                     │    │                     │    │
│  │  ⏱️ 15 min delay    │    │  ⚡ 0.3s delay      │    │
│  │                     │    │                     │    │
│  │  💰 $895/mo         │    │  💎 $300/mo         │    │
│  │                     │    │                     │    │
│  │  📦 Batch only      │    │  🔄 Real-time       │    │
│  │                     │    │                     │    │
│  │  🔒 No CLI/API      │    │  🤖 MCP + CLI + API │    │
│  │                     │    │                     │    │
│  └─────────────────────┘    └─────────────────────┘    │
│                                                         │
│         "Same data. 50x faster. 66% cheaper."          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Audio:** Dramatic reveal sound, confidence tone

**Text overlay:**
- "Same data. 50x faster. 66% cheaper." (bold, center)

**Duration:** 10 seconds

**Animation details:**
- Left side appears first (grayed out, slightly transparent)
- Right side slides in from right with glow effect
- Stats appear with number counter animation
- Final comparison text fades in

**Assets needed:**
- Comparison layout (After Effects or CSS)
- Number counter animation
- Glow/highlight effects

---

### SCENE 6: CONNECTOR SHOWCASE (0:60 — 0:67)

**Visual:** Grid of database icons flowing into a central Pulsyn logo.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                   │
│  │ PG │ │MySQL│ │Mongo│ │Snow│ │ BQ │                   │
│  └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘                   │
│     │      │      │      │      │                      │
│     └──────┴──────┴──┬───┴──────┘                      │
│                      │                                 │
│                  ┌───┴───┐                             │
│                  │ ⚡    │                             │
│                  │PULSYN │                             │
│                  └───┬───┘                             │
│                      │                                 │
│     ┌────────────────┼────────────────┐                │
│     │                │                │                │
│  ┌──┴──┐ ┌──────────┴──┐ ┌──────────┴──┐             │
│  │Snow │ │   API       │ │   CLI       │             │
│  │flake│ │   31 tools  │ │   35 cmds   │             │
│  └─────┘ └─────────────┘ └─────────────┘             │
│                                                         │
│           "PostgreSQL & MySQL today. More coming."     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Audio:** Connection/data flow sounds

**Text overlay:**
- "PostgreSQL & MySQL today. More coming." (appears at 0:64)

**Duration:** 7 seconds

**Animation details:**
- Database icons appear one by one
- Lines draw from icons to center Pulsyn logo
- Output connectors appear below
- Text fades in at end

**Assets needed:**
- Database icons (SVG)
- Pulsyn logo (SVG)
- Line drawing animation (After Effects)

---

### SCENE 7: CTA (0:67 — 0:75)

**Visual:** Clean dark background with Pulsyn logo and CTA.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                                                         │
│                    ┌─────────────┐                      │
│                    │      ⚡     │                      │
│                    │   PULSYN   │                      │
│                    └─────────────┘                      │
│                                                         │
│              "Start free at pulsyn.io"                  │
│                                                         │
│           ┌─────────────────────────────┐              │
│           │      Start Free →           │              │
│           └─────────────────────────────┘              │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Audio:** Uplifting resolution tone

**Text overlay:**
- "Start free at pulsyn.io" (large, center)
- "No credit card required" (small, below)

**Duration:** 8 seconds

**Animation details:**
- Logo appears with subtle glow
- CTA button pulses gently
- URL appears with typing effect

**Assets needed:**
- Pulsyn logo animation
- Button pulse animation
- Sound effect: resolution/chime

---

## FULL AUDIO TIMELINE

| Timestamp | Sound | Source |
|-----------|-------|--------|
| 0:00-0:08 | Tension ambient | Epidemic Sound |
| 0:08-0:22 | Keyboard typing + success chimes | Freesound.org |
| 0:22-0:38 | AI notification + digital ambient | Artlist |
| 0:38-0:50 | Smooth data ambient | Epidemic Sound |
| 0:50-0:60 | Dramatic reveal | Artlist |
| 0:60-0:67 | Connection/data flow | Freesound.org |
| 0:67-0:75 | Uplifting resolution | Epidemic Sound |

---

## PRODUCTION CHECKLIST

### Pre-Production
- [ ] Set up local Pulsyn with test databases (Docker)
- [ ] Create test data (10K+ rows in source table)
- [ ] Prepare terminal environment (clean, dark theme)
- [ ] Mock up dashboard screenshots
- [ ] Record AI chat demo (Claude + MCP)
- [ ] Write all text overlays

### Production
- [ ] Record terminal scenes (OBS or asciinema)
- [ ] Record dashboard walkthrough (screen capture)
- [ ] Record AI chat demo (screen capture)
- [ ] Capture all text overlays as separate assets

### Post-Production
- [ ] Edit in DaVinci Resolve (free) or After Effects
- [ ] Add text overlays and transitions
- [ ] Sync audio with visuals
- [ ] Color grade (dark theme, cyan accents)
- [ ] Export: MP4 (1080p, H.264) + WebM
- [ ] Create thumbnail (1280x720)

### Distribution
- [ ] Upload to YouTube (unlisted) for embedding
- [ ] Add to landing page hero section
- [ ] Create 15s version for social media
- [ ] Create GIF version for README

---

## RECORDING COMMANDS

```bash
# Terminal recording with asciinema
asciinema rec demo.cast \
  --command "pulsyn pipeline create --source postgres --target snowflake" \
  --title "Pulsyn CDC Demo" \
  --theme monokai

# Screen recording (macOS)
screencapture -v -g "$(osascript -e 'tell app "Terminal" to get id of window 1')" demo.mp4

# Screen recording (Windows)
# Use OBS Studio with window capture

# Concatenate clips with ffmpeg
ffmpeg \
  -i scene1.mp4 -i scene2.mp4 -i scene3.mp4 \
  -i scene4.mp4 -i scene5.mp4 -i scene6.mp4 -i scene7.mp4 \
  -filter_complex "[0:v][1:v][2:v][3:v][4:v][5:v][6:v]concat=n=7:v=1:a=0" \
  -c:v libx264 -crf 23 -preset medium \
  output.mp4

# Add background music
ffmpeg -i output.mp4 -i music.mp3 \
  -filter_complex "[1:a]volume=0.3[music];[0:a][music]amix=inputs=2" \
  -c:v copy final.mp4

# Create 15s social media version
ffmpeg -i final.mp4 -ss 0 -t 15 -c:v libx264 -crf 23 social.mp4

# Create GIF for README
ffmpeg -i final.mp4 -vf "fps=10,scale=640:-1:flags=lanczos" \
  -c:v gif output.gif
```

---

## ASSET REQUIREMENTS

| Asset | Format | Size | Source |
|-------|--------|------|--------|
| Pulsyn logo | SVG + PNG | 512x512 | Existing |
| Database icons | SVG | 64x64 | Create or use Simple Icons |
| Terminal font | TTF | — | JetBrains Mono (free) |
| Background music | MP3 | — | Epidemic Sound or Artlist |
| Sound effects | WAV | — | Freesound.org (CC0) |
| Dashboard mockup | PNG | 1920x1080 | Screenshot or Figma |
| MCP logo | SVG | 128x128 | modelcontextprotocol.io |

---

**Save this file as:** `docs/launch/HERO_VIDEO_FULL_SCRIPT.md`
**Give to Kiro:** Use Scene 1-7 descriptions for asset creation
**Record:** Follow the Production Checklist
