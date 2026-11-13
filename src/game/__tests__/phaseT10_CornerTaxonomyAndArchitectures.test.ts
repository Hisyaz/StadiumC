import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamKit } from '../../types';
import {
  StandConfig,
  StadiumDefinition,
  calculateStandCapacity,
  getStandChairRows,
  CornerStandType,
  CORNER_STAND_OPTIONS,
  resolveCornerArchitectureType,
  isCornerRound,
  isCornerGiant,
  isCornerTower,
  isCornerNoStand,
} from '../../types/stadium';
import {
  drawRoundCornerStand,
  drawGiantCornerStand,
  drawTowerCornerStand,
  drawMiteredCornerStand,
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

function createMockContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
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
  } as unknown as CanvasRenderingContext2D;
}

describe('Phase T10: New 4-Corner Architecture Taxonomy ("Round", "Square/Giant", "Tower", "No Stand")', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockContext();
  });

  describe('1. Taxonomy Type Resolution & Validation', () => {
    it('provides all 4 distinct corner options in CORNER_STAND_OPTIONS with icons and badges', () => {
      expect(CORNER_STAND_OPTIONS).toHaveLength(4);
      const ids = CORNER_STAND_OPTIONS.map((o) => o.id);
      expect(ids).toContain('round');
      expect(ids).toContain('square');
      expect(ids).toContain('tower');
      expect(ids).toContain('none');

      const roundOpt = CORNER_STAND_OPTIONS.find((o) => o.id === 'round');
      expect(roundOpt?.badge).toBe('ROUND');
      expect(roundOpt?.icon).toBe('🔄');

      const giantOpt = CORNER_STAND_OPTIONS.find((o) => o.id === 'square');
      expect(giantOpt?.badge).toBe('GIANT');
      expect(giantOpt?.icon).toBe('🏛️');

      const towerOpt = CORNER_STAND_OPTIONS.find((o) => o.id === 'tower');
      expect(towerOpt?.badge).toBe('TOWER');
      expect(towerOpt?.icon).toBe('🏢');

      const noneOpt = CORNER_STAND_OPTIONS.find((o) => o.id === 'none');
      expect(noneOpt?.badge).toBe('OPEN');
      expect(noneOpt?.icon).toBe('🌳');
    });

    it('resolves corner architecture types correctly across aliases', () => {
      expect(resolveCornerArchitectureType('round')).toBe('round');
      expect(resolveCornerArchitectureType('rounded')).toBe('round');
      expect(resolveCornerArchitectureType('tiered')).toBe('round');

      expect(resolveCornerArchitectureType('square')).toBe('giant');
      expect(resolveCornerArchitectureType('giant')).toBe('giant');
      expect(resolveCornerArchitectureType('wall')).toBe('giant');
      expect(resolveCornerArchitectureType('stacked_wall')).toBe('giant');

      expect(resolveCornerArchitectureType('tower')).toBe('tower');
      expect(resolveCornerArchitectureType('vip_building')).toBe('tower');

      expect(resolveCornerArchitectureType('none')).toBe('none');
      expect(resolveCornerArchitectureType('no_stand')).toBe('none');
      expect(resolveCornerArchitectureType(undefined)).toBe('none');
    });

    it('validates boolean helper functions for each corner architecture', () => {
      expect(isCornerRound('round')).toBe(true);
      expect(isCornerRound('tiered')).toBe(true);
      expect(isCornerRound('square')).toBe(false);

      expect(isCornerGiant('giant')).toBe(true);
      expect(isCornerGiant('square')).toBe(true);
      expect(isCornerGiant('round')).toBe(false);

      expect(isCornerTower('tower')).toBe(true);
      expect(isCornerTower('vip_building')).toBe(true);
      expect(isCornerTower('giant')).toBe(false);

      expect(isCornerNoStand('none')).toBe(true);
      expect(isCornerNoStand('no_stand')).toBe(true);
      expect(isCornerNoStand('round')).toBe(false);
    });
  });

  describe('2. Seat & Terrace Row Computation Across Corner Architectures', () => {
    it('computes chair rows for round corner stands based on tier sizing and density', () => {
      const stand: StandConfig = {
        position: 'corner_nw',
        type: 'round',
        tierCount: 3,
        tiers: [
          { size: 'small', density: 'normal' },
          { size: 'medium', density: 'high_density' },
          { size: 'large', density: 'reduced' },
        ],
      };

      expect(getStandChairRows(stand, 0)).toBe(4);  // small normal
      expect(getStandChairRows(stand, 1)).toBe(10); // medium high density
      expect(getStandChairRows(stand, 2)).toBe(13); // large reduced
    });

    it('computes terrace rows for giant / square wall corner stands', () => {
      const smallStand: StandConfig = {
        position: 'corner_ne',
        type: 'square',
        wallSize: 'small',
        wallDensity: 'normal',
      };
      expect(getStandChairRows(smallStand)).toBe(6);

      const mediumStand: StandConfig = {
        position: 'corner_ne',
        type: 'giant',
        wallSize: 'medium',
        wallDensity: 'high_density',
      };
      expect(getStandChairRows(mediumStand)).toBe(13);

      const bigStand: StandConfig = {
        position: 'corner_ne',
        type: 'square',
        wallSize: 'large',
        wallDensity: 'normal',
      };
      expect(getStandChairRows(bigStand)).toBe(16);
    });

    it('returns 0 chair rows for tower (VIP suites) and none (open)', () => {
      const towerStand: StandConfig = {
        position: 'corner_se',
        type: 'tower',
        vipFloors: 4,
      };
      expect(getStandChairRows(towerStand)).toBe(0);

      const openStand: StandConfig = {
        position: 'corner_sw',
        type: 'none',
      };
      expect(getStandChairRows(openStand)).toBe(0);
    });
  });

  describe('3. Corner Stand Capacity Calculations', () => {
    it('calculates zero capacity for open corner (none / no_stand)', () => {
      const stand: StandConfig = { position: 'corner_nw', type: 'none' };
      expect(calculateStandCapacity(stand, 'rectangular', 'corner_nw')).toBe(0);
    });

    it('calculates VIP tower capacity proportional to stacked floors (1-5 floors)', () => {
      const tower1: StandConfig = { position: 'corner_ne', type: 'tower', vipFloors: 1 };
      const tower3: StandConfig = { position: 'corner_ne', type: 'tower', vipFloors: 3 };
      const tower5: StandConfig = { position: 'corner_ne', type: 'tower', vipFloors: 5 };

      const cap1 = calculateStandCapacity(tower1, 'rectangular', 'corner_ne');
      const cap3 = calculateStandCapacity(tower3, 'rectangular', 'corner_ne');
      const cap5 = calculateStandCapacity(tower5, 'rectangular', 'corner_ne');

      expect(cap1).toBeGreaterThan(0);
      expect(cap3).toBeGreaterThan(cap1);
      expect(cap5).toBeGreaterThan(cap3);
      expect(cap5).toBeCloseTo(cap1 * 5, -1);
    });

    it('calculates giant corner wall capacity with density boosts', () => {
      const normalGiant: StandConfig = {
        position: 'corner_se',
        type: 'giant',
        wallSize: 'large',
        wallDensity: 'normal',
      };
      const highGiant: StandConfig = {
        position: 'corner_se',
        type: 'giant',
        wallSize: 'large',
        wallDensity: 'high_density',
      };

      const capNormal = calculateStandCapacity(normalGiant, 'rectangular', 'corner_se');
      const capHigh = calculateStandCapacity(highGiant, 'rectangular', 'corner_se');

      expect(capNormal).toBeGreaterThan(5000);
      expect(capHigh).toBeGreaterThan(capNormal);
    });

    it('calculates round multi-tier corner capacity', () => {
      const roundStand: StandConfig = {
        position: 'corner_sw',
        type: 'round',
        tierCount: 2,
        tiers: [{ size: 'medium' }, { size: 'medium' }],
      };

      const cap = calculateStandCapacity(roundStand, 'rectangular', 'corner_sw');
      expect(cap).toBeGreaterThan(0);
    });
  });

  describe('4. Procedural Canvas Rendering Across All 4 Corner Positions', () => {
    const corners: ('corner_nw' | 'corner_ne' | 'corner_se' | 'corner_sw')[] = [
      'corner_nw',
      'corner_ne',
      'corner_se',
      'corner_sw',
    ];

    it('renders drawRoundCornerStand across all 4 corners without throwing', () => {
      for (const pos of corners) {
        const stand: StandConfig = {
          position: pos,
          type: 'round',
          tierCount: 3,
          tiers: [{ size: 'small' }, { size: 'medium' }, { size: 'large' }],
          primaryColor: '#2563eb',
          secondaryColor: '#f8fafc',
          hasRoof: true,
        };

        expect(() => {
          drawRoundCornerStand(
            ctx,
            stand,
            pos,
            100,
            700,
            100,
            500,
            120,
            120,
            HOME_KIT,
            AWAY_KIT,
            'night'
          );
        }).not.toThrow();

        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      }
    });

    it('renders drawGiantCornerStand across all 4 corners without throwing', () => {
      for (const pos of corners) {
        const stand: StandConfig = {
          position: pos,
          type: 'giant',
          wallSize: 'large',
          wallDensity: 'high_density',
          primaryColor: '#059669',
          secondaryColor: '#ffffff',
          hasRoof: true,
        };

        expect(() => {
          drawGiantCornerStand(
            ctx,
            stand,
            pos,
            100,
            700,
            100,
            500,
            140,
            140,
            HOME_KIT,
            AWAY_KIT,
            'night'
          );
        }).not.toThrow();

        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      }
    });

    it('renders drawTowerCornerStand across all 4 corners with stacked suites and mast', () => {
      for (const pos of corners) {
        const stand: StandConfig = {
          position: pos,
          type: 'tower',
          vipFloors: 4,
          primaryColor: '#7c3aed',
          secondaryColor: '#fef08a',
        };

        expect(() => {
          drawTowerCornerStand(
            ctx,
            stand,
            pos,
            100,
            700,
            100,
            500,
            100,
            100,
            HOME_KIT,
            AWAY_KIT,
            'night'
          );
        }).not.toThrow();

        expect(ctx.fillRect).toHaveBeenCalled();
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
      }
    });

    it('delegates drawMiteredCornerStand to all 4 corner architectures seamlessly', () => {
      const roundStand: StandConfig = { position: 'corner_nw', type: 'round', tierCount: 2 };
      const giantStand: StandConfig = { position: 'corner_ne', type: 'square', wallSize: 'large' };
      const towerStand: StandConfig = { position: 'corner_se', type: 'tower', vipFloors: 3 };
      const noneStand: StandConfig = { position: 'corner_sw', type: 'none' };

      expect(() => {
        drawMiteredCornerStand(ctx, roundStand, 'corner_nw', 100, 700, 100, 500, 120, 120, HOME_KIT, AWAY_KIT);
        drawMiteredCornerStand(ctx, giantStand, 'corner_ne', 100, 700, 100, 500, 120, 120, HOME_KIT, AWAY_KIT);
        drawMiteredCornerStand(ctx, towerStand, 'corner_se', 100, 700, 100, 500, 120, 120, HOME_KIT, AWAY_KIT);
        drawMiteredCornerStand(ctx, noneStand, 'corner_sw', 100, 700, 100, 500, 120, 120, HOME_KIT, AWAY_KIT);
      }).not.toThrow();
    });
  });
});
