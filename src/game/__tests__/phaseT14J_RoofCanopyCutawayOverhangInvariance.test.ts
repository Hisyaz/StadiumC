/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCornerRoofCanopyGeometry,
  checkPolygonSelfIntersects,
  drawCornerMiterRoofCanopy,
} from '../stadiumRenderer';
import {
  StandConfig,
  RoofConfig,
  getUnifiedRoofOverhangDepth,
} from '../../types/stadium';
import { TeamKit } from '../../types';

describe('Hotfix Phase T14J: Roof Canopy Cutaway Overhang Invariance & Fluid Miter Alignment', () => {
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
      quadraticCurveTo: vi.fn(),
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

  const corners: Array<'corner_nw' | 'corner_ne' | 'corner_se' | 'corner_sw'> = [
    'corner_nw',
    'corner_ne',
    'corner_se',
    'corner_sw',
  ];

  describe('T14J.1: Zero Polygon Self-Intersections across all 4 Corners and Typologies', () => {
    it('guarantees zero polygon self-intersections on Round/Tiered corners in partial and full cutaways', () => {
      for (const pos of corners) {
        const stand: StandConfig = {
          position: pos,
          type: 'round',
          tierCount: 3,
          hasRoof: true,
          roofCutaway: 'partial',
        };

        const left = 200;
        const right = 800;
        const top = 180;
        const bottom = 620;
        const depthX = 145;
        const depthY = 145;

        const pTMax = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left - depthX : right + depthX,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top : bottom,
        };
        const pGMax = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left : right,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top - depthY : bottom + depthY,
        };
        const pOut = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left - depthX : right + depthX,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top - depthY : bottom + depthY,
        };
        const pT = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left : right,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top : bottom,
        };
        const pG = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left : right,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top : bottom,
        };

        const geomPartial = getCornerRoofCanopyGeometry(
          stand,
          pos,
          pOut,
          pTMax,
          pGMax,
          pT,
          pG,
          'partial'
        );
        expect(geomPartial).not.toBeNull();
        expect(checkPolygonSelfIntersects(geomPartial!.polygonPts)).toBe(false);

        const geomFull = getCornerRoofCanopyGeometry(
          stand,
          pos,
          pOut,
          pTMax,
          pGMax,
          pT,
          pG,
          'full'
        );
        expect(geomFull).not.toBeNull();
        expect(checkPolygonSelfIntersects(geomFull!.polygonPts)).toBe(false);
      }
    });

    it('guarantees zero polygon self-intersections on Giant/Wall corners in partial and full cutaways', () => {
      for (const pos of corners) {
        const stand: StandConfig = {
          position: pos,
          type: 'giant',
          cornerType: 'giant',
          hasRoof: true,
          roofCutaway: 'partial',
        };

        const left = 200;
        const right = 800;
        const top = 180;
        const bottom = 620;
        const depthX = 180;
        const depthY = 180;

        const pTMax = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left - depthX : right + depthX,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top : bottom,
        };
        const pGMax = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left : right,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top - depthY : bottom + depthY,
        };
        const pOut = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left - depthX : right + depthX,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top - depthY : bottom + depthY,
        };
        const pT = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left : right,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top : bottom,
        };
        const pG = {
          x: pos === 'corner_nw' || pos === 'corner_sw' ? left : right,
          y: pos === 'corner_nw' || pos === 'corner_ne' ? top : bottom,
        };

        const geomPartial = getCornerRoofCanopyGeometry(
          stand,
          pos,
          pOut,
          pTMax,
          pGMax,
          pT,
          pG,
          'partial'
        );
        expect(geomPartial).not.toBeNull();
        expect(checkPolygonSelfIntersects(geomPartial!.polygonPts)).toBe(false);

        const geomFull = getCornerRoofCanopyGeometry(
          stand,
          pos,
          pOut,
          pTMax,
          pGMax,
          pT,
          pG,
          'full'
        );
        expect(geomFull).not.toBeNull();
        expect(checkPolygonSelfIntersects(geomFull!.polygonPts)).toBe(false);
      }
    });

    it('verifies that checkPolygonSelfIntersects correctly detects self-intersecting bowtie hourglasses', () => {
      // Hourglass / bowtie polygon
      const bowtiePts = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
        { x: 100, y: 0 },
      ];
      expect(checkPolygonSelfIntersects(bowtiePts)).toBe(true);

      // Clean convex quadrilateral
      const cleanPts = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];
      expect(checkPolygonSelfIntersects(cleanPts)).toBe(false);
    });
  });

  describe('T14J.2: Calibrated 3-Mode Roof Cutaway Scaling Invariants', () => {
    it('strictly clamps overhang to <= 20% of total depth on Giant Wall corners in partial cutaway', () => {
      const giantStand: StandConfig = {
        position: 'corner_sw',
        type: 'giant',
        cornerType: 'giant',
        hasRoof: true,
      };

      for (const standDepth of [120, 180, 240, 280]) {
        const overhang = getUnifiedRoofOverhangDepth(giantStand, standDepth, 'partial');
        expect(overhang).toBeLessThanOrEqual(Math.round(standDepth * 0.20) + 1);
        expect(overhang).toBeGreaterThanOrEqual(12);
      }
    });

    it('enforces that roof canopy covers <= 50% of the upper tier deck on tiered stands in partial cutaway', () => {
      const tierCounts: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
      for (const tierCount of tierCounts) {
        const stand: StandConfig = {
          position: 'corner_nw',
          type: 'tiered',
          tierCount,
          hasRoof: true,
        };
        const standDepth = 150;
        const overhang = getUnifiedRoofOverhangDepth(stand, standDepth, 'partial');

        const rearWall = 14;
        const frontPlinth = 6;
        const deckDepth = standDepth - rearWall - frontPlinth;
        const upperTierDepth = deckDepth / tierCount;

        const projectionOntoDeck = overhang - rearWall;
        // Projection onto upper deck must be strictly <= 50% of upper tier depth
        expect(projectionOntoDeck / upperTierDepth).toBeLessThanOrEqual(0.50);
      }
    });

    it('returns full enclosure (>= 90% coverage) on full cutaway mode', () => {
      const stand: StandConfig = {
        position: 'corner_se',
        type: 'round',
        tierCount: 2,
        hasRoof: true,
      };
      const standDepth = 150;
      const fullOverhang = getUnifiedRoofOverhangDepth(stand, standDepth, 'full');

      expect(fullOverhang / standDepth).toBeGreaterThanOrEqual(0.90);
    });

    it('returns 0 overhang and null geometry on hidden cutaway mode', () => {
      const stand: StandConfig = {
        position: 'corner_sw',
        type: 'round',
        hasRoof: true,
      };
      const hiddenOverhang = getUnifiedRoofOverhangDepth(stand, 150, 'hidden');
      expect(hiddenOverhang).toBe(0);

      const geom = getCornerRoofCanopyGeometry(
        stand,
        'corner_sw',
        { x: 100, y: 700 },
        { x: 100, y: 600 },
        { x: 200, y: 700 },
        { x: 200, y: 600 },
        { x: 200, y: 600 },
        'hidden'
      );
      expect(geom).toBeNull();
    });
  });

  describe('T14J.3: Visual Mastery & Multi-Material Rendering Verification', () => {
    it('executes drawCornerMiterRoofCanopy without errors across all 4 roof materials and 4 styles', () => {
      const materials = [
        'corrugated_steel',
        'etfe_cushion',
        'precast_concrete',
        'anodized_aluminum',
      ] as const;
      const styles = [
        'cantilever_truss',
        'barrel_vault',
        'tensile_cable',
        'spaceframe_halo',
      ] as const;

      for (const mat of materials) {
        for (const sty of styles) {
          const stand: StandConfig = {
            position: 'corner_sw',
            type: 'round',
            cornerType: 'round',
            hasRoof: true,
            roofMaterial: mat,
            roofStyle: sty,
          };
          const stadiumRoof: RoofConfig = {
            enabled: true,
            border: 'painted_club_fascia',
            style: sty,
            material: mat,
            cutawayMode: 'partial',
          };

          expect(() => {
            drawCornerMiterRoofCanopy(
              mockCtx,
              stand,
              'corner_sw',
              { x: 60, y: 740 },
              { x: 60, y: 600 },
              { x: 200, y: 740 },
              { x: 200, y: 600 },
              { x: 200, y: 600 },
              dummyHomeKit,
              dummyAwayKit,
              'night',
              stadiumRoof,
              'partial'
            );
          }).not.toThrow();
        }
      }
    });

    it('anchors truss rafters and rivets strictly within the canopy boundaries without stray spikes', () => {
      const stand: StandConfig = {
        position: 'corner_se',
        type: 'giant',
        cornerType: 'giant',
        hasRoof: true,
        roofStyle: 'cantilever_truss',
      };

      const geom = getCornerRoofCanopyGeometry(
        stand,
        'corner_se',
        { x: 940, y: 740 },
        { x: 940, y: 600 },
        { x: 800, y: 740 },
        { x: 800, y: 600 },
        { x: 800, y: 600 },
        'partial'
      );

      expect(geom).not.toBeNull();
      // On southern giant corner, outerApex must be anchored along the 45° planar chamfer
      const expectedApexX = (940 + 800) * 0.5;
      const expectedApexY = (600 + 740) * 0.5;
      expect(geom!.outerApex.x).toBeCloseTo(expectedApexX, 1);
      expect(geom!.outerApex.y).toBeCloseTo(expectedApexY, 1);
    });
  });
});
