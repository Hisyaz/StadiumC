/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { HOME_KIT, AWAY_KIT } from '../constants';
import {
  drawTierBalconyFascia,
  drawVomitoryPortal,
  resolveTierFasciaMaterial,
  getTierChairRows,
  drawSingleTouchlineStand,
  drawGoalEndStand,
  drawMiteredCornerStand,
  drawCornerQuadrantStands,
  drawContinuousColiseumBowl,
  drawTouchlineAndCornerStands,
} from '../stadiumRenderer';
import {
  StadiumDefinition,
  StandConfig,
  StandDeckConfig,
  TierSize,
  TierFasciaMaterial,
} from '../../types/stadium';

// High-fidelity Canvas 2D mock recording calls and color states
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

describe('Phase D4.5B: Multi-Floor Tier Architecture (True Elevated Levels)', () => {
  describe('D4.5B.1: Upper Floor Stacking & Balcony Fascias with Cast Shadows', () => {
    it('skips balcony fascia for ground-level tier (tierIndex = 0)', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = { position: 'west', type: 'tiered', tierCount: 2 };
      drawTierBalconyFascia(ctx, stand, 100, 200, 6, 400, 'west', 0, 2, 'concrete', 'night');
      // No drawing operations should occur for ground tier
      expect(operations.length).toBe(0);
    });

    it('renders structural concrete balcony fascia with cast drop shadow for upper tier (tierIndex > 0)', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = { position: 'west', type: 'tiered', tierCount: 2 };
      drawTierBalconyFascia(ctx, stand, 100, 200, 6, 400, 'west', 1, 2, 'concrete', 'night');

      expect(operations.length).toBeGreaterThan(0);

      // Verify cast drop shadow fill
      const shadowOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === 'rgba(0, 0, 0, 0.65)'
      );
      expect(shadowOp).toBeDefined();

      // Verify concrete slab face (#94a3b8)
      const concreteOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#94a3b8'
      );
      expect(concreteOp).toBeDefined();

      // Verify top coping highlight (#cbd5e1)
      const highlightOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#cbd5e1'
      );
      expect(highlightOp).toBeDefined();

      // Verify bottom shadow crease (#475569)
      const creaseOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#475569'
      );
      expect(creaseOp).toBeDefined();
    });

    it('correctly casts drop shadow in all 4 cardinal orientations', () => {
      // West stand: drops shadow eastward (positive X)
      {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'west', type: 'tiered' };
        drawTierBalconyFascia(ctx, stand, 100, 200, 6, 400, 'west', 1, 2, 'concrete');
        const fillRects = operations.filter((op) => op.method === 'fillRect');
        // First fillRect is primary drop shadow at fasciaX + fasciaW (100 + 6 = 106)
        expect(fillRects[0].args[0]).toBe(106);
      }

      // East stand: drops shadow westward (negative X)
      {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'east', type: 'tiered' };
        drawTierBalconyFascia(ctx, stand, 500, 200, 6, 400, 'east', 1, 2, 'concrete');
        const fillRects = operations.filter((op) => op.method === 'fillRect');
        // First fillRect is primary drop shadow at fasciaX - 6 (500 - 6 = 494)
        expect(fillRects[0].args[0]).toBe(494);
      }

      // North stand: drops shadow southward (positive Y)
      {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'north', type: 'tiered' };
        drawTierBalconyFascia(ctx, stand, 200, 100, 600, 6, 'north', 1, 2, 'concrete');
        const fillRects = operations.filter((op) => op.method === 'fillRect');
        // First fillRect is primary drop shadow at fasciaY + fasciaH (100 + 6 = 106)
        expect(fillRects[0].args[1]).toBe(106);
      }

      // South stand: drops shadow northward (negative Y)
      {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'south', type: 'tiered' };
        drawTierBalconyFascia(ctx, stand, 200, 800, 600, 6, 'south', 1, 2, 'concrete');
        const fillRects = operations.filter((op) => op.method === 'fillRect');
        // First fillRect is primary drop shadow at fasciaY - 5 (800 - 5 = 795)
        expect(fillRects[0].args[1]).toBe(795);
      }
    });
  });

  describe('D4.5B.2: Material Finishes Cleanly Applied to Balcony Fascias & Outer Walls', () => {
    it('resolves material finishes accurately from stand and deck configs', () => {
      // 1. Explicit deck fasciaMaterial takes priority
      const deckBrick: StandDeckConfig = { size: 'medium', fasciaMaterial: 'brick' };
      expect(resolveTierFasciaMaterial(undefined, deckBrick)).toBe('brick');

      // 2. Explicit stand fasciaMaterial
      const standSteel: StandConfig = { position: 'west', type: 'tiered', fasciaMaterial: 'steel' };
      expect(resolveTierFasciaMaterial(standSteel)).toBe('steel');

      // 3. Victorian brick resolution
      const standVic: StandConfig = { position: 'north', type: 'tiered', grandstandMaterial: 'victorian_brick' };
      expect(resolveTierFasciaMaterial(standVic)).toBe('brick');

      const standClassic: StandConfig = { position: 'north', type: 'tiered', grade: 'grade2_classic' };
      expect(resolveTierFasciaMaterial(standClassic)).toBe('brick');

      // 4. Industrial steel resolution
      const standInd: StandConfig = { position: 'south', type: 'tiered', grade: 'grade3_industrial' };
      expect(resolveTierFasciaMaterial(standInd)).toBe('steel');

      // 5. Timber resolution
      const standTimber: StandConfig = { position: 'east', type: 'tiered', grade: 'grade1_historic_timber' };
      expect(resolveTierFasciaMaterial(standTimber)).toBe('timber');

      // 6. Modern composite resolution
      const standComp: StandConfig = { position: 'west', type: 'tiered', grade: 'grade5_futuristic' };
      expect(resolveTierFasciaMaterial(standComp)).toBe('composite');

      // 7. Default to concrete
      const standDef: StandConfig = { position: 'west', type: 'tiered' };
      expect(resolveTierFasciaMaterial(standDef)).toBe('concrete');
    });

    it('renders authentic brick balcony fascia with sandstone coping', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = { position: 'west', type: 'tiered' };
      drawTierBalconyFascia(ctx, stand, 100, 200, 6, 400, 'west', 1, 2, 'brick', 'noon');

      // Verify red brick color (#991b1b)
      const brickOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#991b1b'
      );
      expect(brickOp).toBeDefined();

      // Verify sandstone coping (#fef08a)
      const copingOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#fef08a'
      );
      expect(copingOp).toBeDefined();
    });

    it('renders industrial steel balcony fascia with rivet studs', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = { position: 'west', type: 'tiered' };
      drawTierBalconyFascia(ctx, stand, 100, 200, 6, 400, 'west', 1, 2, 'steel', 'night');

      // Verify dark steel plate (#0f172a / #1e293b)
      const steelOp = operations.find(
        (op) => op.method === 'set_fillStyle' && (op.args[0] === '#0f172a' || op.args[0] === '#1e293b')
      );
      expect(steelOp).toBeDefined();

      // Verify silver rivet studs (#cbd5e1)
      const rivetOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#cbd5e1'
      );
      expect(rivetOp).toBeDefined();
    });

    it('renders timber balcony fascia with rustic wood tones', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = { position: 'north', type: 'tiered' };
      drawTierBalconyFascia(ctx, stand, 200, 100, 600, 6, 'north', 1, 2, 'timber', 'noon');

      // Verify wood tones (#78350f / #451a03 / #92400e)
      const timberOp = operations.find(
        (op) => op.method === 'set_fillStyle' && (op.args[0] === '#78350f' || op.args[0] === '#451a03')
      );
      expect(timberOp).toBeDefined();
    });
  });

  describe('D4.5B.3: Prominent Access Vomitory Tunnels (Entry Portals)', () => {
    it('renders vomitory portals with concrete frame, void, yellow nosing, handrails, and green exit lamp', () => {
      const { ctx, operations } = createMockCanvasContext();
      drawVomitoryPortal(ctx, 120, 250, 24, 24, 'west', 'night', 1);

      expect(operations.length).toBeGreaterThan(15);

      // 1. Concrete lintel surround (#94a3b8)
      const lintelOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#94a3b8'
      );
      expect(lintelOp).toBeDefined();

      // 2. Cavern entrance tunnel void (#020617)
      const voidOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#020617'
      );
      expect(voidOp).toBeDefined();

      // 3. Hazard yellow nosing steps (#facc15)
      const nosingOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(nosingOp).toBeDefined();

      // 4. Steel safety handrails (#94a3b8 stroke)
      const railOp = operations.find(
        (op) => op.method === 'set_strokeStyle' && op.args[0] === '#94a3b8'
      );
      expect(railOp).toBeDefined();

      // 5. Illuminated Green Emergency Exit Beacon (#22c55e)
      const exitLampOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#22c55e'
      );
      expect(exitLampOp).toBeDefined();
    });

    it('renders horizontal vomitory portals for goal-end stands', () => {
      const { ctx, operations } = createMockCanvasContext();
      drawVomitoryPortal(ctx, 400, 150, 24, 18, 'north', 'sunset', 0);

      // Verify emergency exit lamp and steps exist in horizontal orientation
      const exitLampOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#22c55e'
      );
      expect(exitLampOp).toBeDefined();

      const yellowStepOp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowStepOp).toBeDefined();
    });
  });

  describe('D4.5B.4: Stepped Chair Rows Driven by Tier Size', () => {
    it('returns exact chair row counts per tier size', () => {
      expect(getTierChairRows('small')).toBe(2);
      expect(getTierChairRows('medium')).toBe(3);
      expect(getTierChairRows('large')).toBe(4);
      expect(getTierChairRows()).toBe(3); // Default medium
    });

    it('adapts chair rows per tier in multi-tier stands', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 3,
        tiers: [
          { size: 'small' },  // Tier 0: 2 rows
          { size: 'medium' }, // Tier 1: 3 rows
          { size: 'large' },  // Tier 2: 4 rows
        ],
      };

      drawSingleTouchlineStand(
        ctx,
        stand,
        100,
        200,
        180,
        600,
        'west',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night'
      );

      expect(operations.length).toBeGreaterThan(100);

      // Verify balcony fascia rendered for upper tiers (t = 1, 2)
      const concreteFascias = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#94a3b8'
      );
      expect(concreteFascias.length).toBeGreaterThanOrEqual(2);

      // Verify exit lamps rendered in vomitory portals
      const exitLamps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#22c55e'
      );
      expect(exitLamps.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('D4.5B.5: Multi-Tier Integration Across All Stand Architectures', () => {
    it('renders Touchline and Goal-End stands with multi-floor tiers without error', () => {
      const { ctx } = createMockCanvasContext();
      const multiFloorDef: StadiumDefinition = {
        id: 'multi_floor_arena',
        name: 'Grand Stadium',
        shortName: 'Grand',
        city: 'Metropolis',
        country: 'Global',
        shape: 'rectangular',
        surroundings: 'big_city',
        hasTrack: false,
        capacity: 65000,
        fifaCategory: 'world',
        dugouts: { type: 'covered_sunken', quality: 'modern', frameColor: '#334155', cushionColor: '#1e293b', shelterTint: 'rgba(0,0,0,0.5)', setbackDistance: 12 },
        tunnel: { type: 'inflatable_accordion', siting: 'center_main', primaryColor: '#1e3a8a', secondaryColor: '#ffffff' },
        lighting: { type: 'corner_pylons', pylonCount: 4, powerKw: 2000, timeOfDay: 'night' },
        seats: { style: 'classic_bucket', pattern: 'solid', colors: ['#1e3a8a', '#ffffff'] },
        stands: {
          west: {
            position: 'west',
            type: 'tiered',
            tierCount: 4,
            tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'large' }, { size: 'large' }],
          },
          east: {
            position: 'east',
            type: 'tiered',
            tierCount: 2,
            tiers: [{ size: 'small' }, { size: 'medium' }],
          },
          north: {
            position: 'north',
            type: 'tiered',
            tierCount: 3,
            tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
          },
          south: {
            position: 'south',
            type: 'tiered',
            tierCount: 3,
            tiers: [{ size: 'small' }, { size: 'medium' }, { size: 'large' }],
          },
          corner_nw: { position: 'corner_nw', type: 'tiered', tierCount: 3 },
          corner_ne: { position: 'corner_ne', type: 'tiered', tierCount: 3 },
          corner_se: { position: 'corner_se', type: 'tiered', tierCount: 2 },
          corner_sw: { position: 'corner_sw', type: 'tiered', tierCount: 2 },
        },
      };

      expect(() => {
        drawTouchlineAndCornerStands(
          ctx,
          multiFloorDef,
          'monumental',
          'night',
          HOME_KIT,
          AWAY_KIT
        );
      }).not.toThrow();
    });

    it('renders continuous coliseum bowl with multi-floor concentric tiers and balcony fascias', () => {
      const { ctx, operations } = createMockCanvasContext();
      const coliseumDef: StadiumDefinition = {
        id: 'coliseum_multi_floor',
        name: 'Coliseum Arena',
        shortName: 'Coliseum',
        city: 'Rome',
        country: 'Italy',
        shape: 'round',
        surroundings: 'classical_statues' as any,
        hasTrack: false,
        capacity: 70000,
        fifaCategory: 'world',
        dugouts: { type: 'covered_sunken', quality: 'modern', frameColor: '#334155', cushionColor: '#1e293b', shelterTint: 'rgba(0,0,0,0.5)', setbackDistance: 12 },
        tunnel: { type: 'inflatable_accordion', siting: 'center_main', primaryColor: '#b91c1c', secondaryColor: '#fef08a' },
        lighting: { type: 'corner_pylons', pylonCount: 4, powerKw: 2400, timeOfDay: 'night' },
        seats: { style: 'classic_bucket', pattern: 'solid', colors: ['#b91c1c', '#fef08a'] },
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 3, tiers: [{ size: 'medium' }] },
          east: { position: 'east', type: 'tiered', tierCount: 3, tiers: [{ size: 'medium' }] },
          north: { position: 'north', type: 'tiered', tierCount: 3, tiers: [{ size: 'medium' }] },
          south: { position: 'south', type: 'tiered', tierCount: 3, tiers: [{ size: 'medium' }] },
          corner_nw: { position: 'corner_nw', type: 'tiered', tierCount: 3 },
          corner_ne: { position: 'corner_ne', type: 'tiered', tierCount: 3 },
          corner_se: { position: 'corner_se', type: 'tiered', tierCount: 3 },
          corner_sw: { position: 'corner_sw', type: 'tiered', tierCount: 3 },
        },
      };

      expect(() => {
        drawContinuousColiseumBowl(
          ctx,
          coliseumDef,
          'monumental',
          'night',
          HOME_KIT,
          AWAY_KIT,
          'round'
        );
      }).not.toThrow();

      // Verify coliseum balcony fascia strokes (#94a3b8 and #cbd5e1)
      const fasciaStroke = operations.find(
        (op) => op.method === 'set_strokeStyle' && op.args[0] === '#94a3b8'
      );
      expect(fasciaStroke).toBeDefined();

      const highlightStroke = operations.find(
        (op) => op.method === 'set_strokeStyle' && op.args[0] === '#cbd5e1'
      );
      expect(highlightStroke).toBeDefined();
    });

    it('renders corner quadrant miters with multi-floor elevated tier balconies and vomitories', () => {
      const { ctx, operations } = createMockCanvasContext();
      const cornerStand: StandConfig = {
        position: 'corner_nw',
        type: 'tiered',
        tierCount: 3,
        tiers: [{ size: 'medium' }, { size: 'medium' }, { size: 'medium' }],
      };

      expect(() => {
        drawMiteredCornerStand(
          ctx,
          cornerStand,
          'corner_nw',
          200,
          1600,
          200,
          2600,
          180,
          180,
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'night'
        );
      }).not.toThrow();

      // Verify corner vomitory entry lamp (#22c55e)
      const exitLamp = operations.find(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#22c55e'
      );
      expect(exitLamp).toBeDefined();

      // Verify corner tier balcony fascia stroke (#94a3b8)
      const fasciaStroke = operations.find(
        (op) => op.method === 'set_strokeStyle' && op.args[0] === '#94a3b8'
      );
      expect(fasciaStroke).toBeDefined();
    });
  });
});
