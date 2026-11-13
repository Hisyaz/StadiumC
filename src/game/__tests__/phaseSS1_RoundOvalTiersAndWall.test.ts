/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTierChairRows,
  getWallTierChairRows,
  getStandChairRows,
  StadiumDefinition,
} from '../../types/stadium';
import {
  drawStadiumApron,
  drawContinuousColiseumBowl,
  getStadiumShapeMetrics,
} from '../stadiumRenderer';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from '../constants';

describe('HOTFIX PHASE SS1: Round/Oval Tiers, The Wall 16-Row Densities & Concentric Round Track', () => {
  let ctx: CanvasRenderingContext2D;
  let strokeCalls: string[];
  let fillCalls: string[];
  let arcCalls: { x: number; y: number; r: number; sAngle: number; eAngle: number; counter?: boolean }[];
  let lineToCalls: { x: number; y: number }[];
  let moveToCalls: { x: number; y: number }[];
  let fillRectCalls: { x: number; y: number; w: number; h: number }[];

  beforeEach(() => {
    strokeCalls = [];
    fillCalls = [];
    arcCalls = [];
    lineToCalls = [];
    moveToCalls = [];
    fillRectCalls = [];

    ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(() => strokeCalls.push('stroke')),
      fill: vi.fn(() => fillCalls.push('fill')),
      arc: vi.fn((x: number, y: number, r: number, sAngle: number, eAngle: number, counter?: boolean) => {
        arcCalls.push({ x, y, r, sAngle, eAngle, counter });
      }),
      moveTo: vi.fn((x: number, y: number) => moveToCalls.push({ x, y })),
      lineTo: vi.fn((x: number, y: number) => lineToCalls.push({ x, y })),
      fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
        fillRectCalls.push({ x, y, w, h });
      }),
      strokeRect: vi.fn(),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createPattern: vi.fn(() => null),
      strokeStyle: '#000000',
      fillStyle: '#000000',
      lineWidth: 1,
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D;
  });

  describe('SS1.1: The Wall Terrace Row Densities (16, 11, 6 Rows)', () => {
    it('returns exact canonical row counts for The Wall stand: Big=16, Medium=11, Small=6', () => {
      expect(getWallTierChairRows('small')).toBe(6);
      expect(getWallTierChairRows('medium')).toBe(11);
      expect(getWallTierChairRows('large')).toBe(16);
      expect(getWallTierChairRows(undefined)).toBe(11); // default medium
    });

    it('preserves standard tiered seating row counts: Small=2, Medium=3, Big=4', () => {
      expect(getTierChairRows('small')).toBe(2);
      expect(getTierChairRows('medium')).toBe(3);
      expect(getTierChairRows('large')).toBe(4);
      expect(getTierChairRows(undefined)).toBe(3);
    });

    it('correctly resolves stand rows via getStandChairRows for wall vs tiered stands', () => {
      const wallLarge = { position: 'west' as const, type: 'wall' as const, wallSize: 'large' as const };
      const wallMedium = { position: 'west' as const, type: 'wall' as const, wallSize: 'medium' as const };
      const wallSmall = { position: 'west' as const, type: 'wall' as const, wallSize: 'small' as const };
      const standardDeck = {
        position: 'west' as const,
        type: 'tiered' as const,
        tierCount: 1 as const,
        tiers: [{ size: 'large' as const }],
      };

      expect(getStandChairRows(wallLarge)).toBe(16);
      expect(getStandChairRows(wallMedium)).toBe(11);
      expect(getStandChairRows(wallSmall)).toBe(6);
      expect(getStandChairRows(standardDeck)).toBe(4);
    });
  });

  describe('SS1.2: Concentric Circular Running Track on Round Stadiums', () => {
    it('renders a true 360° concentric circular track centered at (cx, cy) on round stadiums', () => {
      const cx = PITCH_CONFIG.CENTER_X;
      const cy = PITCH_CONFIG.CENTER_Y;
      const roundStadium: StadiumDefinition = {
        id: 'test_round',
        name: 'Circular Coliseum',
        tier: 'monumental',
        shape: 'round',
        capacity: 75000,
        hasTrack: true,
        apronSetback: 'standard',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 2 },
          east: { position: 'east', type: 'tiered', tierCount: 2 },
          north: { position: 'north', type: 'tiered', tierCount: 2 },
          south: { position: 'south', type: 'tiered', tierCount: 2 },
          corner_nw: { position: 'corner_nw', type: 'tiered' },
          corner_ne: { position: 'corner_ne', type: 'tiered' },
          corner_se: { position: 'corner_se', type: 'tiered' },
          corner_sw: { position: 'corner_sw', type: 'tiered' },
        },
      } as unknown as StadiumDefinition;

      drawStadiumApron(ctx, 'monumental', roundStadium);

      // Verify that full 360° circular arcs centered at (cx, cy) were drawn for track bed, curbs, and lane lines
      const circularTrackArcs = arcCalls.filter(
        (a) => Math.abs(a.x - cx) < 1 && Math.abs(a.y - cy) < 1 && Math.abs(a.eAngle - Math.PI * 2) < 0.01
      );

      // Track bed + inner curb + outer curb + 7 lane dividers = at least 10 full circular arcs centered at (cx, cy)
      expect(circularTrackArcs.length).toBeGreaterThanOrEqual(10);

      // The track radius must be approximately metrics.trackRadiusX (1540px)
      const mainTrackArc = circularTrackArcs.find((a) => Math.abs(a.r - 1540) < 5);
      expect(mainTrackArc).toBeDefined();

      // Ensure no straight touchline segments from pTop to pBottom were drawn for the round track
      const straightTouchlineLines = lineToCalls.filter(
        (l) => l.y === PITCH_CONFIG.PITCH_BOTTOM || l.y === PITCH_CONFIG.PITCH_TOP
      );
      expect(straightTouchlineLines.length).toBe(0);
    });

    it('preserves Olympic straight touchlines and semicircular horseshoe end arcs on oval stadiums', () => {
      const ovalStadium: StadiumDefinition = {
        id: 'test_oval',
        name: 'Olympic Oval Ground',
        tier: 'monumental',
        shape: 'oval',
        capacity: 80000,
        hasTrack: true,
        apronSetback: 'standard',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 2 },
          east: { position: 'east', type: 'tiered', tierCount: 2 },
          north: { position: 'north', type: 'tiered', tierCount: 2 },
          south: { position: 'south', type: 'tiered', tierCount: 2 },
          corner_nw: { position: 'corner_nw', type: 'tiered' },
          corner_ne: { position: 'corner_ne', type: 'tiered' },
          corner_se: { position: 'corner_se', type: 'tiered' },
          corner_sw: { position: 'corner_sw', type: 'tiered' },
        },
      } as unknown as StadiumDefinition;

      drawStadiumApron(ctx, 'monumental', ovalStadium);

      // On oval stadiums, straight lines connecting pTop and pBottom are used
      const straightLines = lineToCalls.filter(
        (l) => l.y === PITCH_CONFIG.PITCH_TOP || l.y === PITCH_CONFIG.PITCH_BOTTOM
      );
      expect(straightLines.length).toBeGreaterThan(0);
    });
  });

  describe('SS1.3: Round & Oval Multi-Floor Tier Quality & Balcony Fascias', () => {
    it('renders elevated balcony fascias, drop shadows, and vomitories in a 3-tier round coliseum', () => {
      const round3Tier: StadiumDefinition = {
        id: 'coliseum_3tier',
        name: 'Tri-Tier Coliseum',
        tier: 'monumental',
        shape: 'round',
        capacity: 90000,
        hasTrack: false,
        stands: {
          west: {
            position: 'west',
            type: 'tiered',
            tierCount: 3,
            tiers: [
              { size: 'medium', fasciaMaterial: 'concrete' },
              { size: 'medium', fasciaMaterial: 'concrete' },
              { size: 'medium', fasciaMaterial: 'steel' },
            ],
          },
          east: { position: 'east', type: 'tiered', tierCount: 3 },
          north: { position: 'north', type: 'tiered', tierCount: 3 },
          south: { position: 'south', type: 'tiered', tierCount: 3 },
          corner_nw: { position: 'corner_nw', type: 'tiered' },
          corner_ne: { position: 'corner_ne', type: 'tiered' },
          corner_se: { position: 'corner_se', type: 'tiered' },
          corner_sw: { position: 'corner_sw', type: 'tiered' },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(
        ctx,
        round3Tier,
        'monumental',
        'noon',
        HOME_KIT,
        AWAY_KIT,
        'round'
      );

      // In a 3-tier coliseum, there are 2 tier breaks (between T0-T1 and T1-T2)
      // Each tier break produces a structural fascia ribbon and radial vomitory access portals
      expect(strokeCalls.length).toBeGreaterThan(20);
      expect(fillRectCalls.length).toBeGreaterThan(10);
    });

    it('renders The Wall monolithic 16-row terrace on round coliseums with crash barriers', () => {
      const roundWall: StadiumDefinition = {
        id: 'coliseum_wall',
        name: 'The Great Circular Wall',
        tier: 'monumental',
        shape: 'round',
        capacity: 85000,
        hasTrack: false,
        stands: {
          west: {
            position: 'west',
            type: 'wall',
            wallSize: 'large', // Big = 16 Rows
          },
          east: { position: 'east', type: 'wall', wallSize: 'large' },
          north: { position: 'north', type: 'wall', wallSize: 'large' },
          south: { position: 'south', type: 'wall', wallSize: 'large' },
          corner_nw: { position: 'corner_nw', type: 'tiered' },
          corner_ne: { position: 'corner_ne', type: 'tiered' },
          corner_se: { position: 'corner_se', type: 'tiered' },
          corner_sw: { position: 'corner_sw', type: 'tiered' },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(
        ctx,
        roundWall,
        'monumental',
        'noon',
        HOME_KIT,
        AWAY_KIT,
        'round'
      );

      // Crash barriers are drawn on alternating rows (16 rows total -> 8 rows with crash barriers)
      expect(strokeCalls.length).toBeGreaterThan(0);
      expect(fillCalls.length).toBeGreaterThan(16);
    });
  });
});
