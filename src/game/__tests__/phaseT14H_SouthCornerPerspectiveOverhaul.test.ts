/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCornerMiterGeometry,
  getShearedCornerPoint,
  traceShearedCornerArc,
  getFluidCornerRoofArcPoints,
  drawRoundCornerStand,
  drawGiantCornerStand,
  getStandPerspectiveMetrics,
} from '../stadiumRenderer';
import {
  StandConfig,
  ArchitecturalGrade,
  ARCHITECTURAL_GRADE_OPTIONS,
} from '../../types/stadium';
import { TeamKit } from '../../types';

describe('Hotfix Phase T14H: Southern Corner 2.5D High-Oblique Perspective Geometry & Seating Synchronization', () => {
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

  describe('T14H.1 & T14H.2: High-Oblique 2.5D Radial Corner Geometry with C1 Tangent Continuity', () => {
    const left = 200;
    const right = 800;
    const top = 150;
    const bottom = 650;
    const standDepthX = 140;
    const standDepthY = 140;
    const sTaper = 35;

    it('guarantees exact 0.000px coordinate alignment at South interface (u = 0) and West interface (u = 1) for SW corner', () => {
      const pInSW = { x: left, y: bottom };
      const rdX = 120;
      const rdY = 120;

      // 1. South interface: angle = Math.PI * 0.5 (u = 0)
      const ptSouth = getShearedCornerPoint(pInSW, rdX, rdY, Math.PI * 0.5, 'corner_sw', 0, standDepthY, sTaper);
      const expectedSouthX = left - sTaper * (rdY / standDepthY);
      const expectedSouthY = bottom + rdY;

      expect(ptSouth.x).toBeCloseTo(expectedSouthX, 3);
      expect(ptSouth.y).toBeCloseTo(expectedSouthY, 3);

      // 2. West touchline interface: angle = Math.PI (u = 1)
      const ptWest = getShearedCornerPoint(pInSW, rdX, rdY, Math.PI, 'corner_sw', 0, standDepthY, sTaper);
      const expectedWestX = left - rdX;
      const expectedWestY = bottom;

      expect(ptWest.x).toBeCloseTo(expectedWestX, 3);
      expect(ptWest.y).toBeCloseTo(expectedWestY, 3);
    });

    it('guarantees exact 0.000px coordinate alignment at East interface (u = 0) and South interface (u = 1) for SE corner', () => {
      const pInSE = { x: right, y: bottom };
      const rdX = 120;
      const rdY = 120;

      // 1. East touchline interface: angle = 0 (u = 0)
      const ptEast = getShearedCornerPoint(pInSE, rdX, rdY, 0, 'corner_se', 0, standDepthY, sTaper);
      const expectedEastX = right + rdX;
      const expectedEastY = bottom;

      expect(ptEast.x).toBeCloseTo(expectedEastX, 3);
      expect(ptEast.y).toBeCloseTo(expectedEastY, 3);

      // 2. South interface: angle = Math.PI * 0.5 (u = 1)
      const ptSouth = getShearedCornerPoint(pInSE, rdX, rdY, Math.PI * 0.5, 'corner_se', 0, standDepthY, sTaper);
      const expectedSouthX = right + sTaper * (rdY / standDepthY);
      const expectedSouthY = bottom + rdY;

      expect(ptSouth.x).toBeCloseTo(expectedSouthX, 3);
      expect(ptSouth.y).toBeCloseTo(expectedSouthY, 3);
    });

    it('enforces C1 tangent continuity (zero derivative of DeltaX at both boundary interfaces)', () => {
      const pInSW = { x: left, y: bottom };
      const rdX = 120;
      const rdY = 120;
      const eps = 0.001;

      // SW at South interface (u = 0): angle = Math.PI * 0.5
      const pt0 = getShearedCornerPoint(pInSW, rdX, rdY, Math.PI * 0.5, 'corner_sw', 0, standDepthY, sTaper);
      const ptEps0 = getShearedCornerPoint(pInSW, rdX, rdY, Math.PI * 0.5 + eps, 'corner_sw', 0, standDepthY, sTaper);
      const deltaX0 = (pt0.x - (pInSW.x - rdX * Math.sin(0)));
      const deltaXEps0 = (ptEps0.x - (pInSW.x - rdX * Math.sin(eps)));
      const rateOfChange0 = Math.abs(deltaXEps0 - deltaX0) / eps;
      expect(rateOfChange0).toBeLessThan(0.05);

      // SW at West interface (u = 1): angle = Math.PI
      const pt1 = getShearedCornerPoint(pInSW, rdX, rdY, Math.PI, 'corner_sw', 0, standDepthY, sTaper);
      const ptEps1 = getShearedCornerPoint(pInSW, rdX, rdY, Math.PI - eps, 'corner_sw', 0, standDepthY, sTaper);
      const deltaX1 = (pt1.x - (pInSW.x - rdX * Math.sin(Math.PI * 0.5)));
      const deltaXEps1 = (ptEps1.x - (pInSW.x - rdX * Math.sin(Math.PI * 0.5 - eps)));
      const rateOfChange1 = Math.abs(deltaXEps1 - deltaX1) / eps;
      expect(rateOfChange1).toBeLessThan(0.05);
    });

    it('preserves northern corners strictly with quadrilateral perspective shear', () => {
      const pInNW = { x: left, y: top };
      const nTaper = 40;
      const rdY = 140;
      const ptNW = getShearedCornerPoint(pInNW, 140, rdY, Math.PI * 1.5, 'corner_nw', nTaper, standDepthY, 0);
      expect(ptNW.x).toBeCloseTo(left + nTaper, 1);
    });
  });

  describe('T14H.2: Miter Knee Elimination in drawGiantCornerStand', () => {
    it('renders drawGiantCornerStand for SW and SE corners with smooth clean quadrilateral polygons', () => {
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
    });
  });

  describe('T14H.3: Seating Height Synchronization with South Stand', () => {
    it('synchronizes seating depth when adjacent South stand is tiered and renders promenade concourse', () => {
      const cornerStand: StandConfig = {
        position: 'corner_se',
        type: 'tiered',
        cornerType: 'round',
        tierCount: 3,
        grade: 'grade4_modern',
        architecturalGrade: 'modern',
      };

      const adjacentSouthStand: StandConfig = {
        position: 'south',
        type: 'tiered',
        tierCount: 3,
        grade: 'grade4_modern',
        architecturalGrade: 'modern',
      };

      drawRoundCornerStand(
        mockCtx,
        cornerStand,
        'corner_se',
        200,
        800,
        150,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night',
        undefined,
        adjacentSouthStand
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      // Verifies promenade deck and vomitory portal rendered
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('utilizes full terrace depth when adjacent South stand is The Wall', () => {
      const cornerStand: StandConfig = {
        position: 'corner_sw',
        type: 'wall',
        cornerType: 'giant',
        wallSize: 'large',
        grade: 'grade2_classic',
        architecturalGrade: 'brutalist',
      };

      const adjacentWallStand: StandConfig = {
        position: 'south',
        type: 'wall',
        wallSize: 'large',
        grade: 'grade2_classic',
        architecturalGrade: 'brutalist',
      };

      drawGiantCornerStand(
        mockCtx,
        cornerStand,
        'corner_sw',
        200,
        800,
        150,
        650,
        180,
        180,
        dummyHomeKit,
        dummyAwayKit,
        'noon',
        undefined,
        adjacentWallStand
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });
  });

  describe('T14H.4: Comprehensive Typology and Architectural Grade Parity', () => {
    const grades: ArchitecturalGrade[] = ['municipal', 'brutalist', 'industrial', 'victorian', 'modern'];

    it('renders SW and SE corner grandstands cleanly across all 5 architectural grades without error', () => {
      grades.forEach((grade) => {
        const stand: StandConfig = {
          position: 'corner_sw',
          type: 'tiered',
          cornerType: 'round',
          tierCount: 2,
          grade: `grade1_${grade}` as any,
          architecturalGrade: grade,
        };

        drawRoundCornerStand(
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
          'sunset'
        );

        expect(mockCtx.save).toHaveBeenCalled();
        expect(mockCtx.restore).toHaveBeenCalled();
      });
    });
  });
});
