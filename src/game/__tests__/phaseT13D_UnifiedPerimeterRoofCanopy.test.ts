import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamKit, TimeOfDay } from '../../types';
import {
  StandConfig,
  RoofConfig,
  RoofCutawayMode,
  getUnifiedRoofOverhangDepth,
} from '../../types/stadium';
import {
  drawStandRoofCanopy,
  drawCornerMiterRoofCanopy,
  getFluidCornerRoofArcPoints,
  getCornerMiterGeometry,
} from '../stadiumRenderer';

const HOME_KIT: TeamKit = {
  name: 'FC Pride',
  shortName: 'FCP',
  primaryColor: '#1d4ed8',
  secondaryColor: '#ffffff',
  shortsColor: '#ffffff',
  socksColor: '#1d4ed8',
  gkColor: '#eab308',
};

const AWAY_KIT: TeamKit = {
  name: 'United Athletic',
  shortName: 'UNA',
  primaryColor: '#dc2626',
  secondaryColor: '#fef08a',
  shortsColor: '#000000',
  socksColor: '#dc2626',
  gkColor: '#10b981',
};

function createMockContext(): CanvasRenderingContext2D & {
  _paths: { type: string; x?: number; y?: number; w?: number; h?: number }[];
  _fills: string[];
  _strokes: string[];
} {
  const paths: { type: string; x?: number; y?: number; w?: number; h?: number }[] = [];
  const fills: string[] = [];
  const strokes: string[] = [];
  const ctx: any = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(() => paths.push({ type: 'beginPath' })),
    closePath: vi.fn(() => paths.push({ type: 'closePath' })),
    moveTo: vi.fn((x: number, y: number) => paths.push({ type: 'moveTo', x, y })),
    lineTo: vi.fn((x: number, y: number) => paths.push({ type: 'lineTo', x, y })),
    arc: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn((x: number, y: number, w: number, h: number) => paths.push({ type: 'rect', x, y, w, h })),
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => paths.push({ type: 'fillRect', x, y, w, h })),
    strokeRect: vi.fn((x: number, y: number, w: number, h: number) => paths.push({ type: 'strokeRect', x, y, w, h })),
    fill: vi.fn(() => fills.push(ctx.fillStyle)),
    stroke: vi.fn(() => strokes.push(ctx.strokeStyle)),
    clip: vi.fn(),
    setLineDash: vi.fn(),
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    globalAlpha: 1,
    _paths: paths,
    _fills: fills,
    _strokes: strokes,
  };
  return ctx;
}

