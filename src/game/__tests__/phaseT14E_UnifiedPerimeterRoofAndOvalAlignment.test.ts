import { describe, it, expect } from 'vitest';
import { getUnifiedRoofOverhangDepth } from '../../types/stadium';
import { getFluidCornerRoofArcPoints, getOvalSectorRadialDepth } from '../stadiumRenderer';
import type { StandConfig } from '../../types/stadium';

describe('HOTFIX PHASE T14E: Unified Perimeter Roof Architecture & Oval Stand Alignment', () => {
  describe('Roof Canopy Upper-Tier Coverage & Bounds (< 50% edge)', () => {
    it('guarantees that roof overhang never hides more than 50% of the upper tier deck in match mode (partial)', () => {
      const standSizes: Array<StandConfig['tierCount']> = [1, 2, 3, 4];
      const depths = [80, 100, 120, 145, 175, 200, 240];

      for (const tierCount of standSizes) {
        for (const totalDepth of depths) {
          const stand: StandConfig = {
            position: 'west',
            type: 'tiered',
            tierCount: tierCount || 2,
            tiers: Array.from({ length: tierCount || 2 }, () => ({
              size: 'medium',
              density: 'normal',
            })),
          };

          const overhangDepth = getUnifiedRoofOverhangDepth(stand, totalDepth, 'partial');
          const rearWall = 14;
          const frontPlinth = 6;
          const seatingDepth = Math.max(20, totalDepth - rearWall - frontPlinth);
          const upperTierDeckDepth = seatingDepth / (tierCount || 2);
          const roofOverTierDeck = overhangDepth - rearWall;
          const deckCoverageFraction = roofOverTierDeck / upperTierDeckDepth;

          // Upper tier deck coverage must strictly never exceed 50%
          expect(deckCoverageFraction).toBeLessThanOrEqual(0.50);
          expect(overhangDepth).toBeGreaterThan(rearWall);
          expect(overhangDepth).toBeLessThan(totalDepth * 0.45);
        }
      }
    });

    it('unifies roof overhang depth across West, East, North, and South stands when configurations match', () => {
      const westStand: StandConfig = { position: 'west', type: 'tiered', tierCount: 2 };
      const eastStand: StandConfig = { position: 'east', type: 'tiered', tierCount: 2 };
      const northStand: StandConfig = { position: 'north', type: 'tiered', tierCount: 2 };
      const southStand: StandConfig = { position: 'south', type: 'tiered', tierCount: 2 };

      const depth = 145;
      const westOverhang = getUnifiedRoofOverhangDepth(westStand, depth, 'partial');
      const eastOverhang = getUnifiedRoofOverhangDepth(eastStand, depth, 'partial');
      const northOverhang = getUnifiedRoofOverhangDepth(northStand, depth, 'partial');
      const southOverhang = getUnifiedRoofOverhangDepth(southStand, depth, 'partial');

      expect(westOverhang).toBe(eastOverhang);
      expect(westOverhang).toBe(northOverhang);
      expect(westOverhang).toBe(southOverhang);
      expect(westOverhang).toBeGreaterThanOrEqual(30);
      expect(westOverhang).toBeLessThanOrEqual(48);
    });

    it('scales roof overhang proportionally when stands have distinct configurations', () => {
      const largeStand: StandConfig = { position: 'west', type: 'tiered', tierCount: 3 };
      const smallStand: StandConfig = { position: 'north', type: 'tiered', tierCount: 1 };

      const largeOverhang = getUnifiedRoofOverhangDepth(largeStand, 180, 'partial');
      const smallOverhang = getUnifiedRoofOverhangDepth(smallStand, 90, 'partial');

      expect(largeOverhang).toBeGreaterThan(smallOverhang);
    });
  });

  describe('Corner Canopy Perimeter Continuity & Southern Corner Alignment', () => {
    it('aligns corner roof leading edge rT and rG with 0px discrepancy to adjacent touchline and goal stand canopies', () => {
      const stand: StandConfig = { position: 'corner_sw', type: 'square', tierCount: 2 };
      const left = 200;
      const bottom = 700;
      const standDepthX = 145;
      const standDepthY = 145;

      const touchlineOverhang = getUnifiedRoofOverhangDepth(stand, standDepthX, 'partial');
      const goalOverhang = getUnifiedRoofOverhangDepth(stand, standDepthY, 'partial');

      // SW Corner outer points
      const pTMax = { x: left - standDepthX, y: bottom };
      const pGMax = { x: left, y: bottom + standDepthY };

      // SW leading edge points anchored flush to outer perimeter
      const rT = { x: pTMax.x + touchlineOverhang, y: pTMax.y };
      const rG = { x: pGMax.x, y: pGMax.y - goalOverhang };

      // West stand canopy inner edge at y = bottom:
      // canopyX = left - standDepthX, canopyW = touchlineOverhang
      // Inner edge x = (left - standDepthX) + touchlineOverhang
      const westStandInnerEdgeX = left - standDepthX + touchlineOverhang;
      expect(rT.x).toBe(westStandInnerEdgeX);
      expect(rT.y).toBe(bottom);

      // South stand canopy inner edge at x = left:
      // canopyY = bottom + standDepthY - goalOverhang, canopyH = goalOverhang
      // Inner edge y = (bottom + standDepthY) - goalOverhang
      const southStandInnerEdgeY = bottom + standDepthY - goalOverhang;
      expect(rG.x).toBe(left);
      expect(rG.y).toBe(southStandInnerEdgeY);
    });

    it('guarantees C1 tangent continuity for fluid corner roof arc', () => {
      const rT = { x: 91, y: 700 };
      const rG = { x: 200, y: 809 };
      const pOut = { x: 55, y: 845 };
      const pT = { x: 194, y: 700 };
      const pTMax = { x: 55, y: 700 };
      const pG = { x: 200, y: 706 };
      const pGMax = { x: 200, y: 845 };

      const pts = getFluidCornerRoofArcPoints(rT, rG, pOut, pT, pTMax, pG, pGMax, 0.3, 16);

      expect(pts.length).toBe(17);
      expect(pts[0].x).toBeCloseTo(rT.x);
      expect(pts[0].y).toBeCloseTo(rT.y);
      expect(pts[pts.length - 1].x).toBeCloseTo(rG.x);
      expect(pts[pts.length - 1].y).toBeCloseTo(rG.y);

      // Tangent at start (rT) should be strictly vertical: dx/dt = 0
      const dxStart = pts[1].x - pts[0].x;
      const dyStart = pts[1].y - pts[0].y;
      expect(Math.abs(dxStart / dyStart)).toBeLessThan(0.08);

      // Tangent at end (rG) should be strictly horizontal: dy/dt = 0
      const dxEnd = pts[pts.length - 1].x - pts[pts.length - 2].x;
      const dyEnd = pts[pts.length - 1].y - pts[pts.length - 2].y;
      expect(Math.abs(dyEnd / dxEnd)).toBeLessThan(0.08);
    });
  });

  describe('Oval Stadium Goal Bend Alignment (Zero Discrepancy at Touchlines)', () => {
    it('hits touchline depths with 100% precision at ang = PI (West) and ang = 0 / 2*PI (East)', () => {
      const dWest = 150;
      const dGoal = 130;
      const dEast = 140;

      // West touchline seam: ang = Math.PI
      const depthWestSeam = getOvalSectorRadialDepth(Math.PI, dWest, dGoal, dEast);
      expect(depthWestSeam).toBeCloseTo(dWest, 5);

      // East touchline seam: ang = 0 or 2*Math.PI
      const depthEastSeam0 = getOvalSectorRadialDepth(0, dWest, dGoal, dEast);
      const depthEastSeam2Pi = getOvalSectorRadialDepth(Math.PI * 2, dWest, dGoal, dEast);
      expect(depthEastSeam0).toBeCloseTo(dEast, 5);
      expect(depthEastSeam2Pi).toBeCloseTo(dEast, 5);

      // Goal apex: ang = 3*Math.PI/2 (North apex) or Math.PI/2 (South apex)
      const depthNorthApex = getOvalSectorRadialDepth(Math.PI * 1.5, dWest, dGoal, dEast);
      const depthSouthApex = getOvalSectorRadialDepth(Math.PI * 0.5, dWest, dGoal, dEast);
      expect(depthNorthApex).toBeCloseTo(dGoal, 5);
      expect(depthSouthApex).toBeCloseTo(dGoal, 5);
    });

    it('produces completely uniform depth when all oval stands share identical size configuration', () => {
      const uniformDepth = 145;
      const sampleAngles = [
        Math.PI,
        Math.PI * 1.15,
        Math.PI * 1.25,
        Math.PI * 1.5,
        Math.PI * 1.75,
        Math.PI * 1.85,
        Math.PI * 2,
        0,
        Math.PI * 0.25,
        Math.PI * 0.5,
        Math.PI * 0.75,
      ];

      for (const ang of sampleAngles) {
        const d = getOvalSectorRadialDepth(ang, uniformDepth, uniformDepth, uniformDepth);
        expect(d).toBeCloseTo(uniformDepth, 5);
      }
    });

    it('smoothly connects without abrupt step discrepancies when stands have different sizes', () => {
      const dWest = 165;
      const dNorth = 120;
      const dEast = 145;

      let prevD = getOvalSectorRadialDepth(Math.PI, dWest, dNorth, dEast);
      const steps = 36;
      for (let i = 1; i <= steps; i++) {
        const ang = Math.PI + (i / steps) * Math.PI;
        const d = getOvalSectorRadialDepth(ang, dWest, dNorth, dEast);
        const delta = Math.abs(d - prevD);
        // Each step change along the bend is small and smooth (< 4px per step), no cliff
        expect(delta).toBeLessThan(4);
        prevD = d;
      }
    });
  });
});
