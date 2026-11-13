# Development Roadmap: Next-Gen Lightweight Football Simulation

> **Architecture & Historical Reference Notice**:  
> All completed engineering milestones (Phases 0.5–18, S1–S5, ST1–ST7, B1–B7, D2, D3, D4, and Hotfixes D4.1–D4.5A) have been archived into **[`/WIKI.md`](/WIKI.md)**.  
> Read `/WIKI.md` for directory maps, subsystem contracts, coordinate geometry, 60 FPS optimization guidelines, and input multiplexing. **Do not bloat this roadmap with completed phase logs.**

---

## Vision & Architecture Principles
Build an authentic, tactical, and fluid 32-bit football simulation that runs at a locked 60 FPS across all hardware, from desktop workstations down to $50 budget smartphones.

- **Strict 60 FPS Performance on Budget Devices**: Pure procedural HTML5 Canvas 2D math, pre-allocated vectors, zero-allocation per-frame render loops (`update` and `render`), and strict garbage collection avoidance.
- **32-Bit Arcade Console Design Constitution**: Pure late-90s / early-2000s console aesthetic (chiseled metallic bevels, dithered shading, authentic scanlines, rich CRT/VHS filters, and tactile responsive menus).
- **Console-Grade Zero-Scroll Viewport UI**: Strict single-screen layout across all devices (PC, tablet, mobile). No vertical or horizontal page scrolling anywhere in menus or tactical boards.
- **Tri-Input Control Multiplexer**: Native, effortless control via Gamepad/Controller (XInput/DirectInput), Keyboard (WASD/Arrows + Action keys), and Touchpad/Touch (low-latency floating virtual stick + action buttons).
- **Daily Token Budget Calibration**: Strictly **1 Phase = 1 Day's worth of Google AI Studio tokens** (~700k–850k tokens), with each phase terminating in a fully compiled, zero-regression, 100% playable build.
- **Strict In-Game Copyright & Generic Architectural Naming Protection**: All in-game UI labels, option selectors, presets, tooltips, and type identifiers in the Stadium Creator, Team Editor, and match HUD must strictly use evocative, generic architectural and structural terminology (e.g. *Parametric Metallic Louvers*, *Translucent ETFE Diamond Quilt*, *Monolithic Titanium Glass Dome*, *Mega-Deck Cantilever Arch*, *Cylindrical Spiral Corner Towers*, *Cable-Stayed Pylon Rigging*, *Industrial Box-Truss Exoskeleton*). Real-world stadium, club, or sponsor names are cited in engineering design roadmaps solely as visual benchmarks and must **NEVER** appear anywhere in the playable game, editor options, or client-facing UI strings.
- **AI Studio Dev Server & Runtime Execution Protocol (Multi-AI & Timeout Safety)**:
  - **Dev Server Port 3000 Invariance**: The dev server runs on port 3000 (`"dev": "vite"`). To verify status, run `curl -I http://localhost:3000`. If unresponsive, invoke the `restart_dev_server` tool.
  - **Container Timeout & RPC Deadline Exceeded Avoidance**: Google AI Studio enforces a 60s Apps Framework and 180s Kotlin coroutine deadline. To prevent VM deadlocks:
    1. *Surgical File Edits*: Never rewrite massive 20k+ line files in full; always use `replace_file_content` targeting small line ranges (under 150 lines).
    2. *Targeted Test Execution*: Never execute `npm test` (which runs all 50+ test suites concurrently) inside background tasks. Always run targeted single-test suites (`npx vitest run src/game/__tests__/phase...`).
    3. *Container Recycle*: If `RPC::DEADLINE_EXCEEDED` or `Timed out waiting for 180000 ms` occurs, refresh the AI Studio browser tab or invoke `restart_dev_server` to release locked file-sync handles.

---

## Active Development Queue: Pending Phases & Hotfixes

```
================================================================================
              ACTIVE MASTER DEVELOPMENT EXECUTION QUEUE (PENDING)
================================================================================
```

