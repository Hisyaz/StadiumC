/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StadiumDefinition } from '../../types/stadium';
import {
  getGroundSubstrateColor,
  drawColiseumRadialSectorEndCap,
  drawColiseumNoStandSector,
  drawContinuousColiseumBowl,
  drawNoStandPerimeterAndBackdrop,
  drawStadiumApron,
  getStadiumFloodlightTowerPositions,
  getUniversalGroundsBounds,
} from '../stadiumRenderer';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from '../constants';

describe('PHASE T1: Round/Oval No-Stand Sector Removal & Ground-Matched Gapless Fill', () => {
  let ctx: CanvasRenderingContext2D;
  let strokeCalls: string[];
  let fillCalls: string[];
  let arcCalls: { x: number; y: number; r: number; sAngle: number; eAngle: number; counter?: boolean }[];
  let lineToCalls: { x: number; y: number }[];
  let moveToCalls: { x: number; y: number }[];
  let fillRectCalls: { x: number; y: number; w: number; h: number }[];
  let capturedFills: string[];
  let capturedStrokes: string[];

  beforeEach(() => {
    strokeCalls = [];
    fillCalls = [];
    arcCalls = [];
    lineToCalls = [];
    moveToCalls = [];
    fillRectCalls = [];
    capturedFills = [];
    capturedStrokes = [];

    ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(() => {
        strokeCalls.push('stroke');
        if (typeof ctx.strokeStyle === 'string') capturedStrokes.push(ctx.strokeStyle);
      }),
      fill: vi.fn(() => {
        fillCalls.push('fill');
        if (typeof ctx.fillStyle === 'string') capturedFills.push(ctx.fillStyle);
      }),
      arc: vi.fn((x: number, y: number, r: number, sAngle: number, eAngle: number, counter?: boolean) => {
        arcCalls.push({ x, y, r, sAngle, eAngle, counter });
      }),
      moveTo: vi.fn((x: number, y: number) => moveToCalls.push({ x, y })),
      lineTo: vi.fn((x: number, y: number) => lineToCalls.push({ x, y })),
      fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
        fillRectCalls.push({ x, y, w, h });
        if (typeof ctx.fillStyle === 'string') capturedFills.push(ctx.fillStyle);
      }),
      strokeRect: vi.fn(),
      setLineDash: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createPattern: vi.fn(() => null),
      measureText: vi.fn(() => ({ width: 40 })),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
  });

  describe('T1.1: Ground Substrate Color Matching', () => {
    it('returns exact substrate hex for diverse ground types and lighting conditions', () => {
      // Parking lots & runway
      expect(getGroundSubstrateColor('parking_lots', 'night')).toBe('#0b1120');
      expect(getGroundSubstrateColor('parking_lots', 'noon')).toBe('#334155');

      // Classical statues / brick pavers
      expect(getGroundSubstrateColor('classical_statues', 'noon')).toBe('#991b1b');
      expect(getGroundSubstrateColor('classical_statues', 'night')).toBe('#450a0a');

      // Potrero / dirt / savannah wadi
      expect(getGroundSubstrateColor('potrero_dirt', 'noon')).toBe('#78350f');
      expect(getGroundSubstrateColor('potrero_dirt', 'sunset')).toBe('#5a2208');

      // Park green lawn
      expect(getGroundSubstrateColor('park_recreation', 'noon')).toBe('#166534');

      // Marine water / harbor
      expect(getGroundSubstrateColor('marine_commercial_harbor', 'noon')).toBe('#0284c7');
      expect(getGroundSubstrateColor('marine_commercial_harbor', 'night')).toBe('#031730');
    });
  });

  describe('T1.2: Coliseum Radial Sector End-Cap Bulkheads & Coping', () => {
    it('draws structural concrete bulkhead and coping cap for round coliseum sector cut', () => {
      drawColiseumRadialSectorEndCap(
        ctx,
        'round',
        0.25 * Math.PI, // SE transition
        PITCH_CONFIG.CENTER_X,
        PITCH_CONFIG.CENTER_Y,
        PITCH_CONFIG.PITCH_TOP,
        PITCH_CONFIG.PITCH_BOTTOM,
        PITCH_CONFIG.PITCH_LEFT - 100,
        PITCH_CONFIG.PITCH_RIGHT + 100,
        240,
        140,
        'night',
        false
      );

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
      expect(strokeCalls.length).toBeGreaterThanOrEqual(4);
      expect(fillRectCalls.length).toBeGreaterThan(0);
      expect(capturedFills).toContain('#facc15');
    });

    it('draws structural oval junction end-caps at nw, ne, sw, se junctions', () => {
      drawColiseumRadialSectorEndCap(
        ctx,
        'oval',
        'nw',
        PITCH_CONFIG.CENTER_X,
        PITCH_CONFIG.CENTER_Y,
        PITCH_CONFIG.PITCH_TOP,
        PITCH_CONFIG.PITCH_BOTTOM,
        PITCH_CONFIG.PITCH_LEFT - 100,
        PITCH_CONFIG.PITCH_RIGHT + 100,
        240,
        140,
        'noon',
        false
      );

      expect(fillRectCalls.length).toBeGreaterThanOrEqual(2);
      expect(strokeCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('T1.3: Coliseum No-Stand Sector Renderer & Perimeter Barrier', () => {
    it('renders ground-matched gapless backdrop fill and curved perimeter barrier for round sector', () => {
      drawColiseumNoStandSector(
        ctx,
        'round',
        'north',
        { position: 'north', type: 'none', perimeterFinish: 'brick_wall' },
        PITCH_CONFIG.CENTER_X,
        PITCH_CONFIG.CENTER_Y,
        PITCH_CONFIG.PITCH_TOP,
        PITCH_CONFIG.PITCH_BOTTOM,
        PITCH_CONFIG.PITCH_LEFT - 100,
        PITCH_CONFIG.PITCH_RIGHT + 100,
        240,
        140,
        'parking_lots',
        'noon',
        HOME_KIT,
        'big_city'
      );

      expect(capturedFills).toContain('#334155');
      expect(arcCalls.length).toBeGreaterThanOrEqual(2);
      expect(fillRectCalls.length).toBeGreaterThan(0);
    });
  });

  describe('T1.4: drawContinuousColiseumBowl No-Stand Sector Removal', () => {
    it('cleanly omits seating steps, renders end-caps, and encloses active sectors in round coliseum with no-stand North', () => {
      const stadiumDef = {
        name: 'Coliseum Arena',
        shape: 'round',
        tier: 'monumental',
        grounds: 'classical_statues',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 2, grade: 'grade4_modern' },
          east: { position: 'east', type: 'tiered', tierCount: 2, grade: 'grade4_modern' },
          north: { position: 'north', type: 'none', perimeterFinish: 'stone_seawall' },
          south: { position: 'south', type: 'tiered', tierCount: 2, grade: 'grade4_modern' },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(
        ctx,
        stadiumDef,
        'monumental',
        'noon',
        HOME_KIT,
        AWAY_KIT,
        'round'
      );

      const expectedGroundCol = getGroundSubstrateColor('classical_statues', 'noon');
      expect(capturedFills).toContain(expectedGroundCol);
      expect(capturedFills).toContain('#facc15');
    });

    it('cleanly omits South seating, south promenade, and south facade when South is no-stand', () => {
      const stadiumDef = {
        name: 'Open South Coliseum',
        shape: 'round',
        tier: 'monumental',
        grounds: 'park_recreation',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 2 },
          east: { position: 'east', type: 'tiered', tierCount: 2 },
          north: { position: 'north', type: 'tiered', tierCount: 2 },
          south: { position: 'south', type: 'none', perimeterFinish: 'chainlink_fence' },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(
        ctx,
        stadiumDef,
        'monumental',
        'noon',
        HOME_KIT,
        AWAY_KIT,
        'round'
      );

      expect(capturedFills).toContain('#166534');
      expect(capturedFills).toContain('#facc15');
    });

    it('cleanly omits North and South ends in oval coliseums when set to no-stand', () => {
      const stadiumDef = {
        name: 'Oval Flank Ground',
        shape: 'oval',
        tier: 'monumental',
        grounds: 'potrero_dirt',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 2 },
          east: { position: 'east', type: 'tiered', tierCount: 2 },
          north: { position: 'north', type: 'no_stand', perimeterFinish: 'rustic_timber' },
          south: { position: 'south', type: 'tiered', tierCount: 2 },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(
        ctx,
        stadiumDef,
        'monumental',
        'sunset',
        HOME_KIT,
        AWAY_KIT,
        'oval'
      );

      expect(capturedFills).toContain('#5a2208');
    });
  });

  describe('T1.5: drawNoStandPerimeterAndBackdrop Gapless Buffer Merge', () => {
    it('expands base terrain ground buffer to universal grounds bounds with matching substrate color', () => {
      drawNoStandPerimeterAndBackdrop(
        ctx,
        { position: 'north', type: 'none', perimeterFinish: 'brick_wall' },
        PITCH_CONFIG.PITCH_LEFT,
        PITCH_CONFIG.PITCH_TOP - 20,
        PITCH_CONFIG.PITCH_RIGHT - PITCH_CONFIG.PITCH_LEFT,
        20,
        'north',
        'big_city',
        'noon',
        'classical_statues'
      );

      const expectedColor = getGroundSubstrateColor('classical_statues', 'noon');
      expect(capturedFills).toContain(expectedColor);

      const uBounds = getUniversalGroundsBounds(PITCH_CONFIG.CENTER_X, PITCH_CONFIG.CENTER_Y);
      const bgRect = fillRectCalls.find(
        (r) => r.y <= uBounds.top && r.w >= PITCH_CONFIG.PITCH_RIGHT - PITCH_CONFIG.PITCH_LEFT
      );
      expect(bgRect).toBeDefined();
    });
  });

  describe('T1.6: Concentric Round Track & Parapet Floodlight Anchoring', () => {
    it('draws 360-degree concentric circular track for shape === round', () => {
      drawStadiumApron(ctx, 'monumental', {
        shape: 'round',
        hasTrack: true,
        apronMaterial: 'grass',
      } as unknown as StadiumDefinition);

      const fullCircleArcs = arcCalls.filter(
        (a) => Math.abs(a.eAngle - Math.PI * 2) < 0.01 && a.sAngle === 0
      );
      expect(fullCircleArcs.length).toBeGreaterThanOrEqual(3);
    });

    it('anchors floodlight towers directly onto the 4 structural corner parapets / bowl rim with zero stray outer towers', () => {
      const towers = getStadiumFloodlightTowerPositions('round', 'monumental', {
        shape: 'round',
      } as unknown as StadiumDefinition);

      expect(towers).toHaveLength(4);
      expect(towers.map((t) => t.quadrant)).toEqual(['nw', 'ne', 'sw', 'se']);

      const cx = PITCH_CONFIG.CENTER_X;
      const cy = PITCH_CONFIG.CENTER_Y;
      for (const tower of towers) {
        const dist = Math.hypot(tower.x - cx, tower.y - cy);
        expect(dist).toBeGreaterThan(1200);
        expect(dist).toBeLessThan(2200);
      }
    });
  });
});
