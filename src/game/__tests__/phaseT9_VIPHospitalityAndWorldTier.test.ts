import { describe, it, expect, vi } from 'vitest';
import {
  StandConfig,
  StandPosition,
  StadiumDefinition,
  isGradeVipEligible,
  isStandVipEligible,
  hasStandVipSeats,
  getEffectiveVipTierIndex,
  hasStandVipZone,
  hasStandTransmissionArea,
  hasVipSeatsInStadium,
  hasTransmissionAreaInStadium,
  hasVipZoneInStadium,
  isFifaWorldCertified,
  getStandVipCapacity,
  getStadiumTotalVipCapacity,
  getStandSeatLevel,
  getStadiumCertificationRating,
  calculateStandCapacity,
  calculateStackedWallCapacity,
  VIP_SEAT_OPTIONS,
} from '../../types/stadium';
import {
  drawVipHospitalityBalustrade,
  drawVipCocktailTable,
  drawVipSeatUnit,
  drawVipZoneBuffetLounge,
  drawTransmissionPressBox,
} from '../stadiumRenderer';

describe('Phase T9: VIP Hospitality Tier, Executive Amenities & FIFA World Certification', () => {
  describe('T9.1: Grade 3+ (Industrial or Superior) Prerequisite Gate', () => {
    it('strictly forbids Municipal (Grade 1) and Brutalist (Grade 2) from VIP eligibility', () => {
      expect(isGradeVipEligible('municipal')).toBe(false);
      expect(isGradeVipEligible('brutalist')).toBe(false);

      const municipalStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade1_municipal',
        architecturalGrade: 'municipal',
        hasVipSeats: true,
      };
      expect(isStandVipEligible(municipalStand)).toBe(false);
      expect(hasStandVipSeats(municipalStand)).toBe(false);
      expect(getStandSeatLevel(municipalStand)).toBe(1); // Grade 1 Municipal

      const brutalistStand: StandConfig = {
        position: 'east',
        type: 'tiered',
        grade: 'grade2_classic',
        architecturalGrade: 'brutalist',
        hasVipSeats: true,
      };
      expect(isStandVipEligible(brutalistStand)).toBe(false);
      expect(hasStandVipSeats(brutalistStand)).toBe(false);
      expect(getStandSeatLevel(brutalistStand)).toBe(2); // Grade 2 Brutalist
    });

    it('permits Industrial (Grade 3), Victorian (Grade 4), and Modern (Grade 5)', () => {
      expect(isGradeVipEligible('industrial')).toBe(true);
      expect(isGradeVipEligible('victorian')).toBe(true);
      expect(isGradeVipEligible('modern')).toBe(true);

      const modernStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade4_modern',
        architecturalGrade: 'modern',
        hasVipSeats: true,
      };
      expect(isStandVipEligible(modernStand)).toBe(true);
      expect(hasStandVipSeats(modernStand)).toBe(true);
      expect(getStandSeatLevel(modernStand)).toBe(6); // Level 6 VIP Hospitality
    });

    it('clamps tiered stand tier placement and calculates effective VIP index', () => {
      const stand2Tier: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 2,
        hasVipSeats: true,
      };
      expect(getEffectiveVipTierIndex(stand2Tier)).toBe(1); // 2nd level

      const stand3Tier: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 3,
        vipTierIndex: 2,
        hasVipSeats: true,
      };
      expect(getEffectiveVipTierIndex(stand3Tier)).toBe(2); // 3rd level
    });
  });

  describe('T9.2: VIP Seats on Stacked Wall Stands', () => {
    it('converts upper wall deck to Level 6 executive viewing mezzanine balcony', () => {
      const regularStackedWall: StandConfig = {
        position: 'west',
        type: 'stacked_wall',
        architecturalGrade: 'modern',
        hasVipSeats: false,
      };
      const regularCap = calculateStackedWallCapacity(regularStackedWall, 'rectangular');

      const vipStackedWall: StandConfig = {
        position: 'west',
        type: 'stacked_wall',
        architecturalGrade: 'modern',
        hasVipSeats: true,
      };
      expect(hasStandVipSeats(vipStackedWall)).toBe(true);
      expect(getStandSeatLevel(vipStackedWall)).toBe(6);

      const vipCap = calculateStackedWallCapacity(vipStackedWall, 'rectangular');
      // VIP mezzanine has upperBase = 2200 and mezzanineBonus = 800 vs regular high wall capacity
      expect(vipCap).toBeGreaterThan(0);
      expect(getStandVipCapacity(vipStackedWall, 'rectangular')).toBe(2200);
    });
  });

  describe('T9.3: VIP Stand Customization Suite (Amenities, Densities & Seat Styles)', () => {
    it('provides the three exclusive VIP seat typologies', () => {
      expect(VIP_SEAT_OPTIONS.length).toBe(3);
      const ids = VIP_SEAT_OPTIONS.map((o) => o.id);
      expect(ids).toContain('plush_armchair');
      expect(ids).toContain('executive_bucket');
      expect(ids).toContain('champagne_bar_stool');
    });

    it('deducts 5% capacity for VIP Zone (buffet lounge) and 150 seats for Transmission Area', () => {
      const baseStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        architecturalGrade: 'modern',
        tierCount: 2,
        tiers: [{ size: 'medium' }, { size: 'medium' }],
      };
      const baseCap = calculateStandCapacity(baseStand, 'rectangular');

      const loungeStand: StandConfig = {
        ...baseStand,
        hasVipZone: true,
      };
      const loungeCap = calculateStandCapacity(loungeStand, 'rectangular');
      expect(loungeCap).toBe(Math.round(baseCap * 0.95));

      const mediaStand: StandConfig = {
        ...baseStand,
        hasTransmissionArea: true,
      };
      const mediaCap = calculateStandCapacity(mediaStand, 'rectangular');
      expect(mediaCap).toBe(baseCap - 150);

      const fullVipAmenitiesStand: StandConfig = {
        ...baseStand,
        hasVipZone: true,
        hasTransmissionArea: true,
      };
      const fullCap = calculateStandCapacity(fullVipAmenitiesStand, 'rectangular');
      expect(fullCap).toBe(Math.max(100, Math.round(baseCap * 0.95) - 150));
    });
  });

  describe('T9.4: FIFA World Category Certification Gate', () => {
    const createCandidateStadium = (overrides?: any): StadiumDefinition => {
      const defaultStands: Record<StandPosition, StandConfig> = {
        west: {
          position: 'west',
          type: 'tiered',
          architecturalGrade: 'modern',
          tierCount: 3,
          hasVipSeats: true,
          hasVipZone: true,
          hasTransmissionArea: true,
        },
        east: {
          position: 'east',
          type: 'tiered',
          architecturalGrade: 'modern',
          tierCount: 3,
        },
        north: {
          position: 'north',
          type: 'tiered',
          architecturalGrade: 'modern',
          tierCount: 2,
        },
        south: {
          position: 'south',
          type: 'tiered',
          architecturalGrade: 'modern',
          tierCount: 2,
        },
        corner_nw: { position: 'corner_nw', type: 'none' },
        corner_ne: { position: 'corner_ne', type: 'none' },
        corner_se: { position: 'corner_se', type: 'none' },
        corner_sw: { position: 'corner_sw', type: 'none' },
      };

      return {
        id: 'candidate_arena',
        name: 'Candidate World Stadium',
        shortName: 'Candidate',
        city: 'Metropolis',
        country: 'Global',
        capacity: 65000,
        shape: 'rectangular',
        surroundings: 'big_city',
        fifaCategory: 'world',
        ...overrides,
        stands: {
          ...defaultStands,
          ...(overrides?.stands || {}),
        },
      } as StadiumDefinition;
    };

    it('certifies stadium as WORLD when VIP Seats, Broadcast Box, and VIP Zone are active with 45K+ capacity', () => {
      const stadium = createCandidateStadium();
      expect(hasVipSeatsInStadium(stadium)).toBe(true);
      expect(hasTransmissionAreaInStadium(stadium)).toBe(true);
      expect(hasVipZoneInStadium(stadium)).toBe(true);
      expect(isFifaWorldCertified(stadium)).toBe(true);
      expect(getStadiumCertificationRating(stadium)).toBe('world');
      expect(getStadiumTotalVipCapacity(stadium)).toBeGreaterThan(0);
    });

    it('clamps to continental if missing VIP Seats', () => {
      const stadium = createCandidateStadium({
        stands: {
          west: {
            position: 'west',
            type: 'tiered',
            architecturalGrade: 'modern',
            tierCount: 3,
            hasVipSeats: false,
            hasVipZone: true,
            hasTransmissionArea: true,
          },
          east: { position: 'east', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
          north: { position: 'north', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
          south: { position: 'south', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
        },
      });
      expect(isFifaWorldCertified(stadium)).toBe(false);
      expect(getStadiumCertificationRating(stadium)).toBe('continental');
    });

    it('clamps to continental if missing Transmission Area', () => {
      const stadium = createCandidateStadium({
        stands: {
          west: {
            position: 'west',
            type: 'tiered',
            architecturalGrade: 'modern',
            tierCount: 3,
            hasVipSeats: true,
            hasVipZone: true,
            hasTransmissionArea: false,
          },
          east: { position: 'east', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
          north: { position: 'north', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
          south: { position: 'south', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
        },
      });
      expect(isFifaWorldCertified(stadium)).toBe(false);
      expect(getStadiumCertificationRating(stadium)).toBe('continental');
    });

    it('clamps to continental if missing VIP Zone', () => {
      const stadium = createCandidateStadium({
        stands: {
          west: {
            position: 'west',
            type: 'tiered',
            architecturalGrade: 'modern',
            tierCount: 3,
            hasVipSeats: true,
            hasVipZone: false,
            hasTransmissionArea: true,
          },
          east: { position: 'east', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
          north: { position: 'north', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
          south: { position: 'south', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
        },
      });
      expect(isFifaWorldCertified(stadium)).toBe(false);
      expect(getStadiumCertificationRating(stadium)).toBe('continental');
    });

    it('drops to municipal if even one stand has Municipal Grade penalty', () => {
      const stadium = createCandidateStadium({
        stands: {
          west: {
            position: 'west',
            type: 'tiered',
            architecturalGrade: 'modern',
            tierCount: 3,
            hasVipSeats: true,
            hasVipZone: true,
            hasTransmissionArea: true,
          },
          east: { position: 'east', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
          north: { position: 'north', type: 'tiered', architecturalGrade: 'modern', tierCount: 2 },
          south: { position: 'south', type: 'tiered', architecturalGrade: 'municipal', tierCount: 1 }, // Penalty trigger!
        },
      });
      expect(isFifaWorldCertified(stadium)).toBe(false);
      expect(getStadiumCertificationRating(stadium)).toBe('municipal');
    });
  });

  describe('T9 Procedural Rendering Helpers', () => {
    const createMockCtx = () => {
      const ctx: any = {
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
        rect: vi.fn(),
        arc: vi.fn(),
        ellipse: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
      };
      return ctx;
    };

    it('draws VIP hospitality balustrade without errors', () => {
      const ctx = createMockCtx();
      expect(() => drawVipHospitalityBalustrade(ctx, 100, 100, 200, 20, 'north', true)).not.toThrow();
      expect(() => drawVipHospitalityBalustrade(ctx, 100, 100, 20, 200, 'west', false)).not.toThrow();
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('draws VIP cocktail side-tables without errors', () => {
      const ctx = createMockCtx();
      expect(() => drawVipCocktailTable(ctx, 150, 150, true)).not.toThrow();
      expect(ctx.ellipse).toHaveBeenCalled();
    });

    it('draws all three VIP seat types (plush armchair, executive bucket, champagne stool)', () => {
      const ctx = createMockCtx();
      expect(() => drawVipSeatUnit(ctx, 50, 50, 10, 8, 'plush_armchair', '#b91c1c', '#f59e0b', true, true)).not.toThrow();
      expect(() => drawVipSeatUnit(ctx, 70, 50, 10, 8, 'executive_bucket', '#0284c7', '#38bdf8', false, true)).not.toThrow();
      expect(() => drawVipSeatUnit(ctx, 90, 50, 10, 8, 'champagne_bar_stool', '#7c2d12', '#fbbf24', true, false)).not.toThrow();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('draws VIP Zone buffet lounge and Transmission Area press box', () => {
      const ctx = createMockCtx();
      expect(() => drawVipZoneBuffetLounge(ctx, 50, 50, 120, 30, 'north', true)).not.toThrow();
      expect(() => drawTransmissionPressBox(ctx, 200, 200, 60, 30, 'west', true)).not.toThrow();
      expect(ctx.strokeRect).toHaveBeenCalled();
    });
  });
});
