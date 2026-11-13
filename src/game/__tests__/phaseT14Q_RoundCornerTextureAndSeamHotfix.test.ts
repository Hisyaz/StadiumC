/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import {
  drawRoundCornerStand,
  drawGoalEndStand,
  drawSingleTouchlineStand,
  drawOuterRearDelimitationWall,
  getCornerMiterGeometry,
  getShearedCornerPoint,
  getStandPerspectiveMetrics,
} from '../stadiumRenderer';
import { StandConfig, StadiumDefinition, calculateDynamicStandDepth } from '../../types/stadium';
import { HOME_KIT, AWAY_KIT } from '../constants';

interface RecordedPathOp {
  method: string;
  args: any[];
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}

function createTrackingContext() {
  const ops: RecordedPathOp[] = [];
  const state = {
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'middle',
  };

  const ctx = new Proxy(state as any, {
    get(target, prop: string) {
      if (prop in target) return target[prop];
      return (...args: any[]) => {
        ops.push({
          method: prop,
          args,
          fillStyle: target.fillStyle,
          strokeStyle: target.strokeStyle,
          lineWidth: target.lineWidth,
        });
        if (prop === 'measureText') return { width: 40 };
        if (prop === 'createPattern') return null;
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          return { addColorStop: vi.fn() };
        }
        return undefined;
      };
    },
    set(target, prop: string, val: any) {
      target[prop] = val;
      return true;
    },
  }) as CanvasRenderingContext2D;

  return { ctx, ops };
}

