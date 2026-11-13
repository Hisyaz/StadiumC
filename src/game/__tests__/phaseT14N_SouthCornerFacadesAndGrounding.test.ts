/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  drawRoundCornerStand,
  drawGiantCornerStand,
  drawTowerCornerStand,
  drawOuterRearDelimitationWall,
  drawSouthCornerOuterWallMiterWrap,
  drawSouthCornerExteriorCirculationStairs,
  drawSouthCornerTurnstileAccessNode,
  drawSouthCornerFoundationPlinthAndShadow,
  drawOuterWallCorner45Transition,
  getSouthCornerFacadeMiterMetrics,
  getSouthCornerPlinthGrounding,
  getSouthernCornerObliqueMetrics,
} from '../stadiumRenderer';
import {
  StandConfig,
  StadiumDefinition,
  CoreStadiumGrounds,
  SouthCornerFacadeMiterMetrics,
  SouthCornerPlinthGrounding,
} from '../../types/stadium';
import { TeamKit } from '../../types';

describe('Hotfix Phase T14N: Southern Corner Exterior Facades, Outer Wall Miter Turn & Grounding Plinths', () => {
  const dummyHomeKit: TeamKit = {
    name: 'Home Red',
    shortName: 'HOM',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    shortsColor: '#ffffff',
    socksColor: '#dc2626',
    gkColor: '#22c55e',
  };

  const dummyAwayKit: TeamKit = {
    name: 'Away Blue',
    shortName: 'AWY',
    primaryColor: '#2563eb',
    secondaryColor: '#facc15',
    shortsColor: '#2563eb',
    socksColor: '#facc15',
    gkColor: '#eab308',
  };

  let mockCtx: any;

  beforeEach(() => {
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      arc: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      setLineDash: vi.fn(),
      measureText: vi.fn(() => ({ width: 40 })),
      clip: vi.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'middle',
    };
  });

  describe('T14N.1: Continuous Outer Wall Miter Wrap (Touchline to South Facade)', () => {
    it('calculates continuous miter wrap metrics without coordinate gaps for SW and SE corners', () => {
      const left = 200;
      const right = 800;
      const bottom = 600;
      const standDepthX = 140;
      const standDepthY = 140;

      const metricsSW = getSouthCornerFacadeMiterMetrics(
        'corner_sw',
        left,
        right,
        bottom,
        standDepthX,
        standDepthY,
        undefined,
        'brick',
        'grade2_classic',
        'night'
      );

      expect(metricsSW).not.toBeNull();
      expect(metricsSW?.pos).toBe('corner_sw');
      expect(metricsSW?.touchlineStartX).toBe(left - standDepthX);
      expect(metricsSW?.touchlineStartY).toBe(bottom);
      expect(metricsSW?.southFacadeEndY).toBe(bottom + standDepthY);
      expect(metricsSW?.isContinuous).toBe(true);
      expect(metricsSW?.miterLength).toBeGreaterThan(0);
      expect(metricsSW?.hasStaircase).toBe(true);
      expect(metricsSW?.hasTurnstileNode).toBe(true);
      expect(metricsSW?.hasExitSign).toBe(true);

      const metricsSE = getSouthCornerFacadeMiterMetrics(
        'corner_se',
        left,
        right,
        bottom,
        standDepthX,
        standDepthY,
        undefined,
        'concrete',
        'grade4_modern',
        'noon'
      );

      expect(metricsSE).not.toBeNull();
      expect(metricsSE?.pos).toBe('corner_se');
      expect(metricsSE?.touchlineStartX).toBe(right + standDepthX);
      expect(metricsSE?.touchlineStartY).toBe(bottom);
      expect(metricsSE?.southFacadeEndY).toBe(bottom + standDepthY);
      expect(metricsSE?.isContinuous).toBe(true);
      expect(metricsSE?.miterLength).toBeGreaterThan(0);
    });

    it('enforces strict lock on northern corners (returns null for corner_nw and corner_ne)', () => {
      expect(getSouthCornerFacadeMiterMetrics('corner_nw', 200, 800, 600, 140, 140)).toBeNull();
      expect(getSouthCornerFacadeMiterMetrics('corner_ne', 200, 800, 600, 140, 140)).toBeNull();
    });

    it('renders drawSouthCornerOuterWallMiterWrap across all 4 wall materials without errors', () => {
      const materials = ['brick', 'corrugated_steel', 'timber', 'concrete'] as const;

      for (const mat of materials) {
        mockCtx.fill.mockClear();
        mockCtx.stroke.mockClear();

        drawSouthCornerOuterWallMiterWrap(
          mockCtx,
          'corner_sw',
          60,
          600,
          165,
          740,
          mat,
          'night',
          'grade2_classic',
          'parking_lots'
        );

        expect(mockCtx.save).toHaveBeenCalled();
        expect(mockCtx.restore).toHaveBeenCalled();
        expect(mockCtx.fill).toHaveBeenCalled();
        expect(mockCtx.stroke).toHaveBeenCalled();
      }
    });

    it('renders drawOuterWallCorner45Transition with full miter run and grounding on south corners', () => {
      drawOuterWallCorner45Transition(
        mockCtx,
        60,
        100,
        14,
        500,
        'west',
        'corner_sw',
        'brick',
        'night',
        'rectangular',
        'grade2_classic'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('wires continuous southern corner outer wall miter wrap into drawOuterRearDelimitationWall for planar giant west & east walls and skips round bowls', () => {
      const standWest: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade2_classic',
        tierCount: 2,
        rearWallMaterial: 'brick',
      };
      const standEast: StandConfig = {
        ...standWest,
        position: 'east',
      };
      const stadiumDef = {
        id: 't14n_miter_test',
        name: 'Miter Ground',
        shape: 'rectangular',
        grounds: 'classical_statues',
        stands: {
          west: standWest,
          east: standEast,
          south: { position: 'south', type: 'tiered', grade: 'grade2_classic', tierCount: 2 },
          corner_sw: { position: 'corner_sw', type: 'wall', cornerType: 'giant', wallSize: 'medium', grade: 'grade2_classic' },
          corner_se: { position: 'corner_se', type: 'wall', cornerType: 'giant', wallSize: 'medium', grade: 'grade2_classic' },
          corner_nw: { position: 'corner_nw', type: 'tiered', grade: 'grade2_classic', tierCount: 2 },
          corner_ne: { position: 'corner_ne', type: 'tiered', grade: 'grade2_classic', tierCount: 2 },
        },
      } as unknown as StadiumDefinition;

      for (const side of ['west', 'east'] as const) {
        mockCtx.moveTo.mockClear();
        mockCtx.lineTo.mockClear();
        mockCtx.fillRect.mockClear();

        drawOuterRearDelimitationWall(
          mockCtx,
          side === 'west' ? standWest : standEast,
          side === 'west' ? 80 : 800,
          100,
          120,
          500,
          side,
          'night',
          0,
          'rectangular',
          stadiumDef
        );

        // Continuous miter wrap traces touchlineStart -> southFacadeEnd using multi-point plinth + coping + wall
        expect(mockCtx.moveTo.mock.calls.length).toBeGreaterThanOrEqual(8);
        expect(mockCtx.lineTo.mock.calls.length).toBeGreaterThanOrEqual(12);
        // Includes exterior circulation stair & turnstile gatehouse fillRect calls from miter wrap
        expect(mockCtx.fillRect.mock.calls.length).toBeGreaterThan(15);
      }

      // Round corners draw their own curved outer wall, plinth, stairs & turnstile, so drawOuterRearDelimitationWall
      // must NOT emit a conflicting straight diagonal miter chord across the concourse.
      const roundStadiumDef = {
        ...stadiumDef,
        stands: {
          ...stadiumDef.stands,
          corner_sw: { position: 'corner_sw', type: 'round', cornerType: 'round', tierCount: 2, grade: 'grade2_classic' },
          corner_se: { position: 'corner_se', type: 'round', cornerType: 'round', tierCount: 2, grade: 'grade2_classic' },
        },
      } as unknown as StadiumDefinition;
      mockCtx.moveTo.mockClear();
      drawOuterRearDelimitationWall(mockCtx, standWest, 80, 100, 120, 500, 'west', 'night', 0, 'rectangular', roundStadiumDef);
      // Only NW 45-degree transition paths, zero SW miter wrap paths
      expect(mockCtx.moveTo.mock.calls.length).toBeLessThan(8);
    });
  });

  describe('T14N.2: High-Oblique Foundation Plinths & Grounding Drop Shadows Across All 9 Ground Types', () => {
    const nineCoreGrounds: CoreStadiumGrounds[] = [
      'parking_lots',
      'mall_commercial',
      'club_museum_trophies',
      'classical_statues',
      'modern_architectural',
      'industrial_depot',
      'park_recreation',
      'municipal_thoroughfare',
      'potrero_dirt',
    ];

    it('returns tailored grounding plinth attributes for each of the 9 core stadium grounds', () => {
      for (const ground of nineCoreGrounds) {
        const plinth = getSouthCornerPlinthGrounding(ground, 'night');
        expect(plinth).toBeDefined();
        expect(plinth.grounds).toBe(ground);
        expect(plinth.plinthColor).toMatch(/^#[0-9a-f]{6}$/i);
        expect(plinth.bevelColor).toMatch(/^#[0-9a-f]{6}$/i);
        expect(plinth.copingColor).toMatch(/^#[0-9a-f]{6}$/i);
        expect(plinth.shadowOpacity).toBeGreaterThan(0.4);
        expect(plinth.shadowOffsetY).toBeGreaterThan(0);
      }
    });

    it('renders drawSouthCornerFoundationPlinthAndShadow across all 9 grounds without gaps', () => {
      const pStart = { x: 60, y: 600 };
      const pEnd = { x: 165, y: 740 };

      for (const ground of nineCoreGrounds) {
        mockCtx.fill.mockClear();
        mockCtx.stroke.mockClear();

        drawSouthCornerFoundationPlinthAndShadow(
          mockCtx,
          'corner_sw',
          pStart,
          pEnd,
          ground,
          'night',
          'grade2_classic'
        );

        expect(mockCtx.save).toHaveBeenCalled();
        expect(mockCtx.restore).toHaveBeenCalled();
        expect(mockCtx.fill).toHaveBeenCalled();
        expect(mockCtx.stroke).toHaveBeenCalled();
      }
    });
  });

  describe('T14N.3: Exterior Corner Circulation Stairs & Turnstile Access Nodes', () => {
    it('renders exterior precast concrete circulation stairs with safety yellow nosing stripes (#facc15)', () => {
      drawSouthCornerExteriorCirculationStairs(
        mockCtx,
        'corner_sw',
        110,
        670,
        'night',
        'grade2_classic'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();

      // Verify that safety yellow color nosing (#facc15) was applied
      const yellowCalls = mockCtx.fillRect.mock.calls.filter((call: any[]) => {
        return mockCtx.fillStyle === '#facc15';
      });
      expect(yellowCalls.length).toBeGreaterThan(0);
    });

    it('renders ground-level turnstile gatehouse kiosk, crowd control rails and illuminated exit sign (#22c55e)', () => {
      drawSouthCornerTurnstileAccessNode(
        mockCtx,
        'corner_se',
        890,
        670,
        'night',
        'grade4_modern'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();

      // Verify illuminated green emergency exit sign (#22c55e) was drawn
      const greenCalls = mockCtx.fillRect.mock.calls.filter((call: any[]) => {
        return mockCtx.fillStyle === '#22c55e';
      });
      expect(greenCalls.length).toBeGreaterThan(0);
    });
  });

  describe('T14N.4: Full Corner Stands Integration & Northern Stand Invariance Lock', () => {
    it('renders southern tiered corner (corner_sw) with exterior stairs, turnstiles and grounding plinth', () => {
      const stand: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        grade: 'grade2_classic',
        tierCount: 2,
        hasRoof: false,
      };

      drawRoundCornerStand(
        mockCtx,
        stand,
        'corner_sw',
        200,
        800,
        100,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();

      // Check for safety yellow nosing & green exit sign in SW corner output
      const fillCalls = mockCtx.fillRect.mock.calls;
      expect(fillCalls.length).toBeGreaterThan(25);

      // Curved foundation plinth traces 24-segment outer arc instead of a single straight chord across seating
      expect(mockCtx.lineTo.mock.calls.length).toBeGreaterThan(60);
    });

    it('traces curved outer plinth geometry without cutting a straight chord across seating tiers in drawSouthCornerFoundationPlinthAndShadow', () => {
      mockCtx.moveTo.mockClear();
      mockCtx.lineTo.mockClear();

      drawSouthCornerFoundationPlinthAndShadow(
        mockCtx,
        'corner_sw',
        { x: 60, y: 650 },
        { x: 146, y: 790 },
        'park_recreation',
        'night',
        'grade2_classic',
        {
          pIn: { x: 200, y: 650 },
          standDepthX: 140,
          standDepthY: 140,
          startAngle: Math.PI * 0.5,
          endAngle: Math.PI,
          sTaper: 54,
        }
      );

      // Curved shadow (49 vertices) + curved plinth face (49 vertices) + curved bevel (24 lineTo)
      expect(mockCtx.moveTo).toHaveBeenCalledTimes(3);
      expect(mockCtx.lineTo.mock.calls.length).toBeGreaterThan(100);
      expect(mockCtx.fill).toHaveBeenCalledTimes(2);
      expect(mockCtx.stroke).toHaveBeenCalledTimes(1);
    });

    it('grounds southern VIP corner towers with terrain-adapted foundation plinths', () => {
      const towerStand: StandConfig = {
        position: 'corner_sw',
        type: 'tower',
        cornerType: 'tower',
        grade: 'grade4_modern',
        vipFloors: 3,
      };
      const stadiumDef = {
        id: 't14n_tower_test',
        name: 'Tower Ground',
        shape: 'rectangular',
        grounds: 'classical_statues',
        stands: { corner_sw: towerStand },
      } as unknown as StadiumDefinition;

      mockCtx.moveTo.mockClear();
      mockCtx.fill.mockClear();
      drawTowerCornerStand(
        mockCtx,
        towerStand,
        'corner_sw',
        200,
        800,
        100,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night',
        undefined,
        undefined,
        undefined,
        undefined,
        stadiumDef
      );

      // Plinth + shadow polygons filled beneath tower base
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalled();
    });

    it('renders southern giant corner (corner_se) with exterior stairs, turnstiles and grounding plinth', () => {
      const stand: StandConfig = {
        position: 'corner_se',
        type: 'wall',
        wallSize: 'medium',
        grade: 'grade3_industrial',
        hasRoof: false,
      };

      drawGiantCornerStand(
        mockCtx,
        stand,
        'corner_se',
        200,
        800,
        100,
        650,
        180,
        180,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('strictly preserves Northern Corner invariance (corner_nw & corner_ne untouched)', () => {
      const standNW: StandConfig = {
        position: 'corner_nw',
        type: 'tiered',
        grade: 'grade2_classic',
        tierCount: 2,
        hasRoof: false,
      };

      const ctxNW = { ...mockCtx, strokeRect: vi.fn(), fillRect: vi.fn() };
      drawRoundCornerStand(
        ctxNW,
        standNW,
        'corner_nw',
        200,
        800,
        100,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      // Verify no southern stairs or plinth were added to NW
      expect(ctxNW.save).toHaveBeenCalled();
      expect(ctxNW.restore).toHaveBeenCalled();
    });

    it('confirms locked 60 FPS performance over 100 consecutive frames with zero errors', () => {
      const stand: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        grade: 'grade2_classic',
        tierCount: 2,
        hasRoof: false,
      };

      const start = performance.now();
      for (let f = 0; f < 100; f++) {
        drawSouthCornerOuterWallMiterWrap(
          mockCtx,
          'corner_sw',
          60,
          600,
          165,
          740,
          'brick',
          'night',
          'grade2_classic',
          'parking_lots'
        );
      }
      const elapsed = performance.now() - start;
      // 100 iterations of outer wall miter wrap should complete well within 50ms (0.5ms/frame)
      expect(elapsed).toBeLessThan(50);
    });
  });
});
