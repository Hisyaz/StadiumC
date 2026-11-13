import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamKit, TimeOfDay } from '../../types';
import {
  StandConfig,
  StadiumDefinition,
  calculateDynamicStandDepth,
  isStandConfigurationEqual,
  getGiantCornerMonumentalDepth,
} from '../../types/stadium';
import {
  drawCornerQuadrantStands,
  getCornerMiterGeometry,
  getStandPerspectiveMetrics,
  getShearedCornerPoint,
  drawCornerTransitionSidewall,
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
  _records: { fillStyle: string; strokeStyle: string }[];
} {
  const paths: { type: string; x?: number; y?: number; w?: number; h?: number }[] = [];
  const records: { fillStyle: string; strokeStyle: string }[] = [];
  const ctx: any = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(() => paths.push({ type: 'beginPath' })),
    closePath: vi.fn(() => paths.push({ type: 'closePath' })),
    moveTo: vi.fn((x: number, y: number) => paths.push({ type: 'moveTo', x, y })),
    lineTo: vi.fn((x: number, y: number) => paths.push({ type: 'lineTo', x, y })),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
      paths.push({ type: 'fillRect', x, y, w, h });
      records.push({ fillStyle: ctx.fillStyle, strokeStyle: ctx.strokeStyle });
    }),
    strokeRect: vi.fn(),
    fill: vi.fn(() => records.push({ fillStyle: ctx.fillStyle, strokeStyle: ctx.strokeStyle })),
    stroke: vi.fn(() => records.push({ fillStyle: ctx.fillStyle, strokeStyle: ctx.strokeStyle })),
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
    _paths: paths,
    _records: records,
  };
  return ctx as CanvasRenderingContext2D & { _paths: typeof paths; _records: typeof records };
}

