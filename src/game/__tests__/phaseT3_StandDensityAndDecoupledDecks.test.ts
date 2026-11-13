/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  StandConfig,
  StandDensity,
  TierSize,
  WallTierSize,
  getTierChairRows,
  resolveTierChairRows,
  getWallTierChairRows,
  getDensityCapacityFactor,
  getStandChairRows,
  calculateStandCapacity,
  calculateStadiumTotalCapacity,
  STAND_DENSITY_OPTIONS,
  StadiumDefinition,
} from '../../types/stadium';
import {
  drawSingleTouchlineStand,
  drawGoalEndStand,
  drawMiteredCornerStand,
  drawContinuousColiseumBowl,
} from '../stadiumRenderer';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from '../constants';
import { getAllRegisteredStadiums } from '../stadiumRegistry';

describe('PHASE T3: Stand Density System & Decoupled Deck Sizing', () => {
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      clip: () => {},
      setLineDash: () => {},
      measureText: () => ({ width: 40 }),
      fillText: () => {},
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;
  });

  describe('T3.1: Stand Density Row Calculation System', () => {
    it('returns exact canonical row counts for Tiered grandstands across all 3 densities', () => {
      // Reduced (-1 row from normal, spacious legroom)
      expect(getTierChairRows('small', 'reduced')).toBe(3);
      expect(getTierChairRows('medium', 'reduced')).toBe(7);
      expect(getTierChairRows('large', 'reduced')).toBe(13);

      // Normal (Standard default row counts)
      expect(getTierChairRows('small', 'normal')).toBe(4);
      expect(getTierChairRows('medium', 'normal')).toBe(8);
      expect(getTierChairRows('large', 'normal')).toBe(14);

      // High Density (Compressed packing: Small +1, Medium +2, Large +4)
      expect(getTierChairRows('small', 'high_density')).toBe(5);
      expect(getTierChairRows('medium', 'high_density')).toBe(10);
      expect(getTierChairRows('large', 'high_density')).toBe(18);
    });

    it('returns exact canonical row counts for The Wall terraces across all 3 densities', () => {
      // Reduced (-1 row)
      expect(getWallTierChairRows('small', 'reduced')).toBe(5);
      expect(getWallTierChairRows('medium', 'reduced')).toBe(10);
      expect(getWallTierChairRows('large', 'reduced')).toBe(15);

      // Normal (Standard default: 6, 11, 16)
      expect(getWallTierChairRows('small', 'normal')).toBe(6);
      expect(getWallTierChairRows('medium', 'normal')).toBe(11);
      expect(getWallTierChairRows('large', 'normal')).toBe(16);

      // High Density (Small +1, Medium +2, Large +4)
      expect(getWallTierChairRows('small', 'high_density')).toBe(7);
      expect(getWallTierChairRows('medium', 'high_density')).toBe(13);
      expect(getWallTierChairRows('large', 'high_density')).toBe(20);
    });

    it('preserves legacy row counts when density parameter is omitted (zero regressions)', () => {
      // Legacy getTierChairRows returned 2, 3, 4
      expect(getTierChairRows('small')).toBe(2);
      expect(getTierChairRows('medium')).toBe(3);
      expect(getTierChairRows('large')).toBe(4);
      expect(getTierChairRows(undefined)).toBe(3);

      // Legacy getWallTierChairRows returned 6, 11, 16
      expect(getWallTierChairRows('small')).toBe(6);
      expect(getWallTierChairRows('medium')).toBe(11);
      expect(getWallTierChairRows('large')).toBe(16);
      expect(getWallTierChairRows(undefined)).toBe(11); // default medium
    });

    it('resolveTierChairRows defaults to normal density with 4, 8, 14 rows', () => {
      expect(resolveTierChairRows('small')).toBe(4);
      expect(resolveTierChairRows('medium')).toBe(8);
      expect(resolveTierChairRows('large')).toBe(14);
    });

    it('getStandChairRows resolves accurate row count with per-deck density and stand-level density', () => {
      const tieredStand: StandConfig = {
        position: 'east',
        type: 'tiered',
        tierCount: 3,
        tiers: [
          { size: 'small', density: 'reduced' }, // 3 rows
          { size: 'medium', density: 'normal' }, // 8 rows
          { size: 'large', density: 'high_density' }, // 18 rows
        ],
      };

      expect(getStandChairRows(tieredStand, 0)).toBe(3);
      expect(getStandChairRows(tieredStand, 1)).toBe(8);
      expect(getStandChairRows(tieredStand, 2)).toBe(18);

      const wallStandReduced: StandConfig = {
        position: 'north',
        type: 'wall',
        wallSize: 'large',
        wallDensity: 'reduced',
      };
      expect(getStandChairRows(wallStandReduced)).toBe(15);

      const wallStandHigh: StandConfig = {
        position: 'north',
        type: 'wall',
        wallSize: 'large',
        density: 'high_density',
      };
      expect(getStandChairRows(wallStandHigh)).toBe(20);
    });
  });

  describe('T3.2: Dynamic Stand Capacity Adjustment', () => {
    it('returns exact capacity adjustment multipliers via getDensityCapacityFactor', () => {
      expect(getDensityCapacityFactor('reduced')).toBe(0.85); // -15%
      expect(getDensityCapacityFactor('normal')).toBe(1.0);  // baseline
      expect(getDensityCapacityFactor('high_density')).toBe(1.25); // +25%
      expect(getDensityCapacityFactor(undefined)).toBe(1.0);
    });

    it('dynamically adjusts Wall stand capacity based on wallDensity', () => {
      const wallNormal: StandConfig = {
        position: 'east',
        type: 'wall',
        wallSize: 'large',
        density: 'normal',
      };
      const wallReduced: StandConfig = {
        position: 'east',
        type: 'wall',
        wallSize: 'large',
        density: 'reduced',
      };
      const wallHigh: StandConfig = {
        position: 'east',
        type: 'wall',
        wallSize: 'large',
        density: 'high_density',
      };

      const capNormal = calculateStandCapacity(wallNormal, 'rectangular', 'east');
      const capReduced = calculateStandCapacity(wallReduced, 'rectangular', 'east');
      const capHigh = calculateStandCapacity(wallHigh, 'rectangular', 'east');

      expect(capNormal).toBe(24000);
      expect(capReduced).toBe(Math.round(24000 * 0.85)); // 20400 (-15%)
      expect(capHigh).toBe(Math.round(24000 * 1.25));    // 30000 (+25%)
    });

    it('dynamically adjusts Tiered stand capacity per-tier and in total', () => {
      const tieredNormal: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 1,
        tiers: [{ size: 'medium', density: 'normal' }],
      };
      const tieredReduced: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 1,
        tiers: [{ size: 'medium', density: 'reduced' }],
      };
      const tieredHigh: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 1,
        tiers: [{ size: 'medium', density: 'high_density' }],
      };

      const capNormal = calculateStandCapacity(tieredNormal, 'rectangular', 'west');
      const capReduced = calculateStandCapacity(tieredReduced, 'rectangular', 'west');
      const capHigh = calculateStandCapacity(tieredHigh, 'rectangular', 'west');

      expect(capNormal).toBe(4800);
      expect(capReduced).toBe(Math.round(4800 * 0.85)); // 4080
      expect(capHigh).toBe(Math.round(4800 * 1.25));    // 6000
    });

    it('accurately integrates into calculateStadiumTotalCapacity across multiple stands', () => {
      const stands: Record<string, StandConfig> = {
        east: { position: 'east', type: 'tiered', tiers: [{ size: 'medium', density: 'reduced' }] },
        west: { position: 'west', type: 'tiered', tiers: [{ size: 'medium', density: 'high_density' }] },
        north: { position: 'north', type: 'none' },
        south: { position: 'south', type: 'wall', wallSize: 'small', density: 'normal' },
        corner_ne: { position: 'corner_ne', type: 'none' },
        corner_nw: { position: 'corner_nw', type: 'none' },
        corner_se: { position: 'corner_se', type: 'none' },
        corner_sw: { position: 'corner_sw', type: 'none' },
      };

      const totalCap = calculateStadiumTotalCapacity(stands as any, 'rectangular');
      const expectedEast = Math.round(4800 * 0.85 * 1.0);
      const expectedWest = Math.round(4800 * 1.25 * 1.0);
      const expectedSouth = Math.round(14400 * 1.0 * 0.85);

      expect(totalCap).toBe(expectedEast + expectedWest + expectedSouth);
    });
  });

  describe('T3.3: STAND_DENSITY_OPTIONS specification', () => {
    it('provides exactly 3 clean options for reduced, normal, and high_density', () => {
      expect(STAND_DENSITY_OPTIONS).toHaveLength(3);
      expect(STAND_DENSITY_OPTIONS.map((o) => o.id)).toEqual(['reduced', 'normal', 'high_density']);
      expect(STAND_DENSITY_OPTIONS[0].factor).toBe(0.85);
      expect(STAND_DENSITY_OPTIONS[1].factor).toBe(1.0);
      expect(STAND_DENSITY_OPTIONS[2].factor).toBe(1.25);
    });
  });

  describe('T3.4: Visual Rendering with Density Scaling', () => {
    it('renders touchline stand cleanly across reduced, normal, and high density without errors', () => {
      const densities: StandDensity[] = ['reduced', 'normal', 'high_density'];

      densities.forEach((dns) => {
        const stand: StandConfig = {
          position: 'east',
          type: 'tiered',
          tierCount: 2,
          density: dns,
          tiers: [
            { size: 'medium', density: dns },
            { size: 'large', density: dns },
          ],
        };

        expect(() => {
          drawSingleTouchlineStand(
            mockCtx,
            stand,
            PITCH_CONFIG.PITCH_RIGHT + 20,
            PITCH_CONFIG.PITCH_TOP,
            180,
            PITCH_CONFIG.FIELD_HEIGHT,
            'east',
            HOME_KIT,
            AWAY_KIT,
            'rectangular'
          );
        }).not.toThrow();
      });
    });

    it('renders goal end stand with The Wall terrace across all densities', () => {
      const densities: StandDensity[] = ['reduced', 'normal', 'high_density'];

      densities.forEach((dns) => {
        const wallStand: StandConfig = {
          position: 'north',
          type: 'wall',
          wallSize: 'large',
          wallDensity: dns,
        };

        expect(() => {
          drawGoalEndStand(
            mockCtx,
            wallStand,
            PITCH_CONFIG.PITCH_LEFT,
            PITCH_CONFIG.PITCH_TOP - 220,
            PITCH_CONFIG.FIELD_WIDTH,
            220,
            'north',
            HOME_KIT,
            AWAY_KIT,
            'rectangular'
          );
        }).not.toThrow();
      });
    });

    it('renders mitered corner stands and coliseum bowl across densities', () => {
      const cornerStand: StandConfig = {
        position: 'corner_ne',
        type: 'tiered',
        tierCount: 2,
        density: 'high_density',
        tiers: [{ size: 'medium', density: 'high_density' }, { size: 'large', density: 'high_density' }],
      };

      expect(() => {
        drawMiteredCornerStand(
          mockCtx,
          cornerStand,
          'corner_ne',
          PITCH_CONFIG.PITCH_RIGHT,
          PITCH_CONFIG.PITCH_RIGHT + 180,
          PITCH_CONFIG.PITCH_TOP - 180,
          PITCH_CONFIG.PITCH_TOP,
          180,
          180,
          HOME_KIT,
          AWAY_KIT,
          'rectangular'
        );
      }).not.toThrow();

      const baseStadium = getAllRegisteredStadiums()[0];
      const bowlStadium: StadiumDefinition = {
        ...baseStadium,
        shape: 'round',
        stands: {
          ...baseStadium.stands,
          east: { position: 'east', type: 'tiered', tiers: [{ size: 'medium', density: 'high_density' }] },
          west: { position: 'west', type: 'tiered', tiers: [{ size: 'medium', density: 'high_density' }] },
          north: { position: 'north', type: 'tiered', tiers: [{ size: 'medium', density: 'high_density' }] },
          south: { position: 'south', type: 'tiered', tiers: [{ size: 'medium', density: 'high_density' }] },
        },
      };

      expect(() => {
        drawContinuousColiseumBowl(
          mockCtx,
          bowlStadium,
          'monumental',
          'sunset',
          HOME_KIT,
          AWAY_KIT,
          'round'
        );
      }).not.toThrow();
    });
  });
});
