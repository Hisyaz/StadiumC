/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  StadiumDefinition,
  StadiumShape,
} from '../../types/stadium';
import {
  getStadiumFloodlightTowerPositions,
  drawAngledFloodlightTower,
  drawStadiumFloodlights,
  drawSouthEntranceGatehousePavilion,
  drawOuterRearDelimitationWall,
  drawCurvedSouthBowlFacade,
} from '../stadiumRenderer';
import { PITCH_CONFIG } from '../constants';

describe('HOTFIX PHASE SS2: Clean Parapet Floodlight Anchors & Structural Outer Facades', () => {
  let ctx: CanvasRenderingContext2D;
  let strokeCalls: string[];
  let fillCalls: string[];
  let arcCalls: { x: number; y: number; r: number; sAngle: number; eAngle: number; counter?: boolean }[];
  let fillRectCalls: { x: number; y: number; w: number; h: number }[];
  let strokeRectCalls: { x: number; y: number; w: number; h: number }[];
  let rotateCalls: number[];
  let translateCalls: { x: number; y: number }[];

  beforeEach(() => {
    strokeCalls = [];
    fillCalls = [];
    arcCalls = [];
    fillRectCalls = [];
    strokeRectCalls = [];
    rotateCalls = [];
    translateCalls = [];

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
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      ellipse: vi.fn(),
      fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
        fillRectCalls.push({ x, y, w, h });
      }),
      strokeRect: vi.fn((x: number, y: number, w: number, h: number) => {
        strokeRectCalls.push({ x, y, w, h });
      }),
      rotate: vi.fn((angle: number) => rotateCalls.push(angle)),
      translate: vi.fn((x: number, y: number) => translateCalls.push({ x, y })),
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

  describe('SS2.1: Clean Parapet Floodlight Anchors & Zero Parallax Drift', () => {
    it('anchors the 4 floodlight towers directly to the corner parapet apexes with zero camera parallax drift in Rectangular stadiums', () => {
      const cx = PITCH_CONFIG.CENTER_X;
      const cy = PITCH_CONFIG.CENTER_Y;

      // Base positions with pX=0, pY=0
      const baseTowers = getStadiumFloodlightTowerPositions('rectangular', 'monumental', undefined, 0, 0);
      expect(baseTowers).toHaveLength(4);

      // Verify quadrant IDs
      const [nw, ne, sw, se] = baseTowers;
      expect(nw.quadrant).toBe('nw');
      expect(ne.quadrant).toBe('ne');
      expect(sw.quadrant).toBe('sw');
      expect(se.quadrant).toBe('se');

      // NW is north-west of center (x < cx, y < cy)
      expect(nw.x).toBeLessThan(cx);
      expect(nw.y).toBeLessThan(cy);
      // NE is north-east of center (x > cx, y < cy)
      expect(ne.x).toBeGreaterThan(cx);
      expect(ne.y).toBeLessThan(cy);
      // SW is south-west of center (x < cx, y > cy)
      expect(sw.x).toBeLessThan(cx);
      expect(sw.y).toBeGreaterThan(cy);
      // SE is south-east of center (x > cx, y > cy)
      expect(se.x).toBeGreaterThan(cx);
      expect(se.y).toBeGreaterThan(cy);

      // Parapet Invariance: towers anchored to physical concrete parapet must NOT wander when camera shifts
      const shiftedTowers = getStadiumFloodlightTowerPositions('rectangular', 'monumental', undefined, 250, 150);
      expect(shiftedTowers[0].x).toBe(baseTowers[0].x);
      expect(shiftedTowers[0].y).toBe(baseTowers[0].y);
      expect(shiftedTowers[1].x).toBe(baseTowers[1].x);
      expect(shiftedTowers[1].y).toBe(baseTowers[1].y);
      expect(shiftedTowers[2].x).toBe(baseTowers[2].x);
      expect(shiftedTowers[2].y).toBe(baseTowers[2].y);
      expect(shiftedTowers[3].x).toBe(baseTowers[3].x);
      expect(shiftedTowers[3].y).toBe(baseTowers[3].y);
    });

    it('anchors towers directly to the 4 quadrant transition rims of Round and Oval coliseum bowls', () => {
      const cx = PITCH_CONFIG.CENTER_X;
      const cy = PITCH_CONFIG.CENTER_Y;

      const roundTowers = getStadiumFloodlightTowerPositions('round', 'monumental', undefined, 0, 0);
      const ovalTowers = getStadiumFloodlightTowerPositions('oval', 'monumental', undefined, 0, 0);

      expect(roundTowers).toHaveLength(4);
      expect(ovalTowers).toHaveLength(4);

      // Verify all angles point directly toward pitch center (cx, cy)
      for (const t of roundTowers) {
        const dx = cx - t.x;
        const dy = cy - t.y;
        const expectedAngle = Math.atan2(dy, dx);
        expect(t.angleTowardCenter).toBeCloseTo(expectedAngle, 4);
      }

      // Verify zero camera drift on round & oval stadiums
      const shiftedRound = getStadiumFloodlightTowerPositions('round', 'monumental', undefined, 180, 90);
      for (let i = 0; i < 4; i++) {
        expect(shiftedRound[i].x).toBe(roundTowers[i].x);
        expect(shiftedRound[i].y).toBe(roundTowers[i].y);
      }
    });

    it('correctly adapts floodlight positions to dynamic stand tier depth scaling in stadiums', () => {
      const compactStadium = {
        id: 'compact_std',
        name: 'Compact Ground',
        tier: 'ascenso',
        shape: 'rectangular',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 1 },
          east: { position: 'east', type: 'tiered', tierCount: 1 },
          north: { position: 'north', type: 'tiered', tierCount: 1 },
          south: { position: 'south', type: 'tiered', tierCount: 1 },
          corner_nw: { position: 'corner_nw', type: 'tiered' },
          corner_ne: { position: 'corner_ne', type: 'tiered' },
          corner_se: { position: 'corner_se', type: 'tiered' },
          corner_sw: { position: 'corner_sw', type: 'tiered' },
        },
      } as unknown as StadiumDefinition;

      const monumentalStadium = {
        id: 'monumental_std',
        name: 'Mega Arena',
        tier: 'monumental',
        shape: 'rectangular',
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 4 },
          east: { position: 'east', type: 'tiered', tierCount: 4 },
          north: { position: 'north', type: 'tiered', tierCount: 4 },
          south: { position: 'south', type: 'tiered', tierCount: 4 },
          corner_nw: { position: 'corner_nw', type: 'tiered' },
          corner_ne: { position: 'corner_ne', type: 'tiered' },
          corner_se: { position: 'corner_se', type: 'tiered' },
          corner_sw: { position: 'corner_sw', type: 'tiered' },
        },
      } as unknown as StadiumDefinition;

      const compactTowers = getStadiumFloodlightTowerPositions('rectangular', 'ascenso', compactStadium);
      const monumentalTowers = getStadiumFloodlightTowerPositions('rectangular', 'monumental', monumentalStadium);

      // In a 4-tier monumental stadium, the stands are much deeper, so the parapet floodlights sit further out
      expect(monumentalTowers[0].x).toBeLessThan(compactTowers[0].x);
      expect(monumentalTowers[0].y).toBeLessThan(compactTowers[0].y);
      expect(monumentalTowers[1].x).toBeGreaterThan(compactTowers[1].x);
      expect(monumentalTowers[3].y).toBeGreaterThan(compactTowers[3].y);
    });
  });

  describe('SS2.2: Compact Parapet Cluster Structure & Volumetric Light Cones', () => {
    it('renders compact parapet-mounted structural pylon clusters with multi-head pixel lamps and aviation beacon', () => {
      const tx = 400;
      const ty = 300;
      const angleTowardCenter = Math.PI * 0.25;

      drawAngledFloodlightTower(
        ctx,
        tx,
        ty,
        angleTowardCenter,
        'night',
        'nw',
        'monumental',
        'grade4_modern'
      );

      // Verify foundation plinth was drawn at (tx, ty)
      const plinth = fillRectCalls.find(
        (r) => r.x === tx - 12 && r.y === ty - 5 && r.w === 24 && r.h === 10
      );
      expect(plinth).toBeDefined();

      // Verify head rotation toward pitch center
      expect(rotateCalls).toContain(angleTowardCenter);

      // Verify red aviation obstruction beacon was drawn
      const redBeaconArc = arcCalls.find(
        (a) => a.x === tx && Math.abs(a.r - 2.5) < 0.1 && Math.abs(a.eAngle - Math.PI * 2) < 0.01
      );
      expect(redBeaconArc).toBeDefined();

      // Verify floodlight lamp array and casing rectangles were drawn
      expect(fillRectCalls.length).toBeGreaterThan(25);
    });

    it('drawStadiumFloodlights renders all 4 corner parapet clusters across any shape', () => {
      const shapes: StadiumShape[] = ['rectangular', 'square', 'round', 'oval'];

      for (const shape of shapes) {
        fillRectCalls = [];
        const stadiumDef = {
          id: `test_${shape}`,
          name: `${shape} Venue`,
          tier: 'monumental',
          shape,
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

        drawStadiumFloodlights(ctx, 'monumental', 'night', 0, 0, stadiumDef);

        // 4 corner towers drawn with foundation plinths and lamp arrays
        expect(fillRectCalls.length).toBeGreaterThanOrEqual(80);
      }
    });
  });

  describe('SS2.3: South Main Entrance Gatehouse Pavilion Across All 4 Shapes', () => {
    it('renders the iconic South Gatehouse Pavilion with deep blue glass atrium, turnstiles, and stone coping', () => {
      const cx = PITCH_CONFIG.CENTER_X;
      const wallY = PITCH_CONFIG.PITCH_BOTTOM + 160;
      const wallW = 1200;

      drawSouthEntranceGatehousePavilion(ctx, cx, wallY, wallW, 'night', 'rectangular', 'grade4_modern');

      // 1. Foundation plinth and entry stairs
      const stepNosing = fillRectCalls.find((r) => Math.abs(r.h - 1.5) < 0.1);
      expect(stepNosing).toBeDefined();

      // 2. Main concrete gatehouse block and flanking pylons
      expect(fillRectCalls.length).toBeGreaterThan(15);

      // 3. Flanking turnstiles with green LED access indicators
      const turnstiles = fillRectCalls.filter((r) => r.w === 4 && r.h === 2);
      expect(turnstiles.length).toBeGreaterThanOrEqual(2);

      const greenLeds = fillRectCalls.filter((r) => r.w === 2 && r.h === 2);
      expect(greenLeds.length).toBeGreaterThanOrEqual(2);
    });

    it('integrates seamlessly with high-oblique rectilinear flare and round/oval bowl curvature', () => {
      const cx = PITCH_CONFIG.CENTER_X;
      const wallY = PITCH_CONFIG.PITCH_BOTTOM + 180;
      const wallW = 1400;

      // Rectangular high-oblique perspective stadium
      fillRectCalls = [];
      drawSouthEntranceGatehousePavilion(ctx, cx, wallY, wallW, 'night', 'rectangular', 'grade4_modern');
      expect(fillRectCalls.length).toBeGreaterThan(15);

      // Square high-oblique perspective stadium
      fillRectCalls = [];
      drawSouthEntranceGatehousePavilion(ctx, cx, wallY, wallW, 'night', 'square', 'grade4_modern');
      expect(fillRectCalls.length).toBeGreaterThan(15);

      // Round stadium
      fillRectCalls = [];
      drawSouthEntranceGatehousePavilion(ctx, cx, wallY, wallW, 'night', 'round', 'grade4_modern');
      expect(fillRectCalls.length).toBeGreaterThan(15);

      // Oval stadium
      fillRectCalls = [];
      drawSouthEntranceGatehousePavilion(ctx, cx, wallY, wallW, 'night', 'oval', 'grade4_modern');
      expect(fillRectCalls.length).toBeGreaterThan(15);
    });
  });

  describe('SS2.4: Structural Outer Facades Across All 4 Shapes', () => {
    it('renders structural rear delimitation walls with stone coping caps and buttress relief across orientations', () => {
      const stand = { position: 'south' as const, type: 'tiered' as const, rearWallMaterial: 'brick' as const };
      fillRectCalls = [];

      drawOuterRearDelimitationWall(ctx, stand, 200, 400, 800, 100, 'south', 'night');

      // Brick wall substrate, course lines, stone coping caps, and drop shadow
      expect(fillRectCalls.length).toBeGreaterThan(10);
    });

    it('renders curved southern exterior bowl facade with radial buttresses and integrated south gatehouse', () => {
      const stand = { position: 'south' as const, type: 'tiered' as const, grade: 'grade4_modern' as const };
      fillRectCalls = [];
      arcCalls = [];

      drawCurvedSouthBowlFacade(ctx, stand, PITCH_CONFIG.CENTER_X, PITCH_CONFIG.CENTER_Y, 700, 'night', 'round');

      // Curved wall arcs drawn
      expect(arcCalls.length).toBeGreaterThan(5);
      // Buttresses, turnstiles, and south gatehouse drawn
      expect(fillRectCalls.length).toBeGreaterThan(15);
    });
  });
});
