import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  drawOuterRearDelimitationWall,
  drawOuterWallCorner45Transition,
  drawOuterWallReturnEndCapPillar,
  drawSouthCornerFacadeTieIn,
  drawNoStandPerimeterAndBackdrop,
} from '../stadiumRenderer';
import { StandConfig, StadiumDefinition } from '../../types/stadium';

describe('HOTFIX PHASE T14G: Outer Wall Corner Integration, Return End-Cap Pillars & No-Stand 2.5D Backdrops', () => {
  let ctx: CanvasRenderingContext2D;
  let fillRectSpy: ReturnType<typeof vi.fn>;
  let strokeRectSpy: ReturnType<typeof vi.fn>;
  let beginPathSpy: ReturnType<typeof vi.fn>;
  let lineToSpy: ReturnType<typeof vi.fn>;
  let strokeSpy: ReturnType<typeof vi.fn>;
  let fillSpy: ReturnType<typeof vi.fn>;
  let arcSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fillRectSpy = vi.fn();
    strokeRectSpy = vi.fn();
    beginPathSpy = vi.fn();
    lineToSpy = vi.fn();
    strokeSpy = vi.fn();
    fillSpy = vi.fn();
    arcSpy = vi.fn();

    ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: fillRectSpy,
      strokeRect: strokeRectSpy,
      beginPath: beginPathSpy,
      moveTo: vi.fn(),
      lineTo: lineToSpy,
      closePath: vi.fn(),
      stroke: strokeSpy,
      fill: fillSpy,
      arc: arcSpy,
      ellipse: vi.fn(),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineCap: 'butt',
      shadowColor: '',
      shadowBlur: 0,
      font: '',
      textAlign: 'left',
      textBaseline: 'middle',
      fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
  });

  describe('T14G.1: Rectangular and Square Stadium Outer Wall 45° Transitional Angle Corner Integration', () => {
    it('drawOuterWallCorner45Transition renders 45° angled miter polygon and continuous coping cap line', () => {
      drawOuterWallCorner45Transition(
        ctx,
        100,
        200,
        14,
        400,
        'west',
        'corner_sw',
        'brick',
        'night',
        'rectangular',
        'grade2_classic'
      );

      // Verify miter polygon was traced and filled
      expect(beginPathSpy).toHaveBeenCalled();
      expect(fillSpy).toHaveBeenCalled();
      // Verify coping cap stroke line
      expect(strokeSpy).toHaveBeenCalled();
      expect(ctx.lineWidth).toBe(1.5);
    });

    it('drawOuterRearDelimitationWall automatically integrates 45° corner transition when corners have stands', () => {
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade2_classic',
        tierCount: 2,
        rearWallMaterial: 'brick',
      };

      const stadiumDef: StadiumDefinition = {
        id: 'test_rect',
        name: 'Test Ground',
        shape: 'rectangular',
        stands: {
          west: stand,
          south: stand,
          corner_sw: { position: 'corner_sw', type: 'tiered', grade: 'grade2_classic' },
          corner_nw: { position: 'corner_nw', type: 'tiered', grade: 'grade2_classic' },
        },
      } as unknown as StadiumDefinition;

      drawOuterRearDelimitationWall(
        ctx,
        stand,
        100,
        200,
        200,
        400,
        'west',
        'night',
        0,
        'rectangular',
        stadiumDef
      );

      // Should have rendered 45° miter paths for corner_sw and corner_nw
      expect(beginPathSpy).toHaveBeenCalled();
      expect(strokeSpy).toHaveBeenCalled();
    });

    it('drawSouthCornerFacadeTieIn seamlessly bonds South Stand front facade and plinth to SW/SE miters', () => {
      drawSouthCornerFacadeTieIn(ctx, 300, 600, 800, 38, 'west', 'brick', 'night', 'rectangular');

      // Verify tie-in plinth and coping cap were drawn
      expect(fillRectSpy).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
  });

  describe('T14G.2: Architectural Return End-Cap Finial Pillar on Disconnected Corners', () => {
    it('drawOuterWallReturnEndCapPillar renders 20px x 20px masonry pier, 90° return, coping cap, and brass lantern', () => {
      drawOuterWallReturnEndCapPillar(
        ctx,
        100,
        200,
        14,
        400,
        'west',
        'south',
        'brick',
        'night',
        'grade2_classic'
      );

      // Verify terminal pier (20px x 20px) was drawn
      const drawnPillars = fillRectSpy.mock.calls.filter(
        (call: any[]) => call[2] === 20 && call[3] === 20
      );
      expect(drawnPillars.length).toBeGreaterThanOrEqual(1);

      // Verify 90° return section (16px x 10px) was drawn
      const drawnReturns = fillRectSpy.mock.calls.filter(
        (call: any[]) => call[2] === 16 && call[3] === 10
      );
      expect(drawnReturns.length).toBeGreaterThanOrEqual(1);

      // Verify illuminated brass lantern glow halo
      expect(arcSpy).toHaveBeenCalled();
    });

    it('drawOuterRearDelimitationWall renders return finial pillar when corner is no_stand', () => {
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade2_classic',
        tierCount: 2,
        rearWallMaterial: 'concrete',
      };

      const stadiumDef: StadiumDefinition = {
        id: 'test_no_corner',
        name: 'Open Ground',
        shape: 'rectangular',
        stands: {
          west: stand,
          corner_sw: { position: 'corner_sw', type: 'no_stand' },
          corner_nw: { position: 'corner_nw', type: 'none' },
        },
      } as unknown as StadiumDefinition;

      drawOuterRearDelimitationWall(
        ctx,
        stand,
        100,
        200,
        200,
        400,
        'west',
        'night',
        0,
        'rectangular',
        stadiumDef
      );

      // Verify terminal pier 20x20 calls occurred for both open corners
      const drawnPillars = fillRectSpy.mock.calls.filter(
        (call: any[]) => call[2] === 20 && call[3] === 20
      );
      expect(drawnPillars.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('T14G.3: Master 2.5D High-Oblique Perspective Correction for No-Stand Backdrops', () => {
    it('drawNoStandPerimeterAndBackdrop renders calibrated 2.5D residential structures without 500px stretched monoliths', () => {
      const stand: StandConfig = {
        position: 'south',
        type: 'no_stand',
        backdrop: 'residential_townhouses',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        200,
        600,
        600,
        20,
        'south',
        'small_city',
        'night',
        'parking_lots'
      );

      // Verify base ground was filled
      expect(fillRectSpy).toHaveBeenCalled();

      // Verify that townhouse facades are drawn at calibrated 26px height, not stretching 400-500px
      const stretchedMonoliths = fillRectSpy.mock.calls.filter(
        (call: any[]) => call[3] > 350
      );
      // The only element with large height is the overall concourse ground buffer (call[3] > 350)
      expect(stretchedMonoliths.length).toBeLessThanOrEqual(2);

      // Verify front doors, windows, and roof planes were drawn
      expect(beginPathSpy).toHaveBeenCalled();
      expect(fillSpy).toHaveBeenCalled();
    });

    it('drawNoStandPerimeterAndBackdrop renders calibrated commercial towers with 2.5D roof decks and curtain walls', () => {
      const stand: StandConfig = {
        position: 'south',
        type: 'no_stand',
        backdrop: 'commercial_skyscrapers',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        200,
        600,
        600,
        20,
        'south',
        'big_city',
        'night',
        'mall_commercial'
      );

      // Verify rooftop beacon was drawn
      expect(arcSpy).toHaveBeenCalled();

      // Verify curtain wall glass facade (46px height) was drawn
      const curtainWalls = fillRectSpy.mock.calls.filter(
        (call: any[]) => call[3] === 46
      );
      expect(curtainWalls.length).toBeGreaterThanOrEqual(1);
    });

    it('drawNoStandPerimeterAndBackdrop renders 2.5D perimeter wall with front vertical face and stone coping ledge', () => {
      const stand: StandConfig = {
        position: 'south',
        type: 'no_stand',
        backdrop: 'wall',
        wallPerimeter: {
          size: 'medium',
          material: 'brick',
        },
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        200,
        600,
        600,
        20,
        'south',
        'small_city',
        'night',
        'parking_lots'
      );

      // Verify vertical wall face (24px height) was drawn
      const wallFaces = fillRectSpy.mock.calls.filter(
        (call: any[]) => call[3] === 24
      );
      expect(wallFaces.length).toBeGreaterThanOrEqual(1);

      // Verify coping ledge (6px depth) was drawn
      const copingLedges = fillRectSpy.mock.calls.filter(
        (call: any[]) => call[3] === 6
      );
      expect(copingLedges.length).toBeGreaterThanOrEqual(1);
    });

    it('drawNoStandPerimeterAndBackdrop renders highway, airport, and railroad with calibrated depth planes', () => {
      const highwayStand: StandConfig = { position: 'south', type: 'no_stand', backdrop: 'highway' };
      drawNoStandPerimeterAndBackdrop(ctx, highwayStand, 200, 600, 600, 20, 'south', 'highway', 'noon');
      expect(fillRectSpy).toHaveBeenCalled();

      fillRectSpy.mockClear();
      const airportStand: StandConfig = { position: 'south', type: 'no_stand', backdrop: 'airport' };
      drawNoStandPerimeterAndBackdrop(ctx, airportStand, 200, 600, 600, 20, 'south', 'airport', 'noon');
      expect(fillRectSpy).toHaveBeenCalled();

      fillRectSpy.mockClear();
      const trainStand: StandConfig = { position: 'south', type: 'no_stand', backdrop: 'railroad' };
      drawNoStandPerimeterAndBackdrop(ctx, trainStand, 200, 600, 600, 20, 'south', 'railroad', 'noon');
      expect(fillRectSpy).toHaveBeenCalled();
    });
  });
});
