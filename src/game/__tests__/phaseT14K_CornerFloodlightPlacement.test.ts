import { describe, it, expect, vi } from 'vitest';
import {
  getStadiumFloodlightTowerPositions,
  drawAngledFloodlightTower,
  drawStadiumFloodlights,
} from '../stadiumRenderer';
import {
  StadiumDefinition,
  CornerFloodlightPlacement,
  CORNER_FLOODLIGHT_PLACEMENT_OPTIONS,
  resolveCornerFloodlightPlacement,
} from '../../types/stadium';
import { createDefaultStadium } from '../stadiumRegistry';

function createMockContext(): CanvasRenderingContext2D {
  const ctx: any = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
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
    setLineDash: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
  };
  return ctx as CanvasRenderingContext2D;
}

describe('Hotfix Phase T14K: Corner Floodlight Placement Subsystem (3 Authentic Typologies)', () => {
  it('T14K.1: CORNER_FLOODLIGHT_PLACEMENT_OPTIONS defines 3 authentic typologies with metadata', () => {
    expect(CORNER_FLOODLIGHT_PLACEMENT_OPTIONS).toHaveLength(3);
    const ids = CORNER_FLOODLIGHT_PLACEMENT_OPTIONS.map((o) => o.id);
    expect(ids).toContain('exterior_tower');
    expect(ids).toContain('integrated_parapet');
    expect(ids).toContain('corner_ground');

    const exteriorOpt = CORNER_FLOODLIGHT_PLACEMENT_OPTIONS.find((o) => o.id === 'exterior_tower')!;
    expect(exteriorOpt.label).toContain('Exterior Towers');
    expect(exteriorOpt.icon).toBe('🗼');

    const parapetOpt = CORNER_FLOODLIGHT_PLACEMENT_OPTIONS.find((o) => o.id === 'integrated_parapet')!;
    expect(parapetOpt.label).toContain('Parapet Clusters');
    expect(parapetOpt.icon).toBe('🏟️');

    const groundOpt = CORNER_FLOODLIGHT_PLACEMENT_OPTIONS.find((o) => o.id === 'corner_ground')!;
    expect(groundOpt.label).toContain('Corner Ground');
    expect(groundOpt.icon).toBe('🌱');
  });

  it('T14K.2: resolveCornerFloodlightPlacement correctly resolves default and user overrides', () => {
    const std = createDefaultStadium();

    // Default with stands present resolves to 'integrated_parapet'
    expect(resolveCornerFloodlightPlacement(std)).toBe('integrated_parapet');

    // Explicit override in stadium definition
    const stdExterior: StadiumDefinition = {
      ...std,
      lighting: {
        ...std.lighting,
        cornerFloodlightPlacement: 'exterior_tower',
      },
    };
    expect(resolveCornerFloodlightPlacement(stdExterior)).toBe('exterior_tower');

    // Function parameter override takes highest priority
    expect(resolveCornerFloodlightPlacement(stdExterior, 'corner_ground')).toBe('corner_ground');

    // If all corners are unbuilt (no-stand), default auto-resolves to 'corner_ground'
    const stdOpenCorners: StadiumDefinition = {
      ...std,
      lighting: { ...std.lighting, cornerFloodlightPlacement: undefined },
      stands: {
        ...std.stands,
        corner_nw: { ...std.stands.corner_nw, type: 'no_stand' },
        corner_ne: { ...std.stands.corner_ne, type: 'no_stand' },
        corner_sw: { ...std.stands.corner_sw, type: 'no_stand' },
        corner_se: { ...std.stands.corner_se, type: 'no_stand' },
      },
    };
    expect(resolveCornerFloodlightPlacement(stdOpenCorners)).toBe('corner_ground');
  });

  it('T14K.3: getStadiumFloodlightTowerPositions computes distinct spatial coordinates across all 3 typologies', () => {
    const std = createDefaultStadium();
    std.shape = 'rectangular';

    const parapetPositions = getStadiumFloodlightTowerPositions('rectangular', 'monumental', std, 0, 0, 'integrated_parapet');
    const exteriorPositions = getStadiumFloodlightTowerPositions('rectangular', 'monumental', std, 0, 0, 'exterior_tower');
    const groundPositions = getStadiumFloodlightTowerPositions('rectangular', 'monumental', std, 0, 0, 'corner_ground');

    expect(parapetPositions).toHaveLength(4);
    expect(exteriorPositions).toHaveLength(4);
    expect(groundPositions).toHaveLength(4);

    // Verify 4 distinct quadrants: nw, ne, sw, se
    const quadrants = ['nw', 'ne', 'sw', 'se'] as const;
    quadrants.forEach((q) => {
      const pParapet = parapetPositions.find((p) => p.quadrant === q)!;
      const pExterior = exteriorPositions.find((p) => p.quadrant === q)!;
      const pGround = groundPositions.find((p) => p.quadrant === q)!;

      expect(pParapet).toBeDefined();
      expect(pExterior).toBeDefined();
      expect(pGround).toBeDefined();

      // Exterior towers must be positioned outward onto the concourse plaza beyond the parapet
      if (q === 'nw') {
        expect(pExterior.x).toBeLessThan(pParapet.x);
        expect(pExterior.y).toBeLessThan(pParapet.y);
      } else if (q === 'ne') {
        expect(pExterior.x).toBeGreaterThan(pParapet.x);
        expect(pExterior.y).toBeLessThan(pParapet.y);
      } else if (q === 'sw') {
        expect(pExterior.x).toBeLessThan(pParapet.x);
        expect(pExterior.y).toBeGreaterThan(pParapet.y);
      } else if (q === 'se') {
        expect(pExterior.x).toBeGreaterThan(pParapet.x);
        expect(pExterior.y).toBeGreaterThan(pParapet.y);
      }

      // Corner ground infill towers must be grounded pitchside inside the open corner footprint
      if (q === 'nw') {
        expect(pGround.x).toBeGreaterThan(pExterior.x);
        expect(pGround.y).toBeGreaterThan(pExterior.y);
      } else if (q === 'ne') {
        expect(pGround.x).toBeLessThan(pExterior.x);
        expect(pGround.y).toBeGreaterThan(pExterior.y);
      }

      // Angles must point toward pitch center
      expect(typeof pParapet.angleTowardCenter).toBe('number');
      expect(typeof pExterior.angleTowardCenter).toBe('number');
      expect(typeof pGround.angleTowardCenter).toBe('number');
    });
  });

  it('T14K.4: Round/Oval coliseums adapt radial rim distances for exterior towers and corner grounds', () => {
    const std = createDefaultStadium();
    std.shape = 'round';

    const parapetPositions = getStadiumFloodlightTowerPositions('round', 'monumental', std, 0, 0, 'integrated_parapet');
    const exteriorPositions = getStadiumFloodlightTowerPositions('round', 'monumental', std, 0, 0, 'exterior_tower');
    const groundPositions = getStadiumFloodlightTowerPositions('round', 'monumental', std, 0, 0, 'corner_ground');

    expect(parapetPositions).toHaveLength(4);
    expect(exteriorPositions).toHaveLength(4);
    expect(groundPositions).toHaveLength(4);

    const nwParapet = parapetPositions.find((p) => p.quadrant === 'nw')!;
    const nwExterior = exteriorPositions.find((p) => p.quadrant === 'nw')!;
    const nwGround = groundPositions.find((p) => p.quadrant === 'nw')!;

    // In NW quadrant (top-left), further out means lower x and lower y
    expect(nwExterior.x).toBeLessThan(nwParapet.x);
    expect(nwExterior.y).toBeLessThan(nwParapet.y);

    // Inward on ground apron means closer to pitch center
    expect(nwGround.x).toBeGreaterThan(nwParapet.x);
    expect(nwGround.y).toBeGreaterThan(nwParapet.y);
  });

  it('T14K.5: drawAngledFloodlightTower renders foundations, plinths, and equipment sheds without errors', () => {
    const ctx = createMockContext();

    // 1. Exterior Tower: renders heavy concrete plinths with caution stripes
    drawAngledFloodlightTower(ctx, 400, 300, 0.5, 'night', 'nw', 'monumental', 'grade4_modern', 'exterior_tower');
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    expect(ctx.ellipse).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalled();

    // 2. Corner Ground: renders electrical equipment shed / transformer cabinet and safety rails
    drawAngledFloodlightTower(ctx, 400, 300, 0.5, 'night', 'nw', 'craven', 'grade2_classic', 'corner_ground');
    expect(ctx.strokeRect).toHaveBeenCalled();

    // 3. Parapet Coping: compact rim cluster
    drawAngledFloodlightTower(ctx, 400, 300, 0.5, 'noon', 'se', 'ascenso', 'grade1_municipal', 'integrated_parapet');
    expect(ctx.save).toHaveBeenCalled();
  });

  it('T14K.6: drawStadiumFloodlights executes seamlessly across all stadium definitions', () => {
    const ctx = createMockContext();
    const std = createDefaultStadium();

    // Execute with default integrated parapet
    drawStadiumFloodlights(ctx, 'monumental', 'night', 0, 0, std);
    expect(ctx.save).toHaveBeenCalled();

    // Execute with exterior tower
    const stdExterior: StadiumDefinition = {
      ...std,
      lighting: {
        ...std.lighting,
        cornerFloodlightPlacement: 'exterior_tower',
      },
    };
    drawStadiumFloodlights(ctx, 'monumental', 'sunset', 0, 0, stdExterior);

    // Execute with corner ground infill
    const stdGround: StadiumDefinition = {
      ...std,
      lighting: {
        ...std.lighting,
        cornerFloodlightPlacement: 'corner_ground',
      },
    };
    drawStadiumFloodlights(ctx, 'monumental', 'dawn', 0, 0, stdGround);
  });
});
