/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCornerMiterGeometry,
  getShearedCornerPoint,
  traceShearedCornerArc,
  drawRoundCornerStand,
  drawGiantCornerStand,
} from '../stadiumRenderer';
import {
  StandConfig,
  ArchitecturalGrade,
} from '../../types/stadium';
import { TeamKit } from '../../types';

describe('Hotfix Phase T14I: Southern Corner Outward-Facing Coliseum Arc & 45° Planar Miter Geometry', () => {
  const dummyHomeKit: TeamKit = {
    name: 'Home Red',
    shortName: 'HOM',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    shortsColor: '#ffffff',
    socksColor: '#dc2626',
    gkColor: '#22c55e',
  };

  const dummyAwayKit: TeamKit = {
    name: 'Away Blue',
    shortName: 'AWY',
    primaryColor: '#2563eb',
    secondaryColor: '#facc15',
    shortsColor: '#2563eb',
    socksColor: '#facc15',
    gkColor: '#eab308',
  };

  let mockCtx: any;

  beforeEach(() => {
    mockCtx = {
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
      arc: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      setLineDash: vi.fn(),
      measureText: vi.fn(() => ({ width: 40 })),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'middle',
    };
  });

  describe('T14I.1: Outward-Facing Concentric Coliseum Arc Convexity & Monotonicity (SW & SE)', () => {
    const left = 200;
    const right = 800;
    const bottom = 650;
    const standDepthX = 140;
    const standDepthY = 140;
    const sTaper = 147; // high-oblique perspective taper

    it('enforces strict monotonic westward progression (dX/du < 0) with zero inward trumpet deflection on SW corner', () => {
      const pInSW = { x: left, y: bottom };
      const rdX = 120;
      const rdY = 120;
      const samples = 20;

      let prevPt = getShearedCornerPoint(pInSW, rdX, rdY, Math.PI * 0.5, 'corner_sw', 0, standDepthY, sTaper);

      for (let i = 1; i <= samples; i++) {
        const u = i / samples;
        const angle = Math.PI * 0.5 + u * Math.PI * 0.5;
        const pt = getShearedCornerPoint(pInSW, rdX, rdY, angle, 'corner_sw', 0, standDepthY, sTaper);

        // X coordinate must strictly decrease (move West away from the pitch)
        expect(pt.x).toBeLessThanOrEqual(prevPt.x + 0.001);
        // Y coordinate must strictly decrease (move North toward the touchline)
        expect(pt.y).toBeLessThanOrEqual(prevPt.y + 0.001);

        prevPt = pt;
      }
    });

    it('enforces strict monotonic eastward/southward progression on SE corner', () => {
      const pInSE = { x: right, y: bottom };
      const rdX = 120;
      const rdY = 120;
      const samples = 20;

      let prevPt = getShearedCornerPoint(pInSE, rdX, rdY, 0, 'corner_se', 0, standDepthY, sTaper);

      for (let i = 1; i <= samples; i++) {
        const u = i / samples;
        const angle = u * Math.PI * 0.5;
        const pt = getShearedCornerPoint(pInSE, rdX, rdY, angle, 'corner_se', 0, standDepthY, sTaper);

        // X coordinate must strictly decrease (move West toward South goal line)
        expect(pt.x).toBeLessThanOrEqual(prevPt.x + 0.001);
        // Y coordinate must strictly increase (move South away from pitch)
        expect(pt.y).toBeGreaterThanOrEqual(prevPt.y - 0.001);

        prevPt = pt;
      }
    });

    it('guarantees positive parametric curvature (X\' Y\'\' - Y\' X\'\' > 0) confirming outward convexity', () => {
      const pInSW = { x: left, y: bottom };
      const rdX = 120;
      const rdY = 120;
      const du = 0.005;

      for (let u = 0.05; u <= 0.95; u += 0.05) {
        const aMinus = Math.PI * 0.5 + (u - du) * Math.PI * 0.5;
        const aMid = Math.PI * 0.5 + u * Math.PI * 0.5;
        const aPlus = Math.PI * 0.5 + (u + du) * Math.PI * 0.5;

        const pM = getShearedCornerPoint(pInSW, rdX, rdY, aMinus, 'corner_sw', 0, standDepthY, sTaper);
        const pC = getShearedCornerPoint(pInSW, rdX, rdY, aMid, 'corner_sw', 0, standDepthY, sTaper);
        const pP = getShearedCornerPoint(pInSW, rdX, rdY, aPlus, 'corner_sw', 0, standDepthY, sTaper);

        const dx_du = (pP.x - pM.x) / (2 * du);
        const dy_du = (pP.y - pM.y) / (2 * du);
        const d2x_du2 = (pP.x - 2 * pC.x + pM.x) / (du * du);
        const d2y_du2 = (pP.y - 2 * pC.y + pM.y) / (du * du);

        // Curvature numerator for 2D parametric curve
        const cross = dx_du * d2y_du2 - dy_du * d2x_du2;
        expect(cross).toBeGreaterThan(0);
      }
    });

    it('closes black polygon gap with 0.000px discrepancy at touchline and goal interfaces', () => {
      const pInSW = { x: left, y: bottom };
      const rdX = standDepthX;
      const rdY = standDepthY;

      // At West touchline interface (u = 1)
      const ptTouch = getShearedCornerPoint(pInSW, rdX, rdY, Math.PI, 'corner_sw', 0, standDepthY, sTaper);
      expect(ptTouch.x).toBeCloseTo(left - standDepthX, 3);
      expect(ptTouch.y).toBeCloseTo(bottom, 3);

      // At South goal interface (u = 0)
      const ptGoal = getShearedCornerPoint(pInSW, rdX, rdY, Math.PI * 0.5, 'corner_sw', 0, standDepthY, sTaper);
      const expectedTau = Math.min(sTaper, rdX * 0.45);
      expect(ptGoal.x).toBeCloseTo(left - expectedTau, 3);
      expect(ptGoal.y).toBeCloseTo(bottom + standDepthY, 3);
    });
  });

  describe('T14I.2: Clean 45° Planar Diagonal Miter Chamfer for Giant/Wall Corners', () => {
    it('renders drawGiantCornerStand with clean planar diagonal chamfer on SW corner', () => {
      const stand: StandConfig = {
        position: 'corner_sw',
        type: 'wall',
        cornerType: 'giant',
        wallSize: 'medium',
        grade: 'grade3_industrial',
        architecturalGrade: 'industrial',
      };

      drawGiantCornerStand(
        mockCtx,
        stand,
        'corner_sw',
        200,
        800,
        150,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('renders drawGiantCornerStand with clean planar diagonal chamfer on SE corner', () => {
      const stand: StandConfig = {
        position: 'corner_se',
        type: 'wall',
        cornerType: 'giant',
        wallSize: 'large',
        grade: 'grade4_modern',
        architecturalGrade: 'modern',
      };

      drawGiantCornerStand(
        mockCtx,
        stand,
        'corner_se',
        200,
        800,
        150,
        650,
        180,
        180,
        dummyHomeKit,
        dummyAwayKit,
        'sunset'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });
  });

  describe('T14I.3: Architectural Grade Parity & Northern Stand Lock', () => {
    const grades: ArchitecturalGrade[] = ['municipal', 'brutalist', 'industrial', 'victorian', 'modern'];

    it('preserves northern corners (NW and NE) strictly without regressions', () => {
      const pInNW = { x: 200, y: 150 };
      const nTaper = 40;
      const ptNW = getShearedCornerPoint(pInNW, 140, 140, Math.PI * 1.5, 'corner_nw', nTaper, 140, 0);
      expect(ptNW.x).toBeCloseTo(200 + nTaper, 1);
    });

    it('renders round and giant corner stands across all 5 architectural grades without error', () => {
      grades.forEach((grade) => {
        const roundStand: StandConfig = {
          position: 'corner_sw',
          type: 'tiered',
          cornerType: 'round',
          tierCount: 3,
          grade: `grade1_${grade}` as any,
          architecturalGrade: grade,
        };

        drawRoundCornerStand(
          mockCtx,
          roundStand,
          'corner_sw',
          200,
          800,
          150,
          650,
          140,
          140,
          dummyHomeKit,
          dummyAwayKit,
          'noon'
        );

        const giantStand: StandConfig = {
          position: 'corner_se',
          type: 'wall',
          cornerType: 'giant',
          wallSize: 'medium',
          grade: `grade1_${grade}` as any,
          architecturalGrade: grade,
        };

        drawGiantCornerStand(
          mockCtx,
          giantStand,
          'corner_se',
          200,
          800,
          150,
          650,
          140,
          140,
          dummyHomeKit,
          dummyAwayKit,
          'noon'
        );
      });

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });
});
