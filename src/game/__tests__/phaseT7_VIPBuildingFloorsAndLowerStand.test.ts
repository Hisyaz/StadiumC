/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import {
  StandConfig,
  getVipBuildingFloors,
  getVipLowerStandRows,
  getVipLowerStandDepth,
  getVipLowerStandCapacity,
  calculateVipBuildingCapacity,
  calculateStandCapacity,
  LOWER_STAND_SIZE_OPTIONS,
  LOWER_STAND_MATERIAL_OPTIONS,
  LOWER_STAND_BARRIER_OPTIONS,
  LOWER_STAND_SEAT_OPTIONS,
  VipFloorCount,
  LowerStandSize,
  LowerStandMaterial,
  LowerStandBarrier,
  LowerStandSeat,
} from '../../types/stadium';
import { drawVipBuildingStand } from '../stadiumRenderer';
import { drawAerialVipBuilding } from '../skyCamRenderer';

describe('Phase T7: VIP Building Multi-Floor Elevator (1-5 Floors) & Integrated Pitchside Stand', () => {
  describe('Helper functions & Floor resolution', () => {
    it('resolves floor count from vipFloors correctly (1 to 5)', () => {
      for (let f = 1; f <= 5; f++) {
        const stand: StandConfig = { position: 'west', type: 'vip_building', vipFloors: f as VipFloorCount };
        expect(getVipBuildingFloors(stand)).toBe(f);
      }
    });

    it('falls back to legacy tierCount if vipFloors is absent', () => {
      const stand: StandConfig = { position: 'west', type: 'vip_building', tierCount: 3 as any };
      expect(getVipBuildingFloors(stand)).toBe(3);
    });

    it('defaults to 4 floors when neither vipFloors nor tierCount is set', () => {
      const stand: StandConfig = { position: 'west', type: 'vip_building' };
      expect(getVipBuildingFloors(stand)).toBe(4);
    });

    it('clamps floor count between 1 and 5', () => {
      const standLow: StandConfig = { position: 'west', type: 'vip_building', vipFloors: 0 as any };
      expect(getVipBuildingFloors(standLow)).toBe(1);

      const standHigh: StandConfig = { position: 'west', type: 'vip_building', vipFloors: 10 as any };
      expect(getVipBuildingFloors(standHigh)).toBe(5);
    });

    it('resolves lower stand rows and depths correctly', () => {
      expect(getVipLowerStandRows('small')).toBe(3);
      expect(getVipLowerStandRows('medium')).toBe(5);
      expect(getVipLowerStandRows('big')).toBe(8);

      expect(getVipLowerStandDepth('small')).toBe(25);
      expect(getVipLowerStandDepth('medium')).toBe(40);
      expect(getVipLowerStandDepth('big')).toBe(60);
    });

    it('provides valid metadata for all lower stand customization options', () => {
      expect(LOWER_STAND_SIZE_OPTIONS).toHaveLength(3);
      expect(LOWER_STAND_SIZE_OPTIONS.map((o) => o.id)).toEqual(['small', 'medium', 'big']);

      expect(LOWER_STAND_MATERIAL_OPTIONS).toHaveLength(3);
      expect(LOWER_STAND_MATERIAL_OPTIONS.map((o) => o.id)).toEqual(['concrete', 'brick', 'metal']);

      expect(LOWER_STAND_BARRIER_OPTIONS).toHaveLength(3);
      expect(LOWER_STAND_BARRIER_OPTIONS.map((o) => o.id)).toEqual([
        'glass_balustrade',
        'metal_handrail',
        'anti_surge_barrier',
      ]);

      expect(LOWER_STAND_SEAT_OPTIONS).toHaveLength(3);
      expect(LOWER_STAND_SEAT_OPTIONS.map((o) => o.id)).toEqual([
        'leather_armchair',
        'padded_bucket',
        'classic_shell',
      ]);
    });
  });

  describe('Capacity calculations', () => {
    it('calculates VIP building capacity with 1 to 5 floors without lower stand', () => {
      for (let f = 1; f <= 5; f++) {
        const stand: StandConfig = {
          position: 'west',
          type: 'vip_building',
          vipFloors: f as VipFloorCount,
          hasLowerStand: false,
        };
        const expected = f * 1100;
        expect(calculateVipBuildingCapacity(stand)).toBe(expected);
      }
    });

    it('calculates VIP building capacity with lower stand terrace enabled', () => {
      const standSmall: StandConfig = {
        position: 'west',
        type: 'vip_building',
        vipFloors: 3,
        hasLowerStand: true,
        lowerStandSize: 'small',
      };
      // (3 * 1100) + 1200 = 4500
      expect(calculateVipBuildingCapacity(standSmall)).toBe(4500);

      const standMedium: StandConfig = {
        position: 'west',
        type: 'vip_building',
        vipFloors: 4,
        hasLowerStand: true,
        lowerStandSize: 'medium',
      };
      // (4 * 1100) + 2000 = 6400
      expect(calculateVipBuildingCapacity(standMedium)).toBe(6400);

      const standBig: StandConfig = {
        position: 'west',
        type: 'vip_building',
        vipFloors: 5,
        hasLowerStand: true,
        lowerStandSize: 'big',
      };
      // (5 * 1100) + 3200 = 8700
      expect(calculateVipBuildingCapacity(standBig)).toBe(8700);
    });

    it('integrates calculateStandCapacity with position multipliers', () => {
      const standWest: StandConfig = {
        position: 'west',
        type: 'vip_building',
        vipFloors: 4,
        hasLowerStand: true,
        lowerStandSize: 'medium',
      };
      // West touchline multiplier is 1.0: Math.round(6400 * 1.0) = 6400
      expect(calculateStandCapacity(standWest, 'rectangular', 'west')).toBe(6400);

      const standNorth: StandConfig = {
        position: 'north',
        type: 'vip_building',
        vipFloors: 4,
        hasLowerStand: true,
        lowerStandSize: 'medium',
      };
      // North goal multiplier is 0.85: Math.round(6400 * 0.85) = 5440
      expect(calculateStandCapacity(standNorth, 'rectangular', 'north')).toBe(5440);

      const standWithoutTerrace: StandConfig = {
        ...standWest,
        hasLowerStand: false,
      };
      // 4400 * 1.0 = 4400
      expect(calculateStandCapacity(standWithoutTerrace, 'rectangular', 'west')).toBe(4400);
    });
  });

  describe('Procedural Pitchside Canvas Rendering (drawVipBuildingStand)', () => {
    function createMockCtx(): CanvasRenderingContext2D {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
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

    it('renders VIP building across all 1 to 5 floor elevator levels without error', () => {
      const ctx = createMockCtx();
      for (let f = 1; f <= 5; f++) {
        const stand: StandConfig = {
          position: 'west',
          type: 'vip_building',
          vipFloors: f as VipFloorCount,
          hasLowerStand: true,
          lowerStandSize: 'medium',
        };

        expect(() => {
          drawVipBuildingStand(
            ctx,
            stand,
            100,
            200,
            800,
            300,
            'west',
            'night'
          );
        }).not.toThrow();
      }
    });

    it('renders with hasLowerStand: false (flush building facade, no lower terrace rows)', () => {
      const ctx = createMockCtx();
      const stand: StandConfig = {
        position: 'west',
        type: 'vip_building',
        vipFloors: 3,
        hasLowerStand: false,
      };

      expect(() => {
        drawVipBuildingStand(
          ctx,
          stand,
          100,
          200,
          800,
          300,
          'west',
          'noon'
        );
      }).not.toThrow();
    });

    it('renders with diverse lower stand materials, barriers, and seat types', () => {
      const ctx = createMockCtx();
      const materials: LowerStandMaterial[] = ['concrete', 'brick', 'metal'];
      const barriers: LowerStandBarrier[] = [
        'glass_balustrade',
        'metal_handrail',
        'anti_surge_barrier',
      ];
      const seats: LowerStandSeat[] = ['leather_armchair', 'padded_bucket', 'classic_shell'];
      const sizes: LowerStandSize[] = ['small', 'medium', 'big'];

      for (let i = 0; i < 3; i++) {
        const stand: StandConfig = {
          position: 'east',
          type: 'vip_building',
          vipFloors: 4,
          hasLowerStand: true,
          lowerStandSize: sizes[i],
          lowerStandMaterial: materials[i],
          lowerStandBarrier: barriers[i],
          lowerStandSeat: seats[i],
        };

        expect(() => {
          drawVipBuildingStand(
            ctx,
            stand,
            50,
            150,
            700,
            250,
            'east',
            'sunset'
          );
        }).not.toThrow();
      }
    });
  });

  describe('Aerial Sky-Cam Rendering (drawAerialVipBuilding)', () => {
    function createMockCtx(): CanvasRenderingContext2D {
      return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        createLinearGradient: vi.fn(() => ({
          addColorStop: vi.fn(),
        })),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
      } as unknown as CanvasRenderingContext2D;
    }

    it('renders aerial sky-cam for all 4 orientations and 1 to 5 floors', () => {
      const ctx = createMockCtx();
      const orientations: ('west' | 'east' | 'north' | 'south')[] = [
        'west',
        'east',
        'north',
        'south',
      ];

      for (const orientation of orientations) {
        for (let f = 1; f <= 5; f++) {
          const stand: StandConfig = {
            position: orientation,
            type: 'vip_building',
            vipFloors: f as VipFloorCount,
            hasLowerStand: true,
            lowerStandSize: 'big',
            lowerStandMaterial: 'metal',
            lowerStandBarrier: 'anti_surge_barrier',
            lowerStandSeat: 'leather_armchair',
          };

          expect(() => {
            drawAerialVipBuilding(
              ctx,
              100,
              100,
              200,
              300,
              orientation,
              'night',
              '#1e3a8a',
              stand
            );
          }).not.toThrow();
        }
      }
    });

    it('renders aerial sky-cam with hasLowerStand: false', () => {
      const ctx = createMockCtx();
      const stand: StandConfig = {
        position: 'west',
        type: 'vip_building',
        vipFloors: 5,
        hasLowerStand: false,
      };

      expect(() => {
        drawAerialVipBuilding(ctx, 100, 100, 200, 300, 'west', 'noon', '#1e3a8a', stand);
      }).not.toThrow();
    });
  });
});
