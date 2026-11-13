import { describe, it, expect, vi } from 'vitest';
import {
  calculateStandCapacity,
  calculateStandPhysicalDepth,
  calculateDynamicStandDepth,
  StandConfig,
  StandType,
} from '../../types/stadium';
import {
  isVipBuildingStand,
  drawVipBuildingStand,
  drawPositionalBackdropVista,
  drawBespokeCornerLandmark,
} from '../stadiumRenderer';
import { drawAerialExposedSeatingBowl } from '../skyCamRenderer';
import { LA_BOMBONERA } from '../stadiumRegistry';
import { HOME_KIT, AWAY_KIT } from '../constants';

// Helper to create a comprehensive mock CanvasRenderingContext2D
function createMockContext(): CanvasRenderingContext2D {
  const gradientMock = {
    addColorStop: vi.fn(),
  };

  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    clip: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 40 })),
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    createLinearGradient: vi.fn(() => gradientMock),
    createRadialGradient: vi.fn(() => gradientMock),
    drawImage: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    font: '10px monospace',
    textAlign: 'start',
    textBaseline: 'alphabetic',
  } as unknown as CanvasRenderingContext2D;
}

describe('Phase T2: VIP Hospitality Building Architecture', () => {
  it('recognizes "vip_building" as a valid StandType', () => {
    const validTypes: StandType[] = ['tiered', 'wall', 'vip_building', 'none', 'no_stand'];
    expect(validTypes).toContain('vip_building');
  });

  it('calculates physical depth of 110px for vip_building stands', () => {
    const vipStand: StandConfig = {
      position: 'east',
      type: 'vip_building',
    };
    const depth = calculateStandPhysicalDepth(vipStand);
    expect(depth).toBe(110);
    expect(calculateDynamicStandDepth(vipStand)).toBe(110);
  });

  it('calculates capacity for vip_building stands based on floor and lower stand formula', () => {
    const vipStand: StandConfig = {
      position: 'east',
      type: 'vip_building',
    };
    const cap = calculateStandCapacity(vipStand, 'rectangular', 'east');
    // Phase T7 dynamic calculation: (4 floors * 1100) + 2000 (default medium lower stand) = 6400
    expect(cap).toBe(6400);
  });

  it('isVipBuildingStand returns true only for vip_building type', () => {
    expect(isVipBuildingStand({ position: 'east', type: 'vip_building' })).toBe(true);
    expect(isVipBuildingStand({ position: 'east', type: 'wall' })).toBe(false);
    expect(isVipBuildingStand({ position: 'east', type: 'tiered' })).toBe(false);
    expect(isVipBuildingStand({ position: 'east', type: 'no_stand' })).toBe(false);
    expect(isVipBuildingStand(undefined)).toBe(false);
  });

  it('renders drawVipBuildingStand without throwing across all 4 orientations', () => {
    const ctx = createMockContext();
    const vipStand: StandConfig = {
      position: 'east',
      type: 'vip_building',
      primaryColor: '#1d4ed8',
      secondaryColor: '#eab308',
      tierCount: 4,
    };

    // East touchline
    expect(() => {
      drawVipBuildingStand(
        ctx,
        vipStand,
        1500,
        200,
        110,
        800,
        'east',
        'night',
        HOME_KIT,
        AWAY_KIT
      );
    }).not.toThrow();

    // West touchline
    expect(() => {
      drawVipBuildingStand(
        ctx,
        vipStand,
        100,
        200,
        110,
        800,
        'west',
        'noon',
        HOME_KIT,
        AWAY_KIT
      );
    }).not.toThrow();

    // North endzone
    expect(() => {
      drawVipBuildingStand(
        ctx,
        vipStand,
        200,
        50,
        1200,
        110,
        'north',
        'sunset',
        HOME_KIT,
        AWAY_KIT
      );
    }).not.toThrow();

    // South endzone
    expect(() => {
      drawVipBuildingStand(
        ctx,
        vipStand,
        200,
        1050,
        1200,
        110,
        'south',
        'night',
        HOME_KIT,
        AWAY_KIT
      );
    }).not.toThrow();

    // Verify drawing calls occurred
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.strokeRect).toHaveBeenCalled();
  });

  it('has Estadio Alberto J. Armando (La Bombonera) East stand configured as vip_building', () => {
    expect(LA_BOMBONERA.stands.east).toBeDefined();
    expect(LA_BOMBONERA.stands.east.type).toBe('vip_building');
    expect(LA_BOMBONERA.stands.east.primaryColor).toBe('#1d4ed8');
    expect(LA_BOMBONERA.stands.east.secondaryColor).toBe('#eab308');
    expect(LA_BOMBONERA.capacity).toBeGreaterThan(45000);
  });
});

describe('Phase T2: Deeply Elaborated Positional Contextual Backdrops & Bespoke Landmarks', () => {
  it('renders orientation-tailored positional backdrop vistas without error', () => {
    const ctx = createMockContext();

    // West Stand opening: Sunset residential hillside & railway spur
    expect(() => {
      drawPositionalBackdropVista(ctx, 0, 0, 300, 800, 'west', 'small_city', 'sunset');
    }).not.toThrow();

    // East Stand opening: Riverfront quay, barges, gantry crane
    expect(() => {
      drawPositionalBackdropVista(ctx, 1000, 0, 300, 800, 'east', 'big_city', 'noon');
    }).not.toThrow();

    // North Stand opening: Alpine peaks & brick viaduct
    expect(() => {
      drawPositionalBackdropVista(ctx, 0, 0, 1400, 200, 'north', 'mountains', 'night');
    }).not.toThrow();

    // South Stand opening: Tramway, fan plaza, matchday stalls
    expect(() => {
      drawPositionalBackdropVista(ctx, 0, 900, 1400, 200, 'south', 'big_city', 'noon');
    }).not.toThrow();
  });

  it('renders bespoke 4-corner landmarks without error', () => {
    const ctx = createMockContext();

    // NW: Floodlight pylon & transformer cage
    expect(() => {
      drawBespokeCornerLandmark(ctx, 'corner_nw', 50, 50, 80, 80, 'night');
    }).not.toThrow();

    // NE: Red-brick Victorian clock tower
    expect(() => {
      drawBespokeCornerLandmark(ctx, 'corner_ne', 950, 50, 80, 80, 'noon');
    }).not.toThrow();

    // SW: Biergarten terrace with parasols
    expect(() => {
      drawBespokeCornerLandmark(ctx, 'corner_sw', 50, 850, 80, 80, 'sunset');
    }).not.toThrow();

    // SE: Heritage turnstile kiosk gatehouse
    expect(() => {
      drawBespokeCornerLandmark(ctx, 'corner_se', 950, 850, 80, 80, 'night');
    }).not.toThrow();
  });

  it('draws aerial exposed seating bowl with vip_building in skyCamRenderer', () => {
    const ctx = createMockContext();
    expect(() => {
      drawAerialExposedSeatingBowl(
        ctx,
        1000,
        700,
        2400,
        1600,
        'rectangular',
        LA_BOMBONERA,
        'night'
      );
    }).not.toThrow();

    expect(() => {
      drawAerialExposedSeatingBowl(
        ctx,
        1000,
        700,
        2400,
        1600,
        'oval',
        LA_BOMBONERA,
        'noon'
      );
    }).not.toThrow();
  });
});
