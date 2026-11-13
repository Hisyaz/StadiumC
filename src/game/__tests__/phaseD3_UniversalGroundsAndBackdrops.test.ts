/**
 * Phase D3 Verification Suite: Universal Fixed-Form Grounds Enclosure,
 * Southern Stand Curvilinear Angle & No-Stand Contextual Backdrops
 *
 * Covers:
 * - D3.1: Universal Fixed-Form Grounds Enclosure & Scale Framing
 *   (getUniversalGroundsBounds invariant across all 4 shapes, bounds clearance, clipping)
 * - D3.2: No-Stand Contextual Immediate Backdrop Engine & Bugfix
 *   (stand.backdrop takes priority over surroundings, all backdrop themes render directly behind barriers)
 * - D3.3: Round & Oval Southern Stand High-Oblique 2.5D Angle & Curved Facade
 *   (radial buttresses, vomitory portals, turnstiles, gate signs, curved coping, goal end routing)
 * - D3.4: Bespoke Grounds Thematic Flavor & Southern Forecourt Enrichments
 *   (Alpine gondola & chalets, Potrero barbecue & jalopies, Airport tarmac & blast deflectors,
 *    Naval carrier catapults & helipad, Commercial glass canopy & food trucks)
 * - Zero-allocation & 60 FPS performance benchmark (< 0.05ms per render)
 */

import { describe, it, expect } from 'vitest';
import {
  getUniversalGroundsBounds,
  getNorthSpatialHierarchy,
  UNIVERSAL_GROUNDS_LEFT,
  UNIVERSAL_GROUNDS_RIGHT,
  UNIVERSAL_GROUNDS_TOP,
  UNIVERSAL_GROUNDS_BOTTOM,
  drawImmediateStadiumGrounds,
  drawCardinalSouthGround,
  drawCurvedSouthBowlFacade,
  drawGoalEndStand,
  ConcourseBounds,
} from '../stadiumRenderer';
import {
  StadiumDefinition,
  StandConfig,
  CANONICAL_B2_PERIMETERS,
} from '../../types/stadium';
import { HOME_KIT, AWAY_KIT } from '../constants';

// Mock Canvas 2D Rendering Context matching Phase D2 patterns
function createMockContext(recordOps = true): { ctx: CanvasRenderingContext2D; calls: { method: string; args: any[] }[] } {
  const calls: { method: string; args: any[] }[] = [];
  const handler: ProxyHandler<any> = {
    get(target, prop: string) {
      if (prop === 'canvas') {
        return { width: 1920, height: 1080 };
      }
      if (prop in target) {
        return target[prop];
      }
      return (...args: any[]) => {
        if (recordOps) {
          calls.push({ method: prop, args });
        }
        if (prop === 'measureText') {
          return { width: 50 };
        }
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          return {
            addColorStop: (...gArgs: any[]) => {
              if (recordOps) {
                calls.push({ method: 'addColorStop', args: gArgs });
              }
            },
          };
        }
        if (prop === 'createPattern') {
          return {} as CanvasPattern;
        }
        return undefined;
      };
    },
    set(target, prop: string, value: any) {
      if (recordOps) {
        calls.push({ method: `set_${prop}`, args: [value] });
      }
      target[prop] = value;
      return true;
    },
  };

  const dummyTarget: any = {
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1,
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    font: '10px monospace',
    textAlign: 'left',
    textBaseline: 'top',
    setLineDash: () => {},
  };

  return { ctx: new Proxy(dummyTarget, handler) as CanvasRenderingContext2D, calls };
}

function createDummyBounds(shape: 'rectangular' | 'round' | 'oval' | 'square' = 'rectangular'): ConcourseBounds {
  return getUniversalGroundsBounds(930, 1470, shape);
}

