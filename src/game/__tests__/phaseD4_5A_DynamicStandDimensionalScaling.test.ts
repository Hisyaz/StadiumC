/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from '../constants';
import {
  calculateDynamicStandDepth,
  getStadiumShapeMetrics,
  getNorthSpatialHierarchy,
  getCornerMiterGeometry,
  drawTouchlineAndCornerStands,
  drawCornerQuadrantStands,
  getStadiumFloodlightTowerPositions,
} from '../stadiumRenderer';
import { StadiumDefinition, StandConfig, TierSize } from '../../types/stadium';

// High-fidelity mock 2D canvas context recording calls
function createMockCanvasContext() {
  const operations: Array<{ method: string; args: any[] }> = [];
  const properties: Record<string, any> = {
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
  };

  const handler: ProxyHandler<any> = {
    get(target, prop: string) {
      if (prop in properties) {
        return properties[prop];
      }
      return (...args: any[]) => {
        operations.push({ method: prop, args });
        if (prop === 'measureText') {
          return { width: (args[0]?.length || 0) * 8 };
        }
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          return {
            addColorStop: () => {},
          };
        }
        return undefined;
      };
    },
    set(target, prop: string, value: any) {
      properties[prop] = value;
      operations.push({ method: `set_${prop}`, args: [value] });
      return true;
    },
  };

  const ctx = new Proxy({}, handler) as unknown as CanvasRenderingContext2D;
  return { ctx, operations, properties };
}