describe('Round Corner Visual & Seam Hotfix Regression Suite (Square & Rectangular Stadiums)', () => {
  it('draws every annular promenade and tier decking in drawRoundCornerStand as a single continuous closed polygon (1 moveTo per fill)', () => {
    const shapes: Array<'rectangular' | 'square'> = ['rectangular', 'square'];
    const corners: Array<'corner_sw' | 'corner_se' | 'corner_nw' | 'corner_ne'> = [
      'corner_sw',
      'corner_se',
      'corner_nw',
      'corner_ne',
    ];

    for (const shape of shapes) {
      for (const pos of corners) {
        const { ctx, ops } = createTrackingContext();
        const stand: StandConfig = {
          position: pos,
          type: 'round',
          cornerType: 'round',
          grade: 'grade3_industrial',
          tierCount: 2,
          rearWallMaterial: 'brick',
        };
        const adjSouth: StandConfig = {
          position: 'south',
          type: 'tiered',
          grade: 'grade3_industrial',
          tierCount: 2,
        };

        drawRoundCornerStand(
          ctx,
          stand,
          pos,
          200,
          800,
          150,
          650,
          140,
          140,
          HOME_KIT,
          AWAY_KIT,
          'night',
          undefined,
          adjSouth,
          undefined,
          undefined,
          undefined,
          'crowded',
          shape
        );

        // Extract every beginPath -> fill sequence and verify none contain > 1 moveTo (broken disjoint subpaths)
        let curMoveCount = 0;
        let inPath = false;
        let annularFillCount = 0;
        for (const op of ops) {
          if (op.method === 'beginPath') {
            inPath = true;
            curMoveCount = 0;
          } else if (op.method === 'moveTo' && inPath) {
            curMoveCount++;
          } else if (op.method === 'fill' && inPath) {
            expect(curMoveCount).toBe(1);
            annularFillCount++;
            inPath = false;
          } else if (op.method === 'stroke' && inPath) {
            inPath = false;
          }
        }
        // At least shadow + base + primary + frontPlinth + (promenade on south) + 2 tiers >= 5 filled polygons
        expect(annularFillCount).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('places outer rear wall strictly within [standDepth - 14 .. standDepth] with brick substrate outside on drawRoundCornerStand', () => {
    const { ctx, ops } = createTrackingContext();
    const stand: StandConfig = {
      position: 'corner_sw',
      type: 'round',
      cornerType: 'round',
      grade: 'grade3_industrial',
      tierCount: 2,
      rearWallMaterial: 'brick',
      hasRoof: false,
    };

    const left = 200;
    const bottom = 650;
    const depth = 140;

    drawRoundCornerStand(
      ctx,
      stand,
      'corner_sw',
      left,
      800,
      150,
      bottom,
      depth,
      depth,
      HOME_KIT,
      AWAY_KIT,
      'night',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'crowded',
      'square'
    );

    // Find the 14px outer rear wall stroke and verify its radius center is depth - 7 (strictly inside [depth-14..depth])
    const outerWallStroke = ops.find((op) => op.method === 'stroke' && op.lineWidth === 14);
    expect(outerWallStroke).toBeDefined();
    expect(outerWallStroke!.strokeStyle).toBe('#450a0a');

    // Look back at the moveTo immediately preceding the 14px outer wall stroke (u=0 -> y = bottom + (depth - 7))
    const outerWallIdx = ops.indexOf(outerWallStroke!);
    let wallStartMoveTo: RecordedPathOp | undefined;
    for (let i = outerWallIdx - 1; i >= 0; i--) {
      if (ops[i].method === 'moveTo') {
        wallStartMoveTo = ops[i];
        break;
      }
    }
    expect(wallStartMoveTo).toBeDefined();
    expect(wallStartMoveTo!.args[1]).toBeCloseTo(bottom + (depth - 7), 1);
  });

  it('aligns drawGoalEndStand (south) taper flush with round corner pGMax on both square and rectangular stadiums', () => {
    for (const shape of ['rectangular', 'square'] as const) {
      const { ctx, ops } = createTrackingContext();
      const southStand: StandConfig = {
        position: 'south',
        type: 'tiered',
        grade: 'grade3_industrial',
        tierCount: 2,
      };
      const cornerSW: StandConfig = {
        position: 'corner_sw',
        type: 'round',
        cornerType: 'round',
        grade: 'grade3_industrial',
        tierCount: 2,
      };
      const westStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade3_industrial',
        tierCount: 3, // Deeper touchline stand than corner (same scenario as user screenshot)
      };
      const stadiumDef = {
        id: `test_${shape}`,
        name: 'Test Ground',
        shape,
        stands: {
          west: westStand,
          south: southStand,
          east: { ...westStand, position: 'east' },
          corner_sw: cornerSW,
          corner_se: { ...cornerSW, position: 'corner_se' },
        },
      } as unknown as StadiumDefinition;

      const x = 180;
      const y = 2720;
      const w = 1500;
      const h = calculateDynamicStandDepth(southStand, shape);
      const cDepth = calculateDynamicStandDepth(cornerSW, shape);
      const cornerPersp = getStandPerspectiveMetrics(shape, cDepth, cDepth);
      const expectedEffTau = Math.min(cornerPersp.southTaperX, Math.round(cDepth * 0.45));

      drawGoalEndStand(ctx, southStand, x, y, w, h, 'south', HOME_KIT, AWAY_KIT, shape, 'night', 'big_city', undefined, undefined, undefined, stadiumDef);

      // Verify South Stand trapezoid clip uses expectedEffTau, NOT full unconstrained southTaperX (~1.05 * h)
      const clipBottomLeft = ops.find(
        (op) => op.method === 'lineTo' && op.args[1] === y + h && Math.abs(op.args[0] - (x - expectedEffTau)) <= 1
      );
      expect(clipBottomLeft).toBeDefined();

      // Verify no overhanging lineTo past expectedEffTau on the left side at y + h
      const unconstrainedLeft = x - getStandPerspectiveMetrics(shape, 120, h).southTaperX;
      const overhungOps = ops.filter(
        (op) => op.method === 'lineTo' && op.args[1] === y + h && op.args[0] <= unconstrainedLeft + 2
      );
      expect(overhungOps.length).toBe(0);

      // Verify corner pGMax matches the exact South Stand junction coordinate
      const cornerGeom = getCornerMiterGeometry('corner_sw', x, x + w, 220, y, cDepth, cDepth, cornerPersp);
      const ptGoal = getShearedCornerPoint(cornerGeom.pIn, cDepth, cDepth, Math.PI * 0.5, 'corner_sw', 0, cDepth, cornerPersp.southTaperX);
      expect(Math.abs(ptGoal.x - (x - expectedEffTau))).toBeLessThanOrEqual(1);
    }
  });

  it('keeps drawSingleTouchlineStand facade texture strictly inside the West/East outer rear walls', () => {
    const { ctx, ops } = createTrackingContext();
    const westStand: StandConfig = {
      position: 'west',
      type: 'tiered',
      grade: 'grade3_industrial',
      tierCount: 3,
      rearWallMaterial: 'brick',
    };

    const x = 60;
    const y = 220;
    const w = 160;
    const h = 2500;

    drawSingleTouchlineStand(ctx, westStand, x, y, w, h, 'west', HOME_KIT, AWAY_KIT, 'rectangular');

    // No draw32BitGrandstandMaterial fillRect should start to the left of the West stand outer rear wall `x`
    // (only the outer drop shadow fillRect at `x - 12` is outside `x`)
    const wideFacadeRectsOutsideWest = ops.filter(
      (op) => op.method === 'fillRect' && op.args[0] < x - 15 && op.args[2] > 20
    );
    expect(wideFacadeRectsOutsideWest.length).toBe(0);
  });

  it('skips conflicting tie-in blocks in drawOuterRearDelimitationWall for south when corners are round or tower', () => {
    const { ctx, ops } = createTrackingContext();
    const southStand: StandConfig = {
      position: 'south',
      type: 'tiered',
      grade: 'grade3_industrial',
      tierCount: 2,
      rearWallMaterial: 'brick',
    };
    const roundDef = {
      id: 'round_south_check',
      name: 'Round Corner Check',
      shape: 'square',
      stands: {
        south: southStand,
        corner_sw: { position: 'corner_sw', type: 'round', cornerType: 'round', tierCount: 2 },
        corner_se: { position: 'corner_se', type: 'tower', cornerType: 'tower', tierCount: 2 },
      },
    } as unknown as StadiumDefinition;

    drawOuterRearDelimitationWall(ctx, southStand, 200, 700, 600, 140, 'south', 'night', 60, 'square', roundDef, 0);

    // drawSouthCornerFacadeTieIn draws a 16x38 block at wX - 10 (= 200 - 60 - 10 = 130).
    // Verify it is NOT drawn when corners are round / tower.
    const tieInLeftBlocks = ops.filter(
      (op) => op.method === 'fillRect' && op.args[0] === 130 && op.args[2] === 16
    );
    expect(tieInLeftBlocks.length).toBe(0);
  });
});
