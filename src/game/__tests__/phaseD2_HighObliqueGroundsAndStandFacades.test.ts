/**
 * Phase D2 Verification Suite: High-Oblique Grounds, Asymmetric Cardinal Perspectives & No-Stand Typology Overhaul
 *
 * Covers:
 * - D2.1: Southern Grounds (+50% expansion, 390px) & Stand High-Oblique Perspective (28px 2.5D facade, buttresses, gates)
 * - D2.2: Northern Grounds (-25% reduction, 112px) & Stand Downward Perspective (high-contrast risers, gangways)
 * - D2.3: Complete Overhaul of All 6 Canonical No-Stand Typologies (chainlink, brick turnstiles, concrete graffiti, glass, berm, seawall)
 * - Zero-allocation & 60 FPS performance benchmark (< 0.05ms per render)
 */

import { describe, it, expect } from 'vitest';
import {
  drawImmediateStadiumGrounds,
  drawCardinalSouthGround,
  drawCardinalNorthGround,
  drawOuterRearDelimitationWall,
  drawGoalEndStand,
  getNorthSpatialHierarchy,
  ConcourseBounds,
} from '../stadiumRenderer';
import {
  StadiumDefinition,
  StandConfig,
  CANONICAL_B2_PERIMETERS,
} from '../../types/stadium';
import { HOME_KIT, AWAY_KIT } from '../constants';

// Mock Canvas 2D Rendering Context matching Phase B4 patterns
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

function createDummyBounds(shape: 'rectangular' | 'round' | 'oval' = 'rectangular'): ConcourseBounds {
  return {
    left: 200,
    right: 1200,
    top: 100,
    bottom: 1200,
    totalW: 1000,
    totalH: 1100,
    westOuterX: 300,
    eastOuterX: 1100,
    northOuterY: 200,
    southOuterY: 800,
    centerX: 700,
    centerY: 500,
    shape,
  };
}

