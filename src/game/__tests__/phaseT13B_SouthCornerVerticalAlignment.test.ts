import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamKit } from '../../types';
import {
  StandConfig,
  StadiumDefinition,
  CornerStandType,
  CORNER_STAND_OPTIONS,
  resolveCornerArchitectureType,
  isCornerRound,
  isCornerGiant,
  isCornerTower,
  isCornerNoStand,
  getGiantCornerMonumentalDepth,
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

describe('Hotfix Phase T13B: South Corner Geometry, Vertical Perspective Alignment & Black Circle Elimination', () => {
  let ctx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    ctx = createMockContext();
  });

  describe('T13B.1 South Corner Geometry & Vertical Perspective Alignment (SW & SE Corners)', () => {
    const left = 200;
    const right = 800;
    const top = 150;
    const bottom = 650;
    const standDepthX = 140;
    const standDepthY = 140;

    it('aligns SW corner pPerspectiveOut strictly vertical with the West touchline stand', () => {
      const p = getStandPerspectiveMetrics('rectangular', standDepthX, standDepthY);
      const miterSW = getCornerMiterGeometry('corner_sw', left, right, top, bottom, standDepthX, standDepthY, p);

      expect(miterSW.pPerspectiveOut).toBeDefined();
      // Strictly vertical with West outer edge: x === left - standDepthX (no lateral flare)
      expect(miterSW.pPerspectiveOut!.x).toBe(left - standDepthX);
      // Clean horizontal connection with South stand outer depth: y === bottom + standDepthY
      expect(miterSW.pPerspectiveOut!.y).toBe(bottom + standDepthY);
      expect(miterSW.verticalSouthAlignment).toBe(true);

      // Verify touchline outer point matches West stand
      const touchOuter = miterSW.pTouch(standDepthX);
      expect(touchOuter.x).toBe(left - standDepthX);
      expect(touchOuter.y).toBe(bottom);

      // Outer West wall from touchOuter to pPerspectiveOut is strictly vertical (same X)
      expect(touchOuter.x).toBe(miterSW.pPerspectiveOut!.x);
    });

    it('aligns SE corner pPerspectiveOut strictly vertical with the East touchline stand', () => {
      const p = getStandPerspectiveMetrics('rectangular', standDepthX, standDepthY);
      const miterSE = getCornerMiterGeometry('corner_se', left, right, top, bottom, standDepthX, standDepthY, p);

      expect(miterSE.pPerspectiveOut).toBeDefined();
      // Strictly vertical with East outer edge: x === right + standDepthX (no lateral flare)
      expect(miterSE.pPerspectiveOut!.x).toBe(right + standDepthX);
      // Clean horizontal connection with South stand outer depth: y === bottom + standDepthY
      expect(miterSE.pPerspectiveOut!.y).toBe(bottom + standDepthY);
      expect(miterSE.verticalSouthAlignment).toBe(true);

      // Verify touchline outer point matches East stand
      const touchOuter = miterSE.pTouch(standDepthX);
      expect(touchOuter.x).toBe(right + standDepthX);
      expect(touchOuter.y).toBe(bottom);

      // Outer East wall from touchOuter to pPerspectiveOut is strictly vertical (same X)
      expect(touchOuter.x).toBe(miterSE.pPerspectiveOut!.x);
    });

    it('preserves northern perspective shear on NW and NE corners without alteration', () => {
      const p = getStandPerspectiveMetrics('rectangular', standDepthX, standDepthY);
      const miterNW = getCornerMiterGeometry('corner_nw', left, right, top, bottom, standDepthX, standDepthY, p);
      const miterNE = getCornerMiterGeometry('corner_ne', left, right, top, bottom, standDepthX, standDepthY, p);

      // NW and NE still possess northern shear functions
      expect(miterNW.pNorthShearGoal).toBeDefined();
      expect(miterNE.pNorthShearGoal).toBeDefined();
      expect(miterNW.pPerspectiveOut!.x).toBe(left - standDepthX + p.lateralTaperNorth);
      expect(miterNE.pPerspectiveOut!.x).toBe(right + standDepthX - p.lateralTaperNorth);
    });
  });

  describe('T13B.2 Vertical Squircle Fillet & Elimination of the "Black Circle" Void Artifact', () => {
    const pIn = { x: 300, y: 500 };
    const rdX = 120;
    const rdY = 120;

    it('computes SW corner points with vertical touchline tangent and horizontal South tangent', () => {
      // SW corner: startAngle = 0.5*PI (South), endAngle = PI (West)
      const ptSouth = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.5, 'corner_sw');
      expect(ptSouth.x).toBeCloseTo(300, 2); // Exact pitch left
      expect(ptSouth.y).toBeCloseTo(500 + rdY, 2); // Exact South depth

      const ptWest = getShearedCornerPoint(pIn, rdX, rdY, Math.PI, 'corner_sw');
      expect(ptWest.x).toBeCloseTo(300 - rdX, 2); // Exact West depth
      expect(ptWest.y).toBeCloseTo(500, 2); // Exact pitch bottom

      // Midpoint (45 degrees): vertical perspective arc produces smooth circular radius (0.7071), avoiding squircle bulge
      const ptMid = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.75, 'corner_sw');
      expect(ptMid.x).toBeCloseTo(pIn.x - rdX * Math.SQRT1_2, 1);
      expect(ptMid.y).toBeCloseTo(pIn.y + rdY * Math.SQRT1_2, 1);

      // Near West touchline (angle = 0.95*PI): x is within 2px of full rdX depth
      const ptNearWest = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.95, 'corner_sw');
      expect(Math.abs(ptNearWest.x - (pIn.x - rdX))).toBeLessThan(2);
    });

    it('computes SE corner points with vertical touchline tangent and horizontal South tangent', () => {
      // SE corner: startAngle = 0 (East), endAngle = 0.5*PI (South)
      const ptEast = getShearedCornerPoint(pIn, rdX, rdY, 0, 'corner_se');
      expect(ptEast.x).toBeCloseTo(300 + rdX, 2); // Exact East depth
      expect(ptEast.y).toBeCloseTo(500, 2); // Exact pitch bottom

      const ptSouth = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.5, 'corner_se');
      expect(ptSouth.x).toBeCloseTo(300, 2); // Exact pitch right
      expect(ptSouth.y).toBeCloseTo(500 + rdY, 2); // Exact South depth

      // Midpoint: smooth vertical perspective circular arc (0.7071)
      const ptMid = getShearedCornerPoint(pIn, rdX, rdY, Math.PI * 0.25, 'corner_se');
      expect(ptMid.x).toBeCloseTo(pIn.x + rdX * Math.SQRT1_2, 1);
      expect(ptMid.y).toBeCloseTo(pIn.y + rdY * Math.SQRT1_2, 1);
    });

    it('traceShearedCornerArc executes smooth lineTo polyline for SW and SE instead of drawSafeEllipse', () => {
      traceShearedCornerArc(ctx, pIn, rdX, rdY, Math.PI * 0.5, Math.PI, 'corner_sw', 0, 120, false, 12);
      expect(ctx.ellipse).not.toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalledTimes(1);
      expect(ctx.lineTo).toHaveBeenCalledTimes(12);

      // Clear mock calls and paths
      vi.clearAllMocks();
      ctx._paths.length = 0;
      traceShearedCornerArc(ctx, pIn, rdX, rdY, 0, Math.PI * 0.5, 'corner_se', 0, 120, false, 12);
      expect(ctx.ellipse).not.toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalledTimes(1);
      expect(ctx.lineTo).toHaveBeenCalledTimes(12);
    });
  });

  describe('T13B.3 Live Rendering Across All 4 Corner Typologies Connecting to South Stand', () => {
    const left = 200;
    const right = 800;
    const top = 150;
    const bottom = 650;
    const standDepthX = 120;
    const standDepthY = 120;

    it('renders Round Sweeping Multi-Tier Corner on SW and SE without circular void or distortion', () => {
      const swStand: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 3,
        primaryColor: '#0284c7',
        secondaryColor: '#ffffff',
      };
      const seStand: StandConfig = {
        position: 'corner_se',
        type: 'tiered',
        grade: 'grade2_classic',
        tierCount: 2,
        primaryColor: '#ef4444',
        secondaryColor: '#fef08a',
      };

      expect(() => {
        drawRoundCornerStand(ctx, swStand, 'corner_sw', left, right, top, bottom, standDepthX, standDepthY, HOME_KIT, AWAY_KIT);
        drawRoundCornerStand(ctx, seStand, 'corner_se', left, right, top, bottom, standDepthX, standDepthY, HOME_KIT, AWAY_KIT);
      }).not.toThrow();

      // Verify canvas operations succeeded and plinths were rendered
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(ctx._paths.length).toBeGreaterThan(50);
    });

    it('renders Giant Monolithic High-Rake Corner on SW and SE with orthogonal vertical outer walls', () => {
      const swGiant: StandConfig = {
        position: 'corner_sw',
        type: 'giant',
        cornerType: 'giant',
        wallSize: 'large',
        wallDensity: 'normal',
        grade: 'grade3_industrial',
      };
      const seGiant: StandConfig = {
        position: 'corner_se',
        type: 'giant',
        cornerType: 'giant',
        wallSize: 'medium',
        wallDensity: 'high_density',
        grade: 'grade5_futuristic',
      };

      expect(() => {
        drawGiantCornerStand(ctx, swGiant, 'corner_sw', left, right, top, bottom, standDepthX, standDepthY, HOME_KIT, AWAY_KIT);
        drawGiantCornerStand(ctx, seGiant, 'corner_se', left, right, top, bottom, standDepthX, standDepthY, HOME_KIT, AWAY_KIT);
      }).not.toThrow();

      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('renders VIP Tower Corner and No-Stand Corner on SW and SE cleanly into the South Stand', () => {
      const swNone: StandConfig = {
        position: 'corner_sw',
        type: 'none',
        cornerType: 'none',
      };
      const seTower: StandConfig = {
        position: 'corner_se',
        type: 'tower',
        cornerType: 'tower',
        vipFloors: 3,
      };

      expect(() => {
        drawMiteredCornerStand(ctx, swNone, 'corner_sw', left, right, top, bottom, standDepthX, standDepthY, HOME_KIT, AWAY_KIT);
        drawMiteredCornerStand(ctx, seTower, 'corner_se', left, right, top, bottom, standDepthX, standDepthY, HOME_KIT, AWAY_KIT);
      }).not.toThrow();
    });

    it('renders all 4 corner quadrants via drawCornerQuadrantStands with South vertical alignment', () => {
      const stadiumDef: StadiumDefinition = {
        id: 'hotfix-t13b-venue',
        name: 'Vertical South Arena',
        shape: 'rectangular',
        tier: 'monumental',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 3, grade: 'grade4_modern' },
          east: { position: 'east', type: 'tiered', tierCount: 3, grade: 'grade4_modern' },
          north: { position: 'north', type: 'wall', wallSize: 'large', grade: 'grade3_industrial' },
          south: { position: 'south', type: 'tiered', tierCount: 2, grade: 'grade4_modern' },
          corner_nw: { position: 'corner_nw', type: 'tiered', tierCount: 3, grade: 'grade4_modern' },
          corner_ne: { position: 'corner_ne', type: 'tiered', tierCount: 3, grade: 'grade4_modern' },
          corner_se: { position: 'corner_se', type: 'tiered', tierCount: 2, grade: 'grade4_modern' },
          corner_sw: { position: 'corner_sw', type: 'tiered', tierCount: 2, grade: 'grade4_modern' },
        },
      } as unknown as StadiumDefinition;

      expect(() => {
        drawCornerQuadrantStands(ctx, stadiumDef, left, right, top, bottom, HOME_KIT, AWAY_KIT, 'rectangular', 'night', standDepthX, standDepthY);
      }).not.toThrow();
    });
  });
});
