# Engineering Wiki: Next-Gen 32-Bit Retro Football Simulation

> **Quick AI Onboarding Guide**: This document is the single-source architectural reference for the entire codebase. When working on any phase or bugfix, read this file to understand system contracts, directory maps, coordinate geometry, rendering pipelines, and performance budgets without scanning thousands of lines of historical logs.

---

## 1. Game Identity & Core Principles

| Pillar | Technical Implementation |
| :--- | :--- |
| **Genre & Aesthetic** | Retro 11v11 arcade-simulation football game inspired by 90s/early-2000s classics (Sensible Soccer, Kick Off, ISS Pro/PES, Virtua Striker) rendered in pure 32-bit pixel art style on HTML5 Canvas 2D. |
| **Performance SLA** | **Locked 60 FPS on budget ($50) smartphones** and low-end Chromebooks. Zero memory allocations (`new Array`, `new Object`) inside per-frame `update()` and `render()` loops. Pre-allocated vector and particle pools. |
| **Controls Multiplexer** | Seamless tri-input system: **Gamepad** (XInput / DirectInput via Gamepad API), **Keyboard** (WASD / Arrow Keys + Action keys), and **Touchpad/Touch** (zero-latency floating virtual stick + touch action buttons). |
| **Zero-Scroll UI** | **Console-grade single-screen viewport discipline**. Modals, HUDs, team selectors, and tactical boards strictly fit `100vw × 100vh` without page scrolling. |
| **Authentic Realism** | Zero arcade magic or forcefields. Physical ball shielding via body leverage, planted studs, inertia, and center of gravity. |
| **Copyright Protection** | Strictly generic, evocative architectural and club naming (e.g., *Parametric Metallic Louvers*, *Monolithic Titanium Dome*). Never use real-world copyrighted club/stadium names in UI or game strings. |
| **Token Budget Calibration** | Strictly **1 Phase = 1 Day of Google AI Studio tokens** (~700k–850k tokens). Every turn must yield a 100% playable, zero-regression build. |

---

## 2. Codebase Map & Directory Architecture

```
/
├── Development Roadmap.md         # Active pending roadmap phases ONLY
├── WIKI.md                        # Architectural reference & historical summary (this file)
├── src/
│   ├── types/
│   │   ├── stadium.ts             # Stadium definitions, 4 shapes, 8 stands, tier metrics, grounds & roofs
│   │   ├── player.ts              # 18 outfield stats, 7 GK stats, 4 tiers, appearance contract
│   │   ├── team.ts                # Club & national team schemas, tactics, formations
│   │   └── kit.ts                 # Modular uniforms (shirts, shorts, socks) with anti-clash engine
│   ├── game/
│   │   ├── engine.ts              # Core match state machine (kickoff, foul, setpiece, goal, celebration)
│   │   ├── physics.ts             # 2.5D ball trajectories, player collisions, momentum, tackling
│   │   ├── ballPhysics.ts         # Ball aerodynamics, turf drag, bounce restitution, swerve/curl
│   │   ├── pitchDimensions.ts     # IFAB pitch dimensions (compact, standard, expansive)
│   │   ├── pitchBoundary.ts       # Dynamic boundary raycasting (throw-in, goal kick, corner attribution)
│   │   ├── pitchRenderer.ts       # Canvas 2D pitch markings, penalty boxes, lawn mowing patterns
│   │   ├── stadiumRenderer.ts     # Grounds trapezoid, 8 stands, corner miters, facades, floodlights
│   │   ├── environmentRenderer.ts # Concourse grounds, panoramic horizons, time-of-day lighting
│   │   ├── skyCamRenderer.ts      # 360° circular fisheye macroscopic overhead projection
│   │   ├── ai.ts & tactics.ts     # Formations, 2-man pressing traps, off-ball runs, offside line
│   │   ├── linesman.ts            # Dual-touchline linesman with Law 6/11 offside animation
│   │   ├── videoRef.ts            # 32-bit CRT VideoRef (VIR) review cutscenes
│   │   ├── animationEngine.ts     # Procedural sprite animation state machine
│   │   ├── arcadeSprites.ts       # 32-bit pixel art sprite rendering
│   │   ├── controllerConfig.ts    # Gamepad & keyboard binding multiplexer
│   │   ├── graphicsConfig.ts      # Graphics quality tiers & retro post-processing (CRT, VHS)
│   │   ├── weatherEngine.ts       # Rain, snow, puddles, wind drift, nocturnal floodlight cones
│   │   ├── audio.ts               # Web Audio procedural sound effects (crowd roar, ball kick, whistle)
│   │   └── stadiumRegistry.ts     # Built-in and custom user stadiums database
│   ├── components/
│   │   ├── PitchCanvas.tsx        # Main Canvas 2D viewport & HUD orchestrator
│   │   ├── MainMenuModal.tsx      # Arcade start menu & navigation hub
│   │   ├── MatchHUD.tsx           # Scoreboard, match clock, radar minimap, stamina meters
│   │   ├── TacticalGamePlanModal  # Drag-and-drop squad formation, roles, and bench subs
│   │   ├── StadiumCreatorModal    # 6-step WYSIWYG stadium builder with live 2D preview
│   │   ├── StadiumSelectorModal   # Venue selector with macroscopic skyview porthole
│   │   ├── TeamSelectorModal      # Multi-tier drill-down team selection (Clubs, National, Legends)
│   │   ├── TeamEditorModal        # Club customizer (kits, home venue, player rosters)
│   │   ├── ModularKitMixer.tsx    # Live uniform assembly (shirt, shorts, socks)
│   │   └── TouchControls.tsx      # Low-latency virtual analog stick & action buttons for mobile
│   └── __tests__/                 # Comprehensive Vitest regression test suite
```

