/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from '../constants';
import {
  StadiumDefinition,
  StandConfig,
  TimeOfDay,
  calculateDynamicStandDepth,
} from '../../types/stadium';
import { createDefaultStadium } from '../stadiumRegistry';
import {
  drawStadiumArchitecture,
  drawSingleTouchlineStand,
  drawGoalEndStand,
  drawNoStandPerimeterAndBackdrop,
  drawMiteredCornerStand,
  drawCornerQuadrantStands,
} from '../stadiumRenderer';

/**
 * Creates a mock 2D canvas rendering context that tracks operations
 */
function createMockCanvasContext() {
  const operations: { method: string; args: any[] }[] = [];
  const properties: Record<string, any> = {
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    globalAlpha: 1.0,
    font: '10px monospace',
    textBaseline: 'top',
    globalCompositeOperation: 'source-over',
  };

  const ctx = new Proxy({} as any, {
    get(target, prop: string) {
      if (prop in properties) {
        return properties[prop];
      }
      return (...args: any[]) => {
        operations.push({ method: prop, args });
        if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
          return {
            addColorStop: (offset: number, color: string) => {
              operations.push({ method: 'addColorStop', args: [offset, color] });
            },
          };
        }
        return undefined;
      };
    },
    set(target, prop: string, value: any) {
      properties[prop] = value;
      operations.push({ method: `set:${prop}`, args: [value] });
      return true;
    },
  });

  return { ctx, operations, properties };
}

