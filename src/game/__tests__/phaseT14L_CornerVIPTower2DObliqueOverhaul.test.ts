import { describe, it, expect, vi } from 'vitest';
import {
  StandConfig,
  getCornerTowerGeometry,
  CornerTowerGeometry,
  VipFloorCount,
  ArchitecturalGrade,
} from '../../types/stadium';
import { TeamKit, TimeOfDay } from '../../types';
import { drawTowerCornerStand } from '../stadiumRenderer';

describe('Hotfix Phase T14L: Corner VIP Towers 2.5D Oblique Architectural Overhaul & 4-Quadrant Directional Aspect System', () => {
  const dummyHomeKit: TeamKit = {
    name: 'Home Blue',
    shortName: 'HME',
    primaryColor: '#1d4ed8',
    secondaryColor: '#ffffff',
    shortsColor: '#ffffff',
    socksColor: '#1e3a8a',
    gkColor: '#22c55e',
  };

  const dummyAwayKit: TeamKit = {
    name: 'Away Red',
    shortName: 'AWY',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    shortsColor: '#000000',
    socksColor: '#dc2626',
    gkColor: '#eab308',
  };

  const createMockContext = () => {
    const callLog: string[] = [];
    const fillRects: { x: number; y: number; w: number; h: number; style: string }[] = [];
    let currentFillStyle = '';

    const ctx = {
      save: vi.fn(() => callLog.push('save')),
      restore: vi.fn(() => callLog.push('restore')),
      beginPath: vi.fn(() => callLog.push('beginPath')),
      closePath: vi.fn(() => callLog.push('closePath')),
      moveTo: vi.fn((x: number, y: number) => callLog.push(`moveTo(${Math.round(x)},${Math.round(y)})`)),
      lineTo: vi.fn((x: number, y: number) => callLog.push(`lineTo(${Math.round(x)},${Math.round(y)})`)),
      stroke: vi.fn(() => callLog.push('stroke')),
      fill: vi.fn(() => callLog.push('fill')),
      fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
        fillRects.push({ x, y, w, h, style: currentFillStyle });
        callLog.push(`fillRect(${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)})`);
      }),
      strokeRect: vi.fn((x: number, y: number, w: number, h: number) =>
        callLog.push(`strokeRect(${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)})`)
      ),
      arc: vi.fn((x: number, y: number, r: number) => callLog.push(`arc(${Math.round(x)},${Math.round(y)},${r})`)),
      clip: vi.fn(() => callLog.push('clip')),
      createPattern: vi.fn(() => null),
      set fillStyle(val: string) {
        currentFillStyle = val;
      },
      get fillStyle() {
        return currentFillStyle;
      },
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;

    return { ctx, callLog, fillRects };
  };

  describe('T14L.1 & T14L.3: 2.5D Oblique Prism Geometry & Horizontal Symmetry', () => {
    it('calculates true 2.5D prism geometry (rooftop, main elevation, lateral flank) across all 4 quadrants', () => {
      const left = 200;
      const right = 800;
      const top = 150;
      const bottom = 650;
      const depthX = 140;
      const depthY = 140;

      const corners = ['corner_nw', 'corner_ne', 'corner_sw', 'corner_se'] as const;

      for (const pos of corners) {
        const geom: CornerTowerGeometry = getCornerTowerGeometry(pos, left, right, top, bottom, depthX, depthY, 4);

        expect(geom.pos).toBe(pos);
        expect(geom.bounds.w).toBe(depthX);
        expect(geom.bounds.h).toBe(depthY);

        // Sum of horizontal components equals total width
        expect(geom.mainElevation.w + geom.lateralFlank.w).toBe(geom.bounds.w);
        // Sum of vertical components equals total height
        expect(geom.rooftop.h + geom.mainElevation.h).toBe(geom.bounds.h);
        expect(geom.rooftop.h + geom.lateralFlank.h).toBe(geom.bounds.h);

        // Rooftop deck sits at the very top of the bounding box
        expect(geom.rooftop.x).toBe(geom.bounds.x);
        expect(geom.rooftop.y).toBe(geom.bounds.y);
        expect(geom.rooftop.w).toBe(geom.bounds.w);
        expect(geom.rooftop.h).toBeGreaterThanOrEqual(14);
      }
    });

    it('enforces horizontal symmetry: NW/SW have East-facing lateral flank; NE/SE have West-facing lateral flank', () => {
      const left = 200;
      const right = 800;
      const top = 150;
      const bottom = 650;

      const nw = getCornerTowerGeometry('corner_nw', left, right, top, bottom, 140, 140);
      const ne = getCornerTowerGeometry('corner_ne', left, right, top, bottom, 140, 140);
      const sw = getCornerTowerGeometry('corner_sw', left, right, top, bottom, 140, 140);
      const se = getCornerTowerGeometry('corner_se', left, right, top, bottom, 140, 140);

      // West towers (NW, SW)
      expect(nw.isWest).toBe(true);
      expect(sw.isWest).toBe(true);
      expect(nw.lateralFlank.side).toBe('east');
      expect(sw.lateralFlank.side).toBe('east');
      // East flank is on the inner side (right of main elevation)
      expect(nw.lateralFlank.x).toBe(nw.mainElevation.x + nw.mainElevation.w);
      expect(sw.lateralFlank.x).toBe(sw.mainElevation.x + sw.mainElevation.w);

      // East towers (NE, SE)
      expect(ne.isEast).toBe(true);
      expect(se.isEast).toBe(true);
      expect(ne.lateralFlank.side).toBe('west');
      expect(se.lateralFlank.side).toBe('west');
      // West flank is on the inner side (left of main elevation)
      expect(ne.mainElevation.x).toBe(ne.lateralFlank.x + ne.lateralFlank.w);
      expect(se.mainElevation.x).toBe(se.lateralFlank.x + se.lateralFlank.w);
    });
  });

  describe('T14L.2: North Front Luxury Suites vs South Rear Exterior Facade', () => {
    it('renders front pitch-facing luxury glazed suites with amber glow and executive silhouettes on North corners', () => {
      const { ctx, fillRects, callLog } = createMockContext();
      const stand: StandConfig = {
        position: 'corner_nw',
        type: 'tower',
        cornerType: 'tower',
        vipFloors: 3,
        architecturalGrade: 'modern',
      };

      drawTowerCornerStand(
        ctx,
        stand,
        'corner_nw',
        200,
        800,
        150,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(fillRects.length).toBeGreaterThan(15);

      // Checks for executive silhouettes (arc calls for heads)
      const arcCalls = callLog.filter((c) => c.startsWith('arc'));
      expect(arcCalls.length).toBeGreaterThan(3);

      // Amber interior hospitality glow fill is present
      const amberFills = fillRects.filter(
        (f) => f.style.includes('245, 158, 11') || f.style.includes('251, 191, 36')
      );
      expect(amberFills.length).toBeGreaterThanOrEqual(3);
    });

    it('renders foreground rear exterior facade with elevator shaft, emergency slit windows & VIP carpet on South corners', () => {
      const { ctx, fillRects } = createMockContext();
      const stand: StandConfig = {
        position: 'corner_se',
        type: 'tower',
        cornerType: 'tower',
        vipFloors: 4,
        architecturalGrade: 'brutalist',
      };

      drawTowerCornerStand(
        ctx,
        stand,
        'corner_se',
        200,
        800,
        150,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      // Checks for emergency green slit windows (#22c55e or #86efac)
      const greenSlits = fillRects.filter((f) => f.style === '#22c55e' || f.style === '#86efac');
      expect(greenSlits.length).toBeGreaterThanOrEqual(3);

      // Checks for VIP red carpet runner (#dc2626)
      const redCarpet = fillRects.filter((f) => f.style === '#dc2626');
      expect(redCarpet.length).toBeGreaterThanOrEqual(1);

      // Checks for gold carpet borders (#fde047)
      const goldBorders = fillRects.filter((f) => f.style === '#fde047');
      expect(goldBorders.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('T14L.3 & T14L.4: 32-Bit Directional Cast Shadows, Floor Scalability & Architectural Grades', () => {
    it('applies directional cast shadows on the receding lateral flank for chiseled 32-bit volume', () => {
      const { ctx, fillRects } = createMockContext();
      const stand: StandConfig = {
        position: 'corner_sw',
        type: 'tower',
        cornerType: 'tower',
        vipFloors: 3,
        architecturalGrade: 'industrial',
      };

      drawTowerCornerStand(
        ctx,
        stand,
        'corner_sw',
        200,
        800,
        150,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'noon'
      );

      // Lateral flank directional shadow (0.35 in day, 0.42 at night)
      const flankShadow = fillRects.filter(
        (f) => f.style.includes('rgba(0, 0, 0, 0.35)') || f.style.includes('rgba(0, 0, 0, 0.42)')
      );
      expect(flankShadow.length).toBeGreaterThanOrEqual(1);
    });

    it('cleanly scales from 1 to 5 floors without vertical distortion or errors', () => {
      const floorCounts: VipFloorCount[] = [1, 2, 3, 4, 5];

      for (const fc of floorCounts) {
        const { ctx, fillRects } = createMockContext();
        const stand: StandConfig = {
          position: 'corner_ne',
          type: 'tower',
          cornerType: 'tower',
          vipFloors: fc,
        };

        expect(() => {
          drawTowerCornerStand(
            ctx,
            stand,
            'corner_ne',
            200,
            800,
            150,
            650,
            140,
            140,
            dummyHomeKit,
            dummyAwayKit,
            'night'
          );
        }).not.toThrow();

        expect(fillRects.length).toBeGreaterThan(10);
      }
    });

    it('renders cleanly across all 5 architectural grades', () => {
      const grades: ArchitecturalGrade[] = ['municipal', 'brutalist', 'industrial', 'victorian', 'modern'];

      for (const g of grades) {
        const { ctx, fillRects } = createMockContext();
        const stand: StandConfig = {
          position: 'corner_nw',
          type: 'tower',
          cornerType: 'tower',
          architecturalGrade: g,
          vipFloors: 3,
        };

        expect(() => {
          drawTowerCornerStand(
            ctx,
            stand,
            'corner_nw',
            200,
            800,
            150,
            650,
            140,
            140,
            dummyHomeKit,
            dummyAwayKit,
            'night'
          );
        }).not.toThrow();

        expect(fillRects.length).toBeGreaterThan(15);
      }
    });
  });
});
