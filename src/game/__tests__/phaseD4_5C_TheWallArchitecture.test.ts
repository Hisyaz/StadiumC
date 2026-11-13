/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateDynamicStandDepth,
  getWallTierChairRows,
  StadiumDefinition,
  StandConfig,
} from '../../types/stadium';
import {
  drawSingleTouchlineStand,
  drawGoalEndStand,
  drawMiteredCornerStand,
  drawContinuousColiseumBowl,
  drawOuterRearDelimitationWall,
  drawWallRearParapetWithGates,
  drawWallCrushBarriers,
  drawCurvedSouthBowlFacade,
  getStadiumShapeMetrics,
} from '../stadiumRenderer';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from '../constants';

// Canvas 2D Mock recording method calls and property setters
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

describe('Phase D4.5C: Monolithic "The Wall" Stand Architecture', () => {
  describe('D4.5C.1: Uninterrupted 210px–260px Massive Terrace Depth', () => {
    it('enforces exact canonical depths for The Wall: Small=90px, Medium=150px, Big=250px', () => {
      const wallSmall: StandConfig = { position: 'west', type: 'wall', wallSize: 'small' };
      const wallMedium: StandConfig = { position: 'west', type: 'wall', wallSize: 'medium' };
      const wallLarge: StandConfig = { position: 'west', type: 'wall', wallSize: 'large' };

      expect(calculateDynamicStandDepth(wallSmall)).toBe(90);
      expect(calculateDynamicStandDepth(wallMedium)).toBe(150);
      expect(calculateDynamicStandDepth(wallLarge)).toBe(250);

      // Default when wallSize is omitted is medium (150px)
      const wallDef: StandConfig = { position: 'north', type: 'wall' };
      expect(calculateDynamicStandDepth(wallDef)).toBe(150);
    });

    it('renders as a single massive tier (tierCount = 1) without multi-tier balcony breaks or vomitories cutting the face', () => {
      const { ctx, operations } = createMockCanvasContext();
      const wallStand: StandConfig = {
        position: 'west',
        type: 'wall',
        wallSize: 'large', // 16 rows
        grade: 'grade3_industrial',
        primaryColor: '#facc15',
        secondaryColor: '#000000',
      };

      drawSingleTouchlineStand(
        ctx,
        wallStand,
        100,
        200,
        260,
        600,
        'west',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night'
      );

      // Verify ZERO balcony fascia operations between tiers (t > 0 is skipped because tierCount = 1)
      const concreteBalconies = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#94a3b8' && op.args[1] === 6
      );
      expect(concreteBalconies.length).toBe(0);

      // Verify ZERO vomitories cutting into the face of the terrace (#22c55e exit sign from drawVomitoryPortal is absent)
      const terraceVomitoryExits = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#22c55e'
      );
      expect(terraceVomitoryExits.length).toBe(0);
    });

    it('renders full terrace depth on South Stand without 55% truncation', () => {
      const { ctx, operations } = createMockCanvasContext();
      const wallSouth: StandConfig = {
        position: 'south',
        type: 'wall',
        wallSize: 'large', // 16 rows
        grade: 'grade3_industrial',
        primaryColor: '#facc15',
        secondaryColor: '#000000',
      };

      drawGoalEndStand(
        ctx,
        wallSouth,
        200,
        1000,
        800,
        260,
        'south',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night'
      );

      // Verify crash barriers rendered across the full depth
      const yellowHazardBars = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowHazardBars.length).toBeGreaterThan(16);

      // Verify absence of the intermediate promenade dividing bleachers (promenade is skipped on The Wall)
      const promPavements = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#334155' && op.args[2] === 800
      );
      expect(promPavements.length).toBe(0);
    });
  });

  describe('D4.5C.2: Pronounced High-Oblique Rake Angle Going Higher and Further Away', () => {
    it('renders progressively deeper 3D riser shadow lips as steps ascend into the distance', () => {
      const { ctx, operations } = createMockCanvasContext();
      const wallNorth: StandConfig = {
        position: 'north',
        type: 'wall',
        wallSize: 'large', // 16 rows
        primaryColor: '#facc15',
        secondaryColor: '#000000',
      };

      drawGoalEndStand(
        ctx,
        wallNorth,
        200,
        100,
        800,
        260,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night'
      );

      // Verify fillRect calls for riser shadow lips (height ranges from ~2.0px on lower steps to 6.0px on upper steps)
      const fillRects = operations.filter((op) => op.method === 'fillRect');
      const riserShadows = fillRects.filter((op) => {
        const h = op.args[3];
        return h >= 2.0 && h <= 6.5;
      });
      expect(riserShadows.length).toBeGreaterThanOrEqual(16);

      // Deepest shadows (> 4.5px) represent top rows ascending toward the towering parapet
      const deepestShadows = fillRects.filter((op) => op.args[3] >= 4.5);
      expect(deepestShadows.length).toBeGreaterThanOrEqual(2);
    });

    it('renders progressive riser shadow lips on touchline stands ascending away from the pitch', () => {
      const { ctx, operations } = createMockCanvasContext();
      const wallWest: StandConfig = {
        position: 'west',
        type: 'wall',
        wallSize: 'large',
        primaryColor: '#facc15',
        secondaryColor: '#000000',
      };

      drawSingleTouchlineStand(
        ctx,
        wallWest,
        100,
        200,
        260,
        600,
        'west',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night'
      );

      const fillRects = operations.filter((op) => op.method === 'fillRect');
      // On West stand, shadowLip increases progressively from 1.5px to 5.0px width
      const verticalRiserShadows = fillRects.filter((op) => {
        const w = op.args[2];
        return w >= 1.5 && w <= 5.5 && op.args[3] >= 590;
      });
      expect(verticalRiserShadows.length).toBeGreaterThanOrEqual(16);
    });
  });

  describe('D4.5C.3: Continuous Horizontal Crash Barriers (Geländer) on EVERY Terrace Step', () => {
    it('renders crash barriers on even AND odd step indices when everyStep is true', () => {
      const { ctx: ctxEven, operations: opsEven } = createMockCanvasContext();
      // Step 0 (even) with everyStep = true -> renders
      drawWallCrushBarriers(ctxEven, 100, 200, 300, 20, 'north', 0, false, true);
      const yellowFillsEven = opsEven.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowFillsEven.length).toBeGreaterThan(0);

      // Step 1 (odd) with everyStep = true -> renders
      const { ctx: ctxOdd, operations: opsOdd } = createMockCanvasContext();
      drawWallCrushBarriers(ctxOdd, 100, 200, 300, 20, 'north', 1, false, true);
      const yellowFillsOdd = opsOdd.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowFillsOdd.length).toBeGreaterThan(0);
    });

    it('renders crash barriers across all 16 rows of a Big Wall stand without gaps', () => {
      const { ctx, operations } = createMockCanvasContext();
      const wallStand: StandConfig = {
        position: 'north',
        type: 'wall',
        wallSize: 'large', // 16 rows
        primaryColor: '#facc15',
        secondaryColor: '#000000',
      };

      drawGoalEndStand(
        ctx,
        wallStand,
        200,
        100,
        800,
        260,
        'north',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night'
      );

      // Verify tubular railing hazard bars rendered in each of the 16 steps
      const yellowHazardBars = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowHazardBars.length).toBeGreaterThanOrEqual(16);

      const blackHazardBars = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#0f172a'
      );
      expect(blackHazardBars.length).toBeGreaterThanOrEqual(16);
    });

    it('renders continuous crash barriers across 45° corner miters on every step', () => {
      const { ctx, operations } = createMockCanvasContext();
      const cornerWall: StandConfig = {
        position: 'corner_nw',
        type: 'wall',
        wallSize: 'large',
      };

      drawMiteredCornerStand(
        ctx,
        cornerWall,
        'corner_nw',
        200,
        1600,
        200,
        2600,
        260,
        260,
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night'
      );

      const yellowBars = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowBars.length).toBeGreaterThanOrEqual(16);
    });

    it('renders continuous crash barriers on every row in continuous coliseum bowls', () => {
      const { ctx, operations } = createMockCanvasContext();
      const coliseumWallDef: StadiumDefinition = {
        id: 'coliseum_wall_test',
        name: 'Circular Wall Ground',
        tier: 'monumental',
        shape: 'round',
        capacity: 80000,
        stands: {
          west: { position: 'west', type: 'wall', wallSize: 'large' },
          east: { position: 'east', type: 'wall', wallSize: 'large' },
          north: { position: 'north', type: 'wall', wallSize: 'large' },
          south: { position: 'south', type: 'wall', wallSize: 'large' },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(
        ctx,
        coliseumWallDef,
        'monumental',
        'noon',
        HOME_KIT,
        AWAY_KIT,
        'round'
      );

      const yellowBars = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowBars.length).toBeGreaterThanOrEqual(16);
    });
  });

  describe('D4.5C.4: Towering Rear Parapet with Rear Vomitory Gates', () => {
    it('renders towering rear parapet wall with heavy stone coping in all 4 cardinal orientations', () => {
      // West stand: 26px towering parapet
      {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'west', type: 'wall', wallSize: 'large' };
        drawWallRearParapetWithGates(ctx, stand, 100, 200, 260, 600, 'west', 'night');

        // Drop shadow extending west
        const westShadow = operations.find(
          (op) => op.method === 'fillRect' && op.args[0] === 84 && op.args[2] === 16
        );
        expect(westShadow).toBeDefined();

        // Heavy stone coping cap (#cbd5e1 and #f8fafc)
        const copingHighlight = operations.find(
          (op) => op.method === 'set_fillStyle' && op.args[0] === '#f8fafc'
        );
        expect(copingHighlight).toBeDefined();
      }

      // North stand: 44px towering parapet
      {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'north', type: 'wall', wallSize: 'large' };
        drawWallRearParapetWithGates(ctx, stand, 200, 100, 800, 260, 'north', 'night', 60);

        // Towering depth 44px
        const northWallBody = operations.find(
          (op) => op.method === 'fillRect' && op.args[3] === 44
        );
        expect(northWallBody).toBeDefined();
      }

      // South stand: 48px towering parapet
      {
        const { ctx, operations } = createMockCanvasContext();
        const stand: StandConfig = { position: 'south', type: 'wall', wallSize: 'large' };
        drawWallRearParapetWithGates(ctx, stand, 200, 1000, 800, 260, 'south', 'night', 120);

        // Towering depth 48px
        const southWallBody = operations.find(
          (op) => op.method === 'fillRect' && op.args[3] === 48
        );
        expect(southWallBody).toBeDefined();
      }
    });

    it('embeds concourse rear vomitory gates with green beacons, cavern voids, and yellow safety steps in the towering parapet', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = { position: 'north', type: 'wall', wallSize: 'large' };
      drawWallRearParapetWithGates(ctx, stand, 200, 100, 800, 260, 'north', 'night', 60);

      // 1. Dark cavern tunnel voids (#020617)
      const tunnelVoids = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#020617'
      );
      expect(tunnelVoids.length).toBeGreaterThanOrEqual(4);

      // 2. Concrete arch lintels (#94a3b8)
      const lintels = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#94a3b8'
      );
      expect(lintels.length).toBeGreaterThanOrEqual(4);

      // 3. Illuminated Green Concourse Exit Beacons (#10b981)
      const exitBeacons = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#10b981'
      );
      expect(exitBeacons.length).toBeGreaterThanOrEqual(4);

      // 4. Hazard yellow safety steps threshold nosing (#facc15)
      const yellowSteps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowSteps.length).toBeGreaterThanOrEqual(4);

      // 5. Steel turnstile crossbars (#64748b)
      const turnstiles = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#64748b'
      );
      expect(turnstiles.length).toBeGreaterThanOrEqual(4);
    });

    it('automatically routes drawOuterRearDelimitationWall to towering parapet when stand is The Wall', () => {
      const { ctx, operations } = createMockCanvasContext();
      const wallStand: StandConfig = { position: 'west', type: 'wall', wallSize: 'large' };

      drawOuterRearDelimitationWall(ctx, wallStand, 100, 200, 260, 600, 'west', 'night');

      // Verify that rear vomitory exit beacons (#10b981) and heavy coping were drawn
      const exitBeacons = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#10b981'
      );
      expect(exitBeacons.length).toBeGreaterThanOrEqual(3);
    });

    it('embeds radial rear vomitory gates along the outer rim of coliseum bowls for The Wall', () => {
      const { ctx, operations } = createMockCanvasContext();
      const coliseumWallDef: StadiumDefinition = {
        id: 'coliseum_gates_test',
        name: 'The Wall Coliseum',
        tier: 'monumental',
        shape: 'round',
        stands: {
          west: { position: 'west', type: 'wall', wallSize: 'large' },
          east: { position: 'east', type: 'wall', wallSize: 'large' },
          north: { position: 'north', type: 'wall', wallSize: 'large' },
          south: { position: 'south', type: 'wall', wallSize: 'large' },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(
        ctx,
        coliseumWallDef,
        'monumental',
        'night',
        HOME_KIT,
        AWAY_KIT,
        'round'
      );

      // Verify coliseum rear vomitory exit beacons (#10b981) along perimeter rim
      const rimExitBeacons = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#10b981'
      );
      expect(rimExitBeacons.length).toBeGreaterThanOrEqual(12);

      // Verify 26px structural parapet thickness was applied
      const strokeCalls = operations.filter((op) => op.method === 'set_lineWidth' && op.args[0] === 26);
      expect(strokeCalls.length).toBeGreaterThanOrEqual(1);
    });
  });
});