| Phase | Title | Primary Scope | Status |
| :---: | :--- | :--- | :---: |
| **D1** | **Dynamic Pitch Boundaries & Venue Architecture** | Dynamic Out-of-Bounds Invariance, Creator Step 1 & Team Editor Dimensions | **COMPLETED & VERIFIED** |
| **D4.5B** | **Hotfix: Multi-Floor Tier Architecture (True Elevated Levels)** | Stacked Upper Floors, Concrete Balcony Fascias, Cast Shadows & Vomitory Portals | **COMPLETED & VERIFIED** |
| **HOTFIX SS1** | **Hotfix: Round/Oval Tiers, The Wall 16-Row Densities & Concentric Round Track** | Concentric Circular Track for Round Bowl, Round/Oval Multi-Floor Tier Quality, The Wall Rows (Big=16, Med=11, Small=6) | **COMPLETED & VERIFIED** |
| **HOTFIX SS2** | **Hotfix: Clean Parapet Floodlight Anchors & Structural Outer Facades** | Inner-Rim Parapet Floodlight Clusters & South Gatehouse Integration Across All Shapes | **COMPLETED & VERIFIED** |
| **D4.5C** | **Hotfix: Monolithic "The Wall" Stand Architecture** | Uninterrupted 210–260px Steep Terrace, High-Oblique Rake, Continuous Crash Barriers | **COMPLETED & VERIFIED** |
| **T1** | **Round/Oval No-Stand Sector Removal & Ground-Matched Gapless Fill** | Omit Round/Oval No-Stand Sectors, Seamless Zero-Gap Grounds Substrate Color Match, Concentric Round Track Fix | **COMPLETED & VERIFIED** |
| **T2** | **"VIP Building" Stand Architecture (La Bombonera East Stand) & Elaborated Positional Backdrops** | Vertical Flat Tower with Stacked VIP Palcos/Suites, Glass Balustrades, Sponsor Murals, Lower Terrace Stand & Orientation-Tailored Vistas (West/East/North/South) + Bespoke 4-Corner Landmarks | **COMPLETED & VERIFIED** |
| **T3** | **Stand Density System & Decoupled Deck Sizing (Tiered & Wall Stands)** | Separate Density from Deck Sizing (Reduced / Normal / High Density), Row Packing Math, Capacity Adjustment & Step 2 UI Controls | **COMPLETED & VERIFIED** |
| **T4** | **Round/Oval Multi-Tier Stacking Fix, Wall Stand Sizing Scaling & Step 2 Density UI Polish** | Fix 2nd/3rd/4th Tier Stacking on Round/Oval Bowls, Physical Depth Scaling for Wall Stands (Big Wall = 4-Tier Stand Depth ~220-260px), Remove Duplicate Batch Density UI | **COMPLETED & VERIFIED** |
| **T5** | **Pitchside Tier Safety Fence & Pitch Barrier Architecture (7 Authentic Typologies)** | Barrier Subsystem between Lowest Tier & Pitch Infill (Red Brick, South American Steel Chain, High Security Chain, Anti-Barristas with Barbwire, Heavy Timber, Concrete, LED Ribbon) | **COMPLETED & VERIFIED** |
| **T6** | **The 5-Grade "Architectural Grade" System & 3-Element Color Palette Engine** | Replace 32-bit Material, Solid Decking & Rear Delimitation with 5 Grades (Municipal, Brutalist, Industrial, Victorian, Modern), Inherent Seat Styles, Seat Level Ranking (Grades 1-5), Municipal Rating Drop Penalty & 8-Color Palette | **COMPLETED & VERIFIED** |
| **T7** | **VIP Building Multi-Floor Suite Elevator (1–5 Floors) & Integrated Pitchside Stand** | Numeric [-] [+] Floor Stepper (1 to 5 Floors), "STAND" Pitchside Terrace Toggle (Small/Med/Big), Custom Materials, Barriers & Seats | **COMPLETED & VERIFIED** |
| **T8** | **"Stacked Wall" Modern Coliseum Architecture (Metropolitano & Tottenham Style)** | Coliseum Double-Decker Wall Stand, Tottenham Arched Domed Crown Profile (North/South), Max Capacity Configuration | **COMPLETED & VERIFIED** |
| **T9** | **VIP Hospitality Tier, Executive Amenities & FIFA "World" Category Certification** | VIP Seats as Tier 6 Grade, Grade 3+ (Industrial+) Eligibility Gate, VIP Zone Buffet Lounge, Transmission Press Box, 3 Luxury Seat Types & FIFA "WORLD" Gate | **COMPLETED & VERIFIED** |
| **T10** | **New 4-Corner Architecture Taxonomy ("Round", "Square/Giant", "Tower", "No Stand")** | Sweeping Round Corner (Camp Nou/Bombonera West), Square/Giant Soaring Wall Corner (St. James'), VIP Tower Corner, No Stand Corner | **COMPLETED & VERIFIED** |
| **T11** | **Unified Grandstand Stairs & 3-Vomitory Tunnel Architectures** | Exactly 2 Vertical Stairs Per Tier with Staggering, 3 Vomitory Access Geometries (Above, Below, Rear) & Circulation Polish | **COMPLETED & VERIFIED** |
| **T12** | **Master Corner Geometry & Northern Perspective Union Overhaul** | Northern Angle Alignment (NW/NE Corners Matching North Stand Rake), Monumental Giant Corner Scaling (~180–240px Depth) & Flush Structural Bonding | **COMPLETED & VERIFIED** |
| **T13** | **Round/Oval Bowl Safety Barrier Invariance & 50% Fluid Rounded Corner Roofs** | Fix North Bend Barrier Escalation on Round/Oval, Concentric Inner Rim Invariance Across 360°, Replace Sharp 50% Triangle Roofs with Fluid Rounded Canopies | **COMPLETED & VERIFIED** |
| **HOTFIX T13B** | **Hotfix: South Corner Geometry, Vertical Perspective Alignment & Black Circle Elimination** | Fix Distorted SW/SE Corner Angles, Align with South Stand Vertical Perspective, Eliminate Dark Circular Blobs/Bulges & Orthogonal Structural Bonding | **COMPLETED & VERIFIED** |
| **HOTFIX T13C** | **Hotfix: Specification-Driven Independent Corner Sizing & Southern Vertical Perspective Overhaul** | Independent Corner Depth (1–4 Tiers, Small/Med/Large, Giant), Perfect Matching for Equal Configurations, Smooth Vertical Perspective for SW/SE Corners & Return Transition Sidewalls | **COMPLETED & VERIFIED** |
| **HOTFIX T13D** | **Hotfix: Unified Perimeter Roof Architecture, Corner Canopy Bonding & 50% Upper-Tier Invariance** | Unify Roof Scale Around Perimeter, Smooth Seamless Corner Bonding (0px Discrepancy & C1 Tangents), Strict <= 50% Upper-Tier Match Cutaway Invariance & Rich Detailing Across All Stands | **COMPLETED & VERIFIED** |
| **HOTFIX T14E** | **Hotfix: Unified Perimeter Roof Architecture for Rectangular & Square Stadiums & Seamless Oval Stand Alignment** | Perimeter-Uniform Roof Canopies, Strict <= 50% Upper-Tier Match Cutaway Invariance, Seamless Southern Corner Bonding (0px Discrepancy & C1 Continuity) & Angular Blended Oval Goal Bends | **COMPLETED & VERIFIED** |
| **HOTFIX T14F** | **Hotfix: Corner Material & Color Harmony, Subtle South Connecting Angles, Fluid Roof Miter & Crisp Ad Banners** | 100% Material & Grade Texture Parity on Corner Stands (Raw & Colors), Subtle Southern Transition Angle, Continuous East/West-to-South Roof Canopy Bonding & Crisp Readable South Banner Typography | **COMPLETED & VERIFIED** |
| **HOTFIX T14G** | **Hotfix: Touchline Outer Wall Corner Integration, Open-End Architectural Finials & High-Oblique No-Stand Backdrops** | Rectangular/Square East/West Outer Wall Angled Corner Integration, Architectural Return End-Cap Finials on Open Stands, Perspective-Calibrated No-Stand Backdrops with True Front & Top Oblique Surfaces | **COMPLETED & VERIFIED** |
| **HOTFIX T14H** | **Hotfix: Southern Corner 2.5D High-Oblique Perspective Geometry, Upper-Tier Coordinate Sync & Miter Knee Elimination** | Eliminate Deformed Upper-Tier Lateral Shearing, Exact 2.5D High-Oblique Radial Miter, Smooth South-to-Touchline Tier Alignment & Roof Miter Sync | **COMPLETED & VERIFIED** |
| **HOTFIX T14I** | **Hotfix: Southern Corner Outward-Facing Coliseum Arc & 45° Planar Miter Geometry** | Outward-Facing Concentric Coliseum Arc on Round/Tiered Corners, Clean 45° Diagonal Miter Chamfer on Giant Corners, Eliminate Inverted Trumpet Horns & Gap Polygons | **COMPLETED & VERIFIED** |
| **HOTFIX T14J** | **Hotfix: Roof Canopy Cutaway Overhang Invariance & Fluid Miter Alignment** | Clamped Corner Roof Overhang (<= 50% Top Tier on Round, <= 20% on Giant), Full Enclosure on 100%, 0% Hidden, Eliminate Self-Intersecting Hourglass Horns | **COMPLETED & VERIFIED** |
| **HOTFIX T14O** | **Hotfix: Southern Corner Seating Layer Order, Concourse Deck Invariance & Seat Occlusion Elimination** | Rectify Render Order (Substrate/Promenade Before Seats), Eliminate Giant Corner Promenade Occlusion, Bounded Concourse Deck Behind Upper Tiers & Calibrated Soffit Shadows | **COMPLETED & VERIFIED** |
| **HOTFIX T14P** | **Hotfix: Corner Stand 32-Bit Texture Parity, Architectural Grade Finishes & Harmonious Color Palette** | 32-Bit Grandstand Material (Concrete, Brick, Steel, Modern, Timber) on Corners, Grade Façade Features, Authentic Decking Patterns & Synchronized Color Palettes | **COMPLETED & VERIFIED** |
| **HOTFIX T14K** | **Hotfix: Corner Floodlight Placement Subsystem (3 Authentic Typologies)** | Step 3 Creator Lighting Options (Exterior Concourse Towers, Integrated Parapet Anchors, Corner Ground Infill Towers for No-Stand Corners) | **COMPLETED & VERIFIED** |
| **HOTFIX T14L** | **Hotfix: Corner VIP Towers 2.5D Oblique Architectural Overhaul & 4-Quadrant Directional Aspect System** | True 2.5D Oblique Prism (North Front Luxury Suites vs South Rear Exterior & Top Roof Deck), Lateral East/West Mirroring & Rooftop Detailing | **COMPLETED & VERIFIED** |
| **HOTFIX T14M** | **Hotfix: Southern Giant & Tiered Corners 2.5D High-Oblique Overhaul (Northern Stands Locked & Preserved)** | Strict Architectural Lock on Northern Giant & Tiered Corners (NW/NE Unchanged); Dedicated Southern (SW/SE) High-Oblique Rear Structure, Concourse Overlook & Grounding | **COMPLETED & VERIFIED** |
| **HOTFIX T14N** | **Hotfix: Southern Corner Exterior Facades, Outer Wall Miter Turn & Grounding Plinths** | Seamless West/East Outer Wall to South Facade Miter Wrap, Grounding Plinths, Concourse Apron Invariance & Exterior Circulation Stairs | **COMPLETED & VERIFIED** |
| **T14** | **Outer Structural Walls, Context-Aware Southern Entrances & 4-Shape Geometry Polish** | Structural Perimeter Walls with Stone Coping, Context-Aware Southern Entrance Pavilions (Marine Ferry Terminal, Alpine Funicular, Desert Oasis, Urban Metro) & 4-Shape Enclosure Polish | **PENDING (NEXT)** |
| **T15** | **Surroundings Overhaul, New "Desert" Environment & Fixed Skyline Width Alignment** | Dedicated "Desert" Surrounding Type (Dunes, Mesas, Heat Haze), Fixed Skyline Lateral Bounds & Flank Perspective Alignment | **PENDING** |
| **T16A** | **Immediate Stadium Grounds & Concourse Architecture (The Physical Surrounding Area)** | Focus Beyond the Horizon: Deep Physical Ground Detailing Framing the Stadium (Paved Plazas, Turnstile Courtyards, Ticket Booths, Parking Bays, Lighting Bases & Kiosks Across All 9 Grounds), Zero-Bus Water Coherence (Catamarans, Water Taxis, Mooring Piers) | **PENDING** |
| **T16B** | **Master "No-Stand" Spatial Footprint Engine & Shape-Adaptive Backdrops** | Populate the Grandstand Footprint Void Across All 4 Shapes (Rectangular, Trapezoid, Round Bowl, Oval Curve) with Unique Contextual Architecture (Grassy Potrero Embankments, Alpine Pine Berms, Urban Streets & Bus Stops, Coastal Boardwalks & Docks, Desert Oasis Tents) | **PENDING** |
| **T17A** | **Stadium Exterior Structural Supports & Partial Coverage Architecture (5 Tiers, 9 Typologies & 5-Element Color Engine)** | No-Coverage Structural Load Supports (5 Tier Options + Raw Option), Partial Coverage Perimeter Architecture (Old Trafford Trusses, 9 Typologies across 5 Tiers), 3–5 Customizable Color Elements (9 Base Colors + Natural Material) & Step 1 Creator Refactor | **PENDING** |
| **T17B** | **Monumental Full Coverage Mega-Stadium Enclosures & Full Pitch/Retractable Roof Systems** | 3 Enclosure Archetypes (Industrial, Modern, Victorian) with 3 Designs Each (9 Master Envelopes: Bernabéu, Allianz, Tottenham, Dortmund Gantry, Gothic Palace, etc.), Full Pitch/Retractable Roof Systems (Schalke Dome), 3–5 Color Elements & Step 1 Integration | **PENDING** |
| **T18** | **Ultra-Detailed 32-Bit Skyview "Fishview" Porthole Engine & Environmental Harmonizer** | 360° Spherical Fisheye Macro View High-Detail Overhaul: Full 32-Bit Integration of Surroundings, Grounds, Stands, Roofs, and New T17 Exterior Coverage Systems, Dynamic Weather & Circular Porthole Preview | **PENDING** |
| **T19** | **Cinematic Southern Entrance-to-Skyline Intro & Master T-Series Vitest Suite** | 3-Stage Venue Intro Pan, Master Vitest Regression Suite & 60 FPS Profiling | **PENDING** |
| **T20** | **Lightweight Cinematics Suite & Slow-Mo Replay Buffer** | Zero-Allocation Replay Ring Buffer, Slow-Mo Highlights & Walkout Hook | **PENDING** |
| **T21** | **Stadium Revenue Engine, Seat Tier Ranking & Pre-Match Attendance Economics** | Seat Pricing Algorithm (Tier 6 VIP, Stand Orientation, Vertical Mid-Tier Premium), Municipal Penalty Gate, Dynamic Attendance & Matchday Gate Revenue Calculator | **PENDING** |
| **T22** | **Broadcast Team Presentation Engine (3 Cinematic Modes: Line-by-Line, Full View & Classical)** | 3 Starting XI Reveal Modes (Line-by-Line with Up to 6 Cards & Portrait Photo Containers, Full View Number-Sorted List + Tactical Pitch Board, Classical Positional List), Custom Colors, Transparency & Border Styling, Gate Revenue Card | **PENDING** |
| **T23** | **Broadcast Channel Sponsor Engine & In-Match Dynamic Event Popups** | 1–3 Procedural Sponsors per Channel, Custom Text Logos & Brand Colors, In-Match Lower-Third TV Bugs (Corners, Free Kicks, Penalties, Halftime 2–3s) & In-Universe Sponsors for 5 Preset Channels | **PENDING** |
| **T24** | **Broadcast Channel Creator, Scoreboard HUD Themes & 4K Subpixel Enhanced Filter Engine** | Dedicated Channel Creator Menu (5 Fonts, Shapes, Scoreboard HUD Theme, Contrast Rules), 4-Tone Ambiance Washes, 4K High-Definition Subpixel Filter & 5 Iconic Presets (DRAWSTAR TV, STAR WIN, DRAW SPORTS, STAR TV, LEGENDS TV) | **PENDING** |

---

## Detailed Specifications of Pending Phases

### Phase D1: Dynamic Pitch Boundary Invariance & Stadium Creator / Team Editor Venue Architecture [COMPLETED]
*Priority: Unify Physical Out-of-Bounds with Visual Pitch Lines + Streamline Venue Configuration*  
*Daily Token Budget Profile: Scope: `src/game/pitchBoundary.ts`, `src/game/pitchDimensions.ts`, `src/game/ballPhysics.ts`, `src/game/engine.ts`, `src/game/setPieces.ts`, `src/components/StadiumCreatorModal.tsx`, `src/components/TeamEditorModal.tsx`, `src/types/stadium.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### D1.1 IFAB Dynamic Playable Boundary Invariance
- **The Core Physics Disconnect**:
  - When pitch turf dimensions are set to `compact` (100m × 64m) or `expansive` (110m × 72m), visual pitch white lines currently do not match physical out-of-bounds trigger coordinates.
  - On compact pitches, players can dribble past visible touchlines/endlines without triggering throw-ins or goal kicks; on expansive pitches, out-of-bounds is triggered prematurely.
- **Engine Solution**:
  - Dynamically synchronize `PITCH_CONFIG`, ball collision bounds, out-of-bounds ray-casting, linesman patrol boundaries, corner arc anchors, and penalty area geometry to active match `turfDimensions`.
  - The painted lines on the pitch strictly define the exact physical playable area in all match scenarios.

#### D1.2 Stadium Creator Step 1 Architecture Refactor
- Move `apron infill material` to the final/last position on Step 1 of `StadiumCreatorModal` (replacing its current 2nd/3rd placement).
- Remove the pitch turf dimension picker from the Stadium Creator (defaulting to standard 105m × 68m in stadium architecture).

#### D1.3 Team Editor Home Venue Turf Dimension Configuration
- Move turf dimensions selection (`compact`, `standard`, `expansive`) into the Team Editor under the Home Venue configuration tab.
- Each club/national team now configures its bespoke home pitch dimensions (e.g., compact high-press potrero vs expansive continental stadium).

#### D1.4 Stadium Creator Gateway Modal ("Edit Current" vs "Create New")
- Introduce a pre-creator selection gateway:
  - **"EDIT CURRENT STADIUM"**: Opens the creator pre-populated with active stadium configuration, with a selector dropdown to choose and modify any registered stadium.
  - **"CREATE NEW STADIUM"**: Starts with a clean, default template from scratch.

---

### Hotfix D4.5 Series: Grandstand Architecture & Projection Overhaul (D4.5B – D4.5F)

#### [Phase D4.5B] Multi-Floor Tier Architecture (True Elevated Levels) [COMPLETED & VERIFIED]
*Scope: `src/game/stadiumRenderer.ts`, `src/types/stadium.ts`, `src/game/__tests__/phaseD4_5B_MultiFloorTiers.test.ts`*
- Render each tier as an authentic upper floor stacked over the lower tier.
- Structural concrete balcony fascias (`#cbd5e1` / `#94a3b8`) with cast drop shadows.
- Polished safety balustrades and prominent access vomitory tunnels (entry portals) centered in each tier.
- Seat rows clearly driven by `tierSize` with visible tread steps and risers.
- Material finishes (concrete, brick, steel, timber) cleanly applied to tier fascias and outer walls.

#### [HOTFIX PHASE SS1] Round/Oval Tiers, The Wall 16-Row Densities & Concentric Round Track [ACTIVE]
*Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/hotfixSS1_RoundOvalTiersAndWall.test.ts`*
- **Concentric Circular Running Track for Round/Circular Stadiums**:
  - Replace oval racetrack straight/horseshoe hybrid paths with true 360° concentric circles (`ctx.arc(cx, cy, trackRadius, 0, Math.PI * 2)`) centered at invariant pitch center `(cx, cy)`.
  - Inner and outer curb rings plus 8 concentric circular lane dividers (`setLineDash([14, 10])`).
  - Keep authentic Olympic straight+horseshoe racetrack geometry on `shape === 'oval'`.
  - Maintain athletics field event placement (High jump, Pole vault, and Flank pit).
- **The Wall Terrace Row Densities**:
  - Enforce authentic terrace rows: **Big Wall = 16 Rows**, **Medium Wall = 11 Rows**, **Small Wall = 6 Rows** via `getWallTierChairRows(wallSize?: WallTierSize): number`.
  - Update `StadiumCreatorModal.tsx` preset buttons and summary badges to reflect accurate terrace row counts when configuring a Wall stand.
  - Render unbroken stehplatz density with anti-surge crash barriers on alternating steps across touchline, goal-end, and bowl geometries.
- **Round & Oval Multi-Floor Tier Quality**:
  - Refactor `drawContinuousColiseumBowl` to cleanly support 1 to 4 distinct elevated tiers without artificial step clamping.
  - Multi-tier bowls feature distinct elevated balcony fascia rings (`#cbd5e1` coping highlight, `#94a3b8` face or material finish, safety balustrades, and deep cast drop shadows onto lower tiers).
  - Prominent radial vomitory access portals spaced around elevated tier concourse rings.

#### [HOTFIX PHASE SS2] Clean Parapet Floodlight Anchors & Structural Outer Facades [COMPLETED & VERIFIED]
*Scope: `src/game/stadiumRenderer.ts`, `src/game/__tests__/hotfixSS2_FloodlightsAndFacades.test.ts`*
- Anchor floodlight pylons and volumetric light clusters directly onto the 4 structural corner parapets / bowl rim.
- Eliminate stray outer horizon floodlight towers.
- Refine structural perimeter walls and south entrance pavilions.

#### [Phase D4.5C] Monolithic "The Wall" Stand Architecture [COMPLETED & VERIFIED]
*Scope: `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseD4_5C_TheWallArchitecture.test.ts`*
- For stands with `type === 'wall'`:
  - Render as a single massive, steep, uninterrupted terrace (210px–260px depth).
  - Pronounced high-oblique rake angle going higher and further away.
  - Continuous horizontal crash barriers (geländer) on every terrace step.
  - Towering rear parapet with rear vomitory gates.

#### [Phase D4.5D] Pure No-Stand Removal & Contextual Backdrop Reveal [COMPLETED & VERIFIED]
*Scope: `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseD4_5D_NoStandBackdropReveal.test.ts`*
- For stands with `type === 'none' | 'no_stand'`:
  - Stand depth drops to 0px (no grandstand slab, no rear wall box).
  - Renders only the low pitch-edge perimeter barrier (chainlink, low stone wall, or hoardings).
  - Selected contextual backdrop (mountains, forest, skyline, ocean, etc.) directly reveals behind the barrier with leaning supporters.
  - Corner miters seamlessly taper into open ground when an adjoining stand is "no stand".

#### [Phase T1] Round/Oval No-Stand Sector Removal & Ground-Matched Gapless Fill [COMPLETED & VERIFIED]
*Scope: `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT1_RoundOvalNoStandAndGroundMatch.test.ts`*
- **Round & Oval Coliseum Bowl No-Stand Sector Removal**:
  - Update `drawContinuousColiseumBowl`: when any quadrant sector (West, East, North, or South) has `type === 'none' | 'no_stand'`, cleanly omit all seating steps, riser shadows, and superstructure in that sector.
  - Seal the exposed radial sector edges with heavy structural concrete end-caps and stone coping.
  - Curve the low pitch-edge perimeter barrier (chainlink, stone seawall, brick, or timber) continuously along the inner rim of the open sector.
- **Ground-Matched Gapless Backdrop Buffer**:
  - Dynamically extend the no-stand terrain fill outward to completely merge with `drawImmediateStadiumGrounds` bounds, eliminating any visual gap or seam line.
  - Substrate color matching: base terrain ground buffer directly adopts the exact substrate fill color of the active `grounds` (e.g. cobblestone, concrete concourse, emerald lawn, red dirt) so open stands feel like a direct extension of the stadium grounds.
- **Concentric Round Running Track Fix & Floodlight Parapet Anchoring**:
  - In `drawStadiumApron` for `shape === 'round'`: draw true concentric circular track arcs matching the circular coliseum bowl geometry.
  - Remove all stray outer horizon/south exterior floodlight towers and anchor light clusters cleanly onto the 4 structural corner parapets / inner bowl rim.

---

### Phase T2: Elaborated Positional No-Stand Contextual Backdrops, VIP Building Stand & Round/Oval Backdrop Engine [COMPLETED]
*Priority: Fix Round/Oval No-Stand Backdrop Reveal, VIP Building Stand Architecture (La Bombonera East), Elaborated 32-Bit Positional Vistas (West, East, North, South) & Bespoke Corner Landmarks*  
*Scope: `src/game/stadiumRenderer.ts`, `src/types/stadium.ts`, `src/game/stadiumRegistry.ts`, `src/game/skyCamRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT2_VIPBuildingAndPositionalBackdrops.test.ts`*
- **Round & Oval No-Stand Backdrop Engine**:
  - Fix backdrop rendering so that when any stand is set to `none` or `no_stand` on `round` or `oval` coliseums, the selected contextual backdrop (mountains, forest, skyline, ocean, industrial, etc.) renders visibly through the open radial aperture or horseshoe curve.
  - Geometry projection: curved sector aperture clip on round stadiums, straight touchline and semicircular goal-bend projection on oval stadiums.
- **Deeply Elaborated Positional Backdrop Vistas**:
  - Elevate beyond simple walls and generic trees by introducing distinct, highly detailed positional vistas tailored to each stand orientation:
    - **West Stand Openings**: Sunset-lit golden horizon, terraced residential hillside streets, suburban railway spurs with vintage freight cars, wooden telephone poles with sagging utility wires, and overgrown hedgerows.
    - **East Stand Openings**: Crisp morning sidelight, active working riverfront / commercial canal embankments, moored cargo barges, rusty gantry cranes, brick warehouse facades, and industrial smoke plumes.
    - **North Stand Openings**: Dramatic high-contrast distant mountain ranges with snow caps and alpine firs, towering metropolitan skyline vistas with blinking antenna beacons, or soaring brick viaduct railway arches.
    - **South Stand Openings**: Grand arrival forecourt, bustling fan plaza with vintage team merchandise stalls, food truck trailers, illuminated retro lamp posts, banner flagstaffs, and active municipal tramlines.
- **Bespoke Corner Landmark Architecture (Open Corners)**:
  - When corner stands are set to `none` or `no_stand`, render bespoke landmark props that anchor the exposed corner:
    - **NW Corner**: Iconic high-mast vintage floodlight pylon with crisscross steel lattice, access ladder, transformer cage, and security perimeter fence.
    - **NE Corner**: Historic red-brick corner clock tower with illuminated four-sided dial and pennant flagpole.
    - **SW Corner**: Grassroots fan culture outdoor terrace / open-air biergarten with striped canvas parasols, rustic wooden picnic tables, and club pennants.
    - **SE Corner**: Authentic turnstile gatehouse kiosk with ticket queues, security turnstiles, and metal bicycle stands.
- **Full Shape Invariance & Seamless Buffer**:
  - Seamlessly merged into concourse ground bounds (`getUniversalGroundsBounds`) across Rectangular, Square, High-Oblique Trapezoid, Oval, and Round stadiums.
- **Stadium Creator Step 2 Integration**:
  - Live preview reflects positional backdrops and bespoke corner landmarks in real time.

---

### Phase T3: Stand Density System & Decoupled Deck Sizing (Tiered & Wall Stands) [COMPLETED & VERIFIED]
*Priority: Decouple Stand Density from Physical Deck Dimensions, 3 Density Tiers & Capacity Scaling*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/pitchDimensions.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT3_StandDensityAndDecoupledDecks.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T3.1 Stand Density System (Decoupled from Physical Deck Depth)
- **Architectural Principle**:
  - Stand density does **not** change the physical size/depth of the stand on canvas; it changes the compactness of row packing within the exact same spatial footprint, placing rows closer together (or farther apart) and adjusting capacity accordingly.
- **3-Option Density Selector**:
  1. **`reduced`**:
     - Reduces row count by **1 less row** than the default size across all tiers and walls.
     - Creates more spacious, comfortable legroom spacing with wider treads.
     - Tiered rows: Small = 3 rows, Medium = 7 rows, Big = 13 rows.
     - Wall rows: Small = 5 rows, Medium = 10 rows, Big = 15 rows.
  2. **`normal`**:
     - Standard default row counts:
     - Tiered rows: Small = 4 rows, Medium = 8 rows, Big = 14 rows.
     - Wall rows: Small = 6 rows, Medium = 11 rows, Big = 16 rows.
  3. **`high_density`**:
     - High-density supporter packing, compressing rows into the same footprint:
     - Tiered: Small = **+1 row** (5 rows total); Medium = **+2 rows** (10 rows total); Big = **+4 rows** (18 rows total).
     - Wall: Small = **+1 row** (7 rows total); Medium = **+2 rows** (13 rows total); Big = **+4 rows** (20 rows total).
- **Dynamic Row Spacing & Step Math**:
  - Dynamically recalculate step riser/tread heights in `drawSingleTouchlineStand`, `drawGoalEndStand`, `drawMiteredCornerStand`, and `drawContinuousColiseumBowl` so that row count adjusts cleanly within the fixed physical depth.
  - Scale barrier spacing and supporter sprite count in proportion to active density.

#### T3.2 Dynamic Stand Capacity Adjustment
- Update `calculateStandCapacity`:
  - `reduced`: -15% capacity factor per tier/wall.
  - `normal`: 1.0 baseline factor.
  - `high_density`: +20% to +25% capacity boost corresponding to packed rows.

#### T3.3 Stadium Creator Step 2 UI Density Controls
- In `StadiumCreatorModal.tsx`, add interactive 3-segment density selector (`REDUCED`, `NORMAL`, `HIGH DENSITY`) to:
  1. Each individual tier in Tiered stands.
  2. The Wall configuration panel.
- Display live row counts and updated capacity readouts in real time.

---

### Phase T4: Round/Oval Multi-Tier Stacking Fix, Wall Stand Sizing Scaling & Step 2 Density UI Polish [COMPLETED & VERIFIED]
*Priority: Fix Broken 2nd/3rd/4th Tiers on Round/Oval Coliseum Bowls, Physical Depth Scaling for Wall Stands (Big Wall = 4-Tier Stand Depth ~220–260px) & Step 2 UI Density Redundancy Cleanup*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/skyCamRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT4_RoundOvalTiersAndWallSizing.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T4.1 Round & Oval 1-to-4 Tier Multi-Deck Stacking Fix
- **The Core Rendering Defect**:
  - In `drawContinuousColiseumBowl` and `skyCamRenderer.ts`, adding a 2nd, 3rd, or 4th tier to tiered stands on `round` and `oval` stadiums currently fails to stack upper decks cleanly over the bowl. Upper tiers collapse into a flat single ring or do not display their upper-floor balcony structures.
- **Mathematical Multi-Floor Stacking Engine**:
  - Dynamically calculate concentric tiered rings for each tier in `stand.tiers` (`tierIdx = 0, 1, 2, 3`):
    - **Radial Inset & Outset Scaling**: Tier 1 extends from inner bowl apron curb to concourse 1; Tier 2 extends with an elevated cantilever riser and structural balcony fascia (`#cbd5e1`/`#94a3b8`) outward with a deeper cast shadow; Tiers 3 and 4 soar further outward.
    - **Elevated Balcony Rings**: Concrete balcony fascia rings separating every tier with stone coping highlights, structural drop shadows cast onto lower tiers, and safety balustrades.
    - **Radial Concourse Vomitories**: Prominent radial vomitory portals distributed evenly along the concentric concourse aisles for all 1 to 4 active tiers.
    - **Per-Tier Step & Seat Geometry**: Each tier's seat rows are calculated via `getTierChairRows(tier.size, tier.density)` with proper radial arc division and spectator placement.

#### T4.2 Wall Stand Physical Depth Scaling Calibration Across All 4 Shapes
- **The Core Sizing Defect**:
  - In `drawSingleTouchlineStand`, `drawGoalEndStand`, and `drawMiteredCornerStand`, changing a Wall Stand size (`small`, `medium`, `big`) currently results in identical or near-identical physical depths on canvas, failing to convey the towering scale of a monumental terrace.
- **True Physical Depth Scaling**:
  - **`big` Wall Stand**: Massive physical depth of **~220px–260px**, matching the commanding physical scale and vertical height of a **4-tier grandstand**. Features a monumental unbroken rake with 16 default rows (up to 20 rows on high density) and anti-surge crash barriers on alternating steps.
  - **`medium` Wall Stand**: Standard depth of **~140px–170px**, matching a **2-tier grandstand** (11 default rows).
  - **`small` Wall Stand**: Compact pitchside terrace depth of **~70px–100px**, matching a **1-tier grandstand** (6 default rows).
- **Riser & Tread Mathematics**:
  - Stand density (`reduced`, `normal`, `high_density`) packs rows tightly or loosely within these distinct physical depths without changing the physical bounding footprint.

#### T4.3 Dedicated Curved Hull & Sector Geometry for Round & Oval Stands
- **Unique Curved Hull Adaptation**:
  - Unlike rectilinear rectangular/square stadiums, round and oval stadiums feature continuous curved hulls (radial arcs for round, tangent lines + semi-circular end arcs for oval).
  - Update stand rendering to follow these curved hulls authentically:
    - Tiered stands: Smooth concentric curved arcs for seating rows, vomitory portals, and balcony fascias.
    - Wall stands: Continuous steep curved terraces that sweep around the curvature of the bowl rather than drawing straight rectilinear blocks.

#### T4.4 Step 2 Stand Creator Density UI Polish (Eliminate Duplicate Toggle)
- **UI Redundancy Cleanup**:
  - In Step 2 of `StadiumCreatorModal.tsx`, remove the duplicate batch density toggle strip (`"STAND PACKING DENSITY: APPLY TO ALL DECKS"`).
  - Keep exclusively the streamlined, intuitive 3-segment density selector (`REDUCED`, `NORMAL`, `HIGH DENSITY`):
    1. On each individual tier deck within Tiered stands (allowing per-tier custom density).
    2. On the Wall Stand panel (controlling terrace packing density).
  - Retain the clean live total row count and capacity feedback badge without visual clutter.

#### T4.5 Vitest Test Suite & Regression Verification
- Comprehensive unit and visual regression test suite in `src/game/__tests__/phaseT4_RoundOvalTiersAndWallSizing.test.ts`:
  - Verifies round/oval multi-tier stacking for 1, 2, 3, and 4 tiers with accurate radial geometry.
  - Verifies physical depth differentiation between `small`, `medium`, and `big` wall stands across all 4 shapes.
  - Verifies zero regressions across all existing stadium test suites.

---

### Phase T5: Pitchside Tier Safety Fence & Pitch Barrier Architecture (7 Authentic Typologies) [COMPLETED & VERIFIED]
*Priority: Functional & Decorative Barrier Subsystem Between Lowest Tier and Pitch Infill Across All 4 Stadium Shapes*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/skyCamRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT5_TierSafetyFenceAndBarriers.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T5.1 Pitchside Barrier Subsystem Architecture
- **Location & Geometric Role**:
  - Positioned precisely at the perimeter boundary between the lowest stand tier (Tier 1 of tiered stands, or the pitch-level step of wall stands) and the pitch apron / infill.
  - Provides a physical and visual barrier separating spectators from the playing field apron.
  - Functions identically across all 4 stadium shapes (Rectangular, Square, High-Oblique Trapezoid, Oval, and Round). On round and oval stadiums, the barrier smoothly follows the curved inner bowl perimeter arc.

#### T5.2 7 Authentic Architectural Barrier Typologies
1. **`red_brick` (Traditional English Low Brick Wall)**:
   - Low red brick parapet with weathered mortar joints and light grey stone coping.
   - Sits lower than spectator eye-level, classic 19th/20th-century British football ground aesthetic.
2. **`steel_chain` (South American Pitch Perimeter Fence)**:
   - Standard-height galvanized steel wire mesh chain-link fence mounted on tubular metal stanchions.
   - Iconic South American domestic football aesthetic preventing pitch incursions while maintaining spectator visibility.
3. **`high_steel_chain` (High-Protection Security Fence)**:
   - Taller galvanized chain-link security fence with reinforced diagonal support bracing and vertical tension cables.
4. **`anti_barristas` (Towering Anti-Invasion Security Barrier)**:
   - Maximum security perimeter fence featuring an outward-angled steel cantilever overhanging the pitch, topped with razor/barbed wire coils to prevent pitch invasion.
5. **`heavy_timber` (Rustic Decorative Timber Post-and-Rail)**:
   - Low decorative barrier constructed from thick dark-stained timber balks, cross-rails, and wrought-iron carriage bolts (same height profile as the red brick wall, tailored for grassroots, potrero, and historic heritage grounds).
6. **`functional_concrete` (Monolithic Brutalist Concrete Barrier)**:
   - Purely functional, low poured-concrete retaining wall with chamfered top edges, expansion joint gaps, and painted safety markings.
7. **`led_ribbon` (Modern Digital Sponsor Ribbon Board)**:
   - Modern illuminated LED display boards running continuously along the pitchside boundary with glowing, scrolling commercial sponsor advertisements and neon club graphics.

#### T5.3 Step 2 Stadium Creator UI Integration
- In `StadiumCreatorModal.tsx` Step 2:
  - Add a dedicated **"PITCHSIDE SAFETY FENCE / BARRIER"** section with clean visual selector chips for all 7 styles.
  - Provide live WYSIWYG canvas updates so users immediately see the chosen barrier in front of the active stand.

#### T5.4 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT5_TierSafetyFenceAndBarriers.test.ts`:
  - Verifies all 7 barrier types render correctly in touchline, goal-end, corner, and coliseum bowl projections.
  - Validates correct radial curved arc rendering on Round and Oval stadiums.

---

### Phase T6: The 5-Grade "Architectural Grade" System & 3-Element Color Palette Engine [COMPLETED]
*Priority: Deprecate Obsolete Material Options, Unified 5 Architectural Grades (Municipal, Brutalist, Industrial, Victorian, Modern), Inherent Seat Styles & 3 Customization Element Groups per Grade with Controlled Preset Palette (No RGB Picker)*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/skyCamRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT6_ArchitecturalGradeAndColorPalette.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T6.1 Deprecation & Removal of Obsolete Stand Options
- In Step 2 of `StadiumCreatorModal.tsx`:
  - **Permanently Remove**: `"32 bit grandstand material (b3.1)"`
  - **Permanently Remove**: `"solid underseat decking"` (removed entirely)
  - **Permanently Remove**: `"rear delimitation wall"`
- Replace all three obsolete controls with a single, comprehensive, high-fidelity option: **"ARCHITECTURAL GRADE"**.

#### T6.2 5 Comprehensive Architectural Grades
The selected Architectural Grade defines the complete material and structural constitution of the stand: the under-seat decking, stairs, vomitories, tier risers, support structures holding higher tiers, perimeter finishes, and inherent seat styles.

1. **Tier 1: Municipal Style (`municipal`)**:
   - **Under-Seat Structure & Stairs**: Completely hollow, open scaffolding framework of galvanized steel pipe tubing and diagonal cross-braces. Basic metal/wooden ladder stairs; raw dirt, gravel, or apron terrain visible beneath spectators' feet.
   - **Stand Elements**: Spectators sit on long, continuous, unpolished timber planks (*tablones*) bolted directly to the metal pipe frames (no bucket seats). Perimeter enclosed by simple chain-link wire or corrugated tin sheets. No roof (open to the elements).
2. **Tier 2: Brutalist Style (`brutalist`)**:
   - **Under-Seat Structure & Stairs**: Thick, solid monolithic poured concrete blocks. Heavy concrete steps with board-marked wood grain textures cast into the cement.
   - **Stand Elements**: Seating tiers are solid concrete ledges with blocky, geometric dividers. Handrails are thick inset concrete slabs or heavy unpolished iron bars. The entire stand feels like a singular carved fortress.
3. **Tier 3: Industrial Style (`industrial`)**:
   - **Under-Seat Structure & Stairs**: Massive exposed structural steel I-beams, heavy columns, and dark brick supporting walls. Industrial steel grating or thick checkered metal plate stairs with visible rivets and heavy welding joints.
   - **Stand Elements**: Highly visible mechanical reinforcements, exposed overhead piping networks, and thick heavy timber beams holding up platforms. Seating consists of weathered wood benches on steel frames or rugged metal flip-seats, surrounded by dark brickwork and industrial-grade mesh railings.
4. **Tier 4: Victorian Style (`victorian`)**:
   - **Under-Seat Structure & Stairs**: Ornate red brick masonry combined with decorative cast-iron arches and pillars. Stairs feature polished hardwood or stone treads paired with intricately twisted cast-iron balustrades and handrails.
   - **Stand Elements**: Asymmetrical massing, classical proportions, carved wooden vergeboards (gingerbread trim) along gables. Seating consists of polished wooden benches or classical cast-iron theater chairs, accented by ornamental crests and decorative brick detailing on tier facings.
5. **Tier 5: Modern Style (`modern`)**:
   - **Under-Seat Structure & Stairs**: Sleek hidden structural skeletons covered by smooth composite panels, brushed titanium, and flawless architectural glass. Seamless terrazzo or illuminated glass stair treads with floating chrome handrails.
   - **Stand Elements**: Vibrant LED ribbon displays built directly into tier faces, glossy steel accents, and reflective glass barriers. Seating consists of high-end individual ergonomic bucket seats with premium finishes and controlled architectural lighting glow.

#### T6.3 Inherent Seat Style Architecture & Step 5 Refactor
- **Inherent Seat Generation**:
  - The seat style (timber tablones, concrete ledges, industrial flip-seats, classical theater chairs, modern luxury bucket seats) is now inherently defined by the selected **Architectural Grade**.
- **Step 5 (Seat Editor) Streamlining**:
  - Remove seat type/style selection from Step 5.
  - Step 5 is preserved exclusively for seat colors, club crest mosaics, and livery patterns (solid, checkered, striped, gradient, dual-tone).

#### T6.4 3 Customization Element Groups Per Grade with 8-Color Palette
- Each of the 5 Architectural Grades organizes all of its visual components into **3 customizable element groups**:
  - **Grade 1 (Municipal)**:
    - *Element 1 (Scaffold Framing)*: Steel pipe tubing & diagonal braces
    - *Element 2 (Decks & Ladders)*: Scaffold planks & ladder rungs
    - *Element 3 (Tablones & Enclosures)*: Wooden bench planks & corrugated tin sheets
  - **Grade 2 (Brutalist)**:
    - *Element 1 (Superstructure)*: Poured concrete tier slabs & retaining walls
    - *Element 2 (Stairs & Aisles)*: Heavy block concrete steps & vomitory aisles
    - *Element 3 (Ledges & Dividers)*: Seating ledges, concrete dividers & slab handrails
  - **Grade 3 (Industrial)**:
    - *Element 1 (Masonry & Foundation)*: Dark brick supporting walls & foundation piers
    - *Element 2 (Steelwork & Pipes)*: Steel I-beams, overhead piping & mesh railings
    - *Element 3 (Decking & Benches)*: Heavy timber beams, checkered metal stairs & wood benches
  - **Grade 4 (Victorian)**:
    - *Element 1 (Brick Facades)*: Ornate red brick masonry & arch pillars
    - *Element 2 (Cast Iron)*: Twisted iron balustrades, ornamental arches & crest detailing
    - *Element 3 (Woodwork & Benches)*: Gingerbread vergeboards, hardwood stairs & theater chairs
  - **Grade 5 (Modern)**:
    - *Element 1 (Composite Panels)*: Smooth exterior composite cladding & tier fascia panels
    - *Element 2 (Stairs & Glass)*: Terrazzo/glass stair treads & floating chrome handrails
    - *Element 3 (High-Tech Accents)*: Ergonomic bucket seat shells & LED ribbon display housings
- **Controlled 8-Color Palette (Strictly No Free RGB Picker)**:
  - Each element group can be assigned one of 8 clean choices:
    1. `raw` (Natural unpainted material: galvanized steel, poured grey cement, dark red brick, varnished mahogany, brushed titanium)
    2. `red`
    3. `blue`
    4. `white`
    5. `black`
    6. `yellow`
    7. `orange`
    8. `green`

#### T6.5 Seat Level Ranking & Municipal Rating Penalty Gate
- **Seat Level Classification (Levels 1 to 5 + Level 6 VIP)**:
  - Grandstand seats are ranked into architectural levels corresponding to their construction grade:
    - **Level 1 (Municipal)**: Raw timber planks (*tablones*) bolted to metal pipe scaffolding.
    - **Level 2 (Brutalist)**: Solid poured concrete ledges with blocky dividers.
    - **Level 3 (Industrial)**: Weathered timber benches or rugged metal flip-seats.
    - **Level 4 (Victorian)**: Polished hardwood benches or ornate cast-iron theater chairs.
    - **Level 5 (Modern)**: Ergonomic contoured individual bucket seats with premium gloss finishes.
    - **Level 6 (VIP Hospitality)**: Plush leather armchairs, executive buckets, and champagne barstools (handled in Phase T9).
- **Municipal Stadium Rating Drop Penalty**:
  - Having even a **single stand or tier** built with **Tier 1 (Municipal Style)** immediately drops the overall stadium certification / qualification rating to the lowest possible rank (`municipal`), regardless of stadium size or overall capacity.
  - An open ground with "No Stand" (*no_stand*) retains a higher natural community / heritage rating than a Municipal-grade stand (even a 4-tier or Big Wall municipal structure).
  - Municipal stands still contribute raw spectator attendance capacity, but penalize prestige and matchday ticket pricing.

#### T6.6 Universal 4-Shape Support
- Full rendering engine integration across Rectangular, Square, High-Oblique Trapezoid, Oval, and Round stadium bowls.
- On Round and Oval stadiums, materials, textures, and custom colors wrap smoothly along concentric radial curves.

#### T6.7 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT6_ArchitecturalGradeAndColorPalette.test.ts`:
  - Validates all 5 architectural grades, their inherent seat styles, 3-element color customization, seat ranking levels, and the Municipal rating penalty gate.
  - Verifies zero regressions across all existing stadium test suites.

---

### Phase T7: VIP Building Multi-Floor Suite Elevator (1–5 Floors) & Integrated Pitchside Stand [COMPLETED & VERIFIED]
*Priority: Interactive Numeric 1–5 Floors Stepper, "STAND" Lower Terrace Pitchside Wall Option & Customization*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/skyCamRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT7_VIPBuildingFloorsAndLowerStand.test.ts`*

#### T7.1 Numeric Floor Stepper (1 to 5 Stacked Floors)
- Replace static 3/4 floor buttons with an interactive numeric elevator counter:
  - `[-]` `[Count]` `[+]` allowing 1, 2, 3, 4, or 5 stacked floors of luxury hospitality suites.
  - Floor height scaling: suites stack vertically with illuminated glass bays, gold balustrades, and interior executive silhouettes.
  - Capacity calculation: each VIP suite floor contributes premium VIP capacity (~1,100 per floor), contributing to VIP status.

#### T7.2 "STAND" Pitchside Terrace Option (Integrated Lower Stand)
- Add a dedicated toggle option: **"STAND"** `[ON / OFF]` (default: ON).
- When active:
  - Renders an integrated pitch-level terrace below the luxury suites tower (smaller than a regular wall stand, but functioning similarly).
  - **Size Selector**:
    - `small`: Compact pitchside terrace (3 rows, ~25px depth) with dugouts and tunnel portal.
    - `medium`: Expanded terrace (5 rows, ~40px depth) with enhanced supporter seating.
    - `big`: Grand lower terrace (8 rows, ~60px depth) creating a commanding presence.
  - Keeps the signature VIP building architectural identity (players tunnel portal, acrylic canopy dugouts, sponsor murals) scaled proportionally.
- **Dedicated Lower Stand Customization**:
  - **Materials**: `concrete`, `brick`, `metal`.
  - **Barriers**: `glass_balustrade`, `metal_handrail`, `anti_surge_barrier`.
  - **Seats**: `leather_armchair`, `padded_bucket`, `classic_shell`.

#### T7.3 Aerial SkyCam & 32-Bit Synchronization
- In `skyCamRenderer.ts`: Update `drawAerialVipBuilding` to reflect active floor count in roof deck height and render the chosen lower stand terrace along the pitch aperture.

---

### Phase T8: "Stacked Wall" Modern Coliseum Architecture (Metropolitano & Tottenham Style) [COMPLETED & VERIFIED]
*Priority: Restrict VIP Building on Round/Oval, Introduce "Stacked Wall" Double-Decker Coliseums with Tottenham Arched Crown*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/skyCamRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT8_StackedWallArchitecture.test.ts`*

#### T8.1 Shape Guard & "Stacked Wall" Typology
- On **Round** and **Oval** stadiums, the flat "VIP Building" is disabled (as modern circular coliseums have continuous curvature).
- Instead, introduce the dedicated coliseum stand typology: **"Stacked Wall"** (`stacked_wall`):
  - Inspired by modern bowl cathedrals like Cívitas Metropolitano and Tottenham Hotspur Stadium South Stand.
  - Features a massive continuous lower wall stand combined with an integrated soaring upper wall deck.
  - Achieves the **highest capacity possible** in the entire game engine (up to 24,000+ spectators on a single stand).

#### T8.2 Double-Decker Wall Geometry & Upper Tier Scaling
- **Lower Tier**: Monumental continuous wall stand (sizes: `small`, `medium`, `big`).
- **Mezzanine Balcony**: Heavy structural concrete cantilever fascia separating lower and upper walls, with illuminated safety glass ribbons and vomitory tunnels.
- **Upper Wall Deck**:
  - Sizeable independently from `small` (6 rows) to `medium` (11 rows) to `big` (16 rows) upper wall.
  - Continuous steep rake following the curved coliseum bowl geometry.

#### T8.3 Tottenham Hotspur Stadium Arched Crown Profile (North & South Ends)
- When a `wall` or `stacked_wall` is placed on the **North or South** end of a round or oval stadium:
  - Render the soaring **arched/domed crown profile** (as shown in Tottenham Hotspur Stadium South Stand reference photo `/public/assets/aistudio/image_e307caf1.png`).
  - The upper rim gently arches upward toward the center, filling the full vertical headspace beneath spoke-wheel tension roof canopies or open skies.
  - Flanked by high-resolution LED miter scoreboards and radial vomitories.

---

### Phase T9: VIP Hospitality Tier, Executive Amenities & FIFA "World" Category Certification [PLANNED]
*Priority: VIP Seats for Tiered & Stacked Wall, VIP Zone Buffet Lounge, Transmission Press Box & FIFA "WORLD" Status Gate*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT9_VIPHospitalityAndWorldTier.test.ts`*

#### T9.1 VIP Seats Option on Tiered Grandstands & Grade 3+ Prerequisite Gate
- **VIP Architectural Level & Classification**:
  - A VIP tier counts as **Tier 6 (VIP / Luxury Hospitality)** in the architectural grade hierarchy, soaring above standard stand finishes.
  - VIP seats are tracked and calculated separately from standard seats for stadium qualification, attendance tallies, and matchday ticket revenue.
- **Architectural Grade 3+ (Industrial or Superior) Prerequisite Gate**:
  - A VIP tier can **ONLY** be added to grandstands with an Architectural Grade of **Tier 3 (Industrial Style) or higher** (Industrial, Victorian, Modern).
  - Stands with **Tier 1 (Municipal)** or **Tier 2 (Brutalist)** styles are strictly prohibited from adding a VIP tier due to infrastructural incompatibility.
- **Tier Placement & Maximum Tier Clamping**:
  - Add **"VIP Seats"** toggle `[ON / OFF]` to eligible Tiered stands:
    - When ON: allocates a dedicated luxury hospitality terrace at the **2nd level** (or allows choosing between 2nd or 3rd level when 3 total tiers exist).
    - When VIP Seats are enabled on a tiered stand, maximum tier count is clamped to **3 tiers** (instead of 4) to maintain structural realism and hospitality sightlines.
    - VIP tier is physically more compact with spacious executive seating.

#### T9.2 VIP Seats Option on "Stacked Wall" (Round & Oval Bowls)
- On `stacked_wall` stands with Architectural Grade 3+ (Industrial, Victorian, Modern):
  - Enabling VIP Seats inserts an executive hospitality mezzanine balcony directly above the lower wall stand (replacing the standard upper wall with an elite Level 6 viewing tier).
  - Forbidden on Municipal or Brutalist stacked walls.

#### T9.3 VIP Stand Customization Suite
- **VIP Density**: Ultra-spacious, far lower density than standard "reduced" (wide armchair spacing with private side tables).
- **"VIP Zone"** `[ON / OFF]`:
  - Adds an executive indoor lounge and buffet pavilion embedded in the middle concourse of the stand.
  - Reduces raw standing capacity slightly (~5%), while rendering an illuminated glass-enclosed hospitality suite portal with amber indoor lighting.
- **"Transmission Area" (Press & Broadcast Box)** `[ON / OFF]`:
  - Elevated media commentary and TV broadcast box positioned at the center-line.
  - Features dark-tinted observation bay windows, TV camera mounts, and rooftop broadcast antenna fixtures.
- **3 Exclusive VIP Seat Types & Materials**:
  - `plush_armchair`: Burgundy velvet or club-color leather armchairs.
  - `executive_bucket`: Premium quilted composite automotive-style seats.
  - `champagne_bar_stool`: Elevated chrome barstools with marble drink ledges.

#### T9.4 FIFA "WORLD" Category Certification Gate
- To achieve prestigious **"WORLD"** Tier (5-Star Elite FIFA Status), a stadium must fulfill all three architectural criteria:
  1. At least one stand with active **VIP Seats**.
  2. Active **Transmission Area** (Press & Broadcast Suite).
  3. Active **VIP Zone** (Executive Hospitality & Amenities).
- Displays animated gold "WORLD TIER" crest in Stadium Creator and Pre-Match HUD.

---

### Phase T10: New 4-Corner Architecture Taxonomy ("Round", "Square/Giant", "Tower", "No Stand") [COMPLETED & VERIFIED]
*Priority: 4 Clean Distinct Architectural Options for All 4 Corners Independently*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT10_CornerTaxonomyAndArchitectures.test.ts`*

#### T10.1 4-Corner Typology Taxonomy
- Replace legacy corner types with 4 clean, distinct architectural options selectable independently:
  1. **"Round" (`round` / `rounded`)**: Sweeping curved multi-tier corner approach (up to 4 tiers) uniting stands in a smooth continuous round arc (inspired by Camp Nou & Bombonera western corners).
  2. **"Square" / "Giant" (`square` / `giant`)**: Massive towering corner stand inspired by St. James' Park corner (towering high rake, like "The Wall" philosophy for corners, massive continuous rake towering over the pitch).
  3. **"Tower" (`tower`)**: Flanking vertical VIP tower with stacked hospitality suites/boxes, inspired by La Bombonera eastern corner towers.
  4. **"No Stand" (`none` / `no_stand`)**: Open corner with low perimeter barrier, ground-matched substrate, and direct contextual backdrop reveal with bespoke corner landmarks.

#### T10.2 Mathematical Corner Geometry
- Radial concentric sweeping arcs for "Round" corners.
- Monolithic high-rake polygon mapping for "Giant" corners.
- Vertical rectangular tower geometry with tiered balconies for "Tower" corners.
- 1 vertical stair per corner tier integrated into unified material system.

---

### Phase T11: Unified Grandstand Stairs & 3-Vomitory Tunnel Architectures [COMPLETED & VERIFIED]
*Priority: Realistic Crowd Circulation, Exactly 2 Vertical Stairs Per Tier with Staggering & 3 Vomitory Tunnel Architectures*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT11_UnifiedStairsAndVomitories.test.ts`*

#### T11.1 Unified Grandstand Stairs with Inter-Tier Staggering
- **Exactly 2 Vertical Gangway Stairs Per Standard Tier**:
  - Enforce exactly 2 vertical gangway stairs cutting through each standard tiered grandstand deck across both Touchline (West/East) and Goal-End (North/South) stands.
  - Replaces legacy 3-stair patterns with consistent, mathematically balanced circulation.
- **Inter-Tier Staggering Engineering**:
  - Consecutive tiers stagger their stair alignments (e.g. Tier 0 at `[0.28, 0.72]` vs Tier 1 at `[0.38, 0.62]`; Tier 2 at `[0.24, 0.76]` vs Tier 3 at `[0.34, 0.66]`).
  - Simulates authentic stadium civil engineering: avoids structural alignment weaknesses and upper-deck crowd choke points.
  - High-visibility hazard yellow nosing (`#facc15`), dark concrete/steel channels (`#0f172a`), and seat exclusion preventing supporter sprite clipping.

#### T11.2 3 Distinct Vomitory / Entrance Architectures
- **1. `rear_level` ("Mid-Deck Direct Concourse")**:
  - Centered mid-tier portal void opening directly onto the cross-aisle gangway with balanced crowd dispersion.
  - Concrete lintel, dark subterranean cavern shadow, alternating steps, side safety handrails, and green emergency exit beacon.
- **2. `tunnel_above` ("Upper Concourse Descent")**:
  - Elevated vomitory portal situated near the top/rear rim of the tier.
  - Descending steps with inward gradient shadows leading spectators down into the rows.
  - Prominent upper illuminated exit beacon mounted on reinforced concrete lintel.
- **3. `tunnel_below` ("Pitchside Inset Ascent")**:
  - Sub-deck vomitory portal inset at the front lip near the pitch apron / perimeter barrier.
  - Ascending steps with yellow hazard striping and threshold safety plating rising into the tier.
  - Safety grab-bars along the mouth jambs.

#### T11.3 Step 2 Stadium Creator UI Integration
- Added dedicated **"VOMITORY & CIRCULATION ARCHITECTURE (T11)"** section in Step 2 of `StadiumCreatorModal.tsx`.
- Interactive 3-way visual architecture selector (`MID-DECK DIRECT`, `UPPER DESCENT`, `PITCHSIDE ASCENT`) with live access flow indicators.
- "⚡ APPLY TO ALL" button propagating active vomitory architecture across all stands.
- Real-time WYSIWYG canvas updates reflecting portal positions and stair staggering.

#### T11.4 Vitest Test Suite & Regression Verification
- Comprehensive unit test suite in `src/game/__tests__/phaseT11_UnifiedStairsAndVomitories.test.ts` verifying stair counts, inter-tier staggering, all 3 vomitory architectures, and zero regressions.

---

### Phase T12: Master Corner Geometry & Northern Perspective Union Overhaul [COMPLETED & VERIFIED]
*Priority: Northern Angle Alignment (NW/NE Corners Matching North Stand Rake), Monumental Giant Corner Scaling (~180–240px Depth) & Flush Structural Bonding*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/pitchDimensions.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT12_CornerGeometryAndNorthernUnion.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T12.1 Northern Corner Perspective Union (NW & NE Corners)
- **High-Oblique Perspective Rake Alignment**:
  - The North Goal-End Grandstand sits in high-oblique perspective with a pronounced northern rake taper (`northTaperX`), narrowing as it recedes into the distance. Currently, the NW and NE corner miter pavilions maintain static orthogonal angles, leaving a visible disconnect or jagged gap where they meet the North Stand.
- **Transitional Quadrilateral Shear Geometry**:
  - As the NW and NE corners approach the North Stand, their deck coping, seating row lines, riser steps, and balustrade smoothly shear to match the exact angle of the North Stand.
  - As they approach the West and East touchline stands, they smoothly return to the perpendicular 90° touchline alignment.
  - Continuous flush structural weld with zero gap, zero stepping offset, and seamless tier-to-tier alignment.

#### T12.2 Monumental "Giant Corner" Architecture & Depth Scaling
- **Authentic Monumental Scale**:
  - Elevate the "Giant" (`square` / `giant`) corner stand from an undersized corner box into a true soaring architectural colossus (inspired by St. James' Park's monumental corner terraces).
- **Physical Depth Scaling**:
  - Expand footprint from ~70px to a monumental **180px–240px depth**, matching the commanding scale of adjacent Big Wall stands and 3-to-4 tier grandstands.
- **Monolithic Continuous Rake**:
  - Continuous steep stepped terrace ("The Wall" corner philosophy) packed with authentic stehplatz density, anti-surge crash barriers on alternating rows, and towering rear parapet coping.
- **Structural Edge-to-Edge Bonding**:
  - Massive polygon hull that physically welds the touchline stand to the goal-end stand without awkward gaps or stepping seams.

#### T12.3 Corner Stair & Vomitory Circulation Polish
- Unified gangway stair running diagonally through the corner with safety yellow hazard nosing and structural handrails aligned with the blended perspective.
- Corner vomitory entrance portal cleanly recessed into the miter concourse.

#### T12.4 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT12_CornerGeometryAndNorthernUnion.test.ts` verifying perspective angle blending on NW/NE corners, depth scaling on Giant corners, and zero regressions.

---

### Phase T13: Round/Oval Bowl Safety Barrier Invariance & 50% Fluid Rounded Corner Roofs [COMPLETED & VERIFIED]
*Priority: Fix North Bend Barrier Escalation on Round/Oval, Concentric Inner Rim Invariance Across 360°, Replace Sharp 50% Triangle Roofs with Fluid Rounded Canopies*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/skyCamRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT13_RoundOvalBarrierAndFluidRoofs.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T13.1 Round & Oval Pitchside Barrier Inner-Rim Invariance
- **Elimination of North Bend Barrier Escalation**:
  - Defect Fixed: On `round` and `oval` stadiums in `drawContinuousColiseumBowl` and `drawPitchsideSafetyBarrier`, the barrier path currently suffers from coordinate distortion near the northern bend—crookedly angling upward and "escalating" into the spectator seating tiers rather than cleanly bounding the pitch apron.
- **Pure 360° Concentric Inner-Rim Tracking**:
  - The barrier is strictly locked to the outer boundary of the pitch apron / inner curb of Tier 1 (the lowest seating deck).
  - On `round` stadiums: Full continuous circular arc `ctx.arc(cx, cy, innerRimRadius, 0, Math.PI * 2)`.
  - On `oval` stadiums: Symmetrical straight touchlines united with smooth semicircular goal-bend horseshoe curves.
  - Ensures all 7 barrier typologies (`red_brick`, `steel_chain`, `high_steel_chain`, `anti_barristas`, `heavy_timber`, `functional_concrete`, `led_ribbon`) hug the pitch apron boundary with 100% geometric invariance across all 360°, never clipping or escalating into seating rows.

#### T13.2 50% Match-Default Fluid Rounded Corner Roof Canopies
- **Elimination of Sharp Triangular Corner Wedges**:
  - Defect Fixed: In the default match camera view with 50% partial roof cutaway (`RoofCutawayMode === 'partial'`), the corner roof junction currently displays a sharp, awkward triangular wedge that looks visually disjointed.
- **Fluid Sweeping Rounded Canopy Arc**:
  - Replace the sharp triangular corner cut with a smooth, fluid rounded corner roof arc that harmoniously unifies the touchline (West/East) cantilever roof with the goal-end (North/South) canopy.
  - Curved cantilever fascia with concentric soffit shadow and radial box-truss ribs.
  - Seamlessly supports all 4 roof styles (Cantilever Truss, Barrel Vault, Tensile Cable, Halo Space-Frame) and all materials (Corrugated Steel, ETFE Cushion, Pre-Cast Concrete, Anodized Aluminum).

#### T13.3 Live Stadium Creator Step 2 WYSIWYG & Pitch View Verification
- Live preview updates in real time across all 4 shapes and cutaway modes.

#### T13.4 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT13_RoundOvalBarrierAndFluidRoofs.test.ts` validating barrier radius invariance on round/oval bowls and smooth corner roof curvature.

---

### Hotfix Phase T13B: South Corner Geometry, Vertical Perspective Alignment & Black Circle Elimination [COMPLETED & VERIFIED]
*Priority: Fix Distorted SW/SE Corner Angles, Align with South Stand Vertical Perspective, Eliminate Dark Circular Blobs/Bulges & Orthogonal Structural Bonding*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT13B_SouthCornerVerticalAlignment.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T13B.1 South Corner Geometry & Vertical Perspective Alignment (SW & SE Corners)
- **Elimination of Distorted Diagonal Angles on Southern Corners**:
  - *Defect Fixed*: While the northern corners (NW and NE) correctly shear inward to match the deep perspective rake angle of the North Stand, the southern corners (SW and SE) currently inherit an unnatural diagonal/circular angle that looks warped and visually disjointed.
  - *Root Cause*: The South Stand in 2.5D oblique perspective is positioned in the immediate foreground and features straight, orthogonal front plinths and clean vertical fascias rather than the steep rake of the northern stand.
  - *Architectural Alignment*: SW and SE corner pavilions adopt a clean, vertical/orthogonal perspective alignment along the southern goal boundary, bridging seamlessly into the South Stand's front plinth and rear facade without artificial angular distortion.

#### T13B.2 Elimination of Dark Circular Blob / "Black Circle" Void Artifacts
- **Elimination of Bulging Circular Arc & Plinth Shadows**:
  - *Defect Fixed*: In `drawRoundCornerStand` and `drawGiantCornerStand`, the base plinth and outer drop shadow previously traced an unconstrained radial ellipse or sheared quadrant sweep, producing an unsightly dark circular blob ("black circle") protruding awkwardly into the concourse ground.
  - *Clean Orthogonal Base Foundations*:
    - Replaced the bulging circular pie-slice plinth on SW/SE corners with an authentic vertical squircle fillet ($p=4$ super-ellipse) and structural foundation plinth aligned flush with the South Stand perimeter.
    - Constrained shadow projection to the exterior perimeter wall boundaries so it never generates a circular dark spot or clips the concourse ground.
    - Ensure tier fascias, vomitory portals, gangway stairs, and perimeter stone copings follow the vertical orientation smoothly into the South Stand.

#### T13B.3 Step 2 Live WYSIWYG & Pitch View Verification Across All 4 Corner Typologies
- Verified that Round Sweeping, Giant Soaring Wall, VIP Tower, and No Stand/Open corners on the SW and SE quadrants connect cleanly to the South Stand across all tiers (1–4), wall terrace depths, and architectural grades (Municipal, Brutalist, Industrial, Victorian, Modern).

#### T13B.4 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT13B_SouthCornerVerticalAlignment.test.ts` verifying:
  - SW and SE corner boundary vertices align vertically with the South Stand touchline and goal-line depth extents.
  - Elimination of circular distortion and dark blob artifacts at the southern quadrants.
  - Zero regressions across NW/NE northern shear geometry, coliseum bowl barriers, and fluid rounded corner roof canopies (109 passing tests).

---

### Hotfix Phase T13C: Specification-Driven Independent Corner Sizing & Southern Vertical Perspective Overhaul [COMPLETED & VERIFIED]
*Priority: Specification-Driven Corner Sizing (Tiers, Small/Med/Large, Giant), Exact Connection to Equal Adjacent Stands, Smooth Vertical Look on SW/SE Corners & Pristine Preservation of Northern Angles*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT13C_IndependentCornerSizingAndSouthPerspective.test.ts`, `src/game/__tests__/phaseT13B_SouthCornerVerticalAlignment.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T13C.1 Specification-Driven Independent Corner Sizing Engine
- **Decoupling Corner Dimensions from Adjacent Stands**:
  - *Previous Defect*: In `drawCornerQuadrantStands`, `getCornerStandDepths` unconditionally forced the corner stand's depth on the X and Y axes to equal the adjacent touchline and goal-end stands' dynamic depths (`fallbackX`, `fallbackY`), ignoring the corner stand's own configured `tierCount`, tier sizing (`small`, `medium`, `large`), and `wallSize`.
  - *Specification-Driven Architecture*:
    - The corner stand computes its own intrinsic physical depth via `calculateDynamicStandDepth(cornerStand, shape)` based on its own type (`tiered`, `giant`, `tower`, `none`), tier count (1 to 4 tiers), individual tier dimensions (small: 75px, medium: 145/205px, large: 285px), and wall size (small: 120px, medium: 180px, large: 240px).
    - If a corner stand has different specifications from its adjacent stands (e.g. 1-tier small corner adjacent to 3-tier medium stands, or a 4-tier large corner adjacent to 2-tier medium stands), the corner independently scales to its own exact specification size rather than being clamped or overridden.
- **Exact Pixel-Perfect Matching on Identical Configurations**:
  - Implemented `isStandConfigurationEqual(a?: StandConfig, b?: StandConfig)` in `src/types/stadium.ts` to detect identical configurations (matching `tierCount` and individual tier sizes for tiered stands; matching `wallSize` for wall and giant stands).
  - When the corner stand and adjacent stand share the same configuration (e.g. 3 tiers all medium, or 2 tiers all large), `getCornerStandDepths` guarantees 100% exact numerical match with zero step-off or gap.
- **Connecting Transition Return Sidewalls (`drawCornerTransitionSidewall`)**:
  - When the corner and adjacent stand have different depths, an authentic architectural masonry return sidewall is rendered at the touchline or goal interface:
    - 8px structural dark shadow foundation (`#0f172a`).
    - 6px primary wall body matching the taller stand's architectural grade palette (`palette.primaryWall`).
    - 2px stone coping cap (`#cbd5e1`) sealing the junction between mismatched tier decks cleanly without visible floating voids or exposed gaps.

#### T13C.2 Southern Corners Vertical Perspective & Smooth Curvature Overhaul (SW & SE)
- **Elimination of the Weird 4th-Power Squircle Bulge**:
  - *Previous Defect*: The $p=4$ super-ellipse squircle (`denom = (cos^4 + sin^4)^0.25`) introduced in T13B flared outward along the 45° diagonal by 19% ($1/0.84 = 1.19$), creating an unnatural elbow bend and distorted row spacing on the southern corners.
  - *Smooth Vertical Perspective Arc Parameterization*:
    - Replaced the $p=4$ squircle in `getShearedCornerPoint` with a smooth, continuous elliptical arc parameterization:
      - **Corner SW** (South-to-West): For $\phi \in [0, \pi/2]$, $fx = \sin(\phi)$, $fy = \cos(\phi)$. This delivers an exact horizontal tangent at the South stand boundary ($dy/d\phi = -\sin(0) = 0$) and an exact vertical tangent at the West touchline ($dx/d\phi = \cos(\pi/2) = 0$).
      - **Corner SE** (East-to-South): For $\phi \in [0, \pi/2]$, $fx = \cos(\phi)$, $fy = \sin(\phi)$. This delivers an exact vertical tangent at the East touchline ($dx/d\phi = -\sin(0) = 0$) and an exact horizontal tangent at the South stand ($dy/d\phi = \cos(\pi/2) = 0$).
    - Eliminates the unnatural diagonal bulge, ensuring seating rows, vomitory portals, and gangway stairs curve smoothly with natural stadium perspective.
- **Giant Corner Vertical Miter Knee Alignment**:
  - For `drawGiantCornerStand`, outer miter walls on southern corners follow vertical-perspective orthogonal pathways connecting cleanly into the South Stand's front plinth without diagonal distortion.

#### T13C.3 Strict Preservation of Northern Corner Geometry (NW & NE Corners)
- **User-Approved Northern Angle Invariance**:
  - As explicitly requested, northern corners (NW and NE) preserve their existing high-oblique perspective shear geometry (`pNorthShearGoal`, `pNorthShearTouch`, `northTaperX`) completely intact without modification.
  - Only their sizing is updated to respect independent corner specifications and equality matching.

#### T13C.4 Vitest Test Suite & Regression Verification
- Dedicated test suite in `src/game/__tests__/phaseT13C_IndependentCornerSizingAndSouthPerspective.test.ts` (14 tests) and updated `phaseT13B_SouthCornerVerticalAlignment.test.ts` (10 tests) validating:
  1. Specification-dependent corner depth calculation across 1–4 tiers, small/medium/large tiers, and giant wall sizes.
  2. Exact pixel matching when corner and adjacent stands have identical configurations.
  3. Proper return transition sidewall execution when configurations differ.
  4. Strictly vertical touchline tangents and horizontal South tangents on SW and SE corners.
  5. Elimination of the 19% diagonal squircle bulge.
  6. Pristine preservation of NW/NE northern perspective shear angles.
  7. Flawless quad-corner stadium rendering across both rectangular and square venue shapes.

---

### Hotfix Phase T13D: Unified Perimeter Roof Architecture, Corner Canopy Bonding & 50% Upper-Tier Invariance [COMPLETED & VERIFIED]
*Priority: Unify Roof Canopy Scale Around Stadium Perimeter, Eliminate West/East Overhang Disproportion, Smooth Corner Bonding with 0px Step, Strict <= 50% Upper-Tier Match Cutaway Invariance & Rich Detailing Across All Stands*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT13D_UnifiedPerimeterRoofCanopy.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T13D.1 Unified Perimeter Roof Scale & Lateral Alignment
- **Elimination of West/East Grandstand Roof Inflation**:
  - *Previous Defect*: In `drawSingleTouchlineStand`, `roofW = w + latSouth` artificially added 35px to touchline stand width and shifted West stand canopy by `x - latSouth`. Consequently, the West and East roofs appeared over twice as massive as the North and South roofs (~55px–70px projection vs ~37px on goal ends), completely disrupting architectural symmetry and creating an ~18px lateral step where the roof met the corner pavilions.
  - *Unified Symmetrical Bounds*:
    - Normalized touchline stand roof boundaries to `roofX = x` and `roofW = w`, matching the actual stand physical footprint.
    - Normalized goal-end stand roof boundaries in `drawGoalEndStand` to `roofLeft = x` and `roofWidth = w`.
    - Result: Roof canopies now maintain balanced, proportional depths (~28px–38px) across all 4 sides of rectangular and square stadiums when configurations are equal.

#### T13D.2 Strict 50% Upper-Tier Match Cutaway Invariance
- **Never Covering More than 50% of the Upper Tier**:
  - *User Requirement*: In default match mode with 50% roof cutaway (`RoofCutawayMode === 'partial'`), the roof canopy must never obscure more than 50% of the upper tier rows, ensuring upper tier spectators, vomitories, stairs, and balustrades remain clearly visible.
  - *Engine Formula in `getUnifiedRoofOverhangDepth`*:
    - Computes active upper tier depth: `upperTierDepth = deckDepth / tierCount` for tiered stands (or `deckDepth * 0.35` for wall stands).
    - Strictly caps the canopy projection into the deck at `Math.floor(upperTierDepth * 0.45)` (strictly $\le 45\%$, never $> 50\%$).
    - Supports stand-specific modifiers (`small`: $0.80\times$, `large`: $1.10\times$) while guaranteeing the upper tier visibility constraint is never violated.
    - Returns 0 for `hidden` mode and full projection (~94%) for `full` coverage mode.

#### T13D.3 Seamless Corner Canopy Bonding & $C^1$ Tangent Continuity
- **Zero-Discrepancy Structural Weld**:
  - Corner roof canopy points `rT` (touchline interface) and `rG` (goal interface) use `getUnifiedRoofOverhangDepth` with the adjacent stands' depth metrics to compute the exact coordinate of the adjacent stand's roof leading edge.
  - Matches the West/East and North/South roof canopies with 0px offset and zero lateral stepping.
- **$C^1$ Tangent Continuity on Curved Corner Canopies**:
  - In `getFluidCornerRoofArcPoints`, the Bezier control point is set to $p_{\text{ctrl}} = (r_T.x, r_G.y)$.
  - Guarantees $B'(0) = (0, 2(r_G.y - r_T.y))$ has a strictly vertical tangent ($dx/dt = 0$) meeting the West/East touchline stand roof, and $B'(1) = (2(r_G.x - r_T.x), 0)$ has a strictly horizontal tangent ($dy/dt = 0$) meeting the North/South stand roof.
  - Eliminates awkward right-angle bends and produces a continuous, graceful perimeter canopy.

#### T13D.4 Rich Architectural Detailing Across All Stands & Corners
- **Preserved & Enhanced Roof Detailing**:
  - *Corrugated Steel*: Radiating corrugated lap ridges along concentric curves across corner canopies and stands.
  - *ETFE Cushion*: Translucent pneumatic pillows with bright heat-welded seams (`#f8fafc`).
  - *Precast Concrete*: Expansion joint seams and coping drip-edges.
  - *Aluminum Standing Seam*: Anodized metallic specular highlights.
  - *Structural Trusses & Rafters*: Load-bearing cantilever ribs, node fastening rivets, and gusset plates.
  - *Fascia & Borders*: Painted club fascia boards in primary team color, specular aluminum drip edges, and safety yellow hazard nosing.

#### T13D.5 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT13D_UnifiedPerimeterRoofCanopy.test.ts` (13 tests) validating:
  1. Upper tier coverage $\le 50\%$ across 1–4 tiers and wall stands in `partial` mode.
  2. Symmetrical depth across West, East, North, and South stands when configurations match.
  3. $C^1$ vertical tangent at `rT` and horizontal tangent at `rG`.
  4. Zero-gap coordinate bonding between corner canopy and adjacent stands.
  5. Rendering of all 4 materials and 4 styles without canvas errors.
  6. Zero regressions across the entire suite (53/53 passed across all phaseT13 suites).

---

### Hotfix Phase T14E: Unified Perimeter Roof Architecture for Rectangular & Square Stadiums & Seamless Oval Stand Alignment [COMPLETED & VERIFIED]
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14E_UnifiedPerimeterRoofAndOvalAlignment.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14E.1 Strict Upper-Tier Coverage Invariance (< 50% Deck Cutaway)
- Calibrated `getUnifiedRoofOverhangDepth` in `src/types/stadium.ts`:
  - Enforces that in match mode (`partial` / 50% edge), the roof overhang extends inward to cover strictly $\le 45\%$ (never $> 50\%$) of the upper tier deck.
  - Computes overhang depth anchored flush to the outer rear delimitation wall (`rearWallThickness + tierProjection`), ensuring positive and proportional canopy overhangs across 1-tier, 2-tier, 3-tier, and 4-tier grandstands.

#### T14E.2 Unified Perimeter Roof Architecture for Rectangular & Square Stadiums
- Unifies roof scale and position across West, East, North, and South stands:
  - If stands share the same size configuration, roof overhang depths match identically around the entire perimeter ($D_{\text{touch}} == D_{\text{goal}}$), producing a single cohesive continuous roof canopy appearance.
  - If a particular stand has a smaller or larger specification, the roof scales proportionally to its stand size without disjoint artifacts.
  - Southern and northern stand canopies anchor flush to their respective outer delimitation walls, casting realistic directional soffit drop shadows inward over seating tiers.
  - Preserves rich roof detailing across all orientations: corrugated steel lap ridges, ETFE pneumatic pillow welds, aluminum highlights, cantilever truss support pillars, and LED ribbon borders.

#### T14E.3 Seamless Southern Corner Roof Canopy Bonding & $C^1$ Tangent Continuity
- Overhauls corner roof canopy coordinates (`rT` and `rG`) in `drawCornerMiterRoofCanopy`:
  - Eliminates the disconnected southern corner canopy defect where SW and SE roofs were previously distorted.
  - Computes leading edge points `rT` and `rG` anchored to the outer perimeter wall and adjacent touchline/goal stands with 0px coordinate discrepancy.
  - Quadratic Bézier curve `fluidArc` maintains $C^1$ tangent continuity: purely vertical tangent at `rT` ($dx/dt = 0$) and purely horizontal tangent at `rG` ($dy/dt = 0$).

#### T14E.4 Seamless Oval Stadium Stand Alignment (Zero Discrepancy at Touchlines)
- Replaces legacy static eccentricities (`0.88` North, `1.16` South) with dynamic angular depth blending `getOvalSectorRadialDepth(ang, dWest, dGoal, dEast)`:
  - Uses smooth $w_X = \cos^2\theta, w_Y = \sin^2\theta$ weighting with zero derivative at $\theta = \pi$ (West) and $\theta = 0 / 2\pi$ (East).
  - When stands share the same size, the horseshoe arc connects to touchline stands with 0.000px discrepancy and forms a completely uniform, continuous coliseum bowl.
  - When stand sizes differ, the radial depth smoothly transitions between touchline and goal without disjoint steps or jagged seams.

#### T14E.5 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14E_UnifiedPerimeterRoofAndOvalAlignment.test.ts` validating:
  1. Upper-tier deck coverage strictly $\le 50\%$ across all stand sizes and tiers.
  2. Identical roof overhang depths across all 4 stands when configurations match.
  3. Exact 0px coordinate alignment between corner roofs and adjacent stand canopies.
  4. $C^1$ tangent continuity of corner fluid arcs.
  5. 100% precision touchline depth alignment on oval stadiums at $\theta = \pi$ and $\theta = 0, 2\pi$.
  6. Zero build or lint errors across the codebase.


---

### Hotfix Phase T14F: Corner Material & Color Harmony, Subtle Southern Angle Refinement, Fluid Roof Miter & Crisp South Banner Typography [COMPLETED & VERIFIED]
*Priority: 100% Material & Grade Texture Parity on Corner Stands (Raw & Colors), Subtle Southern Transition Angle, Continuous East/West-to-South Roof Canopy Bonding & Crisp Readable South Banner Typography*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14F_CornerMaterialsAndSouthAngle.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14F.1 Corner Stand Material, Texture & Architectural Grade Parity
- **The Core Visual Inconsistency**:
  - Currently, when corner stands are rendered (even with matching tier count, tier sizing, and architectural grade like Municipal, Brutalist, Industrial, Victorian, or Modern, and even when left unpainted in default `raw` state), their surfaces, deck treads, and tier risers look wildly different from adjacent non-corner stands.
  - Corner decks frequently omit the rich 32-bit textures, riser stippling, tread depth highlights, and deck shading present in standard touchline and goal-end stands, causing corners to look visually detached or alien.
- **100% Architectural Grade Texture Parity**:
  - Corner rendering pipelines (`drawRoundCornerStand`, `drawGiantCornerStand`, `drawTowerCornerStand`) must strictly sample and apply the active `StandColorPalette` (`palette.primaryWall`, `palette.accentTrim`, `palette.foundation`, `palette.deckFloor`, `palette.fasciaTrim`).
  - Procedural texture parity across all 5 architectural grades:
    - *Municipal*: Hollow scaffold post lines, galvanized pipe highlights, and wood plank grain lines on treads.
    - *Brutalist*: Formwork board markings, concrete aggregate stippling, and heavy monolithic cast shadows.
    - *Industrial*: Riveted plate seam lines, steel grid cross-hatching, and dark brick foundation piers.
    - *Victorian*: Detailed running-bond brick course seams, decorative ironwork trims, and stone coping lintels.
    - *Modern*: Sleek composite horizontal panel joints, specular metallic highlights, and LED channel housings.
  - Tier riser faces on corner decks must display the exact vertical drop shadows, tread surface tone, safety nosing, and coping highlights ($2\text{px}$ stone or metal drip-edge) matching touchline and goal-end stands in both `raw` and painted modes.
  - Corner gangway stairs and vomitories must share the exact concrete/steel channel tone and yellow hazard nosing (`#facc15`).

#### T14F.2 Subtle Southern Corner Perspective Angle & Touchline-to-Goal Transition
- **Elimination of Abrupt Southern Corner Disconnect**:
  - The South Stand in 2.5D oblique perspective sits in the immediate foreground, presenting a prominent front facade, plinth, and forward-facing grandstand elevation.
  - Currently, southern corners (SW and SE) either look overly sheared or abruptly rectilinear, lacking the subtle transitional geometry that allows a viewer's eye to travel naturally from the lateral West/East stands into the foreground South Stand.
- **Subtle Transitional Rake Angle**:
  - Implement a subtle transitional rake angle on SW and SE corners.
  - The corner geometry parameterizes from the purely lateral touchline depth, sweeps along a subtle angled chamfer/fillet, and terminates flush against the South Stand's front plinth and fascia.
  - Seating rows, vomitory aisles, and barrier rails curve with organic architectural cadence, unifying the touchline and goal-end stands into an integrated coliseum structure.

#### T14F.3 Continuous Fluid Corner Roof Miter & East/West-to-South Canopy Bonding
- **Synchronized Roof Miter Geometry**:
  - Ensure the roof canopy over SW and SE corners reflects this subtle transition angle.
  - Connects the East/West touchline canopy with the South goal canopy via a synchronized Bézier miter that mirrors the underlying grandstand deck curvature.
  - Guarantees zero step discrepancy, seamless corner canopy bonding ($C^1$ tangent continuity), unified directional soffit drop shadows, and strict $\le 50\%$ upper-tier match-cutaway invariance.

#### T14F.4 Southern Grandstand Commercial Ad Banner Polish & Typographic Legibility
- **The Legibility Defect**:
  - Currently, the commercial advertising banner spanning the front of the southern grandstand looks distorted, odd, and illegible, with squeezed letterforms and low contrast against the background.
- **Crisp 32-Bit Pixel-Art Ad Banner Architecture**:
  - Overhaul the southern pitchside commercial advertising banner:
    - High-contrast, authentic 32-bit pixel-art typography and crisp brand badges rendered with clean, proportional letter spacing.
    - Perspective-aligned mounting frame with metallic top rail, mounting stanchions, and directional downlight specular sheen.
    - Curated in-universe sponsor brands (e.g., `"ARCADE SPORTS"`, `"STAR WIN"`, `"RETRO LUBE"`, `"TURF MASTER"`, `"CHAMPIONSHIP 90"`) with high luminance contrast against dark background boards.
    - Guaranteed crisp readability at the default match camera zoom level.

#### T14F.5 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14F_CornerMaterialsAndSouthAngle.test.ts`:
  - Validates material and texture parity between corner stands and non-corner stands across all 5 architectural grades and `raw` mode.
  - Validates smooth transition angles and coordinate continuity at SW/SE southern corner interfaces.
  - Validates corner roof miter alignment and $C^1$ continuity connecting East/West to South.
  - Validates southern commercial banner typography, contrast, and layout bounds.
  - Confirms zero regressions across all existing stadium test suites.

---

### Hotfix Phase T14G: Touchline Outer Wall Corner Integration, Open-End Architectural Finials & High-Oblique No-Stand Backdrop Overhaul [COMPLETED & VERIFIED]
*Priority: Rectangular/Square East/West Outer Wall Angled Corner Integration, Architectural Return End-Cap Finials on Open Stands, Perspective-Calibrated No-Stand Backdrops with True Front & Top Oblique Surfaces*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/environmentRenderer.ts`, `src/game/__tests__/phaseT14G_OuterWallIntegrationAndBackdrops.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14G.1 Rectangular & Square East/West Outer Wall Corner Integration
- **Elimination of Abrupt Outer Wall Termination**:
  - Rectangular and square stadiums feature an attractive outer masonry/structural wall along the East and West touchline stands. However, currently these side outer walls end abruptly at the corner boundary with an exposed vertical edge, looking unfinished and disjointed from the rest of the stadium.
- **Angled Corner Integration & South Facade Connection**:
  - On rectangular and square stadiums, extend and integrate this outer wall into the corner stands.
  - The wall smoothly turns at a calibrated 45° transitional angle (or gentle fillet for round corners) following the corner stand's exterior boundary.
  - The integrated wall connects seamlessly into the South Stand's front facade and foundation plinth, creating a single continuous defensive enclosure framing the entire venue.

#### T14G.2 Architectural End-Cap Finials & Clean Returns for "No Stand" Configurations
- **The Open-Corner Disconnect**:
  - When an adjacent corner or goal stand is configured as "No Stand" (`none` / `no_stand`), the touchline outer wall cannot simply vanish or float into empty space.
- **Pristine Architectural Return Finial / Pillar**:
  - When no stand is present at an adjacent corner or side, terminate the outer wall with an authentic architectural return finial/pillar:
    - Heavy structural brick/concrete pier with projecting multi-tier stone coping cap (`#cbd5e1`).
    - Clean 90° return wall section tapering neatly into the concourse ground, sealing the structure cleanly and deliberately.
    - Optional mounting fixture (e.g., vintage bronze lantern or security gate post), framing the open space with clear architectural intention.

#### T14G.3 Master Perspective Correction for "No-Stand" Backdrops (High-Oblique Front & Top Perspective)
- **The Perspective Mismatch Defect**:
  - Currently, selecting "No Stand" adds an oversized flat backdrop texture that does not match the correct perspective angle of the stadium.
  - The background texture appears artificially flat, vertically stretched, and misaligned with the camera's high-oblique 2.5D vantage.
- **True High-Oblique Oblique Surface Geometry (Front + Top)**:
  - Re-engineer the spatial backdrop rendering within the open stand footprint across all 4 orientations (South, North, East, West):
    - On the southern opening (and across all orientations), all foreground structures, barriers, kiosks, embankments, and concourse elements must render in true 2.5D high-oblique perspective: displaying both their vertical front elevation (facade) and top receding horizontal surface.
    - Rescale backdrop textures and props to accurately match the stadium's camera distance and perspective vanishing points, eliminating oversized, flat, or distorted texture maps.
    - Seamlessly connects pitchside perimeter barriers with the receding concourse terrain and contextual landscape.

#### T14G.4 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14G_OuterWallIntegrationAndBackdrops.test.ts`:
  - Validates East/West outer wall angled continuation and seamless bonding into corner and south stands on rectangular and square shapes.
  - Validates architectural return finial end-cap rendering when adjacent stands or corners are set to `no_stand`.
  - Validates high-oblique front and top surface geometry on all no-stand backdrop elements.
  - Confirms locked 60 FPS performance and zero regressions.

---

### Hotfix Phase T14H: Southern Corner 2.5D High-Oblique Perspective Geometry, Upper-Tier Coordinate Sync & Miter Knee Elimination [COMPLETED & VERIFIED]
*Priority: Eliminate Distorted Upper-Tier Lateral Shearing, Exact 2.5D High-Oblique Radial Miter, Smooth South-to-Touchline Tier Alignment & Roof Miter Sync*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14H_SouthCornerPerspectiveOverhaul.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14H.1 Elimination of Distorted Runaway Lateral Shear & Artificial Jagged Miter Knees
- **MANDATORY ARCHITECTURAL LOCK — NORTHERN STANDS PRESERVED**:
  - The Giant (Wall) corner stand and Tiered corner stand on the northern side (`corner_nw` and `corner_ne`) already render accurately, look well, and match the North Stand rake as intended.
  - **They are STRICTLY LOCKED AND MUST NOT BE MODIFIED**.
  - All mathematical coordinate overhauls in HOTFIX T14H apply **strictly and exclusively to the southern corners (`corner_sw` and `corner_se`)**.
- **The Core Southern Geometric Deformation Defect**:
  - In earlier iterations, southern corners (`corner_sw` and `corner_se`) suffered from an artificial lateral shear multiplier (`shearX = -sTaper * rProg * tFrac`). As tier depth increased toward upper tiers (Tier 3 and 4), `rProg` scaled past 1.0, shifting upper-tier seat rows and deck edges 40px–80px laterally outward into an acute, twisted rhomboid.
  - Furthermore, in `drawGiantCornerStand`, an artificial "connecting miter knee" placed a hardcoded 90° rectangular elbow (`kneeX = rowP.x`, `kneeY = rowG.y * 0.65 + rowP.y * 0.35`) into the middle of every row. This caused upper rows to shoot straight sideways, bend abruptly downward, and connect awkwardly to the South Stand, resulting in an unnatural, distorted, and deformed appearance.
- **Complete Eradication of Flawed Heuristics**:
  - Completely eliminate the artificial 5-point jagged knee polygon in `drawGiantCornerStand` for southern corners.
  - Completely replace the unconstrained `sTaper * rProg * tFrac` lateral shearing with a mathematically rigorous 2.5D high-oblique projection engine on SW and SE corners.

#### T14H.2 True High-Oblique 2.5D Radial Corner Geometry with $C^1$ Tangent Continuity
- **High-Oblique 2.5D Camera Projection Context**:
  - The virtual camera is positioned to the South, elevated high above the pitch, tilted Northward down onto the playing surface.
  - From this vantage, the camera views the *top surfaces* of horizontal grandstand treads and roofs, as well as the *northward-facing vertical front elevations* of foreground structures.
  - Touchline stands (West & East) run vertically parallel to the pitch side with strictly invariant lateral bounds ($X = \text{const}$).
  - The South Stand runs horizontally along the bottom of the screen, with a subtle perspective flare widening outward toward the foreground along its front facade ($X(y) = \pm \text{southTaperX} \cdot \frac{y - \text{bottom}}{\text{standDepthY}}$).
- **Exact High-Oblique Parametric Formulation**:
  - **Round Sweeping Corners (`drawRoundCornerStand`)**:
    - For normalized angle parameter $u \in [0, 1]$ ($u = 0$ at South goal-end interface, $u = 1$ at West touchline interface for `corner_sw`):
      $$\theta(u) = \frac{\pi}{2} + u \cdot \frac{\pi}{2}$$
      $$X_{\text{base}}(u) = \text{left} - d_X \cdot \sin\left(u \frac{\pi}{2}\right), \quad Y_{\text{base}}(u) = \text{bottom} + d_Y \cdot \cos\left(u \frac{\pi}{2}\right)$$
    - Perspective flare modulation:
      The perspective taper is strictly a function of the $Y$-distance from the pitch edge:
      $$\tau(Y) = \text{southTaperX} \cdot \left(\frac{Y - \text{bottom}}{\text{standDepthY}}\right)$$
      Smooth $C^1$ continuous transitional blending is enforced via $\cos^2$ weighting for SW (and $\sin^2$ weighting for SE):
      $$\Delta X(u) = -\tau(Y(u)) \cdot \cos^2\left(u \frac{\pi}{2}\right)$$
    - **Mathematical Guarantees**:
      1. At the South interface ($u = 0$): $\cos(0) = 1 \implies \Delta X = -\tau(Y)$, matching the South Stand's flared boundary with **exact 0.000px discrepancy**.
      2. At the West interface ($u = 1$): $\cos(\frac{\pi}{2}) = 0 \implies \Delta X = 0$, matching the touchline stand's vertical boundary with **exact 0.000px discrepancy**.
      3. Derivative at both boundaries: $\frac{d}{du}\left[\cos^2\left(u \frac{\pi}{2}\right)\right] = -\frac{\pi}{2} \sin(\pi u) = 0$ at both $u = 0$ and $u = 1$. This ensures **unbroken $C^1$ tangent continuity** with zero kink, zero step, and zero angular pinching.
      4. Symmetrical formulation for SE corner (`corner_se`):
         $$X_{\text{base}}(u) = \text{right} + d_X \cdot \cos\left(u \frac{\pi}{2}\right), \quad Y_{\text{base}}(u) = \text{bottom} + d_Y \cdot \sin\left(u \frac{\pi}{2}\right)$$
         $$\Delta X(u) = +\tau(Y(u)) \cdot \sin^2\left(u \frac{\pi}{2}\right)$$
  - **Giant / Wall & Rectangular Miter Corners (`drawGiantCornerStand`)**:
    - Seating rows and tiers expand outward along the true 45° diagonal bisector ray:
      $$P_{\text{bisector}}(f) = \left(\text{left} - d_X(f) - \frac{1}{2}\tau(Y_{\text{goal}}(f)), \; \text{bottom} + d_Y(f)\right)$$
    - Clean, natural 2-segment miter geometry ($P_{\text{touch}} \to P_{\text{bisector}} \to P_{\text{goal}}$) or direct diagonal chamfer ($P_{\text{touch}} \to P_{\text{goal}}$), eliminating all artificial right-angle knees and keeping seating rows strictly parallel to the coliseum perimeter.

#### T14H.3 Upper-Tier Vertical Extent & Seating Height Synchronization with South Stand
- **The Seating Depth Mismatch Defect**:
  - In `drawGoalEndStand`, southern tiered stands deliberately compress their active seating tiers to $\approx 55\%$ of the total stand depth (`activeSeatingH = Math.round(deckAreaH * 0.55)`) to ensure the pitch and southern goalmouth are never occluded from the high-oblique camera view.
  - Corner stands were previously expanding their seating rows over 100% of `standDepthY`, causing the upper tiers of the corner to overshoot the South Stand's upper tier by 30px–60px vertically.
- **Synchronized Tier Heights & Concourse Rake**:
  - When the adjacent South Stand is tiered, SW and SE corner seating tiers scale their $Y$-extent dynamically:
    - At the South interface ($u = 0$): seating rows terminate at `activeSeatingH`, matching the South Stand's highest row exactly.
    - Across the corner radius: seating depth smoothly transitions to the full touchline tier depth at the West/East interface ($u = 1$).
    - The rear portion behind the seating tiers forms a clean, flat concourse walkway with safety balustrades and vomitory portals, perfectly aligned with the South Stand's rear concourse.
  - When the adjacent South Stand is a Wall Stand (`type === 'wall'`), the corner utilizes full depth with unbroken steep terrace raking matching "The Wall".

#### T14H.4 Southern Corner Roof Canopy Miter Alignment & Unified Drop Shadows
- **Synchronized Roof Canopy Miter Geometry**:
  - In `drawCornerMiterRoofCanopy`, update SW and SE corner roof canopy coordinates so the leading edge arc, fascia border, and cantilever ribs follow the exact same $C^1$ continuous blended curve:
    - Leading edge points `rT` (touchline) and `rG` (goal) match adjacent roof canopies with 0.0px coordinate discrepancy.
    - Bezier / parametric arc maintains strictly horizontal tangent at the South interface and strictly vertical tangent at the West/East interface.
  - Strict compliance with the $\le 50\%$ upper-tier cutaway invariant in match view (`partial`), revealing seating decks while casting unified directional soffit drop shadows inward over seating tiers.

#### T14H.5 Vitest Test Suite & Mathematical Perspective Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14H_SouthCornerPerspectiveOverhaul.test.ts`:
  1. Validates $C^1$ tangent continuity ($\frac{dx}{du} = 0$ at touchline, $\frac{dy}{du} = 0$ at goal-end) across all 4 tiers on SW and SE corners.
  2. Validates strictly monotonic radial expansion along the diagonal bisector ray (zero inward dips, zero lateral flaring, zero rhomboid skewing).
  3. Validates exact coordinate alignment between corner tiers and adjacent South/West/East stands at $t = 0, 1, 2, 3$.
  4. Validates zero-error canvas rendering across all 4 corner typologies (Round, Giant, Tower, Wall) and all 5 architectural grades.
  5. Confirms zero build or lint regressions across all existing Phase T test suites.

---

### Hotfix Phase T14I: Southern Corner Outward-Facing Coliseum Arc & 45° Planar Miter Geometry [COMPLETED & VERIFIED]
*Priority: Eradicate Inverted Concave Trumpet Horns, Enforce Outward-Facing Concentric Arc (Round) & 45° Planar Miter Chamfer (Giant), Eliminate Black Void Gaps*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14I_SouthCornerOutwardArcAndPlanarMiter.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14I.1 Outward-Facing Concentric Coliseum Arc for Round/Tiered Corners
- **Eradication of Inverted Horn / Trumpet Defect**:
  - The corner seating rows in earlier iterations curved concavely inward toward the grandstand interior, creating a trumpet-like pinch and leaving a black polygon gap between the touchline stand and the corner.
  - Re-engineer `drawRoundCornerStand` on `corner_sw` and `corner_se` to follow an authentic outward-facing concentric coliseum arc:
    - Center of curvature is anchored at the inner pitch corner $(X_{\text{pitch}}, Y_{\text{pitch}})$.
    - Seating rows and tier fascias sweep convexly outward away from the pitch, maintaining uniform tread spacing and zero inward deflection.
    - Front pitchside barrier connects the West/East touchline barrier to the South goal barrier with continuous outward curvature and 0px seam.
    - Outer rear perimeter wall wraps continuously from the touchline outer wall to the South facade.

#### T14I.2 Clean 45° Planar Diagonal Miter Chamfer for Giant/Wall Corners
- **Direct Planar Chamfer Geometry**:
  - For stands with `cornerType === 'giant'` (monolithic high-rake terrace):
    - Seating steps follow straight diagonal lines connecting touchline anchor $P_{\text{touch}}(r)$ to South goal anchor $P_{\text{goal}}(r)$ via $P(t) = (1 - t) P_{\text{touch}}(r) + t P_{\text{goal}}(r)$.
    - Completely eliminates all 5-point polygon knees, curved warps, and lateral shearing.
    - Anti-surge crash barriers (geländer) and spectator sprites sit directly on the straight diagonal terrace treads.

#### T14I.3 Vitest Test Suite & Geometric Convexity Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14I_SouthCornerOutwardArcAndPlanarMiter.test.ts`:
  1. Validates strictly convex outward radial curvature ($\frac{d^2 X}{du^2}$ and $\frac{d^2 Y}{du^2}$ maintain correct orientation away from pitch corner).
  2. Validates collinear straight diagonal treads in `drawGiantCornerStand`.
  3. Validates 0px gap closure between East/West touchline stands and corner stands.

---

### Hotfix Phase T14J: Roof Canopy Cutaway Overhang Invariance & Fluid Miter Alignment [COMPLETED & VERIFIED]
*Priority: Enforce Strict <= 50% Top Tier Overhang (Round) & <= 20% (Giant), Eliminate Self-Intersecting Hourglass Horns & 100%/0% Dynamic Cutaway Modes*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14J_RoofCanopyCutawayOverhangInvariance.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14J.1 Elimination of Self-Intersecting Hourglass Roof Canopy Horns
- **The Inverted Twist Defect**:
  - In `drawCornerMiterRoofCanopy`, the Bézier control point previously pulled the canopy arc toward the outer rear corner while polygon vertices jumped across $pOut \to pTMax \to fluidArc \to pGMax$, creating a self-intersecting bowtie/hourglass shape.
  - Re-engineer the roof canopy polygon path to strictly follow the outer boundary: $pOut \to pTMax \to \text{leadingEdgeArc} \to pGMax \to pOut$ with consistent winding order and zero self-intersections.

#### T14J.2 Calibrated 3-Mode Roof Cutaway Scaling
- **50% Setting (`partial`) — Match Invariance**:
  - For Tiered / Round stands: Canopy overhang covers **at most 50% of the highest tier** along the outer perimeter, leaving lower tiers, vomitories, and active seating 100% visible from the high-oblique camera.
  - For Giant Wall stands: Canopy overhang covers **at most 20% of the total depth** along the rear rim.
- **100% Setting (`full`)**: Fully covers the corner grandstand with uniform fascia coping and structural trusses.
- **0% Setting (`hidden`)**: Completely cuts away (0px overhang), exposing all corner tiers and access portals.

#### T14J.3 Vitest Test Suite & Canopy Boundary Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14J_RoofCanopyCutawayOverhangInvariance.test.ts`:
  1. Validates zero polygon self-intersections across all 4 corner orientations.
  2. Validates maximum 50% top-tier overhang on round corners and 20% on giant corners in `partial` cutaway mode.
  3. Validates complete cutaway in `hidden` mode and full enclosure in `full` mode.

---

### Hotfix Phase T14O: Southern Corner Seating Layer Order, Concourse Deck Invariance & Seat Occlusion Elimination [COMPLETED & VERIFIED]
*Priority: Rectify Canvas 2D Layer Render Order (Promenade Deck & Plinths Drawn as Substrates Before Seats), Eliminate Erroneous Giant Corner Promenade Occlusion, Bounded Concourse Deck Behind Upper Tiers & Calibrated Soffit Shadows*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14O_SouthCornerSeatingLayerOrder.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14O.1 Canvas 2D Layer Rendering Order Rectification
- **The Seat Occlusion Defect**:
  - In `drawRoundCornerStand` and `drawGiantCornerStand`, the solid promenade concourse deck (`#0f172a` / `#334155`) was previously rendered in Step 4.5 *after* all seating rows, spectator sprites, and gangway stairs had already been drawn in Step 4.
  - Because the inner boundary of this promenade deck (`dXProm0`, `dYProm0`) crossed into the active seating area along the curved/mitered radial sweep, the solid fill drew directly over the upper seating rows, wiping out spectator sprites and chairs.
- **Strict Substrate-Before-Content Pipeline**:
  - Re-order the rendering pipeline so all base plinths, concourse pavement fills, and rear promenade decks are rendered **strictly before** any seating tiers, stepped chair rows, supporter sprites, gangway stairs, or balcony fascias are drawn.
  - Seating tiers and spectators are guaranteed 100% unobstructed visibility, drawing cleanly on top of all underlying architectural decking substrates.

#### T14O.2 Complete Elimination of Giant Corner Promenade Occlusion
- **The Monolithic Stehplatz Invariance**:
  - Giant corner stands (`square` / `giant`) embody "The Wall" philosophy: a continuous, steep, monolithic standing terrace running unbroken from the front pitchside apron to the rear parapet wall.
  - An erroneous condition `if (isSouthGoalTiered)` previously inserted an artificial 4-point concourse polygon across the upper half of the Giant corner terrace on southern quadrants, destroying its continuous rake.
  - Completely remove this misplaced promenade deck from `drawGiantCornerStand`. The Giant corner runs uninterrupted across all rows with continuous crush barriers and full spectator presence.

#### T14O.3 Round Southern Corner Seating Depth & Concourse Boundary Invariance
- **Seamless South-to-Touchline Transition**:
  - On `drawRoundCornerStand` on southern corners (`corner_sw`, `corner_se`), when the adjacent South stand has compressed seating with an upper promenade deck, the corner stand's upper concourse is drawn as a foundational substrate *before* the tiers are drawn, strictly bounded behind the top tier rim ($r \ge dX_1, dY_1$).
  - The dividing balustrade is drawn along the true rear perimeter of the seating deck, providing a crisp, architecturally authentic transition into the South stand's promenade without crossing any seating rows.

#### T14O.4 Roof Soffit Drop Shadow Inward Bleed Calibration
- **Elimination of Dark Shadow Overlay**:
  - In `drawCornerMiterRoofCanopy`, the roof soffit shadow previously projected northward (`sY = -shadowDepth`, up to 16px) across southern corners, casting a heavy dark overlay over top-tier spectators.
  - Calibrated the southern corner roof drop shadow to a subtle 3px fascia lip shadow (`Math.min(4, shadowDepth * 0.25)`), framing the roof boundary cleanly without darkening or obscuring seated spectators.

---

### Hotfix Phase T14P: Corner Stand 32-Bit Texture Parity, Architectural Grade Finishes & Harmonious Color Palette [COMPLETED & VERIFIED]
*Priority: 100% Visual Parity between Corner Stands and Adjacent Stands: Full 32-Bit Grandstand Materials (Concrete, Brick, Steel, Modern, Timber), Architectural Grade Façades, Authentic Concentric Decking & Synchronized Palettes*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14P_CornerStandTextureParity.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14P.1 32-Bit Grandstand Material Integration on Corners
- **Elimination of Flat Corner Shells**:
  - Non-corner stands (West, East, North, South) feature rich 32-bit grandstand materials (`draw32BitGrandstandMaterial`: Brutalist Weathered Concrete, English Red Brick Heritage, Modern Composite Panels, Steel Truss Industrial Plates, Timber Plank Classic). Corner stands previously only used flat solid fills and crude Bayer dither loops.
- **Corner Material Projection**:
  - Clip the corner grandstand hull and project `draw32BitGrandstandMaterial` across the corner footprint. The underlying concrete expansion joints, brick coursing, steel seams, or composite panels now flow seamlessly through the corner quadrants, matching the adjacent stands identically.

#### T14P.2 Architectural Grade Façade Detailing
- **Grade-Specific Structural Elements**:
  - Integrate `drawArchitecturalGradeFacade` detailing across corner shells:
    - *Municipal*: Open scaffold framing tubes and wood plank grain.
    - *Brutalist*: Formwork board markings and aggregate concrete stippling.
    - *Industrial*: Riveted plate seams, steel grid cross-hatching, and dark brick foundation piers.
    - *Victorian*: English running-bond brick courses, decorative ironwork, and brass trims.
    - *Modern*: Sleek composite reveals, specular metallic sheen, and LED accent ribbons.

#### T14P.3 Concentric & Mitered Decking Material Parity
- **Port of `drawSolidUnderSeatDecking` to Corner Geometries**:
  - Each corner tier deck now renders authentic architectural decking patterns:
    - *Municipal*: Alternating timber plank bands with dark grain lines and steel pipe bearer lines.
    - *Industrial*: Galvanized checkered steel diamond plate with metallic stipple highlights (`c3.light`).
    - *Victorian*: Rich varnished hardwood plank lines running along concentric arcs and diagonal miters.
    - *Modern*: Aero-titanium composite deck with specular edge highlights.
    - *Brutalist*: Pre-stressed concrete slabs with expansion joint radials.

#### T14P.4 Harmonious Color Palette Synchronization
- **Strict Color & Grade Alignment**:
  - Corner stands sample the exact `StandGradePalette` (`primaryWall`, `secondaryWall`, `deckFloor`, `stepTexture`, `balustrade`, `trim`) and custom `gradeColors` (`c1`, `c2`, `c3`) as adjacent stands.
  - Step risers feature unified drop shadows (`rgba(0, 0, 0, 0.45)`) and specular tread highlights (`rgba(255, 255, 255, 0.18)`), matching the main grandstands in both raw material state and painted team colorways.

---

### Hotfix Phase T14K: Corner Floodlight Placement Subsystem (3 Authentic Typologies) [COMPLETED & VERIFIED]
*Priority: Creator Step 3 Lighting Controls (Exterior Pylons, Parapet Clusters, Corner Ground Infill), Ground Anchors & Elimination of Floating Lights*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT14K_CornerFloodlightPlacement.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14K.1 3 Authentic Corner Floodlight Placement Typologies
- **Typology 1: Exterior Concourse Towers (`exterior_tower`)**:
  - Freestanding high-mast structural lattice steel towers anchored on the outer concourse plaza beyond the perimeter wall.
  - Heavy reinforced concrete footing plinths with access ladder cages and high-intensity angled LED lamp banks.
- **Typology 2: Integrated Parapet Anchors (`integrated_parapet`)**:
  - Compact structural light clusters anchored directly into the corner rear parapet wall / bowl rim coping.
  - Sleek modern architectural profile with zero external ground footprint.
- **Typology 3: Corner Ground Infill Towers (`corner_ground`)**:
  - Designed specifically for stadiums with open/unbuilt corners (`cornerType === 'no_stand'`):
  - Floodlight pylon sits directly inside the open corner spatial footprint on the pitchside apron, complete with maintenance access gate, equipment shed, and spectator leaning rails.

#### T14K.2 Stadium Creator Step 3 Integration
- Add "Corner Floodlight Placement" selector in Step 3 (Atmosphere & Lighting) of `StadiumCreatorModal.tsx`.
- Option choices: `Exterior Towers (Plaza)`, `Parapet Clusters (Rim)`, `Corner Ground (Open Infill)`.
- Live visual updates in the creator WYSIWYG preview canvas.

#### T14K.3 Vitest Test Suite & Floodlight Anchoring Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14K_CornerFloodlightPlacement.test.ts`:
  1. Validates coordinate anchoring across all 3 floodlight topologies on SW, SE, NW, NE corners.
  2. Validates grounding plinths and elimination of floating detached floodlight sprites.
  3. Validates Creator Step 3 state serialization and preview canvas rendering.

---

### Hotfix Phase T14L: Corner VIP Towers 2.5D Oblique Architectural Overhaul & 4-Quadrant Directional Aspect System [COMPLETED & VERIFIED]
*Priority: True 2.5D Oblique Prism (North Front Luxury Suites vs South Rear Exterior & Top Roof Deck), Lateral East/West Mirroring & Rooftop Detailing*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14L_CornerVIPTower2DObliqueOverhaul.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14L.1 Elimination of the Flat Horizontal 2D Box Defect
- **VIP Tower Scope & Northern Stand Invariance**:
  - On the northern corners (`corner_nw` & `corner_ne`), **ONLY the VIP Tower stand is modified** (elevating its flat 2D box into a pitch-facing 2.5D glazed luxury suite).
  - The Northern Giant (Wall) corner stand and Northern Tiered corner stand already look as intended and are **STRICTLY LOCKED AND NOT TOUCHED**.
- **The Core Architectural Defect**:
  - In `drawTowerCornerStand`, the VIP corner tower is currently rendered as an identical, flat 2D rectangle (`ctx.fillRect(tX, tY, cW, cH)`) with basic horizontal window stripes across all four corners (`corner_nw`, `corner_ne`, `corner_se`, `corner_sw`).
  - It completely lacks 2.5D spatial depth, oblique perspective, roof deck depth, and directional orientation awareness, looking like a flat sticker pasted over the corner rather than a towering structural pavilion.
- **True 2.5D Oblique Architectural Prism**:
  - Re-engineer `drawTowerCornerStand` into a true 2.5D architectural prism composed of three distinct perspective surfaces:
    1. **Primary Vertical Elevation**: Front pitch-facing luxury glazed suites (North corners) or monumental exterior structural facade (South corners).
    2. **Lateral Flank Wall**: Perspective-angled structural side wall receding along the touchline/goal orientation with masonry pilasters and expansion joints.
    3. **Top Rooftop Deck**: Flat horizontal/oblique rooftop slab viewed from above with perimeter parapet walls, stone coping highlights (`#cbd5e1`), HVAC mechanical chiller units, communications satellite dishes, and aviation warning beacon pylon.

#### T14L.2 North vs South Directional Aspect System
- **North Corners (`corner_nw` & `corner_ne`) — Front Pitch-Facing Luxury Suites**:
  - The camera looks South-to-North at the *front elevation* of the tower:
    - Multi-floor stacked luxury glazed suites (1 to 5 floors driven by `getVipBuildingFloors(stand)`).
    - Tinted panoramic floor-to-ceiling glass curtain walls with warm interior amber illumination (`rgba(245, 158, 11, 0.55)`).
    - Polished gold/brass safety balustrades and cantilever balcony fascias.
    - Corporate executive silhouettes socializing inside the suites.
    - Ground-level sliding glass doors opening onto private pitchside VIP terrace decks.
- **South Corners (`corner_sw` & `corner_se`) — Foreground Rear Exterior Facade**:
  - The tower sits in the immediate foreground between the camera and the pitch, meaning the camera views the *backside/exterior facade* of the tower:
    - Monumental load-bearing concrete/brick pilasters, structural ribbing, and expansion joints.
    - Vertical tinted glass elevator shafts and illuminated emergency fire-escape stairwell slit windows.
    - Ground-level VIP reception portal with brass revolving doors and red carpet runner extending outward into the concourse plaza.
    - Top rooftop deck viewed from above with industrial exhaust cowls and structural roof access penthouses.

#### T14L.3 East vs West Horizontal Symmetry & Chiseled 32-Bit Lighting
- **Horizontal Mirroring**:
  - NW and SW towers display their East-facing lateral flank (oriented toward the pitch and goal line).
  - NE and SE towers horizontally mirror their West-facing lateral flank.
- **Directional Shading & Chiseled Volume**:
  - Primary facades receive bright daylight or floodlight wash, while lateral flanks receive realistic directional cast shadows (`rgba(0, 0, 0, 0.35)`).
  - Creates authentic 32-bit chiseled volume and architectural weight matching the rest of the stadium.

#### T14L.4 Architectural Grade Material Finish & Floor Scalability
- **5 Architectural Grade Themes**:
  - *Municipal*: Heavy timber posts, galvanized steel brackets, and utilitarian painted fiber-cement panels.
  - *Brutalist*: Monolithic board-formed concrete slabs, deep aggregate shadows, and heavy stone parapets.
  - *Industrial*: Riveted dark steel I-beam framework, weathered brick masonry, and corrugated iron roof deck.
  - *Victorian*: Classical decorative brick coursing, ornamental cast-iron balustrades, and slate coping trims.
  - *Modern*: Sleek brushed aluminum composite cladding, seamless curtain wall glass, and glowing LED channel borders.
- Cleanly scales from 1 to 5 floors without vertical distortion or texture stretching.

#### T14L.5 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14L_CornerVIPTower2DObliqueOverhaul.test.ts`:
  1. Validates 2.5D oblique prism rendering (front/rear vertical face + lateral flank + top roof deck) across all 4 quadrants.
  2. Validates North front luxury suite glazed elevation vs South rear exterior structural facade.
  3. Validates horizontal symmetry between West (NW/SW) and East (NE/SE) towers.
  4. Validates 1 to 5 floor scaling and all 5 architectural grades without canvas errors.

---

### Hotfix Phase T14M: Southern Giant & Tiered Corners 2.5D High-Oblique Overhaul (Northern Stands Locked & Preserved) [COMPLETED & VERIFIED]
*Priority: Strict Architectural Lock on Northern Giant & Tiered Stands (NW/NE Unchanged), Dedicated Southern (SW/SE) High-Oblique Rear Structure, Concourse Overlook & Grounding*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14M_SouthernGiantAndTieredCornerOverhaul.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14M.1 Strict Architectural Lock: Northern Stands Must Not Be Modified
- **Explicit Preservation Mandate**:
  - The Giant (Wall) corner stand and Tiered corner stand on the northern side (`corner_nw` and `corner_ne`) look well, function as intended with verified Phase T12 perspective shear, and are **STRICTLY PRESERVED AND LOCKED**.
  - **Do NOT modify** any rendering logic, geometry, or shaders for `corner_nw` or `corner_ne` in `drawGiantCornerStand` or `drawRoundCornerStand`.
  - All directional aspect and 2.5D perspective adjustments in this phase target **strictly and exclusively the southern corners (`corner_sw` and `corner_se`)**.

#### T14M.2 South Corners (`corner_sw` & `corner_se`) — Foreground Rear Architecture & Concourse Overlook
- **Foreground Structural Geometry**:
  - The camera looks down onto the *rear exterior enclosure and top concourse deck* of the southern corners.
  - **Monumental Rear Enclosure Wall**: Heavy brick/concrete perimeter wall with structural buttress piers and stone coping cap.
  - **Top Concourse Promenade Overlook**: Elevated walkway behind the top tier with safety balustrades, spectator circulation paths, and vomitory entrance tunnels.
  - **Forward Low-Profile Seating Slope**: The seating area slopes forward toward the pitch, matching the compressed height of the South Stand (`activeSeatingH = Math.round(deckAreaH * 0.55)`), displaying rear seat backs, barrier railings, and supporter sprites facing north toward the match action.
  - **Cantilever Underside Braces**: Raker beam concrete brackets visible beneath elevated upper-tier overhangs.

#### T14M.3 Southern Giant Wall Corner Directional Differentiation
- **Southern Giant Corners (`corner_sw` & `corner_se`)**: Monumental exterior masonry buttress walls, rear access stairways, turnstile portals, and top parapet rail overlooking the concourse grounds.
- **Northern Giant Corners (`corner_nw` & `corner_ne`)**: Preserved exactly as-is with monumental forward-facing stehplatz terraces.

#### T14M.4 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14M_SouthernGiantAndTieredCornerOverhaul.test.ts`:
  1. Validates absolute coordinate invariance of Northern stands (`corner_nw` and `corner_ne`).
  2. Validates rear structural wall, top concourse deck, and low-profile forward slope on SW and SE corners.
  3. Validates Giant Wall corner southern directional rendering without altering Northern stands.
  4. Confirms zero build or lint errors and 100% test pass rate across all suites.

---

### Hotfix Phase T14N: Southern Corner Exterior Facades, Outer Wall Miter Turn & Grounding Plinths [COMPLETED & VERIFIED]
*Priority: Seamless West/East Outer Wall to South Facade Miter Wrap, Grounding Plinths, Concourse Apron Invariance & Exterior Circulation Stairs*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/__tests__/phaseT14N_SouthCornerFacadesAndGrounding.test.ts` | Target: ~600k–700k tokens (Day 1 Quota)*

#### T14N.1 Continuous Outer Wall Miter Wrap (Touchline to South Facade)
- **Seamless Perimeter Enclosure Integration**:
  - Rectangular and square stadiums feature an authentic exterior structural wall along the East and West touchlines (introduced in Phase T14G).
  - On the southern corners (SW and SE), smoothly continue this outer masonry/concrete wall around the corner at a clean 45° transitional miter (or graceful radial fillet).
  - The outer wall bonds seamlessly into the South Stand's front facade and entrance plinth, eliminating any abrupt vertical seams, floating corners, or disjointed wall junctions.

#### T14N.2 High-Oblique Foundation Plinths & Grounding Drop Shadows
- **Authentic 2.5D High-Oblique Grounding**:
  - At the base of SW and SE corners, render heavy structural foundation plinths with true 2.5D high-oblique geometry: displaying a vertical front face (foundation wall) and a top horizontal bevel edge (`#cbd5e1` coping).
  - Deep directional contact drop shadows cast onto the surrounding concourse terrain (`drawImmediateStadiumGrounds`), firmly anchoring the southern corner structures into the venue ground.
  - Zero gap or substrate seam between the corner plinth and the apron infill / perimeter barriers.

#### T14N.3 Exterior Corner Circulation Stairs & Turnstile Access Nodes
- **Functional Concourse Architecture**:
  - Exterior corner staircases and spectator vomitory entrance portals on the southern corner hulls.
  - Contextual architectural detailing:
    - Precast concrete steps with safety yellow nosing (`#facc15`).
    - Illuminated emergency exit signage (`#22c55e`).
    - Turnstile gatehouse kiosks and crowd control railings at ground level.

#### T14N.4 Vitest Test Suite & Enclosure Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14N_SouthCornerFacadesAndGrounding.test.ts`:
  1. Validates continuous outer wall miter wrap from touchline stands into South facade without coordinate gaps.
  2. Validates high-oblique foundation plinths and grounding shadows across all 9 concourse ground types.
  3. Validates exterior corner circulation stairs and vomitory portals.
  4. Confirms locked 60 FPS performance and zero per-frame memory allocation.

---

### Phase T14: Outer Structural Walls, Context-Aware Southern Entrances & 4-Shape Geometry Polish [PENDING]
*Priority: Thick Structural Perimeter Enclosures, Stone Coping, Context-Aware Southern Entrance Pavilions (Marine Ferry Terminal, Alpine Funicular, Desert Oasis, Urban Metro) & 4-Shape Enclosure Polish*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT14_OuterWallsAndEntrances.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T14.1 Structural Perimeter Enclosures & Stone Coping Across All 4 Stadium Shapes
- **Thick Structural Outer Perimeter Walls**:
  - Render thick load-bearing perimeter walls with multi-tier stone coping, pilasters, buttress offsets, and masonry expansion joints.
  - Seamlessly encloses the stadium footprint across all 4 shapes:
    - *Rectangular / Square*: Crisp corner miters, brick/concrete pilasters, and recessed utility bays.
    - *Round Coliseum Bowl*: Continuous radial outer perimeter wall with circular coping rings and curved structural buttresses.
    - *Oval Racetrack Bowl*: Symmetrical straight touchline walls blending smoothly into sweeping semicircular goal-bend horseshoe perimeter enclosures.
    - *High-Oblique Trapezoid*: True 1-point perspective oblique perimeter walls widening toward southern foreground with perspective-scaled copings.

#### T14.2 Context-Aware Southern Entrance Pavilions (Grounds & Surroundings Coherence)
- **Elimination of Generic Entrance Mismatches**:
  - The southern grandstand entrance pavilion dynamically adapts its architecture, materials, and signage to match the active ground and surrounding environment:
    - **Marine Floating / Ocean**: *Coastal Ferry Terminal & Pontoon Gangway Pavilion* — Arched marine canopy with weather-resistant naval enamel, marine brass navigation lanterns, covered gangplank turnstiles, and floating pontoon ticket kiosks.
    - **Desert Environments**: *Shaded Sandstone Gatehouse Pavilion* — Monumental hand-carved sandstone portal with tensile fabric sun-shades, terracotta cooling grilles, carved entry archways, and cooling stone water basins.
    - **Mountain / Valley**: *Alpine Granite Portal Pavilion* — Heavy-timber framed chalet entrance with steep-pitched cedar snow roofs, rough-hewn granite plinths, and integrated funicular/gondola ticket hall.
    - **Airport / Gibraltar**: *Airfield Terminal Gatehouse* — Sleek modern passenger processing pavilion with aircraft-grade aluminum panels, tinted glass curtain walls, and automated electronic turnstiles.
    - **Urban Plaza / Municipal**: *Classical Colonnade or Modern Metro Entrance* — Fluted stone colonnades or contemporary subterranean metro subway portal with illuminated digital transit signage and glass turnstile barriers.
    - **Potrero Dirt / Rural Grassroots**: *Rustic Timber Post Gatehouse* — Weathered cedar post-and-beam turnstiles, corrugated iron roof awning, and hand-painted wooden club crest boards.

#### T14.3 South Gatehouse Integration, Plinths & Structural Welds
- Flush bonding between the southern entrance pavilion and the grandstand perimeter wall.
- Elevated concrete/stone foundation plinth casting dynamic drop shadows onto the surrounding concourse ground.
- Pedestrian turnstile lanes, queue barriers, and illuminated stadium name marquee lettering.

#### T14.4 Vitest Test Suite & Regression Verification
- Comprehensive test suite in `src/game/__tests__/phaseT14_OuterWallsAndEntrances.test.ts` validating perimeter enclosure geometry across all 4 shapes and context-aware entrance pavilion selection.

---

### Phase T15: Surroundings Overhaul, New "Desert" Environment & Fixed Skyline Width Alignment [PENDING]
*Priority: Dedicated "Desert" Surrounding Type (Dunes, Mesas, Heat Haze), Fixed Skyline Lateral Bounds & Flank Perspective Alignment*  
*Daily Token Budget Profile: Scope: `src/game/environmentRenderer.ts`, `src/game/stadiumRenderer.ts`, `src/types/stadium.ts`, `src/game/__tests__/phaseT15_SurroundingsOverhaulAndWidth.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T15.1 New Dedicated "Desert" Surrounding Environment (`desert`)
- **Vast Arid Desert Vista**:
  - *Panoramic Northern Horizon*: Deep shifting sand dunes with wind-rippled crests, dramatic sandstone rock buttes and flat-topped mesas, and distant desert oasis date palms.
  - *Dynamic Atmospheric Effects*:
    - Daytime: Shimmering high-temperature mirage wave refraction over the horizon dunes.
    - Sunset / Golden Hour: Spectacular amber and crimson gradient skies with long cast desert shadows.
    - Night: Crystalline clear arid desert night sky with dense glittering starfields, shooting stars, and a luminous crescent moon.
  - *Harmonious Desert Palette*: Deep desert ochres, sun-baked terracotta, golden sand drifts (`#d97706`, `#b45309`, `#f59e0b`, `#78350f`, `#fef3c7`).

#### T15.2 Fixed Skyline Width & Lateral Bounds Locking
- Lock lateral bounds of the surrounding environment on both sides to the **exact fixed width of the northern skyline and panoramic horizon** (`horizonLeftX` to `horizonRightX`).
- Creates an unbroken, cohesive rectangular environmental frame spanning the entire vertical vista, eliminating uneven side spillover.

#### T15.3 High-Oblique Flank Alignment & Southern Perspective Radiation
- Surrounding terrain contours, environmental foliage, and geological features radiate outward toward the southern foreground in harmonious 1-point oblique perspective, perfectly aligning with stadium concourse angles.

#### T15.4 Vitest Test Suite & Regression Verification
- Dedicated test suite in `src/game/__tests__/phaseT15_SurroundingsOverhaulAndWidth.test.ts` validating the desert environment, horizon width locking, and perspective flank angles.

---

### Phase T16A: Immediate Stadium Grounds & Concourse Architecture (The Physical Surrounding Area) [PENDING]
*Priority: Focus Beyond the Horizon: Deep Physical Ground Detailing Framing the Stadium (Paved Plazas, Turnstile Courtyards, Ticket Booths, Parking Bays, Lighting Bases & Kiosks Across All 9 Grounds), Zero-Bus Water Coherence (Catamarans, Water Taxis, Mooring Piers)*  
*Daily Token Budget Profile: Scope: `src/game/environmentRenderer.ts`, `src/game/stadiumRenderer.ts`, `src/types/stadium.ts`, `src/game/__tests__/phaseT16A_ImmediateGroundsAndConcourse.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T16A.1 Shifting Focus to the Immediate Stadium Perimeter (East, West, South, North Concourses)
- **Direct Focus on the Surrounding Stadium Grounds**:
  - Explicit Rule: Cease over-emphasizing the distant northern skyline and horizon. Phase T16A focuses 100% on the **physical ground area immediately framing and surrounding the stadium structure**.
  - Instead of a flat colored wash or basic procedural texture, the grounds surrounding the stands and pitch apron are transformed into a living, physical 32-bit architectural environment:
    - *Physical Paving & Concourse Geometry*: Interlocking stone pedestrian plazas, expansion joints, concrete perimeter curbs, drainage cast grates, painted directional arrows, and tactile concourse walkways wrapping around all 4 sides.
    - *Authentic Concourse Structures*: Freestanding ticket sales kiosks, souvenir program booths, club merchandise stalls, food & drink concession huts, mobile food trucks, and waste receptacles.
    - *Stadium Infrastructure Footings*: Monumental reinforced concrete pylon footing piers anchoring the 4 floodlight towers into the ground, electrical transformer enclosures, security turnstile cages, and perimeter entrance gates.
    - *Paved Parking & Transit Zones*: Marked vehicle parking bays, painted disabled parking stalls, bicycle parking racks, and taxi drop-off lanes.

#### T16A.2 Deep 32-Bit Texture & Substrate Material Evolution for All 9 Grounds
- **Genuine Visual Substrate Transformation**:
  - Selecting a ground option genuinely transforms the concourse floor, textures, materials, and micro-details:
    1. `industrial_asphalt`: Heavy weathered bitumen with tar crack repair lines, poured concrete expansion joints, drainage cast grates, and subtle rainbow motor oil slicks.
    2. `urban_plaza`: Dual-tone interlocking granite pavers with ornamental contrast banding, polished stainless steel bollards, and modern slot drainage channels.
    3. `victorian_cobblestone`: Tactile fan-pattern dithered cobblestones with worn mortar joints, cast-iron utility access covers, and wet reflective puddle sheens.
    4. `suburban_park`: Crushed gravel walkways with timber border edges, neat mowed grass strips, concrete sidewalk curbs, and fallen leaf scatter.
    5. `potrero_dirt`: Sun-cracked red clay soil with scattered stone pebbles, wild dandelion tufts, muddy tire ruts, and dusty chalk line remnants.
    6. `mountain_rock`: Rough-hewn alpine granite flagstones, jagged exposed bedrock outcrops, crushed scree gravel borders, and alpine moss patches.
    7. `beach_sand`: Wind-swept fine golden beach sand with tidal ripple patterns, sea shell fragments, and drift lines along retaining walls.
    8. `marine_floating`: Heavy industrial pontoon caisson concrete with sea-salt stains, wet glossy slipway planks, non-skid rubberized deck tread, and rusted steel mooring fittings.
    9. `airport_runway`: Heavy airfield reinforced concrete slabs with bitumen joint sealant, yellow taxiway guidance lines, inset runway edge lights, and rubber tire landing scuffs.

#### T16A.3 Context-Aware Vehicle & Transport Coherence (Zero Buses on Water!)
- **Strict Real-World Vehicle Coherence**:
  - Eliminates immersion-breaking generic vehicles across incompatible grounds:
    - **Marine Floating / Ocean**: **ZERO wheeled city buses or transit depots**! Replaced with: twin-hull passenger catamarans, water taxis, patrol pilot boats moored at floating finger piers, pontoon lifebuoy stations, nautical caisson mooring bollards, and an illuminated pontoon helicopter landing pad with a bold "H" marker.
    - **Desert**: 4x4 off-road safari expedition rovers, desert sand buggies, shaded water cisterns, clay cooling amphoras, and date palm planters.
    - **Mountain / Valley**: Funicular cable-car gondola cabins, mountain rescue 4x4s, snowplow trucks, stacked firewood logs, and alpine signposts.
    - **Airport / Gibraltar**: Aircraft baggage tugs with luggage trailers, passenger tarmac transfer shuttles, windsock masts, and airfield fire/rescue tenders.
    - **Urban / Victorian / Industrial**: City transit double-decker buses, vintage electric trams, delivery vans, food kiosk trailers, and turnstile ticket booths.

#### T16A.4 Vitest Test Suite & Zero-Allocation Performance Validation
- Dedicated test suite in `src/game/__tests__/phaseT16A_ImmediateGroundsAndConcourse.test.ts` verifying immediate ground structures, texture rendering, zero-bus water coherence, and zero memory allocation during gameplay.

---

### Phase T16B: Master "No-Stand" Spatial Footprint Engine & Shape-Adaptive Backdrops [PENDING]
*Priority: Populate the Grandstand Footprint Void Across All 4 Shapes (Rectangular, Trapezoid, Round Bowl, Oval Curve) with Unique Contextual Architecture (Grassy Potrero Embankments, Alpine Pine Berms, Urban Streets & Bus Stops, Coastal Boardwalks & Docks, Desert Oasis Tents)*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/game/environmentRenderer.ts`, `src/game/__tests__/phaseT16B_NoStandSpatialBackdropEngine.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T16B.1 Overhaul of the "No-Stand" Grandstand Footprint Void
- **Elimination of the Empty Void**:
  - Defect Addressed: Currently, selecting "No Stand" (`none` / `no_stand`) leaves an unrendered void where the grandstand normally sits, flattening the area and failing to deliver a compelling visual experience.
  - Solution: Actively populate the exact physical area where the grandstand usually sits with rich, bespoke 32-bit architectural and landscape scenes driven by the selected backdrop option.
- **Physical Boundary Retention**:
  - Pitchside perimeter barriers (chain-link fence, red brick wall, heavy timber fence, anti-barristas wire, glass balustrade, or functional concrete) remain anchored at the pitch apron edge.
  - Supporter crowd sprites lean naturally along the perimeter barrier, with casual spectators relaxing, sitting, or walking across the open landscape behind it.

#### T16B.2 4-Shape Adaptive Spatial Footprint Geometry
- The no-stand infill scene dynamically maps to the exact contour of the missing sector across all 4 stadium shapes:
  - *Rectangular / Square*: Fills the rectilinear goal-end or touchline zone up to the outer perimeter boundary, seamlessly capped by adjoining corner stands.
  - *High-Oblique Trapezoid*: Perspective-angled infill expanding smoothly toward the southern foreground in true 1-point perspective.
  - *Round Coliseum Bowl*: Radial circular curvature matching the coliseum bowl radius, smoothly capping adjoining stand sector sidewalls.
  - *Oval Racetrack Bowl*: Semicircular goal-bend horseshoe or straight touchline curve infill following the Olympic oval contour.

#### T16B.3 Bespoke Spatial Scene Renders for Every Backdrop Option
- **1. Alpine / Mountain Backdrop**:
  - Grassy hillside pine-forest berm (talud) sloping gently up from pitchside barriers.
  - Winding gravel walking trail lined with alpine wildflowers and wooden signposts.
  - Rustic wooden alpine scorer's cabin with cedar shake shingles.
  - Timber picnic tables and standing supporters leaning on split-rail cedar fences.
- **2. Urban / Skyline Backdrop**:
  - Paved asphalt city street with painted pedestrian crosswalks and granite curbs.
  - Authentic city bus stop with glass shelter and route map display.
  - Vintage newsstand / tobacco kiosk with folded newspapers and snacks.
  - Wrought-iron street lampposts, parking meters, and spectators watching the match from elevated park benches.
- **3. Coastal / Marine Ocean Backdrop**:
  - Heavy wooden seaside boardwalk with weathered timber pilings and creosote piers.
  - Cast-iron mooring bollards with coiled hemp nautical ropes.
  - Small docked fishing skiffs and motorboats gently bobbing in the water.
  - Red-and-white lifebuoy stations, seagulls perched on timber posts, and supporters leaning on maritime railings overlooking the bay.
- **4. Rural / Potrero Dirt Backdrop**:
  - Terraced earthen embankment dotted with dandelion tufts, patches of wild grass, and exposed clay soil.
  - Local supporters sitting on folding canvas deck chairs, wooden bleacher logs, and upturned wooden crates.
  - Parked vintage bicycles leaning against rustic wire fences.
  - Open-air charcoal barbecue food stall with authentic animated grill smoke.
- **5. Industrial Asphalt Backdrop**:
  - Inset industrial freight railway siding with a parked, weathered rust-red cargo boxcar.
  - Weathered corrugated galvanized iron perimeter hoarding with retro advertising stencils.
  - Wooden utility telephone poles with cross-arms and sagging overhead wires.
  - Brick security guardhouse with a barred window and external floodlight.
- **6. Desert Oasis Backdrop**:
  - Wind-sculpted sand dune slope descending naturally to a low dry-stone retaining wall.
  - Grove of towering date palms with hanging fruit clusters casting soft shade.
  - Bedouin-style striped canvas shade tents with colorful patterned ground rugs.
  - Terracotta clay water amphoras and resting spectators sheltered from the desert sun.

#### T16B.4 Vitest Test Suite & Visual Regression Verification
- Dedicated test suite in `src/game/__tests__/phaseT16B_NoStandSpatialBackdropEngine.test.ts` verifying no-stand spatial footprint bounding across all 4 shapes, backdrop scene rendering, and zero allocation performance.

---

### Phase T17A: Stadium Exterior Structural Supports & Partial Coverage Architecture (5 Tiers, 9 Typologies & 5-Element Color Engine) [PENDING]
*Priority: No-Coverage Structural Load-Bearing Customization (5 Tier Options + Raw Option), Partial Coverage Perimeter Architecture (Old Trafford Trusses, 9 Typologies across 5 Tiers), 3–5 Customizable Color Elements (9 Base Colors + Natural Material) & Step 1 Creator Refactor*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT17A_StructuralSupportsAndPartialCoverage.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T17A.1 No-Coverage Structural Load-Bearing Supports (5 Tiered Typologies + Raw Option)
- **The Raw Baseline**:
  - `none` ("No Outside Decorations"): Pure bare exposed grandstand rakes, foundation plinths, and rear wall masonry as currently rendered.
- **5 Tier-Calibrated Load-Bearing & Decorative Supports**:
  - **Tier 1 (Municipal)**: `hardwood_timber_beams` — Heavy diagonal cross-braced timber struts, treated cedar support posts, weathered wooden trestles, and galvanized iron mounting bolts.
  - **Tier 2 (Brutalist)**: `cement_cast_buttresses` — Monolithic poured-in-place concrete shear fins, angled concrete raker beams, and textured formwork grooves holding up upper tier cantilevers.
  - **Tier 3 (Industrial)**: `riveted_steel_girders_pipes` — Exposed red oxide/galvanized industrial I-beams, vertical storm-drainage downpipes, conduit service conduits, and catwalk brackets.
  - **Tier 4 (Victorian)**: `ornate_iron_trusses_piers` — Decorative Victorian cast-iron filigree brackets, ornamental brick-clad buttress piers, and external steel tension tie-rods.
  - **Tier 5 (Modern)**: `composite_aero_pylons` — Sweeping aerodynamic composite pylon masts, illuminated exterior LED service chases, and high-tensile carbon cable backstays.

#### T17A.2 Partial Coverage Perimeter Architecture (Old Trafford Skeletons, 9 Designs across 5 Tiers)
- **Architectural Philosophy**:
  - Surrounds the grandstand perimeters with monumental external structures, exposed steel trusses, concourse galleries, and perimeter overhang roofs (inspired by iconic venues like Old Trafford).
- **9 Authentic Typologies Distributed across 5 Architectural Tiers**:
  - **Tier 1 (Municipal - 1 Design)**:
    - *Design 1*: `municipal_open_corrugated_apron` — Low-slung perimeter corrugated steel apron with treated timber rafters, simple rain gutters, and open perimeter turnstile gates.
  - **Tier 2 (Brutalist - 2 Designs)**:
    - *Design 1*: `brutalist_concrete_pavilions` — Stark geometric concrete outer pavilions with cantilevered mezzanine slabs, narrow slot windows, and elevated spectator ramps.
    - *Design 2*: `brutalist_stepped_colonnade` — Monumental fluted concrete colonnade supporting outer concourse galleries with deep architectural shadow reveals.
  - **Tier 3 (Industrial - 2 Designs / Old Trafford Style)**:
    - *Design 1*: `industrial_old_trafford_steel_truss` — Towering tubular steel cantilever roof masts, quadrant corner trusses, external red-painted staircase towers, and dramatic perimeter roof overhangs.
    - *Design 2*: `industrial_dockyard_gantry_skeleton` — Heavy lattice crane gantry skeleton wrapping the outer stands, elevated metal-grate concourse walkways, and corrugated service bays.
  - **Tier 4 (Victorian - 2 Designs)**:
    - *Design 1*: `victorian_red_brick_archway` — Grand multi-story red brick facade with rounded Romanesque archways, ornamental stone keystones, and glazed clerestory windows.
    - *Design 2*: `victorian_iron_glazed_arcade` — Intricate Victorian cast-iron arcade gallery with arched glass verandas, decorative copper cupolas, and gaslamp-style lanterns.
  - **Tier 5 (Modern - 2 Designs)**:
    - *Design 1*: `modern_curved_glass_atrium` — Sweeping curtain-wall glass atrium envelope, illuminated perimeter soffit, and stainless steel space-frame ribs.
    - *Design 2*: `modern_composite_floating_ribbon` — Dynamic cantilevered composite ribbon canopy wrapping around exterior concourse with an integrated perimeter neon light band.

#### T17A.3 5-Element Color Customization Engine & Natural Material Finishes
- **5 Independent Architectural Color Zones**:
  1. *Primary Structural Frame* (Main columns, load-bearing pillars, heavy girders)
  2. *Secondary Facade Cladding* (Exterior infill panels, wall masonry, siding)
  3. *Accent Trusses & Bracing* (Cross-braces, utility pipes, tension cables, purlins)
  4. *Roof Cantilever Trim* (Fascia boards, perimeter coping, rain gutters)
  5. *Glazing & Lighting Accent* (Window tint, LED ribbon illumination, glass panels)
- **Accessible 10-Color Palette**:
  - 9 Standard Architectural Colors: White (`#f8fafc`), Black (`#0f172a`), Red (`#dc2626`), Blue (`#2563eb`), Yellow (`#facc15`), Purple (`#9333ea`), Orange (`#ea580c`), Green (`#16a34a`), Brown (`#78350f`).
  - 10th Palette Option: `material_natural` ("No Color") — Renders authentic unpainted material finishes (galvanized steel, aged brick, cast concrete, treated cedar, anodized aluminum).

#### T17A.4 Step 1 Creator Refactor & Live Isometric Preview
- Comprehensive Step 1 UI integration in `StadiumCreatorModal.tsx`:
  - Coverage Mode selector: `none` ("No Outside Decorations" / Structural Supports) vs `partial` ("Partial Coverage Facade").
  - Tier-aware design pickers and real-time color swatches.
  - Live WYSIWYG canvas updates showing structural supports and partial coverage pavilions in real-time.

#### T17A.5 Vitest Test Suite & Regression Verification
- Dedicated test suite in `src/game/__tests__/phaseT17A_StructuralSupportsAndPartialCoverage.test.ts` verifying all 5 support options, 9 partial coverage designs, color element mapping, and zero memory regressions.

---

### Phase T17B: Monumental Full Coverage Mega-Stadium Enclosures & Full Pitch/Retractable Roof Systems [PENDING]
*Priority: 3 Full Enclosure Archetypes (Industrial, Modern, Victorian) with 3 Designs Each (9 Master Envelopes: Bernabéu, Allianz, Tottenham, Dortmund Gantry, Gothic Palace, etc.), Full Pitch/Retractable Roof Systems (Schalke Dome), 3–5 Color Elements & Step 1 Integration*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT17B_FullCoverageAndRetractableRoofs.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T17B.1 3 Full Coverage Archetypes & 9 Master Enclosure Envelopes
- **Modern Mega-Arenas (3 Distinct Master Designs)**:
  - *Design A (New Bernabéu Metallic Ribbon)*: Flowing continuous metallic louvers wrapped in a reflective aerodynamic ribbon skin with dynamic horizontal slit lighting and smooth rounded corners.
  - *Design B (Allianz Luminous Diamond Cushion)*: Diamond-patterned ETFE inflatable air cushions fully enveloping the stadium facade with luminous translucent backlighting and glowing seam contours.
  - *Design C (Tottenham Faceted Glass & Engineered Steel)*: Chiseled geometric glass facets, dark powder-coated structural exoskeleton, soaring multi-story south glass atrium, and dramatic curved roof envelope.
- **Industrial Monumental Enclosures (3 Distinct Master Designs)**:
  - *Design A (Dortmund Megastructure Pylon Cage)*: Colossal 62-meter yellow steel pylons projecting above the roofline with suspension stay cables supporting a full stadium roof and corrugated steel perimeter envelope.
  - *Design B (Harbor Shipyard Gantry & Lattice Exoskeleton)*: Heavy maritime shipyard tubular lattice crane towers, exterior glazed elevator shafts, riveted iron cladding, and full steel gantry roof.
  - *Design C (Brutalist Power Station Monolith)*: Heavy weathering Corten steel panels, monumental cooling-tower inspired curved concrete facades, and massive industrial overhead gantry crane roof beams.
- **Victorian Architectural Enclosures (3 Distinct Master Designs)**:
  - *Design A (High-Gothic Heritage Brick & Iron Palace)*: High Victorian Gothic red brick facade with stone mullion tracery, pointed arches, slate gables, and heavy timber/wrought iron roof trusses.
  - *Design B (Crystal Palace Great Exhibition Vault)*: Soaring cast-iron and transparent glass barrel vault covering the entire grandstand perimeter and concourses with decorative iron cresting.
  - *Design C (Imperial Grand Exhibition Rotunda)*: Classical rotunda facade with colossal fluted columns, copper dome accents, ornamental friezes, and heritage clerestory roof lantern.

#### T17B.2 Full Pitch & Retractable Roof Systems
- **Pitch Enclosure Typologies**:
  - *Standard Roof Aperture*: Complete bowl coverage with open center sky aperture over playing pitch.
  - *Full Translucent Polycarbonate Pitch Roof*: 100% all-weather pitch protection permitting full natural turf photosynthesis via UV-translucent panels.
  - *Retractable Dome Roof (Schalke Veltins-Arena Style)*: Motorized dual-panel telescopic roof system that slides completely shut over the pitch for extreme weather or arena concerts.
  - *Retractable Pitch Ground Floor*: Integrated exterior grass nursery tracks allowing pitch turf to slide outside the stadium envelope.

#### T17B.3 5-Element Color Customization for Mega-Enclosures
- Shared 5-element color customization engine:
  1. *Primary Shell Facade* (Metallic ribbons, ETFE cushions, brick walls)
  2. *Secondary Louver & Panel Trim*
  3. *Structural Pylon & Cable Accents*
  4. *Roof Outer Membrane*
  5. *Architectural Backlighting / Glass Glow*
- Full 10-option color palette (9 base colors + Natural Material finish).

#### T17B.4 Vitest Test Suite & Regression Verification
- Dedicated test suite in `src/game/__tests__/phaseT17B_FullCoverageAndRetractableRoofs.test.ts` verifying all 9 full coverage designs, retractable roof states, and color application.

---

### Phase T18: Ultra-Detailed 32-Bit Skyview "Fishview" Porthole Engine & Environmental Harmonizer [PENDING]
*Priority: 360° Spherical Fisheye Macro View High-Detail Overhaul: Full 32-Bit Integration of Surroundings, Grounds, Stands, Roofs, and New T17 Exterior Coverage Systems, Dynamic Weather & Circular Porthole Preview*  
*Daily Token Budget Profile: Scope: `src/game/environmentRenderer.ts`, `src/game/skyCamRenderer.ts`, `src/game/stadiumRenderer.ts`, `src/components/StadiumSelectorModal.tsx`, `src/components/StadiumCreatorModal.tsx`, `src/game/__tests__/phaseT18_SkyviewFishviewOverhaul.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T18.1 Master 32-Bit Fisheye "Fishview" Optical Projection Engine
- **360° Spherical Fisheye Lens Model**:
  - Re-engineer the macroscopic skycam perspective into an ultra-high-definition 32-bit optical fisheye lens projection (`r_distorted = R * sin(theta * k)`).
  - Clean spherical vignette with brass/steel porthole bezel, anti-aliased edge falloff, and subtle chromatic lens aberration at extreme periphery.
  - Centered tactical HUD reticle with compass rose orientation markings (N/S/E/W).

#### T18.2 Comprehensive Visual Synchronization of All Stadium Systems
- **Surroundings Vista Integration (Phase T15)**:
  - Deep 32-bit panoramic horizons rendered into the spherical periphery: mountain ranges, maritime ocean waves with foam, dense forest canopies, sprawling urban skylines, arid desert dunes.
- **Grounds & Concourse Detail Integration (Phase T16)**:
  - Paved plazas, parking zones with tiny pixel vehicles, tree-lined entry walkways, spectator concourses, and bespoke thematic landmarks mapped directly onto the curved spherical ground plane.
- **Grandstand & Bowl Typology Integration (Phases T1–T12)**:
  - High-oblique grandstands, multi-floor tiers, vomitory tunnels, and The Wall continuous terraces rendered with accurate pitch-to-rim elevation and crowd color densities.
- **Roof Architecture & Fluid Canopies Integration (Phase T13)**:
  - Sweeping cantilever trusses, barrel vaults, tensile cables, and fluid rounded corner canopies casting authentic dynamic 32-bit drop shadows onto spectator seating decks.
- **Exterior Coverage & Structural Supports Integration (Phases T17A & T17B)**:
  - Accurately renders No-Coverage load-bearing struts and pipes radiating outward from stands.
  - Accurately renders Partial-Coverage Old Trafford cantilever masts, steel skeletons, and outer concourse pavilions.
  - Accurately renders Full-Coverage mega-enclosures (New Bernabéu metallic ribbon, Allianz glowing diamond cushions, Tottenham glass facade, Dortmund yellow pylons, and Schalke retractable roof dome)!

#### T18.3 Dynamic 32-Bit Atmospheric Weather & Lighting Overlays
- **Real-Time Weather Effects in Fisheye Lens**:
  - *Rain*: Radial rainfall streaks with wet glossy pitch specular highlights and water puddle reflections on concourses.
  - *Snow*: Swirling blizzard snowflakes with procedural snow accumulation along roof edges and outer perimeter grounds.
  - *Fog*: Low-lying volumetric fog banks rolling in from surrounding terrain.
  - *Night Match Lighting*: Atmospheric floodlight glow with volumetric 4-corner beam cones, pitch illuminance, and glowing stadium perimeter lights.

#### T18.4 Circular Porthole Preview UI Integration
- Modern circular porthole modal in `StadiumSelectorModal.tsx` and `StadiumCreatorModal.tsx`:
  - Instant live rendering of current stadium configuration without loading hitch.
  - Smooth interactive pan and zoom controls within the porthole.

#### T18.5 Vitest Test Suite & Zero-Allocation Performance Validation
- Dedicated test suite in `src/game/__tests__/phaseT18_SkyviewFishviewOverhaul.test.ts` validating fisheye coordinate transformations, multi-system synchronization, weather rendering, and locked 60 FPS performance.

---

### Phase T19: Cinematic Southern Entrance-to-Skyline Intro & Master T-Series Vitest Suite [PENDING]
*Priority: Dynamic 3-Stage Venue Presentation, Master T-Series Vitest Suite & Budget Hardware 60 FPS Profiling*  
*Daily Token Budget Profile: Scope: `src/game/camera.ts`, `src/game/engine.ts`, `src/components/PitchCanvas.tsx`, `src/game/__tests__/phaseT19_MasterSuite.test.ts`*
- Dynamic 3-stage pre-match camera intro sequence celebrating venue architecture (Southern grounds & entrance -> Skyline pan & tilt -> Kickoff descent).
- Comprehensive unit and integration test coverage verifying all T-series features, pitch invariance, and geometry.
- Zero-allocation memory profiling maintaining locked 60 FPS performance on budget devices.

---

### Phase T20: Lightweight Cinematics Suite & Slow-Mo Replay Buffer [PENDING]
*Priority: Presentation Polish Without Performance Cost*  
*Daily Token Budget Profile: Scope: `src/game/engine.ts`, `src/components/MatchHUD.tsx`, `src/game/__tests__/phaseT20_CinematicsAndReplay.test.ts`*
- 300-frame circular buffer of essential state (player positions, ball, camera).
- Automatic slow-mo on goals, penalties, red cards, tight offsides. Instant any-key skip.
- Entrance walkout sequence integrating dugout bench camera and entrance tunnel camera hooks.

---

### Phase T21: Stadium Revenue Engine, Seat Tier Ranking & Pre-Match Attendance Economics [PENDING]
*Priority: Seat Pricing Hierarchy (Tier 6 VIP, Stand Orientation, Vertical Mid-Tier Premium), Municipal Penalty Gate, Pre-Match Attendance Distribution & Matchday Gate Revenue Calculator*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/stadiumRegistry.ts`, `src/game/matchRules.ts`, `src/game/__tests__/phaseT21_StadiumRevenueEngine.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T21.1 Seat Ranking Classification & Base Pricing Multipliers
- **6 Architectural Seat Levels**:
  - Every seat in the stadium is ranked based on its construction grade, setting the baseline matchday ticket price:
    - **Level 1 (Municipal)**: Raw timber tablones ($10 baseline). Low prestige, bare-bones infrastructure.
    - **Level 2 (Brutalist)**: Solid poured concrete ledges ($22 baseline). Heavy fortress concrete.
    - **Level 3 (Industrial)**: Steel-framed timber benches / metal flip-seats ($38 baseline).
    - **Level 4 (Victorian)**: Polished hardwood / iron theater chairs ($55 baseline). Historical craftsmanship.
    - **Level 5 (Modern)**: Ergonomic luxury bucket seats ($75 baseline). High-tech comfort.
    - **Level 6 (VIP Hospitality)**: Premium hospitality armchairs & suites ($250 baseline). Calculated separately.
- **Municipal Rating Drop Penalty Enforcement**:
  - The qualification engine audits all stands. If any stand or tier has Architectural Grade 1 (Municipal), the entire stadium qualification collapses to `municipal`. Open "no stand" sectors yield a higher rating than Municipal stands.

#### T21.2 Positional & Vertical Tier Pricing Hierarchy
- **Stand Orientation Multipliers**:
  - **West Stand (Main Grandstand / TV Sideline)**: Prime viewing perspective with player benches and tunnel; commands **1.40×** baseline price.
  - **East Stand (Opposite Touchline)**: Unobstructed sideline view; commands **1.20×** baseline price.
  - **North & South Stands (Goal Ends)**: Atmospheric supporter terraces behind the nets; command **0.90×** baseline price.
  - **Corner Stands**: Angled corner quadrant viewing; commands **0.85×** baseline price.
- **Vertical Tier Elevation Hierarchy (Sightline Acoustics & Angles)**:
  - **3-Tier Grandstands**:
    - **Tier 2 (Middle Balcony / Club Level)**: Optimal panoramic vantage; commands **1.30×** mid-tier premium.
    - **Tier 1 (Pitchside Level)**: Close to action; baseline **1.00×**.
    - **Tier 3 (Upper Rim)**: High altitude viewing; **0.85×** budget pricing.
  - **4-Tier Grandstands**:
    - **Tiers 2 & 3 (Middle Tiers)**: Premium viewing elevation; command **1.25×** mid-tier premium.
    - **Tier 1 (Pitchside)**: Standard baseline **1.00×**.
    - **Tier 4 (Nosebleed Deck)**: High upper rim; **0.80×** discount pricing.
  - **Wall Stands (Continuous Steep Stehplatz)**:
    - Uniform democratic terrace pricing: **1.00×** across all steps, reflecting unbroken fan culture solidarity.

#### T21.3 Pre-Match Dynamic Attendance & Revenue Calculator
- **Attendance Scaling by Match Crowd Level**:
  - `low`: 30%–40% stadium capacity fill.
  - `moderate`: 55%–65% capacity fill.
  - `crowded`: 80%–90% capacity fill.
  - `packed`: 98%–100% capacity fill (sold out).
- **Logical Sector & Tier Distribution**:
  - At `low` attendance, VIP hospitality holds only 5–10 executive attendees, lower tiers have scattered supporters, and upper tiers remain nearly empty.
  - At `crowded` and `packed`, VIP suites sell out alongside regular tiers.
- **Live Gate Revenue Formula**:
  - `Revenue = SUM(Attendees_per_sector × BasePrice(SeatGrade) × OrientationMultiplier × TierElevationMultiplier)`
  - VIP seats are summed independently: `VIPRevenue = VIPAttendees × $250 × OrientationMultiplier`.
  - Outputs live total match attendance count, capacity fill percentage, and total matchday gate receipts in currency ($/credits).

#### T21.4 Vitest Test Suite & Economic Validation
- Test suite in `src/game/__tests__/phaseT21_StadiumRevenueEngine.test.ts`:
  - Verifies ticket pricing math across all 6 seat levels, orientations, and tier vertical elevations.
  - Verifies Municipal rating drop penalty and VIP tier Grade 3+ gate.
  - Verifies attendance distribution scaling from low to packed.

---

### Phase T22: Broadcast Team Presentation Engine (3 Cinematic Modes: Line-by-Line, Full View & Classical) [PENDING]
*Priority: 3 Starting XI Reveal Modes (Line-by-Line with Up to 6 Cards & Portrait Photo Containers, Full View Number-Sorted List + Tactical Pitch Board, Classical Positional List), Custom Colors, Transparency & Border Styling, Gate Revenue Card*  
*Daily Token Budget Profile: Scope: `src/game/camera.ts`, `src/game/engine.ts`, `src/components/PitchCanvas.tsx`, `src/components/MatchHUD.tsx`, `src/components/PreMatchPresentationModal.tsx`, `src/game/__tests__/phaseT22_TeamPresentationModes.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T22.1 3 Distinct Starting XI Presentation Scene Modes (Home Team First, Then Away Team)
- **Mode 1: "Line by Line" (Dynamic Sequential Group Reveal)**:
  - Sequential reveal building dramatic pre-match anticipation group by group:
    1. *Manager Card*: Prominent standalone hero card displaying the manager's name, tactical system badge, and title.
    2. *Goalkeeper Line*: 1 dedicated card for the starting goalkeeper.
    3. *Defenders Line*: Group card row fitting all starting defenders (e.g., 3, 4, or 5).
    4. *Midfielders Line*: Group card row fitting all starting midfielders (up to 5 or 6).
    5. *Attackers Line*: Group card row fitting all starting attackers (e.g., 1, 2, or 3).
  - **Dynamic Card Sizing & Up to 6 Cards Per Line**:
    - Each line row dynamically scales to comfortably fit **up to 6 player cards per line** (the maximum tactical spread in 11v11 football).
    - Each player card cleanly renders:
      - Player Full/Kit Name
      - Squad Jersey Number
      - **Player Portrait Box Container**: Fixed aspect ratio portrait box rendered in solid team color or empty frame with subtle inner bevel, architected with a clean image hook ready to accept the future player face generation engine.
  - After completing all positional lines, it renders the complete Starting XI formation board with the bench substitutes listed cleanly on the side.
- **Mode 2: "Full View" (Squad Number List -> Tactical Pitch Board -> Bench)**:
  - Sequence:
    1. First renders a sleek vertical list of all 11 starting players **organized strictly by jersey number from lowest to highest** (top to bottom).
    2. Seamlessly switches to a full-field tactical pitch board showing the starting XI positioned directly at their formation coordinates on the turf, with Player Name and Number in crisp high-contrast text and the Manager's name anchored below.
    3. Concludes by rendering the bench substitutes on a dedicated side panel / card.
- **Mode 3: "Classical" (Hierarchical Positional List)**:
  - Pure retro sports television presentation without a 2D formation pitch diagram.
  - Displays a clean, elegant vertical list in strict tactical hierarchy from top to bottom:
    1. *Manager* at the top header
    2. *Goalkeeper* below
    3. *Defenders* below
    4. *Midfielders* below
    5. *Attackers* at the bottom
  - Within each positional group, players are automatically sorted from lowest to highest squad number.
  - Renders squad number alongside player name in clean, aligned typography, followed by a dedicated bench reserves block.

#### T22.2 Broadcast Presentation Visual Styling & Customization Engine
- **Granular Visual Styling Options per Broadcast Channel**:
  - *Color Customization*: Primary card color, secondary text/trim color, background container fill, and accent glow.
  - *Opacity & Transparency Slider*: User-adjustable opacity (`0.0` to `1.0`), supporting solid retro arcade cards or modern translucent frosted-glass aesthetics.
  - *Border Geometry*:
    - `square`: Crisp retro arcade rectilinear boxes with beveled metallic borders.
    - `round`: Contemporary smooth rounded pills and curved card corners.
    - `beveled`: Chiseled angled broadcast sports edges.
  - *Visual Accents*: Optional neon edge glow, subtle scanline texture, and dynamic drop shadows.

#### T22.3 Match Gate Attendance & Revenue Card
- Broadcast intro card displayed immediately prior to lineup reveals:
  - Stadium Name, City, Country, and Venue Shape badge.
  - **Official Attendance**: e.g., `"ATTENDANCE: 51,840 / 54,000 (96.0%)"`.
  - **Matchday Gate Receipts**: e.g., `"MATCHDAY REVENUE: $3,215,400"`.
  - Executive Box vs General Admission revenue breakdown strip.

#### T22.4 Seamless Pre-Match Sequence Pipeline & Instant-Skip
- Unified pre-match flow:
  1. Southern Grounds & Entrance Pan
  2. Northern Skyline Vista & Macro Arena Panorama
  3. Official Attendance & Gate Receipts Card
  4. Home Team Starting XI Presentation (Line-by-Line, Full View, or Classical)
  5. Away Team Starting XI Presentation (Symmetric Presentation)
  6. Tunnel Walkout & Dugout Bench Cam
  7. Smooth Camera Descent to Center Circle for Kickoff
- Instant-skip capability: Pressing any button or tapping the screen smoothly advances to the next stage or immediately to kickoff.

#### T22.5 Vitest Test Suite & Regression Verification
- Dedicated test suite in `src/game/__tests__/phaseT22_TeamPresentationModes.test.ts` verifying all 3 presentation modes, number sorting, 6-card row scaling, and styling engine.

---

### Phase T23: Broadcast Channel Sponsor Engine & In-Match Dynamic Event Popups [PENDING]
*Priority: 1–3 Procedural Sponsors per Channel, Custom Text Logos & Brand Colors, In-Match Lower-Third TV Bugs (Corners, Free Kicks, Penalties, Halftime 2–3s) & In-Universe Sponsors for 5 Preset Channels*  
*Daily Token Budget Profile: Scope: `src/types/stadium.ts`, `src/game/graphicsConfig.ts`, `src/components/MatchHUD.tsx`, `src/components/GraphicsSettingsModal.tsx`, `src/game/__tests__/phaseT23_BroadcastSponsorsAndPopups.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T23.1 1 to 3 Procedural Sponsors per Broadcasting Channel
- **Channel Sponsor Configuration**:
  - Each broadcast channel can configure **1 up to 3 official sponsors**.
  - For each sponsor:
    - *Sponsor Name*: Custom text input (e.g., `"UNIQUE CAREER"`, `"Martin's"`).
    - *Brand Colors*: 1 to 3 brand colors (Primary, Secondary, Accent).
    - *Font Style*: Channel font or specialized sponsor typeface.
    - *Border & Badge Shape*: Rectangular card, pill capsule, or minimalist borderless text.
- **Procedural Text-Based Logo Generator**:
  - Automatically synthesizes a stylized 32-bit vector-style brand badge/logo using the selected typography, contrast rules, and colorway without requiring external image assets.
- **Cinematic Presentation Placement Options**:
  - *Bottom Banner*: Anchored cleanly across the bottom lower-third of the presentation screen.
  - *Top Header Strip*: Subtle branded sponsor header bar above lineup cards.
  - *Corner Bug*: Compact sponsor badge placed in corner quadrants (Top-Right, Bottom-Left), automatically adapted to the active presentation mode (Line-by-Line, Full View, Classical).

#### T23.2 In-Match Dynamic Event Sponsor Popups (Lower-Third TV Bugs)
- **Authentic TV Broadcast Event Triggers**:
  - During live gameplay set-pieces, an authentic TV sponsor bug animates into view:
    - **Corner Kicks**: Triggers on corner kick award.
    - **Dangerous Free Kicks**: Triggers on attacking direct free kick award.
    - **Penalty Kicks**: Triggers on penalty award.
    - **Halftime Whistle**: Triggers as teams head to the locker room.
- **Non-Intrusive 2–3 Second TV Bug Animation**:
  - Slides or fades smoothly into the lower-third or corner quadrant.
  - Displays for **2 to 3 seconds**, then cleanly glides or fades away.
  - Positioned strictly outside active ball flight and goalmouth action, ensuring zero gameplay obstruction.

#### T23.3 In-Universe Themed Default Sponsors for 5 Broadcast Presets
- Authentically crafted in-universe sponsors matching channel themes:
  1. **"DRAWSTAR TV"** (Default Arcade):
     - *Sponsor 1*: **"UNIQUE CAREER"** (In-game career mode brand; cyan, electric yellow, white).
     - *Sponsor 2*: **"ARCADE DYNAMICS"** (Retro coin-op hardware tribute; deep blue and neon white).
  2. **"STAR WIN"** (High-Tech Luxury):
     - *Sponsor 1*: **"NEXUS PRO WEAR"** (Futuristic athletic apparel; deep purple, silver, neon white).
     - *Sponsor 2*: **"AERO SPORT"** (Precision sports optics; cyber violet and turquoise).
  3. **"DRAW SPORTS"** (Energetic 2000s Network):
     - *Sponsor 1*: **"POWER TURF"** (High-performance hybrid pitch turf; emerald green and navy blue).
     - *Sponsor 2*: **"STRIKER FUEL"** (Energy drink; electric orange, cobalt blue, white).
  4. **"STAR TV"** (Mainstream Commercial):
     - *Sponsor 1*: **"TELECOM PLUS"** (National telecommunications; vibrant cherry red and pure white).
     - *Sponsor 2*: **"GLOBAL AIR"** (Continental flight airline; gold, navy, white).
  5. **"LEGENDS TV"** (70s/80s Heritage Telecast):
     - *Sponsor 1*: **"MARTIN'S VINTAGE LEATHER"** (Handcrafted traditional football boots; antique blue, rich burgundy, gold).
     - *Sponsor 2*: **"HERITAGE BALL CO."** (Classic 32-panel stitched leather ball maker; deep tan and black).

#### T23.4 Interactive Channel Sponsor Settings & Live Tester
- Dedicated tab in Broadcast Channel settings:
  - Add/Edit/Remove up to 3 sponsors per channel.
  - Real-time procedural logo badge generator preview.
  - Interactive "TEST POPUP" button triggering a live in-engine 3-second simulation.

#### T23.5 Vitest Test Suite & Zero-Allocation Event Loop Verification
- Dedicated test suite in `src/game/__tests__/phaseT23_BroadcastSponsorsAndPopups.test.ts`:
  - Validates procedural sponsor logo badge generation and colorway rendering.
  - Verifies set-piece event triggers (corners, free kicks, penalties, halftime).
  - Confirms strict 2–3s display timers and zero memory allocation during live gameplay.

---

### Phase T24: Broadcast Channel Creator, Scoreboard HUD Themes & 4K Subpixel Enhanced Filter Engine [PENDING]
*Priority: Dedicated Channel Creator Menu (5 Fonts, Shapes, Scoreboard HUD Theme, Contrast Rules), 4-Tone Ambiance Washes, 4K High-Definition Subpixel Filter & 5 Iconic Presets (DRAWSTAR TV, STAR WIN, DRAW SPORTS, STAR TV, LEGENDS TV)*  
*Daily Token Budget Profile: Scope: `src/game/graphicsConfig.ts`, `src/game/filters.css`, `src/components/MatchHUD.tsx`, `src/components/PauseModal.tsx`, `src/components/GraphicsSettingsModal.tsx`, `src/game/__tests__/phaseT24_BroadcastChannelCreator.test.ts` | Target: ~700k–800k tokens (Day 1 Quota)*

#### T24.1 Broadcast Channel Creator Menu
- Dedicated interactive customization panel in Venue/Graphics settings:
  - **Channel Name Input**: User-editable string (up to 16 characters, default: `"DRAWSTAR TV"`).
  - **5 Distinct Broadcast Fonts**:
    1. `arcade_pixel`: Classic 90s arcade bitmap typography.
    2. `modern_sans`: Ultra-crisp contemporary sports sans-serif.
    3. `condensed_sports`: Bold condensed headline typography.
    4. `retro_monospace`: 70s/80s typewriter/teletext tabular font.
    5. `futuristic_display`: Chiseled angled cyber-sports display font.
  - **Component Geometry & Edge Shapes**:
    - `square`: Crisp sharp rectilinear boxes with metallic bevels.
    - `round`: Smooth rounded corner radii and pill-shaped badge contours.
    - `triangular`: Dynamic asymmetric sporty chevron cuts (sharp 45° angle on one edge, square on opposite).
  - **High-Visibility Accessible Colorways**:
    - Primary and secondary channel livery colors.
    - Automated luminance and contrast verification guaranteeing high readability against any pitch grass or crowd background.
  - **Scoreboard HUD & Watermark Theme**:
    - Styled top-right TV watermark bug with channel name and animated broadcast pip.
    - Cohesive scoreboard HUD matching channel font, colors, and shape geometry.
    - Pause menu headers and lineup cards adopt the active channel aesthetic.

#### T24.2 4-Tone Ambiance Washes & 4K Subpixel Enhanced Filter
- **Subtle Atmospheric Tone Overlays**:
  - Very subtle post-process color washes modifying the match lighting mood without compromising sprite clarity:
    - `none`: Natural unfiltered lighting.
    - `blue`: Crisp cool Nordic/continental evening tone.
    - `red`: Warm golden-hour sunset dramatic glow.
    - `green`: Saturated lush classic European pitch wash.
    - `white`: Bright, high-contrast stark modern broadcast illumination.
  - Stackable with any base retro filter (CRT, Scanlines, VHS, Crisp).
- **New 4K Subpixel High-Definition Filter**:
  - Advanced canvas post-process shader pass creating perceived ultra-high-definition fidelity, edge micro-contrast, sharpened pixel contours, and subtle specular crispness on players and ball.

#### T24.3 5 Iconic Default Broadcast Channel Presets
1. **"DRAWSTAR TV"** (Default):
   - 90s arcade sports broadcast aesthetic, arcade pixel font, cyan/yellow/white colorway, square geometry, standard scanline/crisp filter.
2. **"STAR WIN"**:
   - High-tech modern spectacle, modern sans font, white and deep purple tones, round geometry, 4K filter by default.
3. **"DRAW SPORTS"**:
   - Energetic 2000s sports network, condensed sports font, dark navy blue and pure white, sharp triangular/chevron geometric cuts.
4. **"STAR TV"**:
   - 2010s mainstream network, vibrant cherry red and white colors, clean modern layout.
5. **"LEGENDS TV"**:
   - 70s vintage football telecast, retro serif font, antique gold and black palette, VHS filter with subtle warm tone by default.

#### T24.4 Vitest Test Suite & Graphic Regression Verification
- Test suite in `src/game/__tests__/phaseT24_BroadcastChannelCreator.test.ts`:
  - Validates channel creator presets, font switching, geometry shaping, and contrast enforcement.
  - Verifies 4K filter rendering performance locked at 60 FPS.

---

## Token Discipline & Daily Quota Protocol
- **1 Phase = strictly 1 Day's worth of Google AI Studio tokens (~700k–850k tokens)**.
- Every phase terminates in a fully compiled, zero-regression build.
- Zero-scroll console UI invariant across all viewports.
- Zero per-frame memory allocation for sustained locked 60 FPS on $50 smartphones.

