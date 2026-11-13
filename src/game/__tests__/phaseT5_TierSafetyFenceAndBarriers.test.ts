import { describe, it, expect } from 'vitest';
import {
  PitchsideBarrierType,
  PITCHSIDE_BARRIER_OPTIONS,
  resolvePitchsideBarrier,
  StandConfig,
  StadiumDefinition,
} from '../../types/stadium';
import {
  drawPitchsideSafetyBarrier,
  drawCurvedPitchsideSafetyBarrier,
  drawDiagonalPitchsideSafetyBarrier,
  drawSingleTouchlineStand,
  drawGoalEndStand,
  drawContinuousColiseumBowl,
  getStadiumShapeMetrics,
} from '../stadiumRenderer';
import { HOME_KIT, AWAY_KIT } from '../constants';

function createMockCanvasContext() {
  const operations: string[] = [];
  const ctx = {
    save: () => operations.push('save'),
    restore: () => operations.push('restore'),
    beginPath: () => operations.push('beginPath'),
    closePath: () => operations.push('closePath'),
    moveTo: (x: number, y: number) => operations.push(`moveTo(${Math.round(x)},${Math.round(y)})`),
    lineTo: (x: number, y: number) => operations.push(`lineTo(${Math.round(x)},${Math.round(y)})`),
    arc: (x: number, y: number, r: number, sa: number, ea: number, cc?: boolean) =>
      operations.push(`arc(${Math.round(x)},${Math.round(y)},${Math.round(r)})`),
    stroke: () => operations.push('stroke'),
    fill: () => operations.push('fill'),
    clip: () => operations.push('clip'),
    fillRect: (x: number, y: number, w: number, h: number) =>
      operations.push(`fillRect(${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)})`),
    strokeRect: (x: number, y: number, w: number, h: number) =>
      operations.push(`strokeRect(${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)})`),
    clearRect: () => operations.push('clearRect'),
    setLineDash: () => {},
    createPattern: () => null,
    fillText: () => {},
    measureText: () => ({ width: 10 }),
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
  } as unknown as CanvasRenderingContext2D;

  return { ctx, operations };
}