describe('HOTFIX T13C: Independent Corner Sizing & Southern Perspective Hotfix', () => {
  let ctx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    ctx = createMockContext();
  });

  describe('1. Specification-Dependent Corner Sizing & Equality Matching', () => {
    it('accurately detects when corner and adjacent stand configurations are identical', () => {
      const standA: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
      };
      const standB: StandConfig = {
        position: 'corner_nw',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
      };
      const standDifferentTiers: StandConfig = {
        position: 'north',
        type: 'tiered',
        tierCount: 2,
        tiers: [{ size: 'medium' }, { size: 'medium' }],
      };
      const standDifferentSize: StandConfig = {
        position: 'corner_ne',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'small' }, { size: 'medium' }, { size: 'large' }],
      };

      expect(isStandConfigurationEqual(standA, standB)).toBe(true);
      expect(isStandConfigurationEqual(standA, standDifferentTiers)).toBe(false);
      expect(isStandConfigurationEqual(standA, standDifferentSize)).toBe(false);
    });

    it('accurately detects configuration equality for wall stands and giant corners', () => {
      const wallStandLarge: StandConfig = { position: 'east', type: 'wall', wallSize: 'large' };
      const giantCornerLarge: StandConfig = { position: 'corner_se', type: 'giant', cornerType: 'giant', wallSize: 'large' };
      const giantCornerMedium: StandConfig = { position: 'corner_sw', type: 'giant', cornerType: 'giant', wallSize: 'medium' };

      expect(isStandConfigurationEqual(wallStandLarge, giantCornerLarge)).toBe(true);
      expect(isStandConfigurationEqual(wallStandLarge, giantCornerMedium)).toBe(false);
    });

    it('calculates independent corner depths according to the corner specification alone', () => {
      const corner1TierSmall: StandConfig = {
        position: 'corner_nw',
        type: 'tiered',
        tierCount: 1,
        tiers: [{ size: 'small' }],
      };
      const corner2TiersMed: StandConfig = {
        position: 'corner_ne',
        type: 'tiered',
        tierCount: 2,
        tiers: [{ size: 'medium' }, { size: 'medium' }],
      };
      const corner3TiersMed: StandConfig = {
        position: 'corner_se',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
      };
      const corner4TiersLarge: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        tierCount: 4,
        tiers: [{ size: 'large' }, { size: 'large' }, { size: 'large' }, { size: 'large' }],
      };

      const depth1Small = calculateDynamicStandDepth(corner1TierSmall, 'rectangular');
      const depth2Med = calculateDynamicStandDepth(corner2TiersMed, 'rectangular');
      const depth3Med = calculateDynamicStandDepth(corner3TiersMed, 'rectangular');
      const depth4Large = calculateDynamicStandDepth(corner4TiersLarge, 'rectangular');

      // Tier count and sizes scale monotonically
      expect(depth1Small).toBeLessThan(depth2Med);
      expect(depth2Med).toBeLessThan(depth3Med);
      expect(depth3Med).toBeLessThan(depth4Large);

      // Verify exact expected baseline scaling
      expect(depth1Small).toBe(75);
      expect(depth2Med).toBe(145);
      expect(depth3Med).toBe(205);
      expect(depth4Large).toBe(285);
    });

    it('matches adjacent stand depths exactly when configurations are equal', () => {
      const adjacentWest: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
      };
      const matchingCornerNW: StandConfig = {
        position: 'corner_nw',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
      };

      const depthWest = calculateDynamicStandDepth(adjacentWest, 'rectangular');
      const depthNW = calculateDynamicStandDepth(matchingCornerNW, 'rectangular');

      expect(depthNW).toBe(depthWest);
      expect(isStandConfigurationEqual(matchingCornerNW, adjacentWest)).toBe(true);
    });

    it('provides monumental depth scaling for giant corners (120px small, 180px medium, 240px large)', () => {
      expect(getGiantCornerMonumentalDepth('small')).toBe(120);
      expect(getGiantCornerMonumentalDepth('medium')).toBe(180);
      expect(getGiantCornerMonumentalDepth('large')).toBe(240);

      const smallGiant: StandConfig = { position: 'corner_ne', type: 'giant', cornerType: 'giant', wallSize: 'small' };
      expect(calculateDynamicStandDepth(smallGiant, 'rectangular')).toBe(120);

      const largeWall: StandConfig = { position: 'east', type: 'wall', wallSize: 'large' };
      const largeGiant: StandConfig = { position: 'corner_se', type: 'giant', cornerType: 'giant', wallSize: 'large' };
      expect(isStandConfigurationEqual(largeWall, largeGiant)).toBe(true);
    });
  });

  describe('2. Southern Corners Vertical Look & Tangent Continuity (SW & SE)', () => {
    const pIn = { x: 400, y: 550 };
    const rdX = 140;
    const rdY = 140;

    it('guarantees strictly vertical tangent at West touchline interface for SW corner', () => {
      // At angle = PI (due West): X is exactly pIn.x - rdX, Y is pIn.y (touchline bottom)
      const ptTouch = getShearedCornerPoint(pIn, rdX, rdY, Math.PI, 'corner_sw');
      expect(ptTouch.x).toBe(pIn.x - rdX);
      expect(ptTouch.y).toBe(pIn.y);

      // Infinitesimally close to West touchline (angle = 0.999 * PI)
      const ptNearTouch = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.999, 'corner_sw');
      // dX/dPhi approaches 0, meaning curve departs purely vertically downward along Y
      expect(Math.abs(ptNearTouch.x - ptTouch.x)).toBeLessThan(0.01);
      expect(ptNearTouch.y).toBeGreaterThan(ptTouch.y);
    });

    it('guarantees strictly horizontal tangent at South stand interface for SW corner', () => {
      // At angle = 0.5 * PI (due South): X is exactly pIn.x (pitch left), Y is pIn.y + rdY
      const ptSouth = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.5, 'corner_sw');
      expect(ptSouth.x).toBe(pIn.x);
      expect(ptSouth.y).toBe(pIn.y + rdY);

      // Infinitesimally close to South stand (angle = 0.501 * PI)
      const ptNearSouth = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.501, 'corner_sw');
      // dY/dPhi approaches 0, meaning curve departs purely horizontally to the left along X
      expect(Math.abs(ptNearSouth.y - ptSouth.y)).toBeLessThan(0.01);
      expect(ptNearSouth.x).toBeLessThan(ptSouth.x);
    });

    it('guarantees strictly vertical tangent at East touchline interface for SE corner', () => {
      // At angle = 0 (due East): X is exactly pIn.x + rdX, Y is pIn.y (touchline bottom)
      const ptTouch = getShearedCornerPoint(pIn, rdX, rdY, 0, 'corner_se');
      expect(ptTouch.x).toBe(pIn.x + rdX);
      expect(ptTouch.y).toBe(pIn.y);

      // Infinitesimally close to East touchline (angle = 0.001 * PI)
      const ptNearTouch = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.001, 'corner_se');
      expect(Math.abs(ptNearTouch.x - ptTouch.x)).toBeLessThan(0.01);
      expect(ptNearTouch.y).toBeGreaterThan(ptTouch.y);
    });

    it('guarantees strictly horizontal tangent at South stand interface for SE corner', () => {
      // At angle = 0.5 * PI (due South): X is exactly pIn.x (pitch right), Y is pIn.y + rdY
      const ptSouth = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.5, 'corner_se');
      expect(ptSouth.x).toBe(pIn.x);
      expect(ptSouth.y).toBe(pIn.y + rdY);

      // Infinitesimally close to South stand (angle = 0.499 * PI)
      const ptNearSouth = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.499, 'corner_se');
      expect(Math.abs(ptNearSouth.y - ptSouth.y)).toBeLessThan(0.01);
      expect(ptNearSouth.x).toBeGreaterThan(ptSouth.x);
    });

    it('eliminates the unnatural 19% squircle bulge along the 45-degree diagonal', () => {
      // Midpoint at angle = 0.75 * PI for SW corner
      const ptMidSW = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.75, 'corner_sw');
      // Circular parameterization gives exact radius rdX = 140px, NOT 140 * 1.189 = 166.5px
      const distFromPIn = Math.hypot(ptMidSW.x - pIn.x, ptMidSW.y - pIn.y);
      expect(distFromPIn).toBeCloseTo(rdX, 1);
    });

    it('preserves northern perspective angle and taper geometry on NW and NE corners completely untouched', () => {
      const left = 200;
      const right = 800;
      const top = 150;
      const bottom = 650;
      const p = getStandPerspectiveMetrics('rectangular', rdX, rdY);

      const miterNW = getCornerMiterGeometry('corner_nw', left, right, top, bottom, rdX, rdY, p);
      const miterNE = getCornerMiterGeometry('corner_ne', left, right, top, bottom, rdX, rdY, p);

      // Northern corners maintain their perspective lateral taper
      expect(miterNW.pPerspectiveOut!.x).toBe(left - rdX + p.lateralTaperNorth);
      expect(miterNE.pPerspectiveOut!.x).toBe(right + rdX - p.lateralTaperNorth);
    });
  });

  describe('3. Corner Transition Sidewalls for Differing Adjacent Configurations', () => {
    it('renders return transition sidewalls when corner depth differs from touchline or goal stand', () => {
      const pTouch = (d: number) => ({ x: 200 - d, y: 650 });
      const pGoal = (d: number) => ({ x: 200, y: 650 + d });

      const cornerStand: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        tierCount: 1,
        tiers: [{ size: 'small' }],
      };
      const adjacentWestStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
      };

      // Corner depth = 75px, adjacent west depth = 205px
      expect(() => {
        drawCornerTransitionSidewall(
          ctx,
          'corner_sw',
          75,
          205,
          'touchline',
          cornerStand,
          adjacentWestStand,
          pTouch,
          pGoal,
          'noon'
        );
      }).not.toThrow();

      // Verify that stroke operations were invoked to draw the coping and wall return
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('skips transition sidewall when corner depth and adjacent depth are identical', () => {
      const pTouch = (d: number) => ({ x: 200 - d, y: 650 });
      const pGoal = (d: number) => ({ x: 200, y: 650 + d });

      const cornerStand: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
      };

      const initialCallCount = (ctx.stroke as any).mock.calls.length;

      drawCornerTransitionSidewall(
        ctx,
        'corner_sw',
        205,
        205, // Exactly equal depth
        'touchline',
        cornerStand,
        cornerStand,
        pTouch,
        pGoal,
        'noon'
      );

      // Depth delta is 0, so no return wall needed
      expect((ctx.stroke as any).mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('4. Master Stadium Quad Corner Rendering with Diverse Configurations', () => {
    it('renders a stadium with asymmetrically configured corners and adjacent stands flawlessly', () => {
      const complexStadium: StadiumDefinition = {
        id: 'hotfix-t13c-venue',
        name: 'Asymmetric Modern Arena',
        shape: 'rectangular',
        tier: 'monumental',
        stands: {
          west: {
            position: 'west',
            type: 'tiered',
            tierCount: 3,
            tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
            grade: 'grade4_modern',
          },
          east: {
            position: 'east',
            type: 'wall',
            wallSize: 'large',
            grade: 'grade3_industrial',
          },
          north: {
            position: 'north',
            type: 'tiered',
            tierCount: 1,
            tiers: [{ size: 'small' }],
            grade: 'grade2_classic',
          },
          south: {
            position: 'south',
            type: 'tiered',
            tierCount: 2,
            tiers: [{ size: 'large' }, { size: 'large' }],
            grade: 'grade4_modern',
          },
          // Corner NW: matching 3-tier medium with West
          corner_nw: {
            position: 'corner_nw',
            type: 'tiered',
            tierCount: 3,
            tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
            grade: 'grade4_modern',
          },
          // Corner NE: Giant corner matching East wall large
          corner_ne: {
            position: 'corner_ne',
            type: 'giant',
            cornerType: 'giant',
            wallSize: 'large',
            grade: 'grade3_industrial',
          },
          // Corner SE: Independent 1-tier small (differs from East wall and South 2-tier)
          corner_se: {
            position: 'corner_se',
            type: 'tiered',
            tierCount: 1,
            tiers: [{ size: 'small' }],
            grade: 'grade1_grassroots',
          },
          // Corner SW: Independent 4-tier large
          corner_sw: {
            position: 'corner_sw',
            type: 'tiered',
            tierCount: 4,
            tiers: [{ size: 'large' }, { size: 'large' }, { size: 'large' }, { size: 'large' }],
            grade: 'grade5_futuristic',
          },
        },
      } as unknown as StadiumDefinition;

      expect(() => {
        drawCornerQuadrantStands(
          ctx,
          complexStadium,
          150,
          850,
          100,
          600,
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'noon'
        );
      }).not.toThrow();

      // Validate on square stadium shape as well
      expect(() => {
        drawCornerQuadrantStands(
          ctx,
          complexStadium,
          200,
          800,
          200,
          800,
          HOME_KIT,
          AWAY_KIT,
          'square',
          'night'
        );
      }).not.toThrow();
    });
  });
});