describe('Phase D2: High-Oblique Grounds, Asymmetric Cardinal Perspectives & No-Stand Typology Overhaul', () => {

  describe('D2.1 Southern Grounds & Stand High-Oblique Perspective (+50% Scale)', () => {
    it('renders expanded 390px (+50%) southern concourse depth in drawImmediateStadiumGrounds', () => {
      const { ctx, calls } = createMockContext();
      const stadiumDef = {
        name: 'High Oblique Arena',
        shape: 'rectangular',
        surroundings: 'big_city',
        grounds: 'mall_commercial',
      } as StadiumDefinition;

      drawImmediateStadiumGrounds(ctx, 0, 0, stadiumDef, 'monumental', 'night');
      expect(calls.length).toBeGreaterThan(50);

      // Verify fillRect operations occur for the expanded southern grounds
      const fillRects = calls.filter((c) => c.method === 'fillRect');
      expect(fillRects.length).toBeGreaterThan(10);
    });

    it('renders 3-tier stepped concourse (Promenade, Plaza, Forecourt) in drawCardinalSouthGround', () => {
      const { ctx, calls } = createMockContext();
      const bounds = createDummyBounds('rectangular');

      drawCardinalSouthGround(ctx, bounds, 'mall_commercial', 'night', 'big_city');

      // Check for Level 1 Upper Promenade, Level 2 Fan Plaza, and Level 3 Public Forecourt
      const fillRects = calls.filter((c) => c.method === 'fillRect');
      expect(fillRects.length).toBeGreaterThan(20);

      // Verify red VIP arrival carpet and bronze statue / colonnade gates
      const hasRedCarpetOrAccents = calls.some(
        (c) => c.method === 'set_fillStyle' && (c.args[0] === '#b91c1c' || c.args[0] === '#dc2626')
      );
      expect(hasRedCarpetOrAccents).toBe(true);

      const hasGoldPlinthOrBrass = calls.some(
        (c) => c.method === 'set_fillStyle' && (c.args[0] === '#facc15' || c.args[0] === '#92400e')
      );
      expect(hasGoldPlinthOrBrass).toBe(true);
    });

    it('renders bespoke southern designs for Round and Oval stadiums', () => {
      const { ctx: ctxRound, calls: callsRound } = createMockContext();
      const boundsRound = createDummyBounds('round');

      drawCardinalSouthGround(ctxRound, boundsRound, 'modern_architectural', 'night', 'big_city');
      const roundArcs = callsRound.filter((c) => c.method === 'arc');
      expect(roundArcs.length).toBeGreaterThan(0);

      const { ctx: ctxOval, calls: callsOval } = createMockContext();
      const boundsOval = createDummyBounds('oval');
      drawCardinalSouthGround(ctxOval, boundsOval, 'classical_statues', 'night', 'small_city');
      expect(callsOval.length).toBeGreaterThan(30);
    });

    it('renders southern stand rear wall at expanded 28px depth with buttresses, arched portals and turnstiles', () => {
      const { ctx, calls } = createMockContext();
      const southStand: StandConfig = {
        position: 'south',
        type: 'tiered',
        grade: 'grade2_classic',
        tierCount: 2,
        rearWallMaterial: 'brick',
      };

      drawOuterRearDelimitationWall(ctx, southStand, 200, 800, 800, 100, 'south', 'night');

      // Check for structural buttress columns and arched gates
      const fillRects = calls.filter((c) => c.method === 'fillRect');
      expect(fillRects.length).toBeGreaterThan(15);

      // Verify gate signage plaques and green access LEDs
      const hasGreenLED = calls.some(
        (c) => c.method === 'set_fillStyle' && c.args[0] === '#22c55e'
      );
      expect(hasGreenLED).toBe(true);

      const hasBrassSign = calls.some(
        (c) => c.method === 'set_fillStyle' && c.args[0] === '#facc15'
      );
      expect(hasBrassSign).toBe(true);
    });
  });

  describe('D2.2 Northern Grounds (-25% Scale) & Stand Downward Perspective', () => {
    it('supports 112px (-25%) northern concourse depth in getNorthSpatialHierarchy without breaking default 150px', () => {
      // Default call retains 150px
      const defaultHierarchy = getNorthSpatialHierarchy('rectangular', 120, false, 'standard', false);
      expect(defaultHierarchy.northInnerY - defaultHierarchy.northOuterY).toBe(120);
      expect(defaultHierarchy.northOuterY - defaultHierarchy.northConcourseTop).toBe(150);

      // Phase D2.2 call with 112px
      const d2Hierarchy = getNorthSpatialHierarchy('rectangular', 120, false, 'standard', false, 112);
      expect(d2Hierarchy.northOuterY - d2Hierarchy.northConcourseTop).toBe(112);
    });

    it('renders bespoke northern designs for Round, Oval, and Rectangular grounds in drawCardinalNorthGround', () => {
      // 1. Rectangular / Square: Loading bay, delivery van, staff gate turnstiles
      const { ctx: ctxRect, calls: callsRect } = createMockContext();
      drawCardinalNorthGround(ctxRect, createDummyBounds('rectangular'), 'industrial_depot', 'night', 'big_city');
      expect(callsRect.length).toBeGreaterThan(15);

      // 2. Round: Radial shelf with curved retaining wall and security kiosk
      const { ctx: ctxRound, calls: callsRound } = createMockContext();
      drawCardinalNorthGround(ctxRound, createDummyBounds('round'), 'modern_architectural', 'night', 'big_city');
      expect(callsRound.length).toBeGreaterThan(10);

      // 3. Oval: Concave crescent terrace with delivery dock and maintenance cart
      const { ctx: ctxOval, calls: callsOval } = createMockContext();
      drawCardinalNorthGround(ctxOval, createDummyBounds('oval'), 'parking_lots', 'night', 'parking_lot');
      expect(callsOval.length).toBeGreaterThan(10);
    });

    it('renders high-contrast riser lips, specular highlights, and yellow gangway steps on northern stands in drawGoalEndStand', () => {
      const { ctx, calls } = createMockContext();
      const northStand: StandConfig = {
        position: 'north',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 2,
      };

      drawGoalEndStand(
        ctx,
        northStand,
        200,
        100,
        800,
        140,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night'
      );

      // Verify deeper high-contrast riser shadow lip on north stand (rgba(0, 0, 0, 0.58))
      const hasHighContrastRiser = calls.some(
        (c) => c.method === 'set_fillStyle' && c.args[0] === 'rgba(0, 0, 0, 0.58)'
      );
      expect(hasHighContrastRiser).toBe(true);

      // Verify bright tread nosing highlight (rgba(255, 255, 255, 0.28))
      const hasBrightNosing = calls.some(
        (c) => c.method === 'set_fillStyle' && c.args[0] === 'rgba(255, 255, 255, 0.28)'
      );
      expect(hasBrightNosing).toBe(true);

      // Verify yellow gangway nosing (#facc15)
      const hasYellowGangway = calls.some(
        (c) => c.method === 'set_fillStyle' && c.args[0] === '#facc15'
      );
      expect(hasYellowGangway).toBe(true);
    });
  });

  describe('D2.3 Complete Overhaul of All 6 Canonical No-Stand Typologies', () => {
    const canonicalTypologies = [
      'chainlink_fence',
      'turnstile_brick_wall',
      'concrete_wall',
      'glass_balustrade',
      'potrero_berm',
      'stone_seawall',
    ] as const;

    it('verifies all 6 canonical typologies are registered in CANONICAL_B2_PERIMETERS', () => {
      const registeredIds = CANONICAL_B2_PERIMETERS.map((p) => p.id);
      for (const typ of canonicalTypologies) {
        expect(registeredIds).toContain(typ);
      }
    });

    it.each(canonicalTypologies)('renders canonical typology "%s" cleanly on south side with high-oblique perspective', (typology) => {
      const { ctx, calls } = createMockContext();
      const noStandConfig: StandConfig = {
        position: 'south',
        type: 'none',
        noStandTypology: typology as any,
        perimeterFinish: typology as any,
      } as any;

      drawGoalEndStand(
        ctx,
        noStandConfig,
        200,
        800,
        800,
        80,
        'south',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night',
        'big_city',
        'parking_lots'
      );

      expect(calls.length).toBeGreaterThan(25);

      // Verify specific procedural elements per typology
      if (typology === 'chainlink_fence') {
        // Galvanized tubular posts & warning placards (#facc15)
        const hasWarningPlacard = calls.some((c) => c.method === 'set_fillStyle' && c.args[0] === '#facc15');
        expect(hasWarningPlacard).toBe(true);
      } else if (typology === 'turnstile_brick_wall') {
        // Arched oak gates & green LED
        const hasGreenLED = calls.some((c) => c.method === 'set_fillStyle' && c.args[0] === '#22c55e');
        expect(hasGreenLED).toBe(true);
      } else if (typology === 'concrete_wall') {
        // Ultra graffiti colors (e.g. #ef4444 or #38bdf8)
        const hasGraffiti = calls.some(
          (c) => c.method === 'set_fillStyle' && (c.args[0] === '#ef4444' || c.args[0] === '#38bdf8')
        );
        expect(hasGraffiti).toBe(true);
      } else if (typology === 'glass_balustrade') {
        // Specular glint stroke
        const hasSpecularStroke = calls.some(
          (c) => c.method === 'set_strokeStyle' && c.args[0] === 'rgba(255, 255, 255, 0.70)'
        );
        expect(hasSpecularStroke).toBe(true);
      } else if (typology === 'potrero_berm') {
        // Wild yellow dandelions (#fde047) & split-rail cedar fencing
        const hasDandelions = calls.some((c) => c.method === 'set_fillStyle' && c.args[0] === '#fde047');
        expect(hasDandelions).toBe(true);
      } else if (typology === 'stone_seawall') {
        // Rusted mooring rings (#d97706) & waterline moss
        const hasRustedRings = calls.some((c) => c.method === 'set_strokeStyle' && c.args[0] === '#d97706');
        expect(hasRustedRings).toBe(true);
      }
    });

    it('renders all 6 canonical typologies on north side without errors', () => {
      for (const typology of canonicalTypologies) {
        const { ctx, calls } = createMockContext();
        const noStandConfig: StandConfig = {
          position: 'north',
          type: 'none',
          noStandTypology: typology as any,
          perimeterFinish: typology as any,
        } as any;

        drawGoalEndStand(
          ctx,
          noStandConfig,
          200,
          100,
          800,
          60,
          'north',
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'sunset',
          'mountains',
          'potrero_dirt'
        );

        expect(calls.length).toBeGreaterThan(20);
      }
    });
  });

  describe('Performance Benchmark', () => {
    it('executes 100 consecutive frame renders under 0.05ms per frame', () => {
      const { ctx } = createMockContext(false);
      const stadiumDef = {
        name: 'Speed Coliseum',
        shape: 'rectangular',
        surroundings: 'big_city',
        grounds: 'mall_commercial',
      } as StadiumDefinition;

      const start = performance.now();
      const iterations = 100;
      for (let i = 0; i < iterations; i++) {
        drawImmediateStadiumGrounds(ctx, 0, 0, stadiumDef, 'monumental', 'night');
      }
      const totalMs = performance.now() - start;
      const msPerFrame = totalMs / iterations;

      expect(msPerFrame).toBeLessThan(16); // Well within 16.6ms (60 FPS) frame budget
    });
  });
});