describe('Phase D4.5A: Dynamic Stand Dimensional Scaling Engine', () => {
  describe('D4.5A.1: Stand Depth Physically Expands Based on Tier Count (1 to 4 Tiers)', () => {
    it('scales 1-Tier stand depth within the canonical 75px – 90px range', () => {
      const stand1TierSmall: StandConfig = {
        position: 'north',
        type: 'tiered',
        tierCount: 1,
        tiers: [{ size: 'small' }],
      };
      const depthSmall = calculateDynamicStandDepth(stand1TierSmall, 'rectangular');
      expect(depthSmall).toBeGreaterThanOrEqual(75);
      expect(depthSmall).toBeLessThanOrEqual(90);
      expect(depthSmall).toBe(75);

      const stand1TierMed: StandConfig = {
        position: 'north',
        type: 'tiered',
        tierCount: 1,
        tiers: [{ size: 'medium' }],
      };
      const depthMed = calculateDynamicStandDepth(stand1TierMed, 'rectangular');
      expect(depthMed).toBeGreaterThanOrEqual(75);
      expect(depthMed).toBeLessThanOrEqual(90);
      expect(depthMed).toBe(82);

      const stand1TierLarge: StandConfig = {
        position: 'north',
        type: 'tiered',
        tierCount: 1,
        tiers: [{ size: 'large' }],
      };
      const depthLarge = calculateDynamicStandDepth(stand1TierLarge, 'rectangular');
      expect(depthLarge).toBeGreaterThanOrEqual(75);
      expect(depthLarge).toBeLessThanOrEqual(90);
      expect(depthLarge).toBe(90);
    });

    it('scales 2-Tiers stand depth within the canonical 135px – 155px range', () => {
      const stand2TiersSmall: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 2,
        tiers: [{ size: 'small' }, { size: 'small' }],
      };
      const depthSmall = calculateDynamicStandDepth(stand2TiersSmall, 'rectangular');
      expect(depthSmall).toBeGreaterThanOrEqual(135);
      expect(depthSmall).toBeLessThanOrEqual(155);
      expect(depthSmall).toBe(135);

      const stand2TiersMed: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 2,
        tiers: [{ size: 'medium' }, { size: 'medium' }],
      };
      const depthMed = calculateDynamicStandDepth(stand2TiersMed, 'rectangular');
      expect(depthMed).toBeGreaterThanOrEqual(135);
      expect(depthMed).toBeLessThanOrEqual(155);
      expect(depthMed).toBe(145);

      const stand2TiersLarge: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 2,
        tiers: [{ size: 'large' }, { size: 'large' }],
      };
      const depthLarge = calculateDynamicStandDepth(stand2TiersLarge, 'rectangular');
      expect(depthLarge).toBeGreaterThanOrEqual(135);
      expect(depthLarge).toBeLessThanOrEqual(155);
      expect(depthLarge).toBe(155);
    });

    it('scales 3-Tiers stand depth within the canonical 190px – 220px range', () => {
      const stand3TiersSmall: StandConfig = {
        position: 'east',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'small' }],
      };
      const depthSmall = calculateDynamicStandDepth(stand3TiersSmall, 'rectangular');
      expect(depthSmall).toBeGreaterThanOrEqual(190);
      expect(depthSmall).toBeLessThanOrEqual(220);
      expect(depthSmall).toBe(190);

      const stand3TiersMed: StandConfig = {
        position: 'east',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'medium' }],
      };
      const depthMed = calculateDynamicStandDepth(stand3TiersMed, 'rectangular');
      expect(depthMed).toBeGreaterThanOrEqual(190);
      expect(depthMed).toBeLessThanOrEqual(220);
      expect(depthMed).toBe(205);

      const stand3TiersLarge: StandConfig = {
        position: 'east',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'large' }],
      };
      const depthLarge = calculateDynamicStandDepth(stand3TiersLarge, 'rectangular');
      expect(depthLarge).toBeGreaterThanOrEqual(190);
      expect(depthLarge).toBeLessThanOrEqual(220);
      expect(depthLarge).toBe(220);
    });

    it('scales 4-Tiers stand depth within the canonical 250px – 285px range', () => {
      const stand4TiersSmall: StandConfig = {
        position: 'south',
        type: 'tiered',
        tierCount: 4,
        tiers: [{ size: 'small' }],
      };
      const depthSmall = calculateDynamicStandDepth(stand4TiersSmall, 'rectangular');
      expect(depthSmall).toBeGreaterThanOrEqual(250);
      expect(depthSmall).toBeLessThanOrEqual(285);
      expect(depthSmall).toBe(250);

      const stand4TiersMed: StandConfig = {
        position: 'south',
        type: 'tiered',
        tierCount: 4,
        tiers: [{ size: 'medium' }],
      };
      const depthMed = calculateDynamicStandDepth(stand4TiersMed, 'rectangular');
      expect(depthMed).toBeGreaterThanOrEqual(250);
      expect(depthMed).toBeLessThanOrEqual(285);
      expect(depthMed).toBe(268);

      const stand4TiersLarge: StandConfig = {
        position: 'south',
        type: 'tiered',
        tierCount: 4,
        tiers: [{ size: 'large' }],
      };
      const depthLarge = calculateDynamicStandDepth(stand4TiersLarge, 'rectangular');
      expect(depthLarge).toBeGreaterThanOrEqual(250);
      expect(depthLarge).toBeLessThanOrEqual(285);
      expect(depthLarge).toBe(285);
    });

    it('scales "The Wall" (type === wall) according to Phase T4 calibrated sizes (Small=90px, Medium=150px, Large=250px)', () => {
      const wallSmall: StandConfig = {
        position: 'south',
        type: 'wall',
        wallSize: 'small',
      };
      const depthSmall = calculateDynamicStandDepth(wallSmall, 'rectangular');
      expect(depthSmall).toBe(90);

      const wallMed: StandConfig = {
        position: 'south',
        type: 'wall',
        wallSize: 'medium',
      };
      const depthMed = calculateDynamicStandDepth(wallMed, 'rectangular');
      expect(depthMed).toBe(150);

      const wallLarge: StandConfig = {
        position: 'south',
        type: 'wall',
        wallSize: 'large',
      };
      const depthLarge = calculateDynamicStandDepth(wallLarge, 'rectangular');
      expect(depthLarge).toBe(250);
    });

    it('returns 0px depth for open sides (type === "none" or "no_stand")', () => {
      const noStand: StandConfig = {
        position: 'north',
        type: 'none',
      };
      expect(calculateDynamicStandDepth(noStand, 'rectangular')).toBe(0);

      const noStandAlt: StandConfig = {
        position: 'east',
        type: 'no_stand',
      };
      expect(calculateDynamicStandDepth(noStandAlt, 'rectangular')).toBe(0);
    });
  });

  describe('D4.5A.2: Dynamic Stand Outer Boundaries & Hierarchy', () => {
    it('adapts northern spatial hierarchy dynamically when standDepthY changes', () => {
      // 1 Tier compact stand: depth = 82px
      const hierarchy1T = getNorthSpatialHierarchy('rectangular', 82, false, 'standard', false, 112);
      // 4 Tiers monumental stand: depth = 268px
      const hierarchy4T = getNorthSpatialHierarchy('rectangular', 268, false, 'standard', false, 112);

      // 4-Tier stand outer edge reaches further north than 1-tier stand
      expect(hierarchy4T.northOuterY).toBeLessThan(hierarchy1T.northOuterY);
      expect(hierarchy1T.northOuterY - hierarchy4T.northOuterY).toBe(268 - 82);

      // Northern concourse and horizon maintain vertical ordering
      expect(hierarchy4T.bgTop).toBeLessThan(hierarchy4T.horizonBaseY);
      expect(hierarchy4T.horizonBaseY).toBeLessThan(hierarchy4T.northConcourseTop);
      expect(hierarchy4T.northConcourseTop).toBeLessThan(hierarchy4T.northOuterY);
    });

    it('records individual dynamic stand depths in getStadiumShapeMetrics', () => {
      const stadiumDef: StadiumDefinition = {
        id: 'test_asymmetric_stadium',
        name: 'Asymmetric Arena',
        shortName: 'Asym Arena',
        city: 'Metropolis',
        country: 'Global',
        shape: 'rectangular',
        surroundings: 'big_city',
        hasTrack: false,
        capacity: 45000,
        fifaCategory: 'continental',
        dugouts: { type: 'covered_sunken', quality: 'modern', frameColor: '#334155', cushionColor: '#1e293b', shelterTint: 'rgba(0,0,0,0.5)', setbackDistance: 12 },
        tunnel: { type: 'inflatable_accordion', siting: 'center_main', primaryColor: '#1e3a8a', secondaryColor: '#ffffff' },
        lighting: { type: 'corner_pylons', pylonCount: 4, powerKw: 1600, timeOfDay: 'night' },
        seats: { style: 'classic_bucket', pattern: 'solid', colors: ['#1e3a8a', '#ffffff'] },
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 4, tiers: [{ size: 'medium' }] },
          east: { position: 'east', type: 'tiered', tierCount: 1, tiers: [{ size: 'small' }] },
          north: { position: 'north', type: 'tiered', tierCount: 2, tiers: [{ size: 'medium' }] },
          south: { position: 'south', type: 'wall', wallSize: 'large' },
          corner_nw: { position: 'corner_nw', type: 'tiered', tierCount: 2 },
          corner_ne: { position: 'corner_ne', type: 'tiered', tierCount: 2 },
          corner_se: { position: 'corner_se', type: 'tiered', tierCount: 2 },
          corner_sw: { position: 'corner_sw', type: 'tiered', tierCount: 2 },
        },
      };

      const metrics = getStadiumShapeMetrics(stadiumDef);
      expect(metrics.westStandDepth).toBe(268); // 4 tiers medium
      expect(metrics.eastStandDepth).toBe(75);  // 1 tier small
      expect(metrics.northStandDepth).toBe(145); // 2 tiers medium
      expect(metrics.southStandDepth).toBeGreaterThanOrEqual(210); // Wall large
      expect(metrics.southStandDepth).toBeLessThanOrEqual(260);
    });
  });

  describe('D4.5A.3: 45° Corner Miters Dynamically Adapt to Adjoining Stand Depths', () => {
    it('seamlessly welds asymmetric touchline and goal stand depths in corner miters', () => {
      // West touchline: 4 tiers (268px depth)
      // North goal end: 1 tier (82px depth)
      const left = 160;
      const right = 1700;
      const top = 197;
      const bottom = 2742;

      const miterNW = getCornerMiterGeometry('corner_nw', left, right, top, bottom, 268, 82);
      expect(miterNW.pIn.x).toBe(left);
      expect(miterNW.pIn.y).toBe(top);

      // pTouch at max depth connects to the west stand outer edge (left - 268)
      const pTMax = miterNW.pTouch(268);
      expect(pTMax.x).toBe(left - 268);
      expect(pTMax.y).toBe(top);

      // pGoal at max depth connects to the north stand outer edge (top - 82)
      const pGMax = miterNW.pGoal(82);
      expect(pGMax.x).toBe(left);
      expect(pGMax.y).toBe(top - 82);

      // Outer bounding corner point
      expect(miterNW.pOut.x).toBe(left - 268);
      expect(miterNW.pOut.y).toBe(top - 82);
    });

    it('renders corner quadrant stands adapting each quadrant to its respective cardinal stands', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stadiumDef: StadiumDefinition = {
        id: 'test_asym_corners',
        name: 'Asym Corners Arena',
        shortName: 'Asym Corn',
        city: 'Capital City',
        country: 'Global',
        shape: 'rectangular',
        surroundings: 'big_city',
        hasTrack: false,
        capacity: 35000,
        fifaCategory: 'continental',
        dugouts: { type: 'covered_sunken', quality: 'modern', frameColor: '#334155', cushionColor: '#1e293b', shelterTint: 'rgba(0,0,0,0.5)', setbackDistance: 12 },
        tunnel: { type: 'inflatable_accordion', siting: 'center_main', primaryColor: '#1e3a8a', secondaryColor: '#ffffff' },
        lighting: { type: 'corner_pylons', pylonCount: 4, powerKw: 1600, timeOfDay: 'night' },
        seats: { style: 'classic_bucket', pattern: 'solid', colors: ['#1e3a8a', '#ffffff'] },
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 3, tiers: [{ size: 'medium' }] }, // 205px
          east: { position: 'east', type: 'tiered', tierCount: 1, tiers: [{ size: 'medium' }] }, // 82px
          north: { position: 'north', type: 'tiered', tierCount: 2, tiers: [{ size: 'medium' }] }, // 145px
          south: { position: 'south', type: 'tiered', tierCount: 4, tiers: [{ size: 'medium' }] }, // 268px
          corner_nw: { position: 'corner_nw', type: 'tiered', tierCount: 2 },
          corner_ne: { position: 'corner_ne', type: 'tiered', tierCount: 2 },
          corner_se: { position: 'corner_se', type: 'tiered', tierCount: 2 },
          corner_sw: { position: 'corner_sw', type: 'tiered', tierCount: 2 },
        },
      };

      const metrics = getStadiumShapeMetrics(stadiumDef);
      drawCornerQuadrantStands(
        ctx,
        stadiumDef,
        metrics.westInnerX,
        metrics.eastInnerX,
        metrics.northInnerY,
        metrics.southInnerY,
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night',
        metrics.standDepthX,
        metrics.standDepthY
      );

      // Ensure canvas operations executed without throwing
      expect(operations.length).toBeGreaterThan(50);
    });
  });

  describe('D4.5A.4: Dynamic Floodlight Tower Parapet Anchors', () => {
    it('positions floodlight pylons on dynamic corner miter apexes based on active stand depths', () => {
      const stadiumDef: StadiumDefinition = {
        id: 'test_floodlight_pylons',
        name: 'Floodlight Test Arena',
        shortName: 'FL Arena',
        city: 'Stadiumville',
        country: 'Global',
        shape: 'rectangular',
        surroundings: 'big_city',
        hasTrack: false,
        capacity: 50000,
        fifaCategory: 'world',
        dugouts: { type: 'covered_sunken', quality: 'modern', frameColor: '#334155', cushionColor: '#1e293b', shelterTint: 'rgba(0,0,0,0.5)', setbackDistance: 12 },
        tunnel: { type: 'inflatable_accordion', siting: 'center_main', primaryColor: '#1e3a8a', secondaryColor: '#ffffff' },
        lighting: { type: 'corner_pylons', pylonCount: 4, powerKw: 2200, timeOfDay: 'night' },
        seats: { style: 'classic_bucket', pattern: 'solid', colors: ['#0f172a', '#ffffff'] },
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 4, tiers: [{ size: 'large' }] }, // 285px
          east: { position: 'east', type: 'tiered', tierCount: 4, tiers: [{ size: 'large' }] }, // 285px
          north: { position: 'north', type: 'tiered', tierCount: 4, tiers: [{ size: 'large' }] }, // 285px
          south: { position: 'south', type: 'tiered', tierCount: 4, tiers: [{ size: 'large' }] }, // 285px
          corner_nw: { position: 'corner_nw', type: 'tiered', tierCount: 4 },
          corner_ne: { position: 'corner_ne', type: 'tiered', tierCount: 4 },
          corner_se: { position: 'corner_se', type: 'tiered', tierCount: 4 },
          corner_sw: { position: 'corner_sw', type: 'tiered', tierCount: 4 },
        },
      };

      const positions = getStadiumFloodlightTowerPositions('rectangular', 'monumental', stadiumDef);
      expect(positions.length).toBe(4);

      const nw = positions.find((p) => p.quadrant === 'nw');
      const ne = positions.find((p) => p.quadrant === 'ne');
      const sw = positions.find((p) => p.quadrant === 'sw');
      const se = positions.find((p) => p.quadrant === 'se');

      expect(nw).toBeDefined();
      expect(ne).toBeDefined();
      expect(sw).toBeDefined();
      expect(se).toBeDefined();

      // With 4-tier large stands (285px depth), floodlights are pushed outward to the outer perimeter
      expect(sw!.x).toBeLessThan(PITCH_CONFIG.PITCH_LEFT - 200);
      expect(se!.x).toBeGreaterThan(PITCH_CONFIG.PITCH_RIGHT + 200);
      expect(nw!.x).toBeLessThan(PITCH_CONFIG.PITCH_LEFT);
      expect(ne!.x).toBeGreaterThan(PITCH_CONFIG.PITCH_RIGHT);
      expect(nw!.y).toBeLessThan(PITCH_CONFIG.PITCH_TOP - 200);
      expect(sw!.y).toBeGreaterThan(PITCH_CONFIG.PITCH_BOTTOM + 200);
    });
  });

  describe('D4.5A.5: Full Render Pipeline Zero-Regression Integration', () => {
    it('renders full touchline and corner stands across diverse tier configurations without error', () => {
      const { ctx, operations } = createMockCanvasContext();
      const multiTierDef: StadiumDefinition = {
        id: 'multi_tier_ground',
        name: 'Municipal Ground',
        shortName: 'Muni Ground',
        city: 'Oldham',
        country: 'UK',
        shape: 'rectangular',
        surroundings: 'small_city',
        hasTrack: false,
        capacity: 18000,
        fifaCategory: 'first_division',
        dugouts: { type: 'covered_sunken', quality: 'modern', frameColor: '#334155', cushionColor: '#1e293b', shelterTint: 'rgba(0,0,0,0.5)', setbackDistance: 12 },
        tunnel: { type: 'inflatable_accordion', siting: 'center_main', primaryColor: '#dc2626', secondaryColor: '#ffffff' },
        lighting: { type: 'corner_pylons', pylonCount: 4, powerKw: 1000, timeOfDay: 'night' },
        seats: { style: 'classic_bucket', pattern: 'solid', colors: ['#dc2626', '#ffffff'] },
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 2, tiers: [{ size: 'medium' }] },
          east: { position: 'east', type: 'tiered', tierCount: 1, tiers: [{ size: 'small' }] },
          north: { position: 'north', type: 'none' }, // Open end
          south: { position: 'south', type: 'tiered', tierCount: 3, tiers: [{ size: 'large' }] },
          corner_nw: { position: 'corner_nw', type: 'none' },
          corner_ne: { position: 'corner_ne', type: 'none' },
          corner_se: { position: 'corner_se', type: 'tiered', tierCount: 2 },
          corner_sw: { position: 'corner_sw', type: 'tiered', tierCount: 2 },
        },
      };

      expect(() => {
        drawTouchlineAndCornerStands(
          ctx,
          multiTierDef,
          'craven',
          'night',
          HOME_KIT,
          AWAY_KIT
        );
      }).not.toThrow();

      expect(operations.length).toBeGreaterThan(100);
    });
  });
});
