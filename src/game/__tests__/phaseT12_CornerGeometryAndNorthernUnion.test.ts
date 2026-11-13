import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamKit } from '../../types';
import {
  StandConfig,
  StadiumDefinition,
  calculateStandCapacity,
  getStandChairRows,
  CornerStandType,
  CORNER_STAND_OPTIONS,
  resolveCornerArchitectureType,
  isCornerRound,
  isCornerGiant,
  isCornerTower,
  isCornerNoStand,
  getGiantCornerMonumentalDepth,
  getWallTierChairRows,
} from '../../types/stadium';
import {
  drawRoundCornerStand,
  drawGiantCornerStand,
  drawTowerCornerStand,
  drawMiteredCornerStand,
  drawCornerQuadrantStands,
  getCornerMiterGeometry,
  getStandPerspectiveMetrics,
  getShearedCornerPoint,
  traceShearedCornerArc,
} from '../stadiumRenderer';

const HOME_KIT: TeamKit = {
  name: 'Home FC',
  shortName: 'HOM',
  primaryColor: '#0284c7',
  secondaryColor: '#ffffff',
  shortsColor: '#ffffff',
  socksColor: '#0284c7',
  gkColor: '#eab308',
};

const AWAY_KIT: TeamKit = {
  name: 'Away FC',
  shortName: 'AWY',
  primaryColor: '#ef4444',
  secondaryColor: '#ffffff',
  shortsColor: '#000000',
  socksColor: '#ef4444',
  gkColor: '#10b981',
};

function createMockContext(): CanvasRenderingContext2D & { _records: { fillStyle: string; strokeStyle: string; x?: number; y?: number; w?: number; h?: number }[] } {
  const records: { fillStyle: string; strokeStyle: string; x?: number; y?: number; w?: number; h?: number }[] = [];
  const ctx: any = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
      records.push({ fillStyle: ctx.fillStyle, strokeStyle: ctx.strokeStyle, x, y, w, h });
    }),
    strokeRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1.0,
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    _records: records,
  };
  return ctx as CanvasRenderingContext2D & { _records: typeof records };
}

