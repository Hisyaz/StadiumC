import { describe, it, expect, beforeEach } from 'vitest';
import {
  ARCHITECTURAL_GRADE_OPTIONS,
  ArchitecturalGrade,
  PALETTE_COLORS,
  PaletteColor,
  resolveStandArchitecturalGrade,
  resolveStandSeatArchetype,
  getSeatLevelRank,
  getStandSeatLevel,
  hasMunicipalPenalty,
  getStadiumCertificationRating,
  resolveGradeElementColor,
  StadiumDefinition,
  StandConfig,
  SeatArchetype,
} from '../../types/stadium';
import {
  drawSeatArchetype,
  drawArchitecturalGradeFacade,
  drawSolidUnderSeatDecking,
  drawContinuousColiseumBowl,
} from '../stadiumRenderer';

describe('Phase T6: The 5-Grade Architectural Grade System & 3-Element Color Palette Engine', () => {
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      rect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      arc: () => {},
      ellipse: () => {},
      clip: () => {},
      createLinearGradient: () => ({
        addColorStop: () => {},
      }),
      createPattern: () => null,
      setLineDash: () => {},
      measureText: () => ({ width: 10 }),
      fillText: () => {},
      strokeText: () => {},
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      globalAlpha: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
    } as unknown as CanvasRenderingContext2D;
  });

  describe('1. 5 Architectural Grades Definition & Hierarchy', () => {
    it('defines exactly 5 canonical architectural grades in ARCHITECTURAL_GRADE_OPTIONS', () => {
      expect(ARCHITECTURAL_GRADE_OPTIONS).toHaveLength(5);
      const gradeIds = ARCHITECTURAL_GRADE_OPTIONS.map((g) => g.id);
      expect(gradeIds).toEqual(['municipal', 'brutalist', 'industrial', 'victorian', 'modern']);
    });

    it('enforces incremental tier and seat levels from Level 1 to Level 5', () => {
      ARCHITECTURAL_GRADE_OPTIONS.forEach((opt, idx) => {
        expect(opt.tierLevel).toBe(idx + 1);
        expect(opt.seatLevel).toBe(idx + 1);
      });
    });

    it('assigns unique inherent seat archetypes for each architectural grade', () => {
      const expectedArchetypes: Record<ArchitecturalGrade, SeatArchetype> = {
        municipal: 'tablones',
        brutalist: 'concrete_ledges',
        industrial: 'industrial_flip',
        victorian: 'theater_chairs',
        modern: 'modern_bucket',
      };

      ARCHITECTURAL_GRADE_OPTIONS.forEach((opt) => {
        expect(opt.inherentSeatArchetype).toBe(expectedArchetypes[opt.id]);
        expect(opt.seatStyleName.length).toBeGreaterThan(0);
        expect(opt.underSeatStructure.length).toBeGreaterThan(0);
      });
    });

    it('defines 3 customization element groups per grade with descriptive names and notes', () => {
      ARCHITECTURAL_GRADE_OPTIONS.forEach((opt) => {
        expect(opt.element1Name).toBeTruthy();
        expect(opt.element1Desc).toBeTruthy();
        expect(opt.element2Name).toBeTruthy();
        expect(opt.element2Desc).toBeTruthy();
        expect(opt.element3Name).toBeTruthy();
        expect(opt.element3Desc).toBeTruthy();
      });
    });

    it('resolves architectural grade properly from explicit stand config, stadium fallback, or legacy grade', () => {
      const standWithGrade: StandConfig = {
        position: 'west',
        type: 'tiered',
        architecturalGrade: 'victorian',
      };
      expect(resolveStandArchitecturalGrade(standWithGrade)).toBe('victorian');

      const legacyStand1: StandConfig = {
        position: 'east',
        type: 'tiered',
        grade: 'grade1_municipal',
      };
      expect(resolveStandArchitecturalGrade(legacyStand1)).toBe('municipal');

      const legacyStand2: StandConfig = {
        position: 'north',
        type: 'tiered',
        grade: 'grade3_industrial',
      };
      expect(resolveStandArchitecturalGrade(legacyStand2)).toBe('industrial');

      const legacyStand5: StandConfig = {
        position: 'south',
        type: 'tiered',
        grade: 'grade5_futuristic',
      };
      expect(resolveStandArchitecturalGrade(legacyStand5)).toBe('modern');

      // Defaults cleanly to brutalist when unspecified
      expect(resolveStandArchitecturalGrade(undefined)).toBe('brutalist');
    });
  });

  describe('2. Inherent Seat Archetype & Seat Level Ranking Engine', () => {
    it('inherently maps architectural grades to their intrinsic seat hardware archetype', () => {
      expect(resolveStandSeatArchetype('municipal')).toBe('tablones');
      expect(resolveStandSeatArchetype('brutalist')).toBe('concrete_ledges');
      expect(resolveStandSeatArchetype('industrial')).toBe('industrial_flip');
      expect(resolveStandSeatArchetype('victorian')).toBe('theater_chairs');
      expect(resolveStandSeatArchetype('modern')).toBe('modern_bucket');
    });

    it('returns exact seat rank levels 1 through 5 matching the grade spec', () => {
      expect(getSeatLevelRank('tablones')).toBe(1);
      expect(getSeatLevelRank('concrete_ledges')).toBe(2);
      expect(getSeatLevelRank('industrial_flip')).toBe(3);
      expect(getSeatLevelRank('theater_chairs')).toBe(4);
      expect(getSeatLevelRank('modern_bucket')).toBe(5);

      // Legacy fallback rankings
      expect(getSeatLevelRank('wooden_bench')).toBe(1);
      expect(getSeatLevelRank('tip_up_padded')).toBe(4);
      expect(getSeatLevelRank('vip_leather_armchair')).toBe(5);
    });

    it('computes stand seat level rank through getStandSeatLevel', () => {
      const municipalStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        architecturalGrade: 'municipal',
      };
      expect(getStandSeatLevel(municipalStand)).toBe(1);

      const modernStand: StandConfig = {
        position: 'east',
        type: 'tiered',
        architecturalGrade: 'modern',
      };
      expect(getStandSeatLevel(modernStand)).toBe(5);
    });
  });

  describe('3. 8-Color Palette Engine & Procedural Shading', () => {
    it('defines exactly 8 controlled colors in PALETTE_COLORS without free RGB picker requirement', () => {
      const paletteIds = PALETTE_COLORS.map((c) => c.id);
      expect(paletteIds).toEqual([
        'raw',
        'red',
        'blue',
        'white',
        'black',
        'yellow',
        'orange',
        'green',
      ]);
    });

    it('resolves raw procedural unpainted textures for all 5 architectural grades', () => {
      const grades: ArchitecturalGrade[] = ['municipal', 'brutalist', 'industrial', 'victorian', 'modern'];
      grades.forEach((g) => {
        const elem1 = resolveGradeElementColor(g, 1, 'raw', false);
        const elem2 = resolveGradeElementColor(g, 2, 'raw', false);
        const elem3 = resolveGradeElementColor(g, 3, 'raw', false);

        expect(elem1.isRaw).toBe(true);
        expect(elem2.isRaw).toBe(true);
        expect(elem3.isRaw).toBe(true);
        expect(elem1.primary).toBeTruthy();
        expect(elem2.primary).toBeTruthy();
        expect(elem3.primary).toBeTruthy();
      });
    });

    it('resolves vivid colors with borders and highlight tints for all 7 painted palette colors', () => {
      const paintedColors: PaletteColor[] = ['red', 'blue', 'white', 'black', 'yellow', 'orange', 'green'];
      paintedColors.forEach((color) => {
        const resolved = resolveGradeElementColor('industrial', 2, color, false);
        expect(resolved.isRaw).toBe(false);
        expect(resolved.primary).toBeTruthy();
        expect(resolved.dark).toBeTruthy();
        expect(resolved.light).toBeTruthy();
        expect(resolved.border).toBeTruthy();
      });
    });

    it('adjusts night and day color values for atmospheric lighting cohesion', () => {
      const dayRaw = resolveGradeElementColor('victorian', 1, 'raw', false);
      const nightRaw = resolveGradeElementColor('victorian', 1, 'raw', true);
      expect(dayRaw.primary).not.toBe(nightRaw.primary);
    });
  });

  describe('4. Municipal Penalty Gate & Stadium Certification Engine', () => {
    it('activates hasMunicipalPenalty when any active stand is municipal scaffolding', () => {
      const stadiumWithMunicipalStands: any = {
        west: { position: 'west', type: 'tiered', architecturalGrade: 'modern' },
        east: { position: 'east', type: 'tiered', architecturalGrade: 'municipal' },
        north: { position: 'north', type: 'tiered', architecturalGrade: 'industrial' },
        south: { position: 'south', type: 'tiered', architecturalGrade: 'victorian' },
      };

      expect(hasMunicipalPenalty(stadiumWithMunicipalStands)).toBe(true);
    });

    it('does NOT activate hasMunicipalPenalty when all active stands are Grade 2 or higher', () => {
      const professionalStadium: any = {
        west: { position: 'west', type: 'tiered', architecturalGrade: 'brutalist' },
        east: { position: 'east', type: 'tiered', architecturalGrade: 'industrial' },
        north: { position: 'north', type: 'tiered', architecturalGrade: 'victorian' },
        south: { position: 'south', type: 'tiered', architecturalGrade: 'modern' },
      };

      expect(hasMunicipalPenalty(professionalStadium)).toBe(false);
    });

    it('does NOT activate hasMunicipalPenalty for open grounds (type none / no_stand)', () => {
      const openGroundsStadium: any = {
        west: { position: 'west', type: 'tiered', architecturalGrade: 'brutalist' },
        east: { position: 'east', type: 'tiered', architecturalGrade: 'brutalist' },
        north: { position: 'north', type: 'none', architecturalGrade: 'municipal' },
        south: { position: 'south', type: 'no_stand', grade: 'grade1_municipal' },
      };

      // Open ground ends with contextual horizon vista must NOT trigger penalty
      expect(hasMunicipalPenalty(openGroundsStadium)).toBe(false);
    });

    it('strictly caps stadium qualification to municipal when penalty gate is active', () => {
      const worldClassVenueWithOneScaffoldStand: any = {
        id: 'venue_penalty_test',
        name: 'Venue With One Scaffold Stand',
        shape: 'rectangular',
        capacity: 85000,
        turfQuality: 'pristine',
        lighting: { powerKw: 2400, type: 'corner_pylons', pylonCount: 4, timeOfDay: 'night' },
        stands: {
          west: { position: 'west', type: 'tiered', architecturalGrade: 'modern', hasVipSeats: true, hasVipZone: true, hasTransmissionArea: true },
          east: { position: 'east', type: 'tiered', architecturalGrade: 'municipal' }, // Penalty trigger
          north: { position: 'north', type: 'tiered', architecturalGrade: 'modern' },
          south: { position: 'south', type: 'tiered', architecturalGrade: 'modern' },
        },
        seats: { pattern: 'solid', style: 'classic_bucket', colors: ['#dc2626', '#ffffff'] },
      };

      // Due to the municipal scaffolding stand, rating is capped at municipal
      expect(getStadiumCertificationRating(worldClassVenueWithOneScaffoldStand)).toBe('municipal');

      // Once the east stand is upgraded to brutalist, certification reaches world class
      worldClassVenueWithOneScaffoldStand.stands.east.architecturalGrade = 'brutalist';
      expect(getStadiumCertificationRating(worldClassVenueWithOneScaffoldStand)).toBe('world');
    });
  });

  describe('5. Canvas 2D Procedural Rendering & Universal 4-Shape Support', () => {
    it('renders all 5 inherent seat archetypes without throwing', () => {
      const archetypes: SeatArchetype[] = [
        'tablones',
        'concrete_ledges',
        'industrial_flip',
        'theater_chairs',
        'modern_bucket',
      ];

      archetypes.forEach((arch) => {
        expect(() => {
          drawSeatArchetype(mockCtx, 100, 100, 8, 6, arch, '#dc2626', '#1e3a8a', 0, 0, false, true);
          drawSeatArchetype(mockCtx, 120, 100, 8, 6, arch, '#2563eb', '#1d4ed8', 2, 2, true, false);
        }).not.toThrow();
      });
    });

    it('renders architectural grade facades across all 5 grades and 4 orientations', () => {
      const grades: ArchitecturalGrade[] = ['municipal', 'brutalist', 'industrial', 'victorian', 'modern'];
      const orientations = ['north', 'south', 'east', 'west'] as const;

      grades.forEach((g) => {
        orientations.forEach((ori) => {
          expect(() => {
            drawArchitecturalGradeFacade(
              mockCtx,
              50,
              50,
              200,
              80,
              g,
              { element1: 'red', element2: 'raw', element3: 'yellow' },
              ori,
              false
            );
            drawArchitecturalGradeFacade(
              mockCtx,
              50,
              50,
              200,
              80,
              g,
              { element1: 'raw', element2: 'black', element3: 'raw' },
              ori,
              true
            );
          }).not.toThrow();
        });
      });
    });

    it('renders grade-specific solid underseat decking and scaffolding structures', () => {
      const standConfigs: StandConfig[] = [
        { position: 'west', type: 'tiered', architecturalGrade: 'municipal' },
        { position: 'west', type: 'tiered', architecturalGrade: 'brutalist' },
        { position: 'west', type: 'tiered', architecturalGrade: 'industrial' },
        { position: 'west', type: 'tiered', architecturalGrade: 'victorian' },
        { position: 'west', type: 'tiered', architecturalGrade: 'modern' },
      ];

      standConfigs.forEach((stand, idx) => {
        expect(() => {
          drawSolidUnderSeatDecking(mockCtx, stand, 40, 40, 100, 80, idx);
        }).not.toThrow();
      });
    });

    it('renders continuous coliseum bowl seamlessly with architectural grades in oval and round shapes', () => {
      const ovalStadium: any = {
        id: 'coliseum_test',
        name: 'Continuous Coliseum Bowl Test',
        shape: 'oval',
        capacity: 55000,
        stands: {
          west: { position: 'west', type: 'tiered', architecturalGrade: 'modern' },
          east: { position: 'east', type: 'tiered', architecturalGrade: 'modern' },
          north: { position: 'north', type: 'tiered', architecturalGrade: 'modern' },
          south: { position: 'south', type: 'tiered', architecturalGrade: 'modern' },
        },
        seats: { pattern: 'solid', style: 'classic_bucket', colors: ['#dc2626', '#ffffff'] },
      };

      const homeKit = { primaryColor: '#dc2626', secondaryColor: '#ffffff' };
      const awayKit = { primaryColor: '#2563eb', secondaryColor: '#ffffff' };

      expect(() => {
        drawContinuousColiseumBowl(
          mockCtx,
          ovalStadium,
          'monumental',
          'noon',
          homeKit as any,
          awayKit as any,
          'oval',
          undefined,
          'parking_lot',
          'crowded'
        );
      }).not.toThrow();

      // Also verify in round geometry
      expect(() => {
        drawContinuousColiseumBowl(
          mockCtx,
          ovalStadium,
          'monumental',
          'night',
          homeKit as any,
          awayKit as any,
          'round',
          undefined,
          'big_city',
          'crowded'
        );
      }).not.toThrow();
    });
  });
});