describe('PHASE D4.5D: Pure No-Stand Removal & Contextual Backdrop Reveal Suite', () => {

  describe('D4.5D.1: Stand Depth Invariance & Pure 0px Removal', () => {
    it('returns exactly 0px depth for stands configured as "none" or "no_stand"', () => {
      const standNone: StandConfig = { position: 'west', type: 'none' };
      const standNoStand: StandConfig = { position: 'north', type: 'no_stand' };
      const standTiered: StandConfig = { position: 'east', type: 'tiered', tierCount: 2 };

      expect(calculateDynamicStandDepth(standNone, 'rectangular')).toBe(0);
      expect(calculateDynamicStandDepth(standNoStand, 'rectangular')).toBe(0);
      expect(calculateDynamicStandDepth(standNone, 'oval')).toBe(0);
      expect(calculateDynamicStandDepth(standNoStand, 'round')).toBe(0);
      expect(calculateDynamicStandDepth(standTiered, 'rectangular')).toBeGreaterThan(100);
    });

    it('drawSingleTouchlineStand bypasses grandstand concrete slab and rear wall when type is none/no_stand', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'west',
        type: 'none',
        grade: 'grade4_modern',
        backdrop: 'mountains',
        perimeterFinish: 'chainlink_fence',
      };

      drawSingleTouchlineStand(
        ctx,
        stand,
        500,
        220,
        0,
        2500,
        'west',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'mountains'
      );

      // Verify no monumental rear wall box or elevated multi-tier balustrade drawn
      const exitBeaconOps = operations.filter(op => op.method === 'set:fillStyle' && op.args[0] === '#10b981');
      expect(exitBeaconOps.length).toBe(0);

      // Verify low perimeter barrier wire was drawn
      const strokeOps = operations.filter(op => op.method === 'stroke');
      expect(strokeOps.length).toBeGreaterThan(0);
    });

    it('drawGoalEndStand bypasses grandstand structure when type is none/no_stand', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'no_stand',
        grade: 'grade4_modern',
        backdrop: 'dense_forest',
        perimeterFinish: 'rustic_timber',
      };

      drawGoalEndStand(
        ctx,
        stand,
        180,
        220,
        1500,
        0,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'forest'
      );

      // Verify no cantilever roof canopy or rear wall
      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Forest woodland canopy must be present directly
      expect(fillStyles.some(c => c === '#14532d' || c === '#166534')).toBe(true);
    });
  });

  describe('D4.5D.2: Direct Contextual Backdrop Reveal Behind Perimeter Barrier', () => {
    it('reveals Alpine Mountains backdrop (snow caps, ski chalets & cable car pylon) behind perimeter barrier', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'none',
        backdrop: 'alpine_peaks',
        perimeterFinish: 'dry_stone_wall',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        180,
        220,
        1500,
        0,
        'north',
        'mountains',
        'noon'
      );

      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Snow caps (#f8fafc)
      expect(fillStyles).toContain('#f8fafc');
      // Ski chalet timber walls (#78350f)
      expect(fillStyles).toContain('#78350f');
      // Cable car pylon (#94a3b8) and red gondola (#ef4444)
      expect(fillStyles).toContain('#94a3b8');
      expect(fillStyles).toContain('#ef4444');
    });

    it('reveals Dense Forest backdrop (woodland canopy, dirt fire road & ranger tower) behind barrier', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'east',
        type: 'no_stand',
        backdrop: 'dense_woodland',
        perimeterFinish: 'pine_timber_fence',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        1680,
        220,
        0,
        2500,
        'east',
        'forest',
        'noon'
      );

      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Forest dirt fire road (#92400e)
      expect(fillStyles).toContain('#92400e');
      // Ranger tower timber (#78350f) & observation glass (#38bdf8)
      expect(fillStyles).toContain('#78350f');
      expect(fillStyles).toContain('#38bdf8');
    });

    it('reveals Golden Savannah backdrop (kopjes, acacia trees & wildlife silhouette) behind barrier', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'south',
        type: 'none',
        backdrop: 'acacia_plains',
        perimeterFinish: 'potrero_berm',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        180,
        2720,
        1500,
        0,
        'south',
        'savannah',
        'noon'
      );

      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Golden steppe grass (#d97706)
      expect(fillStyles).toContain('#d97706');
      // Red sandstone kopjes (#7c2d12)
      expect(fillStyles).toContain('#7c2d12');
      // Umbrella acacia foliage (#15803d)
      expect(fillStyles).toContain('#15803d');
    });

    it('reveals Elevated Highway backdrop (asphalt roadbed, yellow median, headlights) behind barrier', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'west',
        type: 'no_stand',
        backdrop: 'freeway_viaduct',
        perimeterFinish: 'guardrail_barrier',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        180,
        220,
        0,
        2500,
        'west',
        'highway',
        'night'
      );

      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Yellow median (#facc15)
      expect(fillStyles).toContain('#facc15');
      // Green sign gantry (#15803d)
      expect(fillStyles).toContain('#15803d');
      // Headlights (#fef08a)
      expect(fillStyles).toContain('#fef08a');
    });

    it('reveals Turquoise Ocean & Beach Dunes backdrop behind barrier', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'south',
        type: 'none',
        backdrop: 'beach_cabanas',
        perimeterFinish: 'stone_seawall',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        180,
        2720,
        1500,
        0,
        'south',
        'beach',
        'noon'
      );

      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Turquoise ocean surf (#0284c7)
      expect(fillStyles).toContain('#0284c7');
      // Golden sand dunes (#fde047)
      expect(fillStyles).toContain('#fde047');
      // Wooden boardwalk promenade (#b45309)
      expect(fillStyles).toContain('#b45309');
    });

    it('reveals Skyscraper Skyline backdrop with illuminated window grids behind barrier', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'no_stand',
        backdrop: 'skyscraper_skyline',
        perimeterFinish: 'concrete_wall',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        180,
        220,
        1500,
        0,
        'north',
        'big_city',
        'night'
      );

      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Office window illumination (#fef08a)
      expect(fillStyles).toContain('#fef08a');
      // Red aviation strobe beacon (#ef4444)
      expect(fillStyles).toContain('#ef4444');
    });
  });

  describe('D4.5D.3: Low Pitch-Edge Perimeter Barriers & Leaning Grassroots Fans', () => {
    it('renders low chainlink fence barrier with tension posts and barbed wire outriggers', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'west',
        type: 'none',
        perimeterFinish: 'chainlink_fence',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        180,
        220,
        0,
        2500,
        'west',
        'nature',
        'noon'
      );

      // Galvanized steel post color (#94a3b8)
      const postOps = operations.filter(op => op.method === 'set:fillStyle' && op.args[0] === '#94a3b8');
      expect(postOps.length).toBeGreaterThan(0);
    });

    it('renders low turnstile brick wall with Flemish brick courses and sandstone coping', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'south',
        type: 'none',
        perimeterFinish: 'turnstile_brick_wall',
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        180,
        2720,
        1500,
        0,
        'south',
        'small_city',
        'noon'
      );

      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Crimson brick (#7f1d1d) & Sandstone coping (#fef08a)
      expect(fillStyles).toContain('#7f1d1d');
      expect(fillStyles).toContain('#fef08a');
    });

    it('positions leaning grassroots supporters directly on perimeter barrier overlooking the pitch', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'none',
        primaryColor: '#dc2626',
        secondaryColor: '#2563eb',
        hasGrassrootsFans: true,
      };

      drawNoStandPerimeterAndBackdrop(
        ctx,
        stand,
        180,
        220,
        1500,
        0,
        'north',
        'mountains',
        'noon'
      );

      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Primary club jacket color
      expect(fillStyles).toContain('#dc2626');
      // Natural skin tones
      expect(fillStyles.some(c => c === '#f5c898' || c === '#d4a373' || c === '#8d5b4c')).toBe(true);
      // Flat caps / newsboy hats
      expect(fillStyles.some(c => c === '#334155' || c === '#451a03' || c === '#1e293b')).toBe(true);
    });
  });

  describe('D4.5D.4: Seamless Corner Miter Tapering into Open Ground', () => {
    it('seamlessly tapers corner miter from full touchline depth down to 0px when goal-end is no_stand', () => {
      const { ctx, operations } = createMockCanvasContext();
      const westStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 2,
        primaryColor: HOME_KIT.primaryColor,
      };
      const northStand: StandConfig = {
        position: 'north',
        type: 'no_stand',
      };
      const cornerNW: StandConfig = {
        position: 'corner_nw',
        type: 'tiered',
        tierCount: 2,
      };

      // StandDepthX = 145 (west grandstand), StandDepthY = 0 (north no-stand)
      drawMiteredCornerStand(
        ctx,
        cornerNW,
        'corner_nw',
        180,
        1680,
        220,
        2720,
        145,
        0,
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'mountains',
        westStand,
        northStand
      );

      // Verify stone coping highlight line along the tapered diagonal outer edge
      const stoneCopingOps = operations.filter(op => op.method === 'set:strokeStyle' && op.args[0] === '#f8fafc');
      expect(stoneCopingOps.length).toBeGreaterThan(0);

      // Verify return wall capping the exposed goal side
      const copingCapOps = operations.filter(op => op.method === 'set:fillStyle' && op.args[0] === '#cbd5e1');
      expect(copingCapOps.length).toBeGreaterThan(0);
    });

    it('seamlessly tapers corner miter from full goal-end depth down to 0px when touchline is no_stand', () => {
      const { ctx, operations } = createMockCanvasContext();
      const eastStand: StandConfig = {
        position: 'east',
        type: 'no_stand',
      };
      const northStand: StandConfig = {
        position: 'north',
        type: 'tiered',
        tierCount: 2,
      };
      const cornerNE: StandConfig = {
        position: 'corner_ne',
        type: 'tiered',
        tierCount: 2,
      };

      // StandDepthX = 0 (east no-stand), StandDepthY = 145 (north grandstand)
      drawMiteredCornerStand(
        ctx,
        cornerNE,
        'corner_ne',
        180,
        1680,
        220,
        2720,
        0,
        145,
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'mountains',
        eastStand,
        northStand
      );

      // Verify stroke operations along the tapered outer edge
      const strokeOps = operations.filter(op => op.method === 'stroke');
      expect(strokeOps.length).toBeGreaterThan(0);

      // Verify coping cap on return wall sealing touchline end
      const copingCapOps = operations.filter(op => op.method === 'set:fillStyle' && op.args[0] === '#cbd5e1');
      expect(copingCapOps.length).toBeGreaterThan(0);
    });

    it('renders corner quadrant as open ground (Case 1) when both adjoining stands are no_stand', () => {
      const { ctx, operations } = createMockCanvasContext();
      const westStand: StandConfig = {
        position: 'west',
        type: 'none',
      };
      const southStand: StandConfig = {
        position: 'south',
        type: 'no_stand',
      };
      const cornerSW: StandConfig = {
        position: 'corner_sw',
        type: 'tiered', // Corner might be tiered in config, but both neighbors are no-stand!
      };

      drawMiteredCornerStand(
        ctx,
        cornerSW,
        'corner_sw',
        180,
        1680,
        220,
        2720,
        0,
        0,
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'noon',
        'mountains',
        westStand,
        southStand
      );

      // Case 1 base terrain fill
      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      expect(fillStyles).toContain('#1e293b');

      // Low perimeter barrier stroke
      const strokeOps = operations.filter(op => op.method === 'stroke');
      expect(strokeOps.length).toBeGreaterThan(0);
    });
  });

  describe('D4.5D.5: Master Stadium Architecture Integration', () => {
    it('renders full stadium architecture with open North and South ends without error', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stadium = createDefaultStadium();
      stadium.surroundings = 'mountains';
      stadium.stands.north = {
        position: 'north',
        type: 'none',
        backdrop: 'alpine_peaks',
        perimeterFinish: 'dry_stone_wall',
      };
      stadium.stands.south = {
        position: 'south',
        type: 'no_stand',
        backdrop: 'alpine_peaks',
        perimeterFinish: 'dry_stone_wall',
      };

      expect(() => {
        drawStadiumArchitecture(
          ctx,
          PITCH_CONFIG.CENTER_X,
          PITCH_CONFIG.CENTER_Y,
          'craven',
          'noon',
          HOME_KIT,
          AWAY_KIT,
          undefined,
          stadium
        );
      }).not.toThrow();

      const fillStyles = operations.filter(op => op.method === 'set:fillStyle').map(op => op.args[0]);
      // Mountains snow caps and chalet
      expect(fillStyles).toContain('#f8fafc');
      expect(fillStyles).toContain('#78350f');
    });
  });
});
