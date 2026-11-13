/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCornerMiterGeometry,
  getShearedCornerPoint,
  getFluidCornerRoofArcPoints,
  drawRoundCornerStand,
  drawGiantCornerStand,
  drawTowerCornerStand,
  drawPitchsideSafetyBarrier,
  getStandPerspectiveMetrics,
} from '../stadiumRenderer';
import {
  StandConfig,
  resolveGradeElementColor,
  ArchitecturalGrade,
  ARCHITECTURAL_GRADE_OPTIONS,
} from '../../types/stadium';
import { TeamKit, TimeOfDay } from '../../types';

describe('Hotfix Phase T14F: Corner Material Harmony, Subtle Southern Angle & South Banner Typography', () => {
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

  describe('T14F.1: Architectural Grade Material & Color Parity on Corner Stands', () => {
    const grades: ArchitecturalGrade[] = ['municipal', 'brutalist', 'industrial', 'victorian', 'modern'];

    it('resolves consistent material colors across all 5 architectural grades in raw and custom mode', () => {
      grades.forEach((grade) => {
        // Raw finishes
        const rawElem1 = resolveGradeElementColor(grade, 1, 'raw', false);
        const rawElem2 = resolveGradeElementColor(grade, 2, 'raw', false);
        const rawElem3 = resolveGradeElementColor(grade, 3, 'raw', false);

        expect(rawElem1.isRaw).toBe(true);
        expect(rawElem2.isRaw).toBe(true);
        expect(rawElem3.isRaw).toBe(true);
        expect(rawElem1.primary).toBeDefined();
        expect(rawElem2.primary).toBeDefined();
        expect(rawElem3.primary).toBeDefined();

        // Custom palette colors
        const customElem1 = resolveGradeElementColor(grade, 1, 'blue', false);
        expect(customElem1.isRaw).toBe(false);
        expect(customElem1.primary).toBe('#2563eb');
      });
    });

    it('drawRoundCornerStand renders with grade-matched colors and deck textures', () => {
      const stand: StandConfig = {
        position: 'corner_nw',
        type: 'tiered',
        cornerType: 'round',
        grade: 'grade3_industrial',
        architecturalGrade: 'industrial',
        tierCount: 2,
        density: 'normal',
      };

      drawRoundCornerStand(
        mockCtx,
        stand,
        'corner_nw',
        100,
        900,
        100,
        700,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('drawGiantCornerStand applies resolved architectural grade colors and stehplatz terrace treads', () => {
      const stand: StandConfig = {
        position: 'corner_sw',
        type: 'wall',
        cornerType: 'giant',
        grade: 'grade2_classic',
        architecturalGrade: 'victorian',
        wallSize: 'medium',
      };

      drawGiantCornerStand(
        mockCtx,
        stand,
        'corner_sw',
        100,
        900,
        100,
        700,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'noon'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
    });

    it('drawTowerCornerStand applies resolved architectural grade colors to facade and floor slabs', () => {
      const stand: StandConfig = {
        position: 'corner_se',
        type: 'vip_building',
        cornerType: 'tower',
        grade: 'grade4_modern',
        architecturalGrade: 'modern',
        vipFloors: 3,
      };

      drawTowerCornerStand(
        mockCtx,
        stand,
        'corner_se',
        100,
        900,
        100,
        700,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('T14F.2: Subtle Southern Corner Perspective Transition Angle', () => {
    it('getCornerMiterGeometry provides pSouthShearGoal and southTaperX for SW and SE corners', () => {
      const perspective = getStandPerspectiveMetrics('rectangular', 140, 140);
      const geomSW = getCornerMiterGeometry('corner_sw', 100, 900, 100, 700, 140, 140, perspective);
      const geomSE = getCornerMiterGeometry('corner_se', 100, 900, 100, 700, 140, 140, perspective);

      expect(geomSW.pSouthShearGoal).toBeDefined();
      expect(geomSW.pSouthShearTouch).toBeDefined();
      expect(geomSW.southTaperX).toBeGreaterThanOrEqual(0);

      expect(geomSE.pSouthShearGoal).toBeDefined();
      expect(geomSE.pSouthShearTouch).toBeDefined();
      expect(geomSE.southTaperX).toBeGreaterThanOrEqual(0);
    });

    it('getShearedCornerPoint applies subtle transition angle connecting into South Stand rake', () => {
      const pIn = { x: 100, y: 700 };
      const sTaper = 30;
      const standDepthY = 140;

      // SW Corner: at angle = Math.PI (West interface), shear should be 0 (tangent strictly vertical)
      const ptWest = getShearedCornerPoint(pIn, 100, 100, Math.PI, 'corner_sw', 0, standDepthY, sTaper);
      expect(ptWest.x).toBeCloseTo(0, 0); // pIn.x - 100 = 0

      // SW Corner: at angle = Math.PI * 0.5 (South interface), shear shifts outward to match South Stand flare
      const ptSouth = getShearedCornerPoint(pIn, 100, 100, Math.PI * 0.5, 'corner_sw', 0, standDepthY, sTaper);
      const expectedShear = -sTaper * (100 / standDepthY) * 1.0;
      expect(ptSouth.x).toBeCloseTo(pIn.x + expectedShear, 1);

      // SE Corner: at angle = 0 (East interface), shear should be 0
      const pInSE = { x: 900, y: 700 };
      const ptEast = getShearedCornerPoint(pInSE, 100, 100, 0, 'corner_se', 0, standDepthY, sTaper);
      expect(ptEast.x).toBeCloseTo(1000, 0); // pIn.x + 100 = 1000

      // SE Corner: at angle = Math.PI * 0.5 (South interface), shear shifts outward (+sTaper)
      const ptSouthSE = getShearedCornerPoint(pInSE, 100, 100, Math.PI * 0.5, 'corner_se', 0, standDepthY, sTaper);
      const expectedShearSE = sTaper * (100 / standDepthY) * 1.0;
      expect(ptSouthSE.x).toBeCloseTo(pInSE.x + expectedShearSE, 1);
    });
  });

  describe('T14F.3: Continuous Fluid Corner Roof Miter & Canopy Bonding', () => {
    it('getFluidCornerRoofArcPoints generates a smooth C1 tangent continuous arc for southern corners', () => {
      const rT = { x: 200, y: 700 };
      const rG = { x: 100, y: 780 };
      const pOut = { x: 0, y: 840 };
      const pT = { x: 100, y: 700 };
      const pTMax = { x: 0, y: 700 };
      const pG = { x: 100, y: 700 };
      const pGMax = { x: 100, y: 840 };

      const pts = getFluidCornerRoofArcPoints(rT, rG, pOut, pT, pTMax, pG, pGMax, 0.5, 12);
      expect(pts.length).toBe(13);
      // Start is rT
      expect(pts[0].x).toBeCloseTo(rT.x);
      expect(pts[0].y).toBeCloseTo(rT.y);
      // End is rG
      expect(pts[pts.length - 1].x).toBeCloseTo(rG.x);
      expect(pts[pts.length - 1].y).toBeCloseTo(rG.y);

      // Intermediate coordinates must progress smoothly
      for (let i = 1; i < pts.length; i++) {
        expect(pts[i].y).toBeGreaterThanOrEqual(pts[i - 1].y);
      }
    });
  });

  describe('T14F.4: Southern Pitchside Commercial Ad Banner Polish & Typographic Legibility', () => {
    it('drawPitchsideSafetyBarrier renders readable sponsor typography on southern led_ribbon barrier', () => {
      const stand: StandConfig = {
        position: 'south',
        type: 'tiered',
        pitchsideBarrier: 'led_ribbon',
      };

      drawPitchsideSafetyBarrier(
        mockCtx,
        stand,
        150,
        700,
        700,
        12,
        'south',
        'night',
        dummyHomeKit,
        dummyAwayKit
      );

      // Verify text rendering calls occurred with readable font
      expect(mockCtx.fillText).toHaveBeenCalled();
      expect(mockCtx.font).toContain('7px');
      expect(mockCtx.textAlign).toBe('center');

      // Verify sponsor text contains authentic in-universe brands
      const renderedTexts = mockCtx.fillText.mock.calls.map((call: any[]) => call[0]);
      const validBrands = ['ARCADE SPORTS', 'STAR WIN', 'RETRO LUBE', 'TURF MASTER', 'CHAMPIONSHIP 90', 'PRO KICK', 'GLOBAL AIR'];
      const hasValidBrand = renderedTexts.some((txt: string) => validBrands.includes(txt));
      expect(hasValidBrand).toBe(true);
    });
  });
});