---

## 3. Subsystem Architecture & Core Contracts

### 3.1 Vertical Spatial & Render Layer Hierarchy
The entire rendering pipeline is strictly sorted from farthest background to nearest foreground:
$$\text{bgTop} < \text{horizonBaseY} < \text{northConcourseTop} < \text{northOuterY} < \text{pitchTop} < \text{pitchCenter} < \text{pitchBottom} < \text{southOuterY} < \text{southConcourseBottom}$$

- **Horizon & Skyline**: Always anchored to `horizonBaseY`. Grounds top is anchored strictly to `northConcourseTop` (112px depth), ensuring the panoramic skyline is never occluded by the stadium.
- **Pitch Cartesian Center**: Planar 105m × 68m IFAB field centered at $(0, 0)$. Pitch coordinate space is **100% planar, orthogonal, and invariant** to protect physics accuracy.
- **Perspective Trapezoid Grounds**: The concourse surrounds the stadium in a 1-point high-oblique trapezoid:
  - Narrow top (north): `topLeftX = westOuterX - 160`, `topRightX = eastOuterX + 160`.
  - Expanded base (south): `bottomLeftX = westOuterX - 380`, `bottomRightX = eastOuterX + 380`.
  - Southern forecourt depth: `southConcourseBottom = southOuterY + 390px`.

### 3.2 Stadium Architecture & Dynamic Stand Scaling
- **4 Canonical Footprint Profiles**: `rectangular`, `square`, `round`, `oval`.
- **8 Independent Stands**: North, East, South, West + 4 Corner Quadrants (NW, NE, SW, SE).
- **Dynamic Stand Depth Scaling (`calculateDynamicStandDepth`)**:
  - `none` / `no_stand`: **0px** (barrier only, reveals contextual backdrop).
  - `1 tier`: **75px – 90px** (compact municipal terrace).
  - `2 tiers`: **135px – 155px** (standard regional ground).
  - `3 tiers`: **190px – 220px** (major multi-deck stadium).
  - `4 tiers`: **250px – 285px** (massive monumental arena).
  - `wall`: **210px – 260px** (single massive continuous steep rake with crash barriers).
  - Tier Size scaling: Small ($-15\%$), Medium ($1.0\times$), Large ($+25\%$).
- **Iconic Architectural Landmarks**:
  - **South Gatehouse Pavilion**: Symmetrical central concrete pavilion with deep blue arched portal (`#1e3a8a`), stepped flanking pylons, turnstiles, and LED indicators.
  - **North Upper Press Portico**: Raised central gantry structure atop North rim with tinted media boxes (`#0284c7`), VIP terrace, and broadcast camera mast with red beacon.
  - **4 Corner Floodlight Pylons**: Multi-head pixel arrays (3 rows × 6 lamps) angled inward toward the pitch center with solar-azimuth atmospheric illumination (Day, Sunset, Dusk, Night).

### 3.3 Control Scheme & Input Multiplexer

| Action | Keyboard | Gamepad (Xbox / PlayStation) | Virtual Touch |
| :--- | :--- | :--- | :--- |
| **Move / Aim** | `WASD` / Arrow Keys | Left Analog Stick / D-Pad | Floating Virtual Analog Joystick |
| **Short Pass / Press** | `S` | `A` / $\times$ | **PASS** Button |
| **Lead / Through Ball** | `W` | `Y` / $\Delta$ | **THROUGH** Button |
| **Cross / Long Pass / Slide** | `D` | `X` / $\square$ | **CROSS** Button |
| **Shoot / Clearance** | `A` | `B` / $\bigcirc$ | **SHOOT** Button |
| **Sprint / Dribble Burst** | `Space` / `Shift` | `RT` / `R2` | Outer Ring Joystick Drag |
| **Elevation / Chip Modifier** | `E` | `LB` / `L1` | In-Flight Swipe Up |
| **Swerve / Curl Modifier** | `Q` | `LT` / `L2` | In-Flight Arc Drag |
| **Tactics / Pause** | `P` / `Esc` | `Start` / `Options` | HUD Pause Icon |