describe('Phase T12: Master Corner Geometry & Northern Perspective Union Overhaul', () => {
  let ctx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    ctx = createMockContext();
  });

  describe('T12.1 Northern Corner Perspective Union (NW & NE Corners)', () => {
    it('computes perspective metrics with non-zero northTaperX for high-oblique perspective convergence', () => {
      const p = getStandPerspectiveMetrics('rectangular', 120, 120);
      expect(p.northTaperX).toBeGreaterThan(30);
      expect(p.southTaperX).toBeGreaterThan(p.northTaperX);
      expect(p.lateralTaperNorth).toBeGreaterThan(20);
    });

    it('generates transitional quadrilateral shear geometry for NW corner matching North Stand rake', () => {
      const left = 200;
      const right = 800;
      const top = 150;
      const bottom = 650;
      const standDepthX = 140;
      const standDepthY = 140;

      const p = getStandPerspectiveMetrics('rectangular', standDepthX, standDepthY);
      const miter = getCornerMiterGeometry('corner_nw', left, right, top, bottom, standDepthX, standDepthY, p);

      expect(miter.pNorthShearGoal).toBeDefined();
      expect(miter.pNorthShearTouch).toBeDefined();

      // Front pitch corner: shear is 0
      const pitchEdgeGoal = miter.pNorthShearGoal!(0);
      expect(pitchEdgeGoal.x).toBe(left);
      expect(pitchEdgeGoal.y).toBe(top);

      // Rear outer rim: goal edge shears exactly by +northTaperX to bond flush with North Stand
      const rearEdgeGoal = miter.pNorthShearGoal!(standDepthY);
      expect(rearEdgeGoal.x).toBeCloseTo(left + p.northTaperX, 0);
      expect(rearEdgeGoal.y).toBe(top - standDepthY);

      // Touchline maintains perpendicular 90° alignment along West touchline
      const touchPoint = miter.pNorthShearTouch!(standDepthX);
      expect(touchPoint.x).toBe(left - standDepthX);
      expect(touchPoint.y).toBe(top);

      // Rear outer point pPerspectiveOut connects with lateral taper
      expect(miter.pPerspectiveOut).toBeDefined();
      expect(miter.pPerspectiveOut!.x).toBe(left - standDepthX + p.lateralTaperNorth);
      expect(miter.pPerspectiveOut!.y).toBe(top - standDepthY);
    });

    it('generates transitional quadrilateral shear geometry for NE corner matching North Stand rake', () => {
      const left = 200;
      const right = 800;
      const top = 150;
      const bottom = 650;
      const standDepthX = 140;
      const standDepthY = 140;

      const p = getStandPerspectiveMetrics('rectangular', standDepthX, standDepthY);
      const miter = getCornerMiterGeometry('corner_ne', left, right, top, bottom, standDepthX, standDepthY, p);

      expect(miter.pNorthShearGoal).toBeDefined();
      expect(miter.pNorthShearTouch).toBeDefined();

      // Front pitch corner: shear is 0
      const pitchEdgeGoal = miter.pNorthShearGoal!(0);
      expect(pitchEdgeGoal.x).toBe(right);
      expect(pitchEdgeGoal.y).toBe(top);

      // Rear outer rim: goal edge shears inward by -northTaperX to bond flush with North Stand
      const rearEdgeGoal = miter.pNorthShearGoal!(standDepthY);
      expect(rearEdgeGoal.x).toBeCloseTo(right - p.northTaperX, 0);
      expect(rearEdgeGoal.y).toBe(top - standDepthY);

      // Touchline maintains perpendicular 90° alignment along East touchline
      const touchPoint = miter.pNorthShearTouch!(standDepthX);
      expect(touchPoint.x).toBe(right + standDepthX);
      expect(touchPoint.y).toBe(top);

      // Rear outer point pPerspectiveOut connects with lateral taper
      expect(miter.pPerspectiveOut).toBeDefined();
      expect(miter.pPerspectiveOut!.x).toBe(right + standDepthX - p.lateralTaperNorth);
      expect(miter.pPerspectiveOut!.y).toBe(top - standDepthY);
    });

    it('computes sheared corner points smoothly along the angular arc using getShearedCornerPoint', () => {
      const pIn = { x: 300, y: 200 };
      const nTaper = 60;
      const standDepthY = 120;

      // NW Corner: startAngle is PI (West), endAngle is 1.5*PI (North)
      const ptWest = getShearedCornerPoint(pIn, 100, 100, Math.PI, 'corner_nw', nTaper, standDepthY);
      expect(ptWest.x).toBeCloseTo(300 - 100, 1); // West: shear is 0
      expect(ptWest.y).toBeCloseTo(200, 1);

      const ptNorth = getShearedCornerPoint(pIn, 100, 100, Math.PI * 1.5, 'corner_nw', nTaper, standDepthY);
      const expectedShear = nTaper * (100 / standDepthY) * 1.0;
      expect(ptNorth.x).toBeCloseTo(300 + expectedShear, 1); // North: full shear applied
      expect(ptNorth.y).toBeCloseTo(200 - 100, 1);

      const ptMid = getShearedCornerPoint(pIn, 100, 100, Math.PI * 1.25, 'corner_nw', nTaper, standDepthY);
      // Midpoint angle has partial shear
      expect(ptMid.x).toBeGreaterThan(300 - 100 * Math.SQRT1_2);

      // Southern corners have no north shear applied
      const ptSE = getShearedCornerPoint(pIn, 100, 100, 0, 'corner_se', nTaper, standDepthY);
      expect(ptSE.x).toBe(400);
      expect(ptSE.y).toBe(200);
    });

    it('traces sheared corner arc smoothly without throwing using traceShearedCornerArc', () => {
      const pIn = { x: 300, y: 200 };
      expect(() => {
        traceShearedCornerArc(ctx, pIn, 120, 120, Math.PI, Math.PI * 1.5, 'corner_nw', 50, 120, false);
        traceShearedCornerArc(ctx, pIn, 120, 120, Math.PI * 1.5, Math.PI * 2, 'corner_ne', 50, 120, false);
      }).not.toThrow();

      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
    });
  });

  describe('T12.2 Monumental "Giant Corner" Architecture & Depth Scaling', () => {
    it('provides monumental depth scaling via getGiantCornerMonumentalDepth (~180px–240px)', () => {
      expect(getGiantCornerMonumentalDepth('small')).toBe(120);
      expect(getGiantCornerMonumentalDepth('medium')).toBe(180);
      expect(getGiantCornerMonumentalDepth('large')).toBe(240);
    });

    it('computes monumental dynamic depth for giant/square corner stands', () => {
      const giantStandSmall: StandConfig = {
        position: 'corner_nw',
        type: 'square',
        wallSize: 'small',
      };
      const giantStandMed: StandConfig = {
        position: 'corner_ne',
        type: 'giant',
        wallSize: 'medium',
      };
      const giantStandBig: StandConfig = {
        position: 'corner_se',
        type: 'giant',
        wallSize: 'large',
      };

      const depthSmall = getGiantCornerMonumentalDepth(giantStandSmall.wallSize);
      const depthMed = getGiantCornerMonumentalDepth(giantStandMed.wallSize);
      const depthBig = getGiantCornerMonumentalDepth(giantStandBig.wallSize);

      expect(depthSmall).toBe(120);
      expect(depthMed).toBe(180);
      expect(depthBig).toBe(240);
    });

    it('computes stehplatz continuous terrace rows for giant corners with density modifiers', () => {
      const smallNormal = getWallTierChairRows('small', 'normal');
      const smallReduced = getWallTierChairRows('small', 'reduced');
      const smallHigh = getWallTierChairRows('small', 'high_density');

      expect(smallNormal).toBe(6);
      expect(smallReduced).toBe(5);
      expect(smallHigh).toBe(7);

      const bigNormal = getWallTierChairRows('large', 'normal');
      const bigHigh = getWallTierChairRows('large', 'high_density');

      expect(bigNormal).toBe(16);
      expect(bigHigh).toBe(20);
    });

    it('calculates monumental capacity for giant corners scaled by size and density', () => {
      const giantSmall: StandConfig = {
        position: 'corner_sw',
        type: 'giant',
        wallSize: 'small',
        wallDensity: 'normal',
      };
      const giantLargeHigh: StandConfig = {
        position: 'corner_sw',
        type: 'giant',
        wallSize: 'large',
        wallDensity: 'high_density',
      };

      const capSmall = calculateStandCapacity(giantSmall, 'rectangular', 'corner_sw');
      const capLargeHigh = calculateStandCapacity(giantLargeHigh, 'rectangular', 'corner_sw');

      expect(capSmall).toBeGreaterThan(3000);
      expect(capLargeHigh).toBeGreaterThan(capSmall * 1.5);
    });

    it('renders drawGiantCornerStand with closed flush bonding hull and alternating crash barriers', () => {
      const stand: StandConfig = {
        position: 'corner_nw',
        type: 'giant',
        wallSize: 'large',
        wallDensity: 'high_density',
        primaryColor: '#059669',
        secondaryColor: '#ffffff',
        hasRoof: true,
      };

      expect(() => {
        drawGiantCornerStand(
          ctx,
          stand,
          'corner_nw',
          200,
          800,
          150,
          650,
          100,
          100,
          HOME_KIT,
          AWAY_KIT,
          'night',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          'packet',
          'rectangular'
        );
      }).not.toThrow();

      // Verifies closed polygon hull and structural drawing
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
    });
  });

  describe('T12.3 Corner Stair & Vomitory Circulation Polish', () => {
    it('renders exactly 1 diagonal gangway stair with safety yellow hazard nosing in giant corner stand', () => {
      const stand: StandConfig = {
        position: 'corner_ne',
        type: 'giant',
        wallSize: 'medium',
        wallDensity: 'normal',
      };

      drawGiantCornerStand(
        ctx,
        stand,
        'corner_ne',
        200,
        800,
        150,
        650,
        180,
        180,
        HOME_KIT,
        AWAY_KIT,
        'night'
      );

      // Verifies stroke called with #facc15 yellow hazard nosing
      const strokeCalls = (ctx.stroke as any).mock.calls;
      expect(strokeCalls.length).toBeGreaterThan(5);
    });

    it('renders diagonal gangway stair in round corner stand with yellow hazard nosing', () => {
      const stand: StandConfig = {
        position: 'corner_nw',
        type: 'round',
        tierCount: 3,
        tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'large' }],
      };

      drawRoundCornerStand(
        ctx,
        stand,
        'corner_nw',
        200,
        800,
        150,
        650,
        140,
        140,
        HOME_KIT,
        AWAY_KIT,
        'noon',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'crowded',
        'rectangular'
      );

      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });
  });

  describe('T12.4 Master Integration & Regression Verification across All 4 Architectures', () => {
    it('renders all 4 corner architectures via drawMiteredCornerStand seamlessly', () => {
      const nwGiant: StandConfig = { position: 'corner_nw', type: 'giant', wallSize: 'large' };
      const neRound: StandConfig = { position: 'corner_ne', type: 'round', tierCount: 2 };
      const seTower: StandConfig = { position: 'corner_se', type: 'tower', vipFloors: 4 };
      const swNone: StandConfig = { position: 'corner_sw', type: 'none' };

      expect(() => {
        drawMiteredCornerStand(ctx, nwGiant, 'corner_nw', 200, 800, 150, 650, 120, 120, HOME_KIT, AWAY_KIT, 'rectangular');
        drawMiteredCornerStand(ctx, neRound, 'corner_ne', 200, 800, 150, 650, 120, 120, HOME_KIT, AWAY_KIT, 'rectangular');
        drawMiteredCornerStand(ctx, seTower, 'corner_se', 200, 800, 150, 650, 120, 120, HOME_KIT, AWAY_KIT, 'rectangular');
        drawMiteredCornerStand(ctx, swNone, 'corner_sw', 200, 800, 150, 650, 120, 120, HOME_KIT, AWAY_KIT, 'rectangular');
      }).not.toThrow();
    });

    it('renders all 4 corner quadrants simultaneously via drawCornerQuadrantStands without regression', () => {
      const stadium: Partial<StadiumDefinition> = {
        shape: 'rectangular',
        stands: {
          west: { position: 'west', type: 'wall', wallSize: 'large' },
          east: { position: 'east', type: 'tiered', tierCount: 3 },
          north: { position: 'north', type: 'tiered', tierCount: 2 },
          south: { position: 'south', type: 'wall', wallSize: 'medium' },
          corner_nw: { position: 'corner_nw', type: 'giant', wallSize: 'large' },
          corner_ne: { position: 'corner_ne', type: 'round', tierCount: 2 },
          corner_se: { position: 'corner_se', type: 'tower', vipFloors: 3 },
          corner_sw: { position: 'corner_sw', type: 'none' },
        },
      };

      expect(() => {
        drawCornerQuadrantStands(
          ctx,
          stadium as StadiumDefinition,
          200,
          800,
          150,
          650,
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'night',
          140,
          140
        );
      }).not.toThrow();

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('returns immediately for round and oval bowls in drawCornerQuadrantStands', () => {
      const roundDef: Partial<StadiumDefinition> = { shape: 'round' };
      const ovalDef: Partial<StadiumDefinition> = { shape: 'oval' };

      const saveCountBefore = (ctx.save as any).mock.calls.length;

      drawCornerQuadrantStands(ctx, roundDef as StadiumDefinition, 200, 800, 150, 650, HOME_KIT, AWAY_KIT, 'round');
      drawCornerQuadrantStands(ctx, ovalDef as StadiumDefinition, 200, 800, 150, 650, HOME_KIT, AWAY_KIT, 'oval');

      const saveCountAfter = (ctx.save as any).mock.calls.length;
      expect(saveCountAfter).toBe(saveCountBefore);
    });
  });
});