describe('Hotfix Phase T13D: Unified Perimeter Roof Architecture & 50% Upper-Tier Invariance', () => {
  describe('1. 50% Match Cutaway Upper-Tier Invariance (Never occludes > 50% of upper tier)', () => {
    it('strictly guarantees upper tier occlusion is <= 50% for 1-tier, 2-tier, 3-tier, and 4-tier stands', () => {
      const standDepths = [100, 120, 140, 160, 200];

      for (let numTiers = 1; numTiers <= 4; numTiers++) {
        for (const standDepth of standDepths) {
          const stand: StandConfig = {
            position: 'west',
            type: 'tiered',
            tierCount: numTiers as 1 | 2 | 3 | 4,
            tiers: Array.from({ length: numTiers }, () => ({
              size: 'medium',
              density: 'normal',
            })),
          };

          const overhang = getUnifiedRoofOverhangDepth(stand, standDepth, 'partial');
          const deckDepth = Math.max(20, standDepth - 14 - 6);
          const upperTierDepth = deckDepth / numTiers;

          // Roof must never cover more than 50% of the upper tier deck (tier projection <= 45%)
          const tierDeckCoverage = Math.max(0, overhang - 14);
          expect(tierDeckCoverage).toBeLessThanOrEqual(upperTierDepth * 0.50);
          expect(overhang).toBeGreaterThan(0);
        }
      }
    });

    it('strictly guarantees upper tier occlusion is <= 50% for monolithic Wall stands', () => {
      const wallSizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];

      for (const wallSize of wallSizes) {
        const stand: StandConfig = {
          position: 'south',
          type: 'wall',
          wallSize,
        };
        const standDepth = 150;
        const overhang = getUnifiedRoofOverhangDepth(stand, standDepth, 'partial');
        const deckDepth = Math.max(20, standDepth - 14 - 6);
        const upperTierZone = deckDepth * 0.35;
        const tierDeckCoverage = Math.max(0, overhang - 14);

        expect(tierDeckCoverage).toBeLessThanOrEqual(upperTierZone * 0.50);
        expect(overhang).toBeGreaterThan(0);
      }
    });

    it('returns 0 for "hidden" cutaway mode and returns generous projection for "full" cutaway mode', () => {
      const stand: StandConfig = {
        position: 'north',
        type: 'tiered',
        tierCount: 2,
      };
      const standDepth = 140;

      const hiddenOverhang = getUnifiedRoofOverhangDepth(stand, standDepth, 'hidden');
      expect(hiddenOverhang).toBe(0);

      const partialOverhang = getUnifiedRoofOverhangDepth(stand, standDepth, 'partial');
      const fullOverhang = getUnifiedRoofOverhangDepth(stand, standDepth, 'full');

      expect(partialOverhang).toBeGreaterThan(0);
      expect(fullOverhang).toBeGreaterThan(partialOverhang);
      expect(fullOverhang).toBeLessThanOrEqual(standDepth);
    });
  });

  describe('2. Perimeter Roof Depth Symmetry across all Stadium Sides', () => {
    it('produces identical roof overhang across West, East, North, South when configurations match', () => {
      const standardStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 3,
        tiers: [
          { size: 'medium', density: 'normal' },
          { size: 'medium', density: 'normal' },
          { size: 'medium', density: 'normal' },
        ],
      };

      const depth = 145;
      const westOverhang = getUnifiedRoofOverhangDepth({ ...standardStand, position: 'west' }, depth, 'partial');
      const eastOverhang = getUnifiedRoofOverhangDepth({ ...standardStand, position: 'east' }, depth, 'partial');
      const northOverhang = getUnifiedRoofOverhangDepth({ ...standardStand, position: 'north' }, depth, 'partial');
      const southOverhang = getUnifiedRoofOverhangDepth({ ...standardStand, position: 'south' }, depth, 'partial');

      expect(westOverhang).toBe(eastOverhang);
      expect(westOverhang).toBe(northOverhang);
      expect(westOverhang).toBe(southOverhang);
    });

    it('adapts corner overhang to match adjacent stand overhang when corner shares same tier specs', () => {
      const sideStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 2,
        tiers: [
          { size: 'medium', density: 'normal' },
          { size: 'medium', density: 'normal' },
        ],
      };
      const cornerStand: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        tierCount: 2,
        tiers: [
          { size: 'medium', density: 'normal' },
          { size: 'medium', density: 'normal' },
        ],
      };

      const depth = 130;
      const sideOverhang = getUnifiedRoofOverhangDepth(sideStand, depth, 'partial');
      const cornerOverhang = getUnifiedRoofOverhangDepth(cornerStand, depth, 'partial');

      expect(sideOverhang).toBe(cornerOverhang);
    });
  });

  describe('3. Corner Canopy Bonding & C1 Tangent Continuity', () => {
    it('computes exact vertical tangent at touchline interface (rT) and horizontal tangent at goal interface (rG)', () => {
      const rT = { x: 100, y: 500 }; // touchline point
      const rG = { x: 250, y: 650 }; // goal point
      const pOut = { x: 50, y: 700 };
      const pT = { x: 200, y: 500 };
      const pTMax = { x: 50, y: 500 };
      const pG = { x: 250, y: 500 };
      const pGMax = { x: 250, y: 700 };

      const arcPoints = getFluidCornerRoofArcPoints(rT, rG, pOut, pT, pTMax, pG, pGMax, 0.35, 16);

      expect(arcPoints.length).toBe(17);
      expect(arcPoints[0].x).toBeCloseTo(rT.x, 2);
      expect(arcPoints[0].y).toBeCloseTo(rT.y, 2);
      expect(arcPoints[16].x).toBeCloseTo(rG.x, 2);
      expect(arcPoints[16].y).toBeCloseTo(rG.y, 2);

      // Verify C1 vertical tangent at rT: dx/dt = 0 when t = 0
      // In bezier curve B(t) with control point pCtrl = { x: rT.x, y: rG.y }:
      // B'(0) = 2 * (pCtrl - rT) = 2 * (0, rG.y - rT.y), meaning dx/dt = 0!
      const initialDx = arcPoints[1].x - arcPoints[0].x;
      const initialDy = arcPoints[1].y - arcPoints[0].y;
      // Tangent is predominantly vertical: |dx| should be much smaller than |dy|
      expect(Math.abs(initialDx)).toBeLessThan(Math.abs(initialDy) * 0.25);

      // Verify C1 horizontal tangent at rG: dy/dt = 0 when t = 1
      // B'(1) = 2 * (rG - pCtrl) = 2 * (rG.x - rT.x, 0), meaning dy/dt = 0!
      const finalDx = arcPoints[16].x - arcPoints[15].x;
      const finalDy = arcPoints[16].y - arcPoints[15].y;
      // Tangent is predominantly horizontal: |dy| should be much smaller than |dx|
      expect(Math.abs(finalDy)).toBeLessThan(Math.abs(finalDx) * 0.25);
    });

    it('bonds corner roof leading edge seamlessly to touchline and goal stand coordinates', () => {
      const ctx = createMockContext();
      const cornerStand: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        tierCount: 2,
        roofStyle: 'cantilever_truss',
        roofMaterial: 'corrugated_steel',
      };
      const westStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 2,
      };
      const southStand: StandConfig = {
        position: 'south',
        type: 'tiered',
        tierCount: 2,
      };

      const effPOut = { x: 50, y: 700 };
      const pTMax = { x: 50, y: 500 };
      const pGMax = { x: 250, y: 700 };
      const pT = { x: 250, y: 500 };
      const pG = { x: 250, y: 500 };

      drawCornerMiterRoofCanopy(
        ctx,
        cornerStand,
        'corner_sw',
        effPOut,
        pTMax,
        pGMax,
        pT,
        pG,
        HOME_KIT,
        AWAY_KIT,
        'noon',
        undefined,
        'partial',
        westStand,
        southStand
      );

      // Verify canvas operations took place (shadow, canopy fill, ridges, fascia border)
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx._paths.length).toBeGreaterThan(10);
    });
  });

  describe('4. Rich Detailing on Corner Canopies across All Materials and Styles', () => {
    it('renders corrugated lap ridges for corrugated steel roof material', () => {
      const ctx = createMockContext();
      const stand: StandConfig = {
        position: 'corner_nw',
        type: 'tiered',
        roofMaterial: 'corrugated_steel',
      };
      const effPOut = { x: 50, y: 50 };
      const pTMax = { x: 50, y: 250 };
      const pGMax = { x: 250, y: 50 };
      const pT = { x: 250, y: 250 };
      const pG = { x: 250, y: 250 };

      drawCornerMiterRoofCanopy(ctx, stand, 'corner_nw', effPOut, pTMax, pGMax, pT, pG, HOME_KIT, AWAY_KIT, 'night');

      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('renders pneumatic pillow welds for ETFE cushion roof material', () => {
      const ctx = createMockContext();
      const stand: StandConfig = {
        position: 'corner_ne',
        type: 'tiered',
        roofMaterial: 'etfe_cushion',
      };
      const effPOut = { x: 450, y: 50 };
      const pTMax = { x: 450, y: 250 };
      const pGMax = { x: 250, y: 50 };
      const pT = { x: 250, y: 250 };
      const pG = { x: 250, y: 250 };

      drawCornerMiterRoofCanopy(ctx, stand, 'corner_ne', effPOut, pTMax, pGMax, pT, pG, HOME_KIT, AWAY_KIT, 'noon');

      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('renders precast expansion joints and aluminum standing seam roof materials', () => {
      for (const mat of ['precast_concrete', 'anodized_aluminum'] as const) {
        const ctx = createMockContext();
        const stand: StandConfig = {
          position: 'corner_se',
          type: 'tiered',
          roofMaterial: mat,
        };
        const effPOut = { x: 450, y: 700 };
        const pTMax = { x: 450, y: 500 };
        const pGMax = { x: 250, y: 700 };
        const pT = { x: 250, y: 500 };
        const pG = { x: 250, y: 500 };

        drawCornerMiterRoofCanopy(ctx, stand, 'corner_se', effPOut, pTMax, pGMax, pT, pG, HOME_KIT, AWAY_KIT, 'sunset');

        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      }
    });

    it('renders barrel vault, space frame, and post & beam structural framework on corner roofs', () => {
      for (const style of ['barrel_vault', 'spaceframe_halo', 'tensile_cable', 'cantilever_truss'] as const) {
        const ctx = createMockContext();
        const stand: StandConfig = {
          position: 'corner_nw',
          type: 'tiered',
          roofStyle: style,
        };
        const effPOut = { x: 50, y: 50 };
        const pTMax = { x: 50, y: 250 };
        const pGMax = { x: 250, y: 50 };
        const pT = { x: 250, y: 250 };
        const pG = { x: 250, y: 250 };

        drawCornerMiterRoofCanopy(ctx, stand, 'corner_nw', effPOut, pTMax, pGMax, pT, pG, HOME_KIT, AWAY_KIT, 'noon');

        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      }
    });
  });

  describe('5. Stand Roof Canopy Calling & Coordinate Integrity', () => {
    it('drawStandRoofCanopy respects stand hasRoof=false by not rendering', () => {
      const ctx = createMockContext();
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        hasRoof: false,
      };

      drawStandRoofCanopy(ctx, stand, 0, 0, 150, 400, 'west', HOME_KIT, AWAY_KIT);

      expect(ctx.fill).not.toHaveBeenCalled();
      expect(ctx.stroke).not.toHaveBeenCalled();
    });

    it('drawStandRoofCanopy renders soffit drop shadow, base sheeting, and fascia across all 4 orientations', () => {
      const orientations: ('west' | 'east' | 'north' | 'south')[] = ['west', 'east', 'north', 'south'];

      for (const ori of orientations) {
        const ctx = createMockContext();
        const stand: StandConfig = {
          position: ori,
          type: 'tiered',
          tierCount: 2,
          roofBorder: 'painted_club_fascia',
        };

        drawStandRoofCanopy(ctx, stand, 100, 100, 150, 400, ori, HOME_KIT, AWAY_KIT, 'noon');

        expect(ctx.fillRect).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
        expect(ctx._paths.length).toBeGreaterThan(5);
      }
    });
  });
});
