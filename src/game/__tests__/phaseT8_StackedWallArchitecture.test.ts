/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import {
  StandConfig,
  StadiumDefinition,
  isStackedWallStand,
  getStackedWallRows,
  getStackedWallLowerRows,
  getStackedWallUpperRows,
  calculateStackedWallCapacity,
  calculateStandCapacity,
  getAvailableStandTypesForShape,
  getStandChairRows,
  STACKED_WALL_SIZE_OPTIONS,
  WallTierSize,
} from '../../types/stadium';
import {
  drawSingleTouchlineStand,
  drawMiteredCornerStand,
  drawContinuousColiseumBowl,
  drawTottenhamArchedCrownAndScoreboards,
} from '../stadiumRenderer';
import { HOME_KIT, AWAY_KIT } from '../constants';

describe('Phase T8: "Stacked Wall" Modern Coliseum Architecture (Double-Decker Wall & Tottenham Crown)', () => {
  describe('T8.1: Shape Guard & Typology Resolution', () => {
    it('disallows vip_building on round and oval grounds while permitting stacked_wall', () => {
      const roundTypes = getAvailableStandTypesForShape('round').map((t) => t.id);
      expect(roundTypes).toContain('stacked_wall');
      expect(roundTypes).toContain('wall');
      expect(roundTypes).toContain('tiered');
      expect(roundTypes).toContain('none');
      expect(roundTypes).not.toContain('vip_building');

      const ovalTypes = getAvailableStandTypesForShape('oval').map((t) => t.id);
      expect(ovalTypes).toContain('stacked_wall');
      expect(ovalTypes).toContain('wall');
      expect(ovalTypes).toContain('tiered');
      expect(ovalTypes).toContain('none');
      expect(ovalTypes).not.toContain('vip_building');
    });

    it('permits all structural stand types including vip_building and stacked_wall on rectilinear grounds', () => {
      const rectTypes = getAvailableStandTypesForShape('rectangular').map((t) => t.id);
      expect(rectTypes).toContain('tiered');
      expect(rectTypes).toContain('wall');
      expect(rectTypes).toContain('stacked_wall');
      expect(rectTypes).toContain('vip_building');
      expect(rectTypes).toContain('none');

      const squareTypes = getAvailableStandTypesForShape('square').map((t) => t.id);
      expect(squareTypes).toContain('tiered');
      expect(squareTypes).toContain('wall');
      expect(squareTypes).toContain('stacked_wall');
      expect(squareTypes).toContain('vip_building');
      expect(squareTypes).toContain('none');
    });

    it('correctly identifies stacked wall stands via isStackedWallStand', () => {
      const standStacked: StandConfig = { position: 'west', type: 'stacked_wall' };
      const standTiered: StandConfig = { position: 'west', type: 'tiered' };
      const standWall: StandConfig = { position: 'west', type: 'wall_tier' as any };
      const standVip: StandConfig = { position: 'west', type: 'vip_building' };

      expect(isStackedWallStand(standStacked)).toBe(true);
      expect(isStackedWallStand(standTiered)).toBe(false);
      expect(isStackedWallStand(standWall)).toBe(false);
      expect(isStackedWallStand(standVip)).toBe(false);
    });
  });

  describe('T8.2: Double-Decker Wall Geometry & Row Calculations', () => {
    it('provides correct default row counts for small, medium, and big tiers in STACKED_WALL_SIZE_OPTIONS', () => {
      expect(STACKED_WALL_SIZE_OPTIONS).toHaveLength(3);
      expect(STACKED_WALL_SIZE_OPTIONS.map((o) => o.id)).toEqual(['small', 'medium', 'large']);

      const standDefault: StandConfig = { position: 'west', type: 'stacked_wall' };
      // Defaults to medium lower (11 rows) and medium upper (11 rows)
      expect(getStackedWallLowerRows(standDefault)).toBe(11);
      expect(getStackedWallUpperRows(standDefault)).toBe(11);

      const rows = getStackedWallRows(standDefault);
      expect(rows.lowerRows).toBe(11);
      expect(rows.upperRows).toBe(11);
      expect(rows.totalRows).toBe(22);
    });

    it('computes independent lower wall rows according to lowerWallSize', () => {
      const sizes: WallTierSize[] = ['small', 'medium', 'large'];
      const expectedRows = [6, 11, 16];

      sizes.forEach((sz, idx) => {
        const stand: StandConfig = {
          position: 'west',
          type: 'stacked_wall',
          stackedWallLowerSize: sz,
        };
        expect(getStackedWallLowerRows(stand)).toBe(expectedRows[idx]);
        expect(getStandChairRows(stand, 0)).toBe(expectedRows[idx]);
      });
    });

    it('computes independent upper wall rows according to upperWallSize', () => {
      const sizes: WallTierSize[] = ['small', 'medium', 'large'];
      const expectedRows = [6, 11, 16];

      sizes.forEach((sz, idx) => {
        const stand: StandConfig = {
          position: 'west',
          type: 'stacked_wall',
          stackedWallUpperSize: sz,
        };
        expect(getStackedWallUpperRows(stand)).toBe(expectedRows[idx]);
        expect(getStandChairRows(stand, 1)).toBe(expectedRows[idx]);
      });
    });

    it('integrates getStandChairRows correctly for tier 0 and 1 of stacked_wall', () => {
      const stand: StandConfig = {
        position: 'west',
        type: 'stacked_wall',
        stackedWallLowerSize: 'small',
        stackedWallUpperSize: 'large',
      };
      expect(getStandChairRows(stand, 0)).toBe(6);
      expect(getStandChairRows(stand, 1)).toBe(16);
      expect(getStandChairRows(stand, 2)).toBe(0);
    });
  });

  describe('T8.2: Stand Capacity Calculations & Mass Spectator Density', () => {
    it('calculates stacked wall capacity with density multipliers and mezzanine bonus', () => {
      // Base: lower medium (14,000) * 1.0 + upper medium (11,000) * 1.0 + 1,500 = 26,500
      const standDefault: StandConfig = {
        position: 'west',
        type: 'stacked_wall',
        stackedWallLowerSize: 'medium',
        stackedWallUpperSize: 'medium',
        stackedWallLowerDensity: 'normal',
        stackedWallUpperDensity: 'normal',
      };
      expect(calculateStackedWallCapacity(standDefault)).toBe(26500);

      // Max Capacity: lower large (18,000 * 1.25 = 22,500) + upper large (15,000 * 1.25 = 18,750) + 1,500 = 42,750
      const standMax: StandConfig = {
        position: 'west',
        type: 'stacked_wall',
        stackedWallLowerSize: 'large',
        stackedWallUpperSize: 'large',
        stackedWallLowerDensity: 'high_density',
        stackedWallUpperDensity: 'high_density',
      };
      expect(calculateStackedWallCapacity(standMax)).toBe(42750);

      // Reduced Capacity: lower small (10,000 * 0.85 = 8,500) + upper small (8,000 * 0.85 = 6,800) + 1,500 = 16,800
      const standMin: StandConfig = {
        position: 'west',
        type: 'stacked_wall',
        stackedWallLowerSize: 'small',
        stackedWallUpperSize: 'small',
        stackedWallLowerDensity: 'reduced',
        stackedWallUpperDensity: 'reduced',
      };
      expect(calculateStackedWallCapacity(standMin)).toBe(16800);
    });

    it('integrates calculateStandCapacity with position multipliers for stacked_wall', () => {
      const standWest: StandConfig = {
        position: 'west',
        type: 'stacked_wall',
        stackedWallLowerSize: 'medium',
        stackedWallUpperSize: 'medium',
      };
      // West multiplier 1.0
      expect(calculateStandCapacity(standWest, 'rectangular', 'west')).toBe(26500);

      const standNorth: StandConfig = {
        position: 'north',
        type: 'stacked_wall',
        stackedWallLowerSize: 'medium',
        stackedWallUpperSize: 'medium',
      };
      // North multiplier 0.85: Math.round(26500 * 0.85) = 22525
      expect(calculateStandCapacity(standNorth, 'rectangular', 'north')).toBe(22525);
    });
  });

  describe('T8.3: Procedural Rendering & Tottenham Arched Crown', () => {
    function createMockCtx(): CanvasRenderingContext2D {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        quadraticCurveTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 50 })),
        createLinearGradient: vi.fn(() => ({
          addColorStop: vi.fn(),
        })),
        createRadialGradient: vi.fn(() => ({
          addColorStop: vi.fn(),
        })),
        clip: vi.fn(),
        rect: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: 'left',
        textBaseline: 'top',
        shadowColor: '',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D;
    }

    it('draws single touchline stand with stacked_wall double-decker tiers and mezzanine balcony without throwing', () => {
      const ctx = createMockCtx();
      const stand: StandConfig = {
        position: 'west',
        type: 'stacked_wall',
        stackedWallLowerSize: 'medium',
        stackedWallUpperSize: 'large',
        stackedWallLowerDensity: 'high_density',
        stackedWallUpperDensity: 'normal',
      };

      expect(() => {
        drawSingleTouchlineStand(
          ctx,
          stand,
          100,
          200,
          800,
          300,
          'west',
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'sunset'
        );
      }).not.toThrow();
    });

    it('draws mitered corner stand with stacked_wall without throwing', () => {
      const ctx = createMockCtx();
      const stand: StandConfig = {
        position: 'corner_nw',
        type: 'stacked_wall',
        stackedWallLowerSize: 'small',
        stackedWallUpperSize: 'medium',
      };

      expect(() => {
        drawMiteredCornerStand(
          ctx,
          stand,
          'corner_nw',
          50,
          200,
          50,
          200,
          150,
          150,
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'noon'
        );
      }).not.toThrow();
    });

    it('draws continuous coliseum bowl with stacked_wall configuration without throwing', () => {
      const ctx = createMockCtx();
      const bowlStand: StandConfig = {
        position: 'west',
        type: 'stacked_wall',
        stackedWallLowerSize: 'large',
        stackedWallUpperSize: 'large',
        stackedWallArchedCrown: true,
      };

      const stadiumDef = {
        id: 'test_stacked_wall_bowl',
        name: 'Metropolitano Coliseum',
        shortName: 'Metropolitano',
        city: 'Madrid',
        capacity: 70000,
        tier: 'monumental',
        shape: 'round',
        stands: {
          west: bowlStand,
          east: bowlStand,
          north: bowlStand,
          south: bowlStand,
          corner_ne: bowlStand,
          corner_nw: bowlStand,
          corner_se: bowlStand,
          corner_sw: bowlStand,
        },
      } as unknown as StadiumDefinition;

      expect(() => {
        drawContinuousColiseumBowl(
          ctx,
          stadiumDef,
          'monumental',
          'night',
          HOME_KIT,
          AWAY_KIT,
          'round'
        );
      }).not.toThrow();
    });

    it('renders Tottenham Arched Crown and LED jumbotron scoreboards without throwing', () => {
      const ctx = createMockCtx();
      expect(() => {
        drawTottenhamArchedCrownAndScoreboards(
          ctx,
          100,
          50,
          600,
          'north',
          'night',
          '#1e3a8a',
          '#00e5ff'
        );
      }).not.toThrow();

      // Verify path creation for arched crown, clerestory windows, and scoreboards
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });
});