describe('Phase T5: Pitchside Tier Safety Fence & Pitch Barrier Architecture (7 Authentic Typologies)', () => {
  describe('T5.1: Architectural Typology Definitions & Options', () => {
    it('defines exactly 7 authentic pitchside barrier typologies with complete metadata', () => {
      expect(PITCHSIDE_BARRIER_OPTIONS).toHaveLength(7);

      const expectedIds: PitchsideBarrierType[] = [
        'red_brick',
        'steel_chain',
        'high_steel_chain',
        'anti_barristas',
        'heavy_timber',
        'functional_concrete',
        'led_ribbon',
      ];

      const actualIds = PITCHSIDE_BARRIER_OPTIONS.map((o) => o.id);
      expect(actualIds).toEqual(expectedIds);

      PITCHSIDE_BARRIER_OPTIONS.forEach((opt) => {
        expect(opt.id).toBeTruthy();
        expect(opt.label).toBeTruthy();
        expect(opt.desc).toBeTruthy();
        expect(opt.icon).toBeTruthy();
        expect(['low', 'standard', 'tall', 'overhanging']).toContain(opt.heightCategory);
        expect(opt.shortLabel).toBeTruthy();
      });
    });
  });

  describe('T5.2: Multi-Tier Hierarchy Resolution & Inheritance (resolvePitchsideBarrier)', () => {
    it('prioritizes stand-level explicit pitchsideBarrier override over everything', () => {
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade2_classic',
        pitchsideBarrier: 'led_ribbon',
      };
      const stadium = {
        id: 'test_stad',
        name: 'Test Arena',
        shape: 'rectangular',
        pitchsideBarrier: 'red_brick',
      } as unknown as StadiumDefinition;

      expect(resolvePitchsideBarrier(stand, stadium)).toBe('led_ribbon');
    });

    it('falls back to stadium-level explicit pitchsideBarrier if stand has none', () => {
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade1_municipal',
      };
      const stadium = {
        id: 'test_stad',
        name: 'Test Arena',
        shape: 'rectangular',
        pitchsideBarrier: 'anti_barristas',
      } as unknown as StadiumDefinition;

      expect(resolvePitchsideBarrier(stand, stadium)).toBe('anti_barristas');
    });

    it('faithfully converts legacy stand.barrier settings', () => {
      expect(resolvePitchsideBarrier({ position: 'west', type: 'tiered', barrier: 'brick' as any })).toBe('red_brick');
      expect(resolvePitchsideBarrier({ position: 'west', type: 'tiered', barrier: 'wood' as any })).toBe('heavy_timber');
      expect(resolvePitchsideBarrier({ position: 'west', type: 'tiered', barrier: 'cement' as any })).toBe('functional_concrete');
      expect(resolvePitchsideBarrier({ position: 'west', type: 'tiered', barrier: 'chain_link' as any })).toBe('steel_chain');
    });

    it('intelligently infers typologies from stand architectural grades', () => {
      expect(resolvePitchsideBarrier({ position: 'west', type: 'tiered', grade: 'grade5_futuristic' })).toBe('led_ribbon');
      expect(resolvePitchsideBarrier({ position: 'west', type: 'tiered', grade: 'grade4_modern' })).toBe('led_ribbon');
      expect(resolvePitchsideBarrier({ position: 'west', type: 'tiered', grade: 'grade2_classic' })).toBe('red_brick');
      expect(resolvePitchsideBarrier({ position: 'west', type: 'tiered', grade: 'grade1_municipal' })).toBe('heavy_timber');
      expect(resolvePitchsideBarrier({ position: 'west', type: 'tiered', grade: 'grade3_industrial' })).toBe('steel_chain');
      expect(resolvePitchsideBarrier(undefined)).toBe('steel_chain');
    });
  });

  describe('T5.3: Straight Touchline & Goal-End Barrier Procedural Rendering', () => {
    const allBarriers: PitchsideBarrierType[] = [
      'red_brick',
      'steel_chain',
      'high_steel_chain',
      'anti_barristas',
      'heavy_timber',
      'functional_concrete',
      'led_ribbon',
    ];

    allBarriers.forEach((barrierType) => {
      it(`renders straight barrier for ${barrierType} along West touchline without error`, () => {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'west', type: 'tiered', pitchsideBarrier: barrierType };
        drawPitchsideSafetyBarrier(ctx, stand, 400, 200, 8, 800, 'west', 'noon', HOME_KIT, AWAY_KIT);
        expect(operations.length).toBeGreaterThan(0);
        expect(operations).toContain('save');
        expect(operations).toContain('restore');
      });

      it(`renders straight barrier for ${barrierType} along East touchline without error`, () => {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'east', type: 'tiered', pitchsideBarrier: barrierType };
        drawPitchsideSafetyBarrier(ctx, stand, 1600, 200, 8, 800, 'east', 'night', HOME_KIT, AWAY_KIT);
        expect(operations.length).toBeGreaterThan(0);
        expect(operations).toContain('save');
        expect(operations).toContain('restore');
      });

      it(`renders straight barrier for ${barrierType} along North goal end without error`, () => {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'north', type: 'tiered', pitchsideBarrier: barrierType };
        drawPitchsideSafetyBarrier(ctx, stand, 400, 150, 1200, 8, 'north', 'sunset', HOME_KIT, AWAY_KIT);
        expect(operations.length).toBeGreaterThan(0);
        expect(operations).toContain('save');
        expect(operations).toContain('restore');
      });

      it(`renders straight barrier for ${barrierType} along South goal end without error`, () => {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'south', type: 'tiered', pitchsideBarrier: barrierType };
        drawPitchsideSafetyBarrier(ctx, stand, 400, 1050, 1200, 8, 'south', 'dawn', HOME_KIT, AWAY_KIT);
        expect(operations.length).toBeGreaterThan(0);
        expect(operations).toContain('save');
        expect(operations).toContain('restore');
      });
    });
  });

  describe('T5.4: Concentric Radial Arcs & Coliseum Bowls (drawCurvedPitchsideSafetyBarrier)', () => {
    const allBarriers: PitchsideBarrierType[] = [
      'red_brick',
      'steel_chain',
      'high_steel_chain',
      'anti_barristas',
      'heavy_timber',
      'functional_concrete',
      'led_ribbon',
    ];

    allBarriers.forEach((barrierType) => {
      it(`renders curved barrier for ${barrierType} along round bowl quadrant`, () => {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'west', type: 'tiered', pitchsideBarrier: barrierType };
        drawCurvedPitchsideSafetyBarrier(
          ctx,
          stand,
          1000,
          600,
          450,
          Math.PI * 0.75,
          Math.PI * 1.25,
          'bowl',
          'noon',
          HOME_KIT,
          AWAY_KIT,
          undefined,
          1.0
        );
        expect(operations.length).toBeGreaterThan(0);
        expect(operations).toContain('save');
        expect(operations).toContain('restore');
      });

      it(`renders curved barrier for ${barrierType} with elliptical eccentricity for oval racetracks`, () => {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'north', type: 'tiered', pitchsideBarrier: barrierType };
        drawCurvedPitchsideSafetyBarrier(
          ctx,
          stand,
          1000,
          600,
          450,
          0,
          Math.PI,
          'bowl',
          'night',
          HOME_KIT,
          AWAY_KIT,
          undefined,
          0.85
        );
        expect(operations.length).toBeGreaterThan(0);
        expect(operations).toContain('save');
        expect(operations).toContain('restore');
      });
    });
  });

  describe('T5.5: 45° Diagonal Mitered Corners (drawDiagonalPitchsideSafetyBarrier)', () => {
    const corners: ('corner_nw' | 'corner_ne' | 'corner_sw' | 'corner_se')[] = [
      'corner_nw',
      'corner_ne',
      'corner_sw',
      'corner_se',
    ];

    corners.forEach((corner) => {
      it(`renders diagonal barrier for ${corner} in miter corner stand`, () => {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: corner, type: 'tiered', pitchsideBarrier: 'functional_concrete' };
        drawDiagonalPitchsideSafetyBarrier(
          ctx,
          stand,
          { x: 300, y: 200 },
          { x: 450, y: 350 },
          corner,
          'noon',
          HOME_KIT,
          AWAY_KIT
        );
        expect(operations.length).toBeGreaterThan(0);
        expect(operations).toContain('save');
        expect(operations).toContain('restore');
      });
    });
  });

  describe('T5.6: Full Coliseum Bowl Integration (drawContinuousColiseumBowl)', () => {
    it('seamlessly integrates Phase T5 barriers into round coliseum bowl rendering without regressions', () => {
      const stadium = {
        id: 'coliseum_test',
        name: 'The Great Round Amphitheatre',
        shape: 'round',
        pitchsideBarrier: 'anti_barristas',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 3, pitchsideBarrier: 'anti_barristas' },
          east: { position: 'east', type: 'tiered', tierCount: 3, pitchsideBarrier: 'led_ribbon' },
          north: { position: 'north', type: 'tiered', tierCount: 3, pitchsideBarrier: 'red_brick' },
          south: { position: 'south', type: 'wall', wallSize: 'large', pitchsideBarrier: 'high_steel_chain' },
        },
      } as unknown as StadiumDefinition;

      const metrics = getStadiumShapeMetrics('round');
      const { ctx, operations } = createMockCanvasContext();

      drawContinuousColiseumBowl(
        ctx,
        stadium,
        'monumental',
        'night',
        HOME_KIT,
        AWAY_KIT,
        'round',
        metrics
      );

      expect(operations.length).toBeGreaterThan(100);
      expect(operations).toContain('save');
      expect(operations).toContain('restore');
    });
  });

  describe('T5.7: Full Straight Touchline & Goal End Stand Integration', () => {
    it('integrates pitchside safety barrier into lowest tier of touchline stand', () => {
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 2,
        pitchsideBarrier: 'led_ribbon',
      };
      const stadium = {
        id: 'touchline_test',
        name: 'Touchline Arena',
        shape: 'rectangular',
        pitchsideBarrier: 'led_ribbon',
      } as unknown as StadiumDefinition;

      const { ctx, operations } = createMockCanvasContext();

      drawSingleTouchlineStand(
        ctx,
        stand,
        200,
        150,
        250,
        900,
        'west',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'big_city',
        undefined,
        undefined,
        undefined,
        stadium
      );

      expect(operations.length).toBeGreaterThan(50);
      expect(operations).toContain('save');
      expect(operations).toContain('restore');
    });

    it('integrates pitchside safety barrier into goal end stand', () => {
      const stand: StandConfig = {
        position: 'north',
        type: 'tiered',
        tierCount: 2,
        pitchsideBarrier: 'heavy_timber',
      };
      const stadium = {
        id: 'goalend_test',
        name: 'Goal End Ground',
        shape: 'rectangular',
        pitchsideBarrier: 'heavy_timber',
      } as unknown as StadiumDefinition;

      const { ctx, operations } = createMockCanvasContext();

      drawGoalEndStand(
        ctx,
        stand,
        400,
        100,
        1200,
        220,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'sunset',
        'big_city',
        undefined,
        undefined,
        undefined,
        stadium
      );

      expect(operations.length).toBeGreaterThan(50);
      expect(operations).toContain('save');
      expect(operations).toContain('restore');
    });
  });
});