### 3.4 Match Physics & Ball Aerodynamics
- **Ball Physics**: True 2.5D coordinate model $(x, y, z)$ with gravity ($g = 9.81\,\text{m/s}^2$), air drag, Magnus effect swerve curve, turf friction, and surface restitution.
- **Spatial Protection**: When a ball carrier shields the ball, the physics engine plants the player's pivot foot, lowers the center of gravity, and computes collision hulls to prevent defenders from walking through their body without committing a foul.
- **Linesman Offside Engine**: Active IFAB Law 11 evaluation checking the second-last defender at the precise millisecond of pass release. If offside is triggered, the touchline linesman raises their flag with animated mechanics and play stops.

---

## 4. Historical Milestones Digest

```
[Phases 0.5 – 18] Core Gameplay, Physics, AI & Presentation
├── Symmetrical foul rules, 2026 pressing triggers, 4-button passing/shooting controls
├── IFAB pitch dimensions (105m×68m), turf physics, dynamic rain/snow/puddles
├── 18 outfield + 7 GK stats, 28 tactical playstyles, 4 skill tiers (Amateur to Pinnacle)
├── Procedural 32-bit animation engine (bullet headers, sliding tackles, volleys, trivelas)
├── Split-screen pre-match hub, modular kit mixer with anti-clash contrast engine
├── Linesman offside engine (IFAB Law 11) & 32-bit CRT VideoRef cutscenes
└── Locked 60 FPS mobile optimization with zero-allocation heap architecture

[Phases S1 – S5 & ST1 – ST7] Dynamic Stadiums & Geometry Framework
├── IFAB pitch invariance with 4 footprint profiles (Square, Rectangular, Round, Oval)
├── Stepped riser geometry with dense seating rows & outer load-bearing walls
├── Solar azimuth lighting engine (noon shadows, 45° golden hour, floodlight quad-cones)
├── 360° circular fisheye horizon & 6-step WYSIWYG Stadium Creator
├── 8 independent cardinal & diagonal stands with 45° miter-welded corner pavilions
├── 9 immediate ground environments (Plazas, Malls, Asphalt, Potrero, Docks, Mountains)
└── Sims-style 3-state roof cutaway toggler (0% hidden, 50% eaves, 100% full)

[Phases B1 – B7] Vertical Hierarchy & Master Visual Overhaul
├── Vertical spatial hierarchy (bgTop < horizonBaseY < northConcourseTop < pitchTop)
├── Grandstand typology: "The Wall" (continuous steep rake) vs multi-tier cantilever decks
├── 32-bit architectural textures: brick, weathered stone, precast concrete, steel trusses
├── Independent asymmetric concourse ground directionality with rich ambient props
├── Deep ocean platforms (aircraft carrier, oil rig), airport runways & Alpine horizons
├── Ultra-wide macroscopic camera glide intro (5% to 100% zoom)
└── Unified regression test suite verifying 580+ visual conditions

[Phases D1 – D4.5A] High-Oblique 2.5D Grounds, Pitch Invariance & Stand Architecture
├── Phase D1: Dynamic IFAB pitch boundary invariance (PITCH_CONFIG sync, out-of-bounds raycasting, linesmen patrol sync)
├── Phase D1: Team Editor home venue turf dimension presets (compact, standard, expansive, custom) with tactical readouts
├── Phase D1: Stadium Creator Step 1 refactor (apron infill to final slot, invariant 76m×112m apron) & Gateway selector
├── Phase D2: Southern grounds expansion (+50%), northern compact shelf (-25%), 6 no-stand types
├── Phase D3: Universal fixed-form grounds trapezoid (fitting all 4 shapes) & no-stand backdrops
├── Hotfix D3.1: Strict vertical horizon anchoring & high-oblique 1-point perspective trapezoid
├── Phase D4: Subtle stand perspective alignment with IFAB planar pitch invariance
├── Hotfixes D4.1–D4.4: High-oblique stand rake, South Gatehouse, North Portico & 4 Floodlight Pylons
└── Hotfix D4.5A: Dynamic stand dimensional scaling (1T: 75–90px, 2T: 135–155px, 3T: 190–220px, 4T: 250–285px)
```

---

## 5. Engineering Standards & Contribution Rules

1. **Smart Read-Before-Write**: When modifying an existing file, read the targeted code segment with `view_file`. Never read files that do not need modification.
2. **Zero-Allocation Render Loops**: Never write `new Object()`, `new Array()`, or spread operator `[...items]` inside functions called per frame (`draw*`, `update*`, `tick*`). Use module-level pre-allocated scratch objects.
3. **Canvas 2D Math Over DOM Elements**: Render all in-stadium props, stands, lines, crowds, and weather directly to the HTML5 Canvas 2D context.
4. **Automated Vitest Verification**: Every feature implementation must include or update automated tests in `src/game/__tests__/` and verify with `compile_applet` and `lint_applet`.
5. **Console UI Discipline**: Never introduce vertical scrolling into modals or the HUD. All controls must be comfortably clickable on a 360px mobile touchscreen and navigable via gamepad.