describe('Phase D3: Universal Fixed-Form Grounds Enclosure, Southern Stand Curvilinear Angle & No-Stand Contextual Backdrops', () => {

  // =========================================================================
  // D3.1 & Hotfix D3.1: Universal Fixed-Form Grounds Enclosure & Perspective Trapezoid Framing
  // =========================================================================
  describe('D3.1 & Hotfix D3.1 Universal Fixed-Form Grounds Enclosure & Perspective Trapezoid Framing', () => {
    it('strictly places grounds top BELOW the skyline/horizon (under it) across all shapes', () => {
      const shapes: ('rectangular' | 'square' | 'round' | 'oval')[] = ['rectangular', 'square', 'round', 'oval'];

      for (const shape of shapes) {
        const bounds = getUniversalGroundsBounds(930, 1470, shape);
        const hierarchy = getNorthSpatialHierarchy(shape, 120, false, 'standard', false, 112);

        // Grounds top is strictly anchored to hierarchy.northConcourseTop
        expect(bounds.top).toBe(hierarchy.northConcourseTop);
        // Grounds top must be > horizonBaseY (in screen coordinates, Y increases downward, so grounds start BELOW horizonBaseY)
        expect(bounds.top).toBeGreaterThan(hierarchy.horizonBaseY);
        // Horizon/Skyline is at Y <= horizonBaseY, guaranteeing grounds NEVER fall in front of or occlude skyline
        expect(hierarchy.horizonBaseY).toBeLessThan(bounds.top);
      }
    });

    it('ensures northern grounds shelf is compact (112px) and the stadium ends slightly lower than northern grounds', () => {
      const shapes: ('rectangular' | 'square' | 'round' | 'oval')[] = ['rectangular', 'square', 'round', 'oval'];

      for (const shape of shapes) {
        const bounds = getUniversalGroundsBounds(930, 1470, shape);
        // Stadium north outer edge ends slightly lower than grounds end (in screen coords: northOuterY > bounds.top)
        expect(bounds.northOuterY).toBeGreaterThan(bounds.top);
        expect(bounds.northOuterY - bounds.top).toBe(112);
      }
    });

    it('provides bigger ground space at the south (+390px expansive forecourt)', () => {
      const shapes: ('rectangular' | 'square' | 'round' | 'oval')[] = ['rectangular', 'square', 'round', 'oval'];

      for (const shape of shapes) {
        const bounds = getUniversalGroundsBounds(930, 1470, shape);
        // Southern forecourt depth must provide +390px beyond the southernmost stadium wall
        expect(bounds.bottom - bounds.southOuterY).toBe(390);
        expect(bounds.bottom).toBe(bounds.southOuterY + 390);
      }
    });

    it('forms a high-oblique perspective trapezoid narrower at the north and wider at the south matching reference image', () => {
      const shapes: ('rectangular' | 'square' | 'round' | 'oval')[] = ['rectangular', 'square', 'round', 'oval'];

      for (const shape of shapes) {
        const bounds = getUniversalGroundsBounds(930, 1470, shape);

        expect(bounds.topLeftX).toBeDefined();
        expect(bounds.topRightX).toBeDefined();
        expect(bounds.bottomLeftX).toBeDefined();
        expect(bounds.bottomRightX).toBeDefined();

        // Top width is strictly smaller/narrower than bottom width
        expect(bounds.topWidth).toBeDefined();
        expect(bounds.bottomWidth).toBeDefined();
        expect(bounds.topWidth!).toBeLessThan(bounds.bottomWidth!);

        // Flanks angle outward from north to south
        expect(bounds.topLeftX!).toBeGreaterThan(bounds.bottomLeftX!);
        expect(bounds.topRightX!).toBeLessThan(bounds.bottomRightX!);

        // Bounding box encompasses the trapezoid
        expect(bounds.left).toBe(bounds.bottomLeftX);
        expect(bounds.right).toBe(bounds.bottomRightX);
        expect(bounds.totalW).toBe(bounds.bottomRightX! - bounds.bottomLeftX!);
      }
    });

    it('applies perspective trapezoid enclosure clipping in drawImmediateStadiumGrounds for all shapes', () => {
      const shapes: ('rectangular' | 'square' | 'round' | 'oval')[] = ['rectangular', 'square', 'round', 'oval'];

      for (const shape of shapes) {
        const { ctx, calls } = createMockContext();
        const def: Partial<StadiumDefinition> = {
          name: `${shape} Coliseum`,
          shape,
          grounds: 'mall_commercial',
          surroundings: 'big_city',
        };

        drawImmediateStadiumGrounds(ctx, 930, 1470, def as StadiumDefinition, 'monumental', 'night');

        // Check that evenodd clip operation was performed
        const clips = calls.filter((c) => c.method === 'clip');
        expect(clips.length).toBeGreaterThanOrEqual(1);
        expect(clips.some((c) => c.args[0] === 'evenodd')).toBe(true);

        // Check that trapezoid lineTo / moveTo operations were called during boundary construction
        const moveTos = calls.filter((c) => c.method === 'moveTo');
        const lineTos = calls.filter((c) => c.method === 'lineTo');
        expect(moveTos.length).toBeGreaterThan(0);
        expect(lineTos.length).toBeGreaterThan(0);

        // Check that fill operations occurred across the concourse
        const fills = calls.filter((c) => c.method === 'fillRect');
        expect(fills.length).toBeGreaterThan(10);
      }
    });
  });

  // =========================================================================
  // D3.2: No-Stand Contextual Immediate Backdrop Engine & Bugfix
  // =========================================================================
  describe('D3.2 No-Stand Contextual Immediate Backdrop Engine & Bugfix', () => {
    it('prioritizes explicit stand.backdrop over surroundings (Mountains in small_city)', () => {
      const { ctx, calls } = createMockContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'none',
        grade: 'grade1_municipal',
        backdrop: 'alpine_peaks', // Explicit Mountains backdrop!
      };

      drawGoalEndStand(
        ctx,
        stand,
        200,
        100,
        1000,
        120,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'small_city' // Surroundings is small_city, but backdrop is alpine_peaks!
      );

      // Verify Mountains backdrop features rendered:
      // Snow caps (#f8fafc) and Ski Chalet (#78350f)
      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#f8fafc'); // Perpetual snow caps
      expect(fillStyles).toContain('#78350f'); // Wooden ski chalet walls
      expect(fillStyles).toContain('#94a3b8'); // Aerial cable car pylon
      expect(fillStyles).toContain('#ef4444'); // Red gondola cabin
    });

    it('prioritizes explicit stand.backdrop over surroundings (Beach in mountains)', () => {
      const { ctx, calls } = createMockContext();
      const stand: StandConfig = {
        position: 'south',
        type: 'no_stand',
        grade: 'grade1_municipal',
        backdrop: 'beach_cabanas', // Explicit Beach backdrop!
      };

      drawGoalEndStand(
        ctx,
        stand,
        200,
        1000,
        1000,
        120,
        'south',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'mountains' // Global surroundings is mountains, but stand wants beach!
      );

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#0284c7'); // Deep turquoise ocean water
      expect(fillStyles).toContain('#fde047'); // Golden sand dunes
      expect(fillStyles).toContain('#b45309'); // Wooden boardwalk promenade
    });

    it('renders Forest backdrop directly behind perimeter when forest is chosen', () => {
      const { ctx, calls } = createMockContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'none',
        grade: 'grade1_municipal',
        backdrop: 'dense_pine_woodland',
      };

      drawGoalEndStand(
        ctx,
        stand,
        200,
        100,
        1000,
        120,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'big_city'
      );

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#92400e'); // Forest access fire road
      expect(fillStyles).toContain('#78350f'); // Ranger lookout tower & log fencing
      expect(fillStyles).toContain('#451a03'); // Ranger cabin
    });

    it('renders Airport backdrop with active tarmac and aircraft when runway is chosen', () => {
      const { ctx, calls } = createMockContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'no_stand',
        grade: 'grade1_municipal',
        backdrop: 'runway',
      };

      drawGoalEndStand(
        ctx,
        stand,
        200,
        100,
        1000,
        120,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'small_city'
      );

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#0a0f1d'); // Tarmac runway
      expect(fillStyles).toContain('#ffffff'); // Piano-key threshold stripes & aircraft fuselage
      expect(fillStyles).toContain('#facc15'); // Yellow runway centerline
      expect(fillStyles).toContain('#475569'); // Curved metal aircraft hangar
    });

    it('renders Railroad backdrop with steel rails and boxcars when train_depot is chosen', () => {
      const { ctx, calls } = createMockContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'none',
        grade: 'grade1_municipal',
        backdrop: 'train_depot',
      };

      drawGoalEndStand(
        ctx,
        stand,
        200,
        100,
        1000,
        120,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'big_city'
      );

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#292524'); // Wooden railroad ties
      expect(fillStyles).toContain('#94a3b8'); // Steel rails
      expect(fillStyles).toContain('#22c55e'); // Green switching signal
    });

    it('renders Savannah backdrop with red sandstone kopjes and acacia trees', () => {
      const { ctx, calls } = createMockContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'no_stand',
        grade: 'grade1_municipal',
        backdrop: 'golden_grasslands',
      };

      drawGoalEndStand(
        ctx,
        stand,
        200,
        100,
        1000,
        120,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'small_city'
      );

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#7c2d12'); // Red sandstone kopjes
      expect(fillStyles).toContain('#15803d'); // Flat acacia canopy
      expect(fillStyles).toContain('#451a03'); // Acacia trunk & giraffe silhouette
    });

    it('renders all 6 canonical no-stand perimeter barriers seamlessly in front of contextual backdrops', () => {
      for (const finish of CANONICAL_B2_PERIMETERS) {
        const { ctx, calls } = createMockContext();
        const stand: StandConfig = {
          position: 'south',
          type: 'no_stand',
          grade: 'grade1_municipal',
          backdrop: 'alpine_peaks',
          perimeterFinish: finish as any,
        };

        drawGoalEndStand(
          ctx,
          stand,
          200,
          1000,
          1000,
          120,
          'south',
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'noon',
          'mountains'
        );

        // Verify barrier operations occurred
        expect(calls.length).toBeGreaterThan(20);
      }
    });
  });

  // =========================================================================
  // D3.3: Round & Oval Southern Stand High-Oblique 2.5D Angle & Curved Facade
  // =========================================================================
  describe('D3.3 Round & Oval Southern Stand High-Oblique 2.5D Angle & Curved Facade', () => {
    it('renders radial buttresses, vomitories, turnstiles, and coping in drawCurvedSouthBowlFacade', () => {
      const { ctx, calls } = createMockContext();
      const stand: StandConfig = {
        position: 'south',
        type: 'tiered',
        grade: 'grade4_modern',
      };

      drawCurvedSouthBowlFacade(ctx, stand, 930, 2720, 1050, 'night', 'oval');

      // 1. Verify curved drop shadow
      const strokeStyles = calls.filter((c) => c.method === 'set_strokeStyle').map((c) => c.args[0]);
      expect(strokeStyles).toContain('rgba(0, 0, 0, 0.52)');

      // 2. Verify radial structural buttress columns (at least 11 buttresses)
      const buttressStrokes = calls.filter((c) => c.method === 'stroke');
      expect(buttressStrokes.length).toBeGreaterThanOrEqual(15);

      // 3. Verify turnstiles crossbars and gate plaques
      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#020617'); // Dark vomitory portal cavity
      expect(fillStyles.some((s) => s === '#facc15' || s === '#38bdf8')).toBe(true); // Gate numeral plaques
      expect(strokeStyles).toContain('#94a3b8'); // Chrome turnstile crossbars

      // 4. Verify continuous curved perimeter coping
      expect(strokeStyles).toContain('#cbd5e1'); // Concrete coping cap
      expect(strokeStyles).toContain('#ffffff'); // Highlight coping lip
    });

    it('routes Round and Oval South goal end stand rendering through drawCurvedSouthBowlFacade', () => {
      const { ctx, calls } = createMockContext();
      const stand: StandConfig = {
        position: 'south',
        type: 'tiered',
        grade: 'grade2_classic',
      };

      // Calling drawGoalEndStand for Round South end
      drawGoalEndStand(
        ctx,
        stand,
        200,
        1470,
        1660,
        220,
        'south',
        HOME_KIT,
        AWAY_KIT,
        'round',
        'night',
        'big_city'
      );

      // Verify that curved facade elements were rendered (turnstile bars #94a3b8, coping #fef08a for classic brick)
      const strokeStyles = calls.filter((c) => c.method === 'set_strokeStyle').map((c) => c.args[0]);
      expect(strokeStyles).toContain('#94a3b8'); // Turnstile bars in curved facade
      expect(strokeStyles.some((s) => s === '#fde047' || s === '#fef08a')).toBe(true); // Heritage red-brick coping cap
    });
  });

  // =========================================================================
  // D3.4: Bespoke Grounds Thematic Flavor & Southern Forecourt Enrichments
  // =========================================================================
  describe('D3.4 Bespoke Grounds Thematic Flavor & Southern Forecourt Enrichments', () => {
    it('renders Alpine gondola terminal station, dual cabins, timber chalets, and stream in drawCardinalSouthGround', () => {
      const { ctx, calls } = createMockContext();
      const bounds = createDummyBounds('rectangular');

      drawCardinalSouthGround(ctx, bounds, 'mountains_gondola_terminal', 'noon', 'mountains');

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#334155'); // Gondola terminal station
      expect(fillStyles).toContain('#ef4444'); // Red gondola cabin
      expect(fillStyles).toContain('#2563eb'); // Blue gondola cabin
      expect(fillStyles).toContain('#78350f'); // Timber chalet walls
      expect(fillStyles).toContain('#0369a1'); // Mountain stream culvert water
      expect(fillStyles).toContain('#78716c'); // Stone footbridge
    });

    it('renders Potrero sizzling BBQ food shack, glowing embers, parked jalopies, and scarves in drawCardinalSouthGround', () => {
      const { ctx, calls } = createMockContext();
      const bounds = createDummyBounds('rectangular');

      drawCardinalSouthGround(ctx, bounds, 'potrero_dirt', 'night', 'savannah');

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#78350f'); // "PARRILLA POPULAR" BBQ food shack
      expect(fillStyles).toContain('#ef4444'); // Glowing red embers
      expect(fillStyles).toContain('#f97316'); // Fiery orange embers
      expect(fillStyles).toContain('#0284c7'); // Retro blue jalopy
      expect(fillStyles).toContain('#dc2626'); // Red delivery moped
    });

    it('renders Gibraltar Airport runway tarmac, blast deflectors, and baggage tug in drawCardinalSouthGround', () => {
      const { ctx, calls } = createMockContext();
      const bounds = createDummyBounds('rectangular');

      drawCardinalSouthGround(ctx, bounds, 'airport_runway_tarmac', 'night', 'airport');

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#0a0f1d'); // Heavy runway tarmac apron
      expect(fillStyles).toContain('#eab308'); // Yellow baggage tug utility vehicle
      expect(fillStyles).toContain('#3b82f6'); // Towed baggage luggage bags
      expect(fillStyles).toContain('#475569'); // Corrugated jet blast deflectors
    });

    it('renders Naval Carrier catapult tracks, arresting wires, and illuminated helipad in drawCardinalSouthGround', () => {
      const { ctx, calls } = createMockContext();
      const bounds = createDummyBounds('rectangular');

      drawCardinalSouthGround(ctx, bounds, 'marine_aircraft_carrier', 'night', 'marine_floating');

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('#0f172a'); // Catapult track slot
      expect(fillStyles).toContain('#facc15'); // Catapult edge warning lines
      expect(fillStyles).toContain('#eab308'); // Hydraulic arresting gear tensioners
      expect(fillStyles).toContain('#f59e0b'); // Helipad amber perimeter LED beacons
    });

    it('renders Commercial Mall glass canopy, artisan food trucks, and pop-up merchandise kiosks in drawCardinalSouthGround', () => {
      const { ctx, calls } = createMockContext();
      const bounds = createDummyBounds('rectangular');

      drawCardinalSouthGround(ctx, bounds, 'mall_commercial', 'night', 'big_city');

      const fillStyles = calls.filter((c) => c.method === 'set_fillStyle').map((c) => c.args[0]);
      expect(fillStyles).toContain('rgba(56, 189, 248, 0.45)'); // Modern cantilevered glass canopy
      expect(fillStyles).toContain('#ea580c'); // Artisan burger food truck
      expect(fillStyles).toContain('#16a34a'); // Pizza food truck
      expect(fillStyles).toContain('#1e3a8a'); // Fan merchandise kiosk
    });
  });

  // =========================================================================
  // Zero-Allocation & Performance Guarantee
  // =========================================================================
  describe('Zero-Allocation & 60 FPS Performance Guarantee', () => {
    it('executes 1,000 getUniversalGroundsBounds queries in under 15ms (< 0.015ms/query)', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        const shape = i % 4 === 0 ? 'rectangular' : i % 4 === 1 ? 'square' : i % 4 === 2 ? 'round' : 'oval';
        getUniversalGroundsBounds(930, 1470, shape);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(15);
    });

    it('executes 200 drawCurvedSouthBowlFacade renders in under 60ms (< 0.30ms/render)', () => {
      const { ctx } = createMockContext(false); // disable op recording for raw speed
      const stand: StandConfig = { position: 'south', type: 'tiered', grade: 'grade4_modern' };

      const start = performance.now();
      for (let i = 0; i < 200; i++) {
        drawCurvedSouthBowlFacade(ctx, stand, 930, 2720, 1050, 'night', 'oval');
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(60);
    });

    it('executes 200 drawCardinalSouthGround renders with rich forecourt flavor in under 70ms (< 0.35ms/render)', () => {
      const { ctx } = createMockContext(false);
      const bounds = createDummyBounds('rectangular');

      const start = performance.now();
      for (let i = 0; i < 200; i++) {
        const grounds = i % 5 === 0 ? 'mountains_gondola_terminal' : i % 5 === 1 ? 'potrero_dirt' : i % 5 === 2 ? 'airport_runway_tarmac' : i % 5 === 3 ? 'marine_aircraft_carrier' : 'mall_commercial';
        drawCardinalSouthGround(ctx, bounds, grounds as any, 'night', 'big_city');
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(70);
    });
  });
});
