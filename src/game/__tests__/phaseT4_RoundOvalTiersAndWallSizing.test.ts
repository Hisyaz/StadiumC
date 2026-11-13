import { describe, it, expect } from 'vitest';
import {
  calculateDynamicStandDepth,
  getWallTierChairRows,
  StandConfig,
  StadiumDefinition,
} from '../../types/stadium';
import { TeamKit } from '../../types';
import {
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
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
  } as unknown as CanvasRenderingContext2D;

  return { ctx, operations };
}

describe('Phase T4: Round/Oval Multi-Tier Stacking, Wall Stand Sizing Scaling & Step 2 Polish', () => {
  describe('T4.2: Wall Stand Physical Depth Sizing Calibration', () => {
    it('calibrates Wall stand physical depths to match 1-tier, 2-tier, and 4-tier footprints', () => {
      const wallSmall: StandConfig = { position: 'west', type: 'wall', wallSize: 'small' };
      const wallMedium: StandConfig = { position: 'west', type: 'wall', wallSize: 'medium' };
      const wallLarge: StandConfig = { position: 'west', type: 'wall', wallSize: 'large' };

      // Small = 90px (comparable to 1-tier base depth ~82px, 75-90px)
      expect(calculateDynamicStandDepth(wallSmall)).toBe(90);

      // Medium = 150px (comparable to 2-tier base depth ~145px, 135-155px)
      expect(calculateDynamicStandDepth(wallMedium)).toBe(150);

      // Big/Large = 250px (comparable to 4-tier base depth ~268px, 250-285px)
      expect(calculateDynamicStandDepth(wallLarge)).toBe(250);

      // Default when wallSize is omitted defaults to medium (150px)
      const wallDef: StandConfig = { position: 'south', type: 'wall' };
      expect(calculateDynamicStandDepth(wallDef)).toBe(150);
    });

    it('packs dense standing terrace rows into calibrated physical depths', () => {
      // Small footprint (90px) packs 5-7 steep terrace rows
      expect(getWallTierChairRows('small', 'reduced')).toBe(5);
      expect(getWallTierChairRows('small', 'normal')).toBe(6);
      expect(getWallTierChairRows('small', 'high_density')).toBe(7);

      // Medium footprint (150px) packs 10-13 steep terrace rows
      expect(getWallTierChairRows('medium', 'reduced')).toBe(10);
      expect(getWallTierChairRows('medium', 'normal')).toBe(11);
      expect(getWallTierChairRows('medium', 'high_density')).toBe(13);

      // Big/Large footprint (250px) packs 15-20 massive continuous terrace rows
      expect(getWallTierChairRows('large', 'reduced')).toBe(15);
      expect(getWallTierChairRows('large', 'normal')).toBe(16);
      expect(getWallTierChairRows('large', 'high_density')).toBe(20);
    });

    it('differentiates 1-tier vs 4-tier grandstand depths and matches wall large sizing', () => {
      const stand1Tier: StandConfig = { position: 'north', type: 'tiered', tierCount: 1 };
      const stand2Tier: StandConfig = { position: 'north', type: 'tiered', tierCount: 2 };
      const stand3Tier: StandConfig = { position: 'north', type: 'tiered', tierCount: 3 };
      const stand4Tier: StandConfig = { position: 'north', type: 'tiered', tierCount: 4 };

      const depth1 = calculateDynamicStandDepth(stand1Tier);
      const depth2 = calculateDynamicStandDepth(stand2Tier);
      const depth3 = calculateDynamicStandDepth(stand3Tier);
      const depth4 = calculateDynamicStandDepth(stand4Tier);

      expect(depth1).toBe(82);
      expect(depth2).toBe(145);
      expect(depth3).toBe(205);
      expect(depth4).toBe(268);

      const wallLarge: StandConfig = { position: 'north', type: 'wall', wallSize: 'large' };
      const depthWallLarge = calculateDynamicStandDepth(wallLarge);
      expect(depthWallLarge).toBe(250);
      expect(Math.abs(depthWallLarge - depth4)).toBeLessThanOrEqual(20);
    });
  });

  describe('T4.1 & T4.3: Round Stadium Multi-Tier Concentric Stacking & Sector Independence', () => {
    it('executes 1, 2, 3, and 4 tier round coliseum bowl rendering without errors', () => {
      for (const tierNum of [1, 2, 3, 4] as const) {
        const { ctx, operations } = createMockCanvasContext();
        const roundDef = {
          id: `round_tier_${tierNum}`,
          name: `Round Tier ${tierNum} Stadium`,
          tier: 'monumental',
          shape: 'round',
          capacity: 50000,
          stands: {
            west: { position: 'west', type: 'tiered', tierCount: tierNum },
            east: { position: 'east', type: 'tiered', tierCount: tierNum },
            north: { position: 'north', type: 'tiered', tierCount: tierNum },
            south: { position: 'south', type: 'tiered', tierCount: tierNum },
          },
        } as unknown as StadiumDefinition;

        drawContinuousColiseumBowl(ctx, roundDef, 'monumental', 'night', HOME_KIT, AWAY_KIT, 'round');
        expect(operations.length).toBeGreaterThan(100);
      }
    });

    it('renders per-sector independent architecture on round coliseum bowl', () => {
      const { ctx, operations } = createMockCanvasContext();
      const mixedRoundDef = {
        id: 'mixed_round',
        name: 'Mixed Round Coliseum',
        tier: 'monumental',
        shape: 'round',
        capacity: 65000,
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 4 },
          east: { position: 'east', type: 'tiered', tierCount: 2 },
          north: { position: 'north', type: 'wall', wallSize: 'large' },
          south: { position: 'south', type: 'no_stand' },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(ctx, mixedRoundDef, 'monumental', 'night', HOME_KIT, AWAY_KIT, 'round');
      expect(operations.length).toBeGreaterThan(100);
      // Contains both arc and path operations for wall, tiered, and open boundaries
      expect(operations.some((op) => op.includes('arc'))).toBe(true);
      expect(operations.some((op) => op.includes('fill'))).toBe(true);
    });

    it('scales dynamic bowl depth correctly for multi-tier round stadiums', () => {
      const round4TierDef = {
        id: 'round_4tier',
        name: 'Round 4-Tier Arena',
        shape: 'round',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 4 },
          east: { position: 'east', type: 'tiered', tierCount: 4 },
          north: { position: 'north', type: 'tiered', tierCount: 4 },
          south: { position: 'south', type: 'tiered', tierCount: 4 },
        },
      } as unknown as StadiumDefinition;

      const metrics = getStadiumShapeMetrics(round4TierDef, 'standard', false);
      expect(metrics.standDepthX).toBe(268);
      expect(metrics.standDepthY).toBe(268);
    });
  });

  describe('T4.1 & T4.3: Oval Stadium Multi-Tier Concentric Stacking & Sector Independence', () => {
    it('executes 1, 2, 3, and 4 tier oval stadium rendering without errors', () => {
      for (const tierNum of [1, 2, 3, 4] as const) {
        const { ctx, operations } = createMockCanvasContext();
        const ovalDef = {
          id: `oval_tier_${tierNum}`,
          name: `Oval Tier ${tierNum} Stadium`,
          tier: 'monumental',
          shape: 'oval',
          capacity: 60000,
          stands: {
            west: { position: 'west', type: 'tiered', tierCount: tierNum },
            east: { position: 'east', type: 'tiered', tierCount: tierNum },
            north: { position: 'north', type: 'tiered', tierCount: tierNum },
            south: { position: 'south', type: 'tiered', tierCount: tierNum },
          },
        } as unknown as StadiumDefinition;

        drawContinuousColiseumBowl(ctx, ovalDef, 'monumental', 'night', HOME_KIT, AWAY_KIT, 'oval');
        expect(operations.length).toBeGreaterThan(100);
      }
    });

    it('renders independent sectors on oval stadium with Wall stands on flanks', () => {
      const { ctx, operations } = createMockCanvasContext();
      const mixedOvalDef = {
        id: 'mixed_oval',
        name: 'Mixed Oval Arena',
        tier: 'monumental',
        shape: 'oval',
        capacity: 75000,
        stands: {
          west: { position: 'west', type: 'wall', wallSize: 'large' },
          east: { position: 'east', type: 'wall', wallSize: 'small' },
          north: { position: 'north', type: 'tiered', tierCount: 3 },
          south: { position: 'south', type: 'tiered', tierCount: 1 },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(ctx, mixedOvalDef, 'monumental', 'sunset', HOME_KIT, AWAY_KIT, 'oval');
      expect(operations.length).toBeGreaterThan(150);
      expect(operations.some((op) => op.includes('fillRect'))).toBe(true);
      expect(operations.some((op) => op.includes('arc'))).toBe(true);
    });

    it('scales dynamic bowl depth correctly for multi-tier oval stadiums', () => {
      const ovalMixedDef = {
        id: 'oval_mixed',
        name: 'Oval Mixed Arena',
        shape: 'oval',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 3 }, // 205px
          east: { position: 'east', type: 'wall', wallSize: 'large' }, // 250px
          north: { position: 'north', type: 'tiered', tierCount: 1 }, // 82px
          south: { position: 'south', type: 'tiered', tierCount: 2 }, // 145px
        },
      } as unknown as StadiumDefinition;

      const metrics = getStadiumShapeMetrics(ovalMixedDef, 'standard', false);
      expect(metrics.standDepthX).toBe(250);
      expect(metrics.standDepthY).toBe(145);
    });
  });
});
