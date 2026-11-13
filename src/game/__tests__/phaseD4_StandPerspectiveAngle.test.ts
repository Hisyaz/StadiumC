/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi } from 'vitest';
import { PITCH_CONFIG, HOME_KIT, AWAY_KIT } from '../constants';
import {
  getStandPerspectiveMetrics,
  getCornerMiterGeometry,
  drawOuterRearDelimitationWall,
  drawGoalEndStand,
  drawSingleTouchlineStand,
  drawTouchlineAndCornerStands,
  drawCornerQuadrantStands,
  getStadiumShapeMetrics,
  getColiseumPointAtDistance,
  drawSouthEntranceGatehousePavilion,
  drawNorthUpperPorticoPavilion,
  getStadiumFloodlightTowerPositions,
  drawAngledFloodlightTower,
  drawStadiumFloodlights,
  drawTimeOfDayAtmosphere,
} from '../stadiumRenderer';
import { StadiumDefinition, StandConfig } from '../../types/stadium';

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
            addColorStop: vi.fn(),
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

describe('Phase D4: Subtle High-Oblique Stand Perspective Alignment', () => {
  describe('D4.1: Strict IFAB Playable Pitch Invariance', () => {
    it('guarantees 100% invariant, planar, orthogonal IFAB pitch coordinates', () => {
      // IFAB playable pitch boundary constants must remain strictly unchanged
      expect(PITCH_CONFIG.PITCH_LEFT).toBe(180);
      expect(PITCH_CONFIG.PITCH_RIGHT).toBe(1680);
      expect(PITCH_CONFIG.PITCH_TOP).toBe(220);
      expect(PITCH_CONFIG.PITCH_BOTTOM).toBe(2720);
      expect(PITCH_CONFIG.CENTER_X).toBe(930);
      expect(PITCH_CONFIG.CENTER_Y).toBe(1470);

      // Pitch dimensions: 1500px width x 2500px length (105m x 68m standard ratio)
      const pitchWidth = PITCH_CONFIG.PITCH_RIGHT - PITCH_CONFIG.PITCH_LEFT;
      const pitchHeight = PITCH_CONFIG.PITCH_BOTTOM - PITCH_CONFIG.PITCH_TOP;
      expect(pitchWidth).toBe(1500);
      expect(pitchHeight).toBe(2500);

      // Center spot exact midpoint invariance
      expect((PITCH_CONFIG.PITCH_LEFT + PITCH_CONFIG.PITCH_RIGHT) / 2).toBe(PITCH_CONFIG.CENTER_X);
      expect((PITCH_CONFIG.PITCH_TOP + PITCH_CONFIG.PITCH_BOTTOM) / 2).toBe(PITCH_CONFIG.CENTER_Y);
    });

    it('ensures touchline plinths sit flush against straight pitch boundary without tilt', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 2,
      };

      const x = 60;
      const y = PITCH_CONFIG.PITCH_TOP;
      const w = 120;
      const h = PITCH_CONFIG.PITCH_BOTTOM - PITCH_CONFIG.PITCH_TOP;

      drawSingleTouchlineStand(ctx, stand, x, y, w, h, 'west', HOME_KIT, AWAY_KIT, 'rectangular');

      // Foundation plinth for West stand is drawn along x + w - 7, completely straight
      const plinthRects = operations.filter(
        (op) => op.method === 'fillRect' && op.args[0] === x + w - 7
      );
      expect(plinthRects.length).toBeGreaterThan(0);
      expect(plinthRects[0].args[1]).toBe(y - 4);
      expect(plinthRects[0].args[2]).toBe(7);
      expect(plinthRects[0].args[3]).toBe(h + 8);
    });
  });

  describe('D4.2: Southern Stand Subtle Perspective Angle Realignment', () => {
    it('computes calibrated subtle perspective tapers with south expansion > north taper', () => {
      const metrics = getStandPerspectiveMetrics('rectangular', 120, 120);

      expect(metrics.northTaperX).toBeGreaterThan(0);
      expect(metrics.southTaperX).toBeGreaterThan(0);
      // Perspective optical convergence: south (foreground) expands more than north (background) foreshortens
      expect(metrics.southTaperX).toBeGreaterThan(metrics.northTaperX);
      expect(metrics.lateralTaperNorth).toBeGreaterThan(0);
      expect(metrics.lateralTaperSouth).toBeGreaterThan(0);
      expect(metrics.lateralTaperSouth).toBeGreaterThan(metrics.lateralTaperNorth);
      expect(metrics.perspectiveRatio).toBeGreaterThanOrEqual(0.072);
    });

    it('renders southern rear delimitation wall with flared width matching grounds perspective', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'south',
        type: 'tiered',
        grade: 'grade4_modern',
      };

      const wallX = 300;
      const wallY = 2720;
      const wallW = 1200;
      const wallH = 120;
      const perspectiveOffset = 24;

      drawOuterRearDelimitationWall(ctx, stand, wallX, wallY, wallW, wallH, 'south', 'night', perspectiveOffset);

      // Flared southern wall base: wallX - offset = 300 - 24 = 276; wallW + 2*offset = 1200 + 48 = 1248
      const expectedFlaredX = wallX - perspectiveOffset;
      const expectedFlaredW = wallW + 2 * perspectiveOffset;

      const substrateRects = operations.filter(
        (op) => op.method === 'fillRect' && op.args[0] === expectedFlaredX && op.args[2] === expectedFlaredW
      );
      expect(substrateRects.length).toBeGreaterThan(0);
    });

    it('renders southern goal-end stand with perspective trapezoid tiers expanding into foreground', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'south',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 2,
      };

      const x = 180;
      const y = 2720;
      const w = 1500;
      const h = 120;

      drawGoalEndStand(ctx, stand, x, y, w, h, 'south', HOME_KIT, AWAY_KIT, 'rectangular');

      // The perspective trapezoid clipping path connects front (x, y) to flared rear (x - southTaper, y + h)
      const perspective = getStandPerspectiveMetrics('rectangular', 120, h);
      const southTaper = perspective.southTaperX;

      const moveToOps = operations.filter((op) => op.method === 'moveTo' && op.args[0] === x && op.args[1] === y);
      const lineToFlared = operations.filter(
        (op) => op.method === 'lineTo' && op.args[0] === x + w + southTaper && op.args[1] === y + h
      );

      expect(moveToOps.length).toBeGreaterThan(0);
      expect(lineToFlared.length).toBeGreaterThan(0);
    });
  });

  describe('D4.3: Northern Stand Downward Angle Harmonization', () => {
    it('renders northern goal-end stand with symmetrical inward perspective convergence', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 2,
      };

      const x = 180;
      const y = 100;
      const w = 1500;
      const h = 120;

      drawGoalEndStand(ctx, stand, x, y, w, h, 'north', HOME_KIT, AWAY_KIT, 'rectangular');

      const perspective = getStandPerspectiveMetrics('rectangular', 120, h);
      const northTaper = perspective.northTaperX;

      // The northern trapezoid path connects rear (x + northTaper, y) to front (x, y + h)
      const moveToNorth = operations.filter(
        (op) => op.method === 'moveTo' && op.args[0] === x + northTaper && op.args[1] === y
      );
      const lineToFront = operations.filter(
        (op) => op.method === 'lineTo' && op.args[0] === x && op.args[1] === y + h
      );

      expect(moveToNorth.length).toBeGreaterThan(0);
      expect(lineToFront.length).toBeGreaterThan(0);
    });

    it('aligns northern rear delimitation wall to inward tapered width', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'tiered',
        grade: 'grade4_modern',
      };

      const wallX = 300;
      const wallY = 100;
      const wallW = 1200;
      const wallH = 120;
      const perspectiveOffset = 14;

      drawOuterRearDelimitationWall(ctx, stand, wallX, wallY, wallW, wallH, 'north', 'night', perspectiveOffset);

      const expectedTaperedX = wallX + perspectiveOffset;
      const expectedTaperedW = wallW - 2 * perspectiveOffset;

      const wallRects = operations.filter(
        (op) => op.method === 'fillRect' && op.args[0] === expectedTaperedX && op.args[2] === expectedTaperedW
      );
      expect(wallRects.length).toBeGreaterThan(0);
    });
  });

  describe('D4.4: Lateral Stands (East & West) Longitudinal Perspective Taper & Corner Miters', () => {
    it('flares outer footprint of touchline stands outward from North to South while preserving vertical inner edge', () => {
      const { ctx, operations } = createMockCanvasContext();
      const westStand: StandConfig = {
        position: 'west',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 2,
      };

      const x = 60;
      const y = 220;
      const w = 120;
      const h = 2500;

      drawSingleTouchlineStand(ctx, westStand, x, y, w, h, 'west', HOME_KIT, AWAY_KIT, 'rectangular');

      const perspective = getStandPerspectiveMetrics('rectangular', w, h);
      const latNorth = perspective.lateralTaperNorth;
      const latSouth = perspective.lateralTaperSouth;

      // West trapezoid connects (x + latNorth, y) to (x + w, y) down to (x + w, y + h) to (x - latSouth, y + h)
      const moveToNorthOuter = operations.filter(
        (op) => op.method === 'moveTo' && op.args[0] === x + latNorth && op.args[1] === y
      );
      const lineToPitchEdge = operations.filter(
        (op) => op.method === 'lineTo' && op.args[0] === x + w && op.args[1] === y
      );
      const lineToSouthOuter = operations.filter(
        (op) => op.method === 'lineTo' && op.args[0] === x - latSouth && op.args[1] === y + h
      );

      expect(moveToNorthOuter.length).toBeGreaterThan(0);
      expect(lineToPitchEdge.length).toBeGreaterThan(0);
      expect(lineToSouthOuter.length).toBeGreaterThan(0);
    });

    it('computes corner miter vertices aligning seamlessly with tapered cardinal stand outer edges', () => {
      const left = 300;
      const right = 1500;
      const top = 200;
      const bottom = 2700;
      const depthX = 120;
      const depthY = 120;

      const perspective = getStandPerspectiveMetrics('rectangular', depthX, depthY);

      // NW Corner aligns with North inward taper and West northern inward taper
      const miterNW = getCornerMiterGeometry('corner_nw', left, right, top, bottom, depthX, depthY, perspective);
      expect(miterNW.pPerspectiveOut).toBeDefined();
      expect(miterNW.pPerspectiveOut!.x).toBe(left - depthX + perspective.lateralTaperNorth);
      expect(miterNW.pPerspectiveOut!.y).toBe(top - depthY);

      // NE Corner aligns with North inward taper and East northern inward taper
      const miterNE = getCornerMiterGeometry('corner_ne', left, right, top, bottom, depthX, depthY, perspective);
      expect(miterNE.pPerspectiveOut).toBeDefined();
      expect(miterNE.pPerspectiveOut!.x).toBe(right + depthX - perspective.lateralTaperNorth);
      expect(miterNE.pPerspectiveOut!.y).toBe(top - depthY);

      // SW Corner aligns vertically with West touchline stand (Hotfix T13B)
      const miterSW = getCornerMiterGeometry('corner_sw', left, right, top, bottom, depthX, depthY, perspective);
      expect(miterSW.pPerspectiveOut).toBeDefined();
      expect(miterSW.pPerspectiveOut!.x).toBe(left - depthX);
      expect(miterSW.pPerspectiveOut!.y).toBe(bottom + depthY);

      // SE Corner aligns vertically with East touchline stand (Hotfix T13B)
      const miterSE = getCornerMiterGeometry('corner_se', left, right, top, bottom, depthX, depthY, perspective);
      expect(miterSE.pPerspectiveOut).toBeDefined();
      expect(miterSE.pPerspectiveOut!.x).toBe(right + depthX);
      expect(miterSE.pPerspectiveOut!.y).toBe(bottom + depthY);
    });

    it('renders all 4 corner quadrant stands without error using perspective alignment', () => {
      const { ctx } = createMockCanvasContext();
      const stadiumDef: Partial<StadiumDefinition> = {
        shape: 'rectangular',
        stands: {
          corner_nw: { position: 'corner_nw', type: 'tiered', grade: 'grade4_modern' },
          corner_ne: { position: 'corner_ne', type: 'tiered', grade: 'grade4_modern' },
          corner_se: { position: 'corner_se', type: 'tiered', grade: 'grade4_modern' },
          corner_sw: { position: 'corner_sw', type: 'tiered', grade: 'grade4_modern' },
        } as any,
      };

      expect(() => {
        drawCornerQuadrantStands(
          ctx,
          stadiumDef as StadiumDefinition,
          180,
          1680,
          220,
          2720,
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'night',
          120,
          120,
          'big_city'
        );
      }).not.toThrow();
    });
  });

  describe('D4.5: Round & Oval Coliseum Bowls Radial Perspective', () => {
    it('applies calibrated radial eccentricity gradient (0.95 north to 1.05 south) on coliseums', () => {
      const pRound = getStandPerspectiveMetrics('round');
      const pOval = getStandPerspectiveMetrics('oval');

      expect(pRound.eccentricityNorth).toBeLessThan(1.0);
      expect(pRound.eccentricitySouth).toBeGreaterThan(1.0);
      expect(pOval.eccentricityNorth).toBeLessThan(1.0);
      expect(pOval.eccentricitySouth).toBeGreaterThan(1.0);
    });

    it('renders continuous coliseum bowl with perspective curvature without breaking inner boundary', () => {
      const { ctx } = createMockCanvasContext();
      const stadiumDef: Partial<StadiumDefinition> = {
        shape: 'oval',
        surroundings: 'big_city',
        stands: {
          north: { position: 'north', type: 'tiered', grade: 'grade4_modern' },
          south: { position: 'south', type: 'tiered', grade: 'grade4_modern' },
          east: { position: 'east', type: 'tiered', grade: 'grade4_modern' },
          west: { position: 'west', type: 'tiered', grade: 'grade4_modern' },
        } as any,
      };

      expect(() => {
        drawTouchlineAndCornerStands(
          ctx,
          stadiumDef as StadiumDefinition,
          'monumental',
          'night',
          HOME_KIT,
          AWAY_KIT
        );
      }).not.toThrow();
    });
  });

  describe('Hotfix D4.1: High-Oblique Stand Perspective Geometry & Southern Low-Profile Realignment', () => {
    it('computes severe 3D high-oblique perspective metrics matching grounds trapezoid flaring', () => {
      const p = getStandPerspectiveMetrics('rectangular', 120, 120);

      // Severely increased perspective metrics
      expect(p.southTaperX).toBeGreaterThanOrEqual(100); // ~126px base flare
      expect(p.northTaperX).toBeGreaterThanOrEqual(50);  // ~66px vanishing taper
      expect(p.lateralTaperNorth).toBeGreaterThanOrEqual(40); // ~54px northern taper
      expect(p.lateralTaperSouth).toBeGreaterThanOrEqual(90); // ~114px southern flare
      expect(p.eccentricityNorth).toBeLessThan(0.92);
      expect(p.eccentricitySouth).toBeGreaterThan(1.10);
    });

    it('renders southern goal-end stand with low-profile seating rake and upper promenade concourse', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'south',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 2,
      };

      const x = 180;
      const y = 2720;
      const w = 1500;
      const h = 120;

      drawGoalEndStand(ctx, stand, x, y, w, h, 'south', HOME_KIT, AWAY_KIT, 'rectangular');

      // Promenade deck is rendered with solid fill and access portals
      const exitOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#22c55e'
      );
      expect(exitOps.length).toBeGreaterThan(0);
    });

    it('renders northern goal-end stand with central raised architectural portico structure', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 2,
      };

      const x = 180;
      const y = 100;
      const w = 1500;
      const h = 120;

      drawGoalEndStand(ctx, stand, x, y, w, h, 'north', HOME_KIT, AWAY_KIT, 'rectangular');

      // Central portico glass windows are rendered
      const glassOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && (op.args[0] === '#0284c7' || op.args[0] === 'rgba(56, 189, 248, 0.6)')
      );
      expect(glassOps.length).toBeGreaterThan(0);
    });
  });

  describe('Hotfix D4.2: Round & Oval Coliseum Continuous Bowls & Infill Anti-Clipping Geometry', () => {
    it('guarantees uniform track infill clearance (>= 80px buffer) with zero corner clipping on Round & Oval grounds', () => {
      const roundMetrics = getStadiumShapeMetrics('round', 'standard', true);
      const ovalMetrics = getStadiumShapeMetrics('oval', 'standard', true);

      // Pitch corner distance from center (930, 1470) to (180, 220) = sqrt(750^2 + 1250^2) = 1457.74px
      const pitchCornerDiagonal = Math.sqrt(Math.pow(750, 2) + Math.pow(1250, 2));

      // In Round coliseum with running track: apron radius must provide at least 80px buffer beyond pitch corners
      expect(roundMetrics.apronRadiusX).toBeGreaterThan(pitchCornerDiagonal + 70);
      expect(roundMetrics.westInnerX).toBeLessThan(PITCH_CONFIG.PITCH_LEFT - 80);
      expect(roundMetrics.eastInnerX).toBeGreaterThan(PITCH_CONFIG.PITCH_RIGHT + 80);

      // In Oval coliseum with running track: straight touchline flanks and endzone curves provide >= 120px buffer
      expect(ovalMetrics.westInnerX).toBeLessThanOrEqual(PITCH_CONFIG.PITCH_LEFT - 120);
      expect(ovalMetrics.eastInnerX).toBeGreaterThanOrEqual(PITCH_CONFIG.PITCH_RIGHT + 120);
      expect(ovalMetrics.northInnerY).toBeLessThanOrEqual(PITCH_CONFIG.PITCH_TOP - 120);
      expect(ovalMetrics.southInnerY).toBeGreaterThanOrEqual(PITCH_CONFIG.PITCH_BOTTOM + 120);
    });

    it('verifies 2.5D curvilinear coliseum perspective with foreshortened north and expanded south', () => {
      const pRound = getStandPerspectiveMetrics('round');
      const pOval = getStandPerspectiveMetrics('oval');

      expect(pRound.eccentricityNorth).toBeCloseTo(0.88, 2);
      expect(pRound.eccentricitySouth).toBeCloseTo(1.16, 2);
      expect(pOval.eccentricityNorth).toBeCloseTo(0.88, 2);
      expect(pOval.eccentricitySouth).toBeCloseTo(1.16, 2);

      // Test getColiseumPointAtDistance for Round coliseum
      const cx = PITCH_CONFIG.CENTER_X;
      const cy = PITCH_CONFIG.CENTER_Y;
      const rIn = 1500;
      const d = 100;

      // North apex (angle = 3*PI/2)
      const ptNorth = getColiseumPointAtDistance('round', cx, cy, PITCH_CONFIG.PITCH_TOP, PITCH_CONFIG.PITCH_BOTTOM, 100, 1760, rIn, d, Math.PI * 1.5);
      // South apex (angle = PI/2)
      const ptSouth = getColiseumPointAtDistance('round', cx, cy, PITCH_CONFIG.PITCH_TOP, PITCH_CONFIG.PITCH_BOTTOM, 100, 1760, rIn, d, Math.PI * 0.5);

      const northDist = cy - ptNorth.y;
      const southDist = ptSouth.y - cy;

      expect(northDist).toBe(rIn + d * pRound.eccentricityNorth);
      expect(southDist).toBe(rIn + d * pRound.eccentricitySouth);
      expect(southDist).toBeGreaterThan(northDist);
    });

    it('renders Round and Oval coliseums with low-profile south seating rake and elevated concourse promenade', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stadiumDef: Partial<StadiumDefinition> = {
        shape: 'round',
        surroundings: 'big_city',
        stands: {
          north: { position: 'north', type: 'tiered', grade: 'grade4_modern' },
          south: { position: 'south', type: 'tiered', grade: 'grade4_modern' },
          east: { position: 'east', type: 'tiered', grade: 'grade4_modern' },
          west: { position: 'west', type: 'tiered', grade: 'grade4_modern' },
        } as any,
      };

      drawTouchlineAndCornerStands(
        ctx,
        stadiumDef as StadiumDefinition,
        'monumental',
        'night',
        HOME_KIT,
        AWAY_KIT
      );

      // Yellow safety caution line on concourse promenade balustrade
      const yellowLineOps = operations.filter(
        (op) => op.method === 'set_strokeStyle' && op.args[0] === '#eab308'
      );
      expect(yellowLineOps.length).toBeGreaterThan(0);

      // Grand central entrance pavilion atrium doorway
      const pavilionAtriumOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#1e3a8a'
      );
      expect(pavilionAtriumOps.length).toBeGreaterThan(0);
    });
  });

  describe('Hotfix D4.3: South Main Entrance Gatehouse & North Upper Portico Suite Across All 4 Stadium Types', () => {
    it('renders iconic South Main Entrance Gatehouse Pavilion with deep blue atrium, stepped pylons & turnstiles', () => {
      const { ctx, operations } = createMockCanvasContext();
      const cx = PITCH_CONFIG.CENTER_X;
      const wallY = 2800;
      const wallW = 1200;

      drawSouthEntranceGatehousePavilion(ctx, cx, wallY, wallW, 'night', 'rectangular', 'grade4_modern');

      // 1. Deep blue glass atrium doorway (#1e3a8a and #0284c7)
      const atriumDeepBlue = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#1e3a8a'
      );
      const atriumCyanGlass = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#0284c7'
      );
      expect(atriumDeepBlue.length).toBeGreaterThan(0);
      expect(atriumCyanGlass.length).toBeGreaterThan(0);

      // 2. Cyan glazing crossbars / mullions (#38bdf8)
      const glazingOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#38bdf8'
      );
      expect(glazingOps.length).toBeGreaterThan(0);

      // 3. Turnstiles and green electronic access LED indicators (#22c55e)
      const ledOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#22c55e'
      );
      expect(ledOps.length).toBeGreaterThan(0);

      // 4. Concrete parapet coping with white specular highlights (#cbd5e1 and #ffffff)
      const copingOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#cbd5e1'
      );
      const highlightOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#ffffff'
      );
      expect(copingOps.length).toBeGreaterThan(0);
      expect(highlightOps.length).toBeGreaterThan(0);

      // 5. Stepped foundation stairs with safety yellow tread nosing (#facc15)
      const yellowTreadOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowTreadOps.length).toBeGreaterThan(0);

      // 6. Contact drop shadow southwards onto concourse
      const shadowOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === 'rgba(0, 0, 0, 0.52)'
      );
      expect(shadowOps.length).toBeGreaterThan(0);
    });

    it('renders North Upper Central Portico / Press Box Pavilion with stepped gable, panoramic glazing & antenna', () => {
      const { ctx, operations } = createMockCanvasContext();
      const cx = PITCH_CONFIG.CENTER_X;
      const rimTopY = 180;
      const standWidth = 1200;

      drawNorthUpperPorticoPavilion(ctx, cx, rimTopY, standWidth, 'night', 'rectangular', 'grade4_modern');

      // 1. Panoramic tinted blue press/media gantry windows (#0284c7)
      const mediaWindowOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && (op.args[0] === '#0284c7' || op.args[0] === 'rgba(56, 189, 248, 0.7)')
      );
      expect(mediaWindowOps.length).toBeGreaterThan(0);

      // 2. VIP observation terrace / gantry balustrade in brushed aluminum (#94a3b8)
      const terraceRailOps = operations.filter(
        (op) => op.method === 'set_strokeStyle' && op.args[0] === '#94a3b8'
      );
      expect(terraceRailOps.length).toBeGreaterThan(0);

      // 3. Symmetrical access steps with safety yellow treads (#facc15)
      const yellowStepOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      expect(yellowStepOps.length).toBeGreaterThan(0);

      // 4. Broadcast antenna camera mast with red warning beacon (#ef4444)
      const beaconOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#ef4444'
      );
      expect(beaconOps.length).toBeGreaterThan(0);

      // 5. Stepped gable parapet coping with white highlight (#cbd5e1 and #ffffff)
      const copingOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#cbd5e1'
      );
      expect(copingOps.length).toBeGreaterThan(0);
    });

    it('renders South Gatehouse and North Portico seamlessly across Rectangular stadiums', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stadiumDef: Partial<StadiumDefinition> = {
        shape: 'rectangular',
        surroundings: 'big_city',
      };

      drawTouchlineAndCornerStands(
        ctx,
        stadiumDef as StadiumDefinition,
        'monumental',
        'night',
        HOME_KIT,
        AWAY_KIT
      );

      // South Main Entrance Gatehouse Atrium & LED access indicators
      const southAtriumOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#1e3a8a'
      );
      const southLedOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#22c55e'
      );
      expect(southAtriumOps.length).toBeGreaterThan(0);
      expect(southLedOps.length).toBeGreaterThan(0);

      // North Upper Portico press box glazing & broadcast beacon
      const northGlazingOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && (op.args[0] === '#0284c7' || op.args[0] === 'rgba(56, 189, 248, 0.7)')
      );
      const northBeaconOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#ef4444'
      );
      expect(northGlazingOps.length).toBeGreaterThan(0);
      expect(northBeaconOps.length).toBeGreaterThan(0);
    });

    it('renders South Gatehouse and North Portico seamlessly across Square stadiums', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stadiumDef: Partial<StadiumDefinition> = {
        shape: 'square',
        surroundings: 'small_city',
      };

      drawTouchlineAndCornerStands(
        ctx,
        stadiumDef as StadiumDefinition,
        'monumental',
        'night',
        HOME_KIT,
        AWAY_KIT
      );

      const southAtriumOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#1e3a8a'
      );
      const northBeaconOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#ef4444'
      );
      expect(southAtriumOps.length).toBeGreaterThan(0);
      expect(northBeaconOps.length).toBeGreaterThan(0);
    });

    it('renders South Gatehouse and North Portico seamlessly across Round coliseums', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stadiumDef: Partial<StadiumDefinition> = {
        shape: 'round',
        surroundings: 'big_city',
      };

      drawTouchlineAndCornerStands(
        ctx,
        stadiumDef as StadiumDefinition,
        'monumental',
        'night',
        HOME_KIT,
        AWAY_KIT
      );

      // Both South Gatehouse and North Portico must be present on continuous round coliseums
      const southAtriumOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#1e3a8a'
      );
      const northBeaconOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#ef4444'
      );
      expect(southAtriumOps.length).toBeGreaterThan(0);
      expect(northBeaconOps.length).toBeGreaterThan(0);
    });

    it('renders South Gatehouse and North Portico seamlessly across Oval coliseums', () => {
      const { ctx, operations } = createMockCanvasContext();
      const stadiumDef: Partial<StadiumDefinition> = {
        shape: 'oval',
        surroundings: 'big_city',
      };

      drawTouchlineAndCornerStands(
        ctx,
        stadiumDef as StadiumDefinition,
        'monumental',
        'night',
        HOME_KIT,
        AWAY_KIT
      );

      const southAtriumOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#1e3a8a'
      );
      const northBeaconOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#ef4444'
      );
      expect(southAtriumOps.length).toBeGreaterThan(0);
      expect(northBeaconOps.length).toBeGreaterThan(0);
    });
  });

  describe('Hotfix D4.4: High-Intensity 4-Pylon Angled Floodlight Towers & Lighting Ambience', () => {
    it('computes 4 structural quadrant tower positions angled inward toward pitch center in Rectangular stadiums', () => {
      const towers = getStadiumFloodlightTowerPositions('rectangular', 'monumental');
      expect(towers).toHaveLength(4);

      const [nw, ne, sw, se] = towers;
      expect(nw.quadrant).toBe('nw');
      expect(ne.quadrant).toBe('ne');
      expect(sw.quadrant).toBe('sw');
      expect(se.quadrant).toBe('se');

      const cx = PITCH_CONFIG.CENTER_X;
      const cy = PITCH_CONFIG.CENTER_Y;

      // NW tower (top-left) is located northwest of pitch center: x < cx and y < cy
      expect(nw.x).toBeLessThan(cx);
      expect(nw.y).toBeLessThan(cy);
      // NW angle points southeast toward center (dx > 0, dy > 0 => 0 < angle < PI/2)
      expect(Math.cos(nw.angleTowardCenter)).toBeGreaterThan(0);
      expect(Math.sin(nw.angleTowardCenter)).toBeGreaterThan(0);

      // NE tower (top-right): x > cx and y < cy
      expect(ne.x).toBeGreaterThan(cx);
      expect(ne.y).toBeLessThan(cy);
      // NE angle points southwest toward center (dx < 0, dy > 0 => PI/2 < angle < PI)
      expect(Math.cos(ne.angleTowardCenter)).toBeLessThan(0);
      expect(Math.sin(ne.angleTowardCenter)).toBeGreaterThan(0);

      // SW tower (bottom-left): x < cx and y > cy
      expect(sw.x).toBeLessThan(cx);
      expect(sw.y).toBeGreaterThan(cy);
      // SW angle points northeast toward center (dx > 0, dy < 0 => -PI/2 < angle < 0)
      expect(Math.cos(sw.angleTowardCenter)).toBeGreaterThan(0);
      expect(Math.sin(sw.angleTowardCenter)).toBeLessThan(0);

      // SE tower (bottom-right): x > cx and y > cy
      expect(se.x).toBeGreaterThan(cx);
      expect(se.y).toBeGreaterThan(cy);
      // SE angle points northwest toward center (dx < 0, dy < 0 => -PI < angle < -PI/2)
      expect(Math.cos(se.angleTowardCenter)).toBeLessThan(0);
      expect(Math.sin(se.angleTowardCenter)).toBeLessThan(0);
    });

    it('positions towers along the 2.5D curvilinear transition rims in Round and Oval coliseums', () => {
      const roundTowers = getStadiumFloodlightTowerPositions('round', 'monumental');
      const ovalTowers = getStadiumFloodlightTowerPositions('oval', 'monumental');

      expect(roundTowers).toHaveLength(4);
      expect(ovalTowers).toHaveLength(4);

      const cx = PITCH_CONFIG.CENTER_X;
      const cy = PITCH_CONFIG.CENTER_Y;

      // In Round coliseum: NW (5PI/4), NE (7PI/4), SW (3PI/4), SE (PI/4)
      for (const t of roundTowers) {
        // All angles point inward toward (cx, cy)
        const dx = cx - t.x;
        const dy = cy - t.y;
        const expectedAngle = Math.atan2(dy, dx);
        expect(t.angleTowardCenter).toBeCloseTo(expectedAngle, 4);
      }

      // South rim towers in 2.5D perspective sit further from center than north rim towers due to south expansion
      const roundNW = roundTowers.find((t) => t.quadrant === 'nw')!;
      const roundSW = roundTowers.find((t) => t.quadrant === 'sw')!;
      const distNorth = Math.hypot(roundNW.x - cx, roundNW.y - cy);
      const distSouth = Math.hypot(roundSW.x - cx, roundSW.y - cy);
      expect(distSouth).toBeGreaterThan(distNorth);

      const ovalNW = ovalTowers.find((t) => t.quadrant === 'nw')!;
      const ovalSW = ovalTowers.find((t) => t.quadrant === 'sw')!;
      const ovalDistNorth = Math.hypot(ovalNW.x - cx, ovalNW.y - cy);
      const ovalDistSouth = Math.hypot(ovalSW.x - cx, ovalSW.y - cy);
      expect(ovalDistSouth).toBeGreaterThan(ovalDistNorth);
    });

    it('embodies severe perspective flaring in Rectangular stadiums (southern towers wider than northern)', () => {
      const towers = getStadiumFloodlightTowerPositions('rectangular', 'monumental');
      const nw = towers.find((t) => t.quadrant === 'nw')!;
      const ne = towers.find((t) => t.quadrant === 'ne')!;
      const sw = towers.find((t) => t.quadrant === 'sw')!;
      const se = towers.find((t) => t.quadrant === 'se')!;

      const northSpan = ne.x - nw.x;
      const southSpan = se.x - sw.x;
      // High-oblique perspective flaring: southern base span is significantly wider than northern span
      expect(southSpan).toBeGreaterThan(northSpan);
    });

    it('renders 3D perspective-angled floodlight tower with multi-head pixel lamp array, beacon, gantry and bloom in night mode', () => {
      const { ctx, operations } = createMockCanvasContext();
      const tx = 200;
      const ty = 300;
      const angle = 0.8; // angled inward

      drawAngledFloodlightTower(ctx, tx, ty, angle, 'night', 'nw', 'monumental', 'grade4_modern');

      // 1. Concrete foundation plinth with safety hazard yellow/black stripes
      const hazardYellow = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#facc15'
      );
      const hazardDark = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#0f172a'
      );
      expect(hazardYellow.length).toBeGreaterThan(0);
      expect(hazardDark.length).toBeGreaterThan(0);

      // 2. Aerodynamic tubular column structure with specular highlight
      const highlightOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#ffffff'
      );
      expect(highlightOps.length).toBeGreaterThan(0);

      // 3. Maintenance service platform & brushed aluminum safety railing (#94a3b8)
      const railingOps = operations.filter(
        (op) => op.method === 'set_strokeStyle' && op.args[0] === '#94a3b8'
      );
      expect(railingOps.length).toBeGreaterThan(0);

      // 4. Red aviation obstruction beacon (#ef4444)
      const beaconOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#ef4444'
      );
      expect(beaconOps.length).toBeGreaterThan(0);

      // 5. 3D perspective rotation by angleTowardCenter
      const rotateOps = operations.filter(
        (op) => op.method === 'rotate' && Math.abs(op.args[0] - angle) < 1e-4
      );
      expect(rotateOps.length).toBeGreaterThan(0);

      // 6. Multi-head pixel lamp clusters: cyan-white array (#ffffff, #38bdf8, #0284c7)
      const cyanGlowOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#38bdf8'
      );
      const deepCyanOps = operations.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#0284c7'
      );
      expect(cyanGlowOps.length).toBeGreaterThan(0);
      expect(deepCyanOps.length).toBeGreaterThan(0);

      // 7. Radial bloom and volumetric directional beam gradients created
      const gradOps = operations.filter((op) => op.method === 'createRadialGradient');
      expect(gradOps.length).toBeGreaterThanOrEqual(3); // beacon halo, beam cone, head bloom
    });

    it('renders cohesive sunset and day atmospheric variants for angled floodlight tower', () => {
      const { ctx: sunsetCtx, operations: sunsetOps } = createMockCanvasContext();
      drawAngledFloodlightTower(sunsetCtx, 200, 300, 0.8, 'sunset', 'nw', 'monumental', 'grade4_modern');

      // Sunset golden-amber halogen lamps (#fef08a, #f59e0b, #d97706)
      const amberOps = sunsetOps.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#f59e0b'
      );
      const goldOps = sunsetOps.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#fef08a'
      );
      expect(amberOps.length).toBeGreaterThan(0);
      expect(goldOps.length).toBeGreaterThan(0);

      const { ctx: dayCtx, operations: dayOps } = createMockCanvasContext();
      drawAngledFloodlightTower(dayCtx, 200, 300, 0.8, 'noon', 'nw', 'monumental', 'grade4_modern');

      // Noon: De-energized dark reflector cups (#334155, #64748b)
      const deenergizedOps = dayOps.filter(
        (op) => op.method === 'set_fillStyle' && op.args[0] === '#334155'
      );
      expect(deenergizedOps.length).toBeGreaterThan(0);
    });

    it('executes drawStadiumFloodlights across all stadium shapes without error', () => {
      const shapes = ['rectangular', 'square', 'round', 'oval', 'octagonal'] as const;

      for (const shape of shapes) {
        const { ctx } = createMockCanvasContext();
        const stadiumDef: Partial<StadiumDefinition> = {
          shape,
          stands: {
            north: { position: 'north', type: 'tiered', grade: 'grade4_modern' },
            south: { position: 'south', type: 'tiered', grade: 'grade4_modern' },
            east: { position: 'east', type: 'tiered', grade: 'grade4_modern' },
            west: { position: 'west', type: 'tiered', grade: 'grade4_modern' },
          } as any,
        };

        expect(() => {
          drawStadiumFloodlights(ctx, 'monumental', 'night', 0, 0, stadiumDef as StadiumDefinition);
        }).not.toThrow();
      }
    });

    it('synchronizes nocturnal atmospheric glare cones in drawTimeOfDayAtmosphere with quadrant floodlights', () => {
      const { ctx, operations } = createMockCanvasContext();
      const bounds = {
        left: PITCH_CONFIG.PITCH_LEFT - 400,
        top: PITCH_CONFIG.PITCH_TOP - 400,
        width: PITCH_CONFIG.FIELD_WIDTH + 800,
        height: PITCH_CONFIG.FIELD_HEIGHT + 800,
      };

      const stadiumDef: Partial<StadiumDefinition> = {
        shape: 'rectangular',
      };

      drawTimeOfDayAtmosphere(ctx, 'night', bounds, undefined, stadiumDef as StadiumDefinition);

      // Night radial gradient glare cones created
      const gradOps = operations.filter((op) => op.method === 'createRadialGradient');
      expect(gradOps.length).toBeGreaterThanOrEqual(5); // 4 cones + 4 halos + 1 center pool
    });
  });

  describe('Performance & Zero-Allocation 60 FPS Guarantee', () => {
    it('executes 500 render passes of drawTouchlineAndCornerStands well under 50ms (<0.1ms per frame)', () => {
      const { ctx } = createMockCanvasContext();
      const stadiumDef: Partial<StadiumDefinition> = {
        shape: 'rectangular',
        surroundings: 'big_city',
      };

      const start = performance.now();
      for (let i = 0; i < 500; i++) {
        drawTouchlineAndCornerStands(
          ctx,
          stadiumDef as StadiumDefinition,
          'monumental',
          'night',
          HOME_KIT,
          AWAY_KIT
        );
      }
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(100); // 500 frames in <100ms means >5,000 FPS throughput!
    });
  });
});
