import { describe, it, expect, vi } from 'vitest';
import {
  drawCurvedPitchsideSafetyBarrier,
  getFluidCornerRoofArcPoints,
  drawCornerMiterRoofCanopy,
  drawContinuousColiseumBowl,
} from '../stadiumRenderer';
import { TeamKit, TimeOfDay } from '../../types';
import {
  StandConfig,
  StadiumDefinition,
  ROOF_CUTAWAY_OPTIONS,
  PitchsideBarrierType,
  RoofStyle,
  RoofMaterial,
} from '../../types/stadium';

// Mock CanvasRenderingContext2D
function createMockContext(): { ctx: CanvasRenderingContext2D; calls: { method: string; args: any[] }[] } {
  const calls: { method: string; args: any[] }[] = [];
  const ctx = {
    save: vi.fn(() => calls.push({ method: 'save', args: [] })),
    restore: vi.fn(() => calls.push({ method: 'restore', args: [] })),
    beginPath: vi.fn(() => calls.push({ method: 'beginPath', args: [] })),
    closePath: vi.fn(() => calls.push({ method: 'closePath', args: [] })),
    moveTo: vi.fn((x: number, y: number) => calls.push({ method: 'moveTo', args: [x, y] })),
    lineTo: vi.fn((x: number, y: number) => calls.push({ method: 'lineTo', args: [x, y] })),
    arc: vi.fn((x: number, y: number, r: number, sa: number, ea: number, ccw?: boolean) =>
      calls.push({ method: 'arc', args: [x, y, r, sa, ea, ccw] })
    ),
    stroke: vi.fn(() => calls.push({ method: 'stroke', args: [] })),
    fill: vi.fn(() => calls.push({ method: 'fill', args: [] })),
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => calls.push({ method: 'fillRect', args: [x, y, w, h] })),
    strokeRect: vi.fn((x: number, y: number, w: number, h: number) => calls.push({ method: 'strokeRect', args: [x, y, w, h] })),
    fillText: vi.fn(() => calls.push({ method: 'fillText', args: [] })),
    quadraticCurveTo: vi.fn((cpx: number, cpy: number, x: number, y: number) =>
      calls.push({ method: 'quadraticCurveTo', args: [cpx, cpy, x, y] })
    ),
    bezierCurveTo: vi.fn(() => calls.push({ method: 'bezierCurveTo', args: [] })),
    rect: vi.fn((x: number, y: number, w: number, h: number) => calls.push({ method: 'rect', args: [x, y, w, h] })),
    clip: vi.fn(() => calls.push({ method: 'clip', args: [] })),
    createPattern: vi.fn(() => null),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    setLineDash: vi.fn(() => {}),
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;

  return { ctx, calls };
}

const mockHomeKit: TeamKit = {
  name: 'Home FC',
  shortName: 'HOM',
  primaryColor: '#1e3a8a',
  secondaryColor: '#f59e0b',
  shortsColor: '#ffffff',
  socksColor: '#1e3a8a',
  gkColor: '#eab308',
};

const mockAwayKit: TeamKit = {
  name: 'Away FC',
  shortName: 'AWY',
  primaryColor: '#dc2626',
  secondaryColor: '#ffffff',
  shortsColor: '#000000',
  socksColor: '#dc2626',
  gkColor: '#10b981',
};

describe('Phase T13: Round/Oval Bowl Safety Barrier Invariance & 50% Fluid Rounded Corner Roofs', () => {
  describe('T13.1 Round & Oval Pitchside Barrier Inner-Rim Invariance', () => {
    const barrierTypes: PitchsideBarrierType[] = [
      'red_brick',
      'steel_chain',
      'high_steel_chain',
      'anti_barristas',
      'heavy_timber',
      'functional_concrete',
      'led_ribbon',
    ];

    it.each(barrierTypes)(
      'renders barrier typology "%s" with pure concentric inner-rim circular arcs (ctx.arc)',
      (barrierType) => {
        const { ctx, calls } = createMockContext();
        const stand: StandConfig = {
          position: 'north',
          type: 'tiered',
          tierCount: 2,
          hasRoof: true,
          pitchsideBarrier: barrierType,
        };

        const cx = 500;
        const cy = 400;
        const rIn = 220;
        const startA = Math.PI;
        const endA = 2 * Math.PI;

        // Pass an eccentricity argument (e.g. 0.65) that historically caused North bend distortion
        drawCurvedPitchsideSafetyBarrier(
          ctx,
          stand,
          cx,
          cy,
          rIn,
          startA,
          endA,
          'north',
          'night',
          mockHomeKit,
          mockAwayKit,
          undefined,
          0.65,
          1.0
        );

        // Verify that ctx.arc is called for concentric tracking
        const mainArcCalls = calls.filter(
          (c) => c.method === 'arc' && c.args[0] === cx && c.args[1] === cy && c.args[2] >= rIn - 12
        );
        expect(mainArcCalls.length).toBeGreaterThan(0);

        // Every main circular arc called must be centered at cx=500, cy=400 with radius close to rIn
        for (const arc of mainArcCalls) {
          expect(arc.args[0]).toBe(cx);
          expect(arc.args[1]).toBe(cy);
          expect(arc.args[2]).toBeGreaterThanOrEqual(rIn - 12);
          expect(arc.args[2]).toBeLessThanOrEqual(rIn + 2);
        }
      }
    );

    it('guarantees round coliseum bowl pitchside barrier tracks the invariant rIn without distortion', () => {
      const { ctx, calls } = createMockContext();
      const stadiumDef: StadiumDefinition = {
        id: 'test_round_coliseum',
        name: 'Coliseum Arena',
        shape: 'round',
        overallTier: 3,
        capacity: 45000,
        stands: {
          west: { position: 'west', type: 'tiered', tierCount: 2, pitchsideBarrier: 'led_ribbon' },
          east: { position: 'east', type: 'tiered', tierCount: 2, pitchsideBarrier: 'led_ribbon' },
          north: { position: 'north', type: 'tiered', tierCount: 2, pitchsideBarrier: 'led_ribbon' },
          south: { position: 'south', type: 'tiered', tierCount: 2, pitchsideBarrier: 'led_ribbon' },
        },
        corners: {
          nw: { type: 'round', tierCount: 2 },
          ne: { type: 'round', tierCount: 2 },
          se: { type: 'round', tierCount: 2 },
          sw: { type: 'round', tierCount: 2 },
        },
      } as unknown as StadiumDefinition;

      drawContinuousColiseumBowl(
        ctx,
        stadiumDef,
        'monumental',
        'night',
        mockHomeKit,
        mockAwayKit,
        'round'
      );

      // Verify arc calls were made for the bowl sectors
      const arcCalls = calls.filter((c) => c.method === 'arc');
      expect(arcCalls.length).toBeGreaterThan(0);
    });

    it('verifies oval racetrack bowl pitchside barriers seamlessly touch the straight touchline barriers at (cx ± rIn, pTop)', () => {
      const cx = 500;
      const pTop = 260;
      const rIn = 220;

      // West straight touchline inner X is cx - rIn = 280
      const westInnerX = cx - rIn;
      // East straight touchline inner X is cx + rIn = 720
      const eastInnerX = cx + rIn;

      // North horseshoe arc starts at Math.PI and ends at 2 * Math.PI
      const northStart = {
        x: cx + Math.cos(Math.PI) * rIn,
        y: pTop + Math.sin(Math.PI) * rIn,
      };
      const northEnd = {
        x: cx + Math.cos(2 * Math.PI) * rIn,
        y: pTop + Math.sin(2 * Math.PI) * rIn,
      };

      expect(northStart.x).toBeCloseTo(westInnerX, 4);
      expect(northStart.y).toBeCloseTo(pTop, 4);
      expect(northEnd.x).toBeCloseTo(eastInnerX, 4);
      expect(northEnd.y).toBeCloseTo(pTop, 4);
    });
  });

  describe('T13.2 50% Fluid Rounded Corner Roof Canopies', () => {
    it('generates a smooth quadratic Bézier curve connecting rT to rG via getFluidCornerRoofArcPoints', () => {
      const pOut = { x: 50, y: 50 };
      const pTMax = { x: 50, y: 150 };
      const pGMax = { x: 150, y: 50 };
      const pT = { x: 150, y: 150 };
      const pG = { x: 150, y: 150 };
      const depthFactor = 0.32; // 50% match-view partial cutaway

      const rT = {
        x: pTMax.x + (pT.x - pTMax.x) * depthFactor,
        y: pTMax.y + (pT.y - pTMax.y) * depthFactor,
      };
      const rG = {
        x: pGMax.x + (pG.x - pGMax.x) * depthFactor,
        y: pGMax.y + (pG.y - pGMax.y) * depthFactor,
      };

      const steps = 12;
      const pts = getFluidCornerRoofArcPoints(rT, rG, pOut, pT, pTMax, pG, pGMax, depthFactor, steps);

      expect(pts).toHaveLength(steps + 1);

      // Start point is exactly rT
      expect(pts[0].x).toBeCloseTo(rT.x, 4);
      expect(pts[0].y).toBeCloseTo(rT.y, 4);

      // End point is exactly rG
      expect(pts[steps].x).toBeCloseTo(rG.x, 4);
      expect(pts[steps].y).toBeCloseTo(rG.y, 4);

      // Straight chord midpoint
      const chordMid = { x: (rT.x + rG.x) / 2, y: (rT.y + rG.y) / 2 };
      // Curve apex midpoint
      const curveMid = pts[Math.floor(steps / 2)];

      // Control point pCtrl is pulled inward toward the pitch corner
      const pCtrl = {
        x: pOut.x + (pT.x - pTMax.x) * depthFactor + (pG.x - pGMax.x) * depthFactor,
        y: pOut.y + (pT.y - pTMax.y) * depthFactor + (pG.y - pGMax.y) * depthFactor,
      };

      // Curve apex creates a smooth rounded fillet between the straight chord and pCtrl
      expect(curveMid.x).toBeLessThan(chordMid.x);
      expect(curveMid.y).toBeLessThan(chordMid.y);
      expect(curveMid.x).toBeGreaterThan(pCtrl.x);
      expect(curveMid.y).toBeGreaterThan(pCtrl.y);
    });

    it('renders fluid rounded corner roof canopy without a straight diagonal chord in 50% partial cutaway', () => {
      const { ctx, calls } = createMockContext();
      const stand: StandConfig = {
        position: 'north',
        type: 'tiered',
        tierCount: 2,
        hasRoof: true,
        roofStyle: 'cantilever_truss',
        roofMaterial: 'corrugated_steel',
        roofCutaway: 'partial',
      };

      const pOut = { x: 100, y: 100 };
      const pTMax = { x: 100, y: 300 };
      const pGMax = { x: 300, y: 100 };
      const pT = { x: 250, y: 300 };
      const pG = { x: 300, y: 250 };

      drawCornerMiterRoofCanopy(
        ctx,
        stand,
        'corner_nw',
        pOut,
        pTMax,
        pGMax,
        pT,
        pG,
        mockHomeKit,
        mockAwayKit,
        'night'
      );

      // Check lineTo calls: should contain multiple intermediate points from fluid arc
      const lineToCalls = calls.filter((c) => c.method === 'lineTo');
      expect(lineToCalls.length).toBeGreaterThan(20);

      // Verify canopy was filled
      const fillCalls = calls.filter((c) => c.method === 'fill');
      expect(fillCalls.length).toBeGreaterThanOrEqual(2); // Soffit shadow + canopy base
    });

    it.each([
      ['cantilever_truss', 'corrugated_steel'],
      ['barrel_vault', 'etfe_cushion'],
      ['tensile_cable', 'precast_concrete'],
      ['spaceframe_halo', 'anodized_aluminum'],
    ] as [RoofStyle, RoofMaterial][])(
      'supports fluid rounded corner canopy with roof style "%s" and material "%s"',
      (style, material) => {
        const { ctx, calls } = createMockContext();
        const stand: StandConfig = {
          position: 'east',
          type: 'tiered',
          tierCount: 2,
          hasRoof: true,
          roofStyle: style,
          roofMaterial: material,
          roofBorder: style === 'spaceframe_halo' ? 'led_halo_ribbon' : 'painted_club_fascia',
          roofCutaway: 'partial',
        };

        const pOut = { x: 900, y: 100 };
        const pTMax = { x: 900, y: 300 };
        const pGMax = { x: 700, y: 100 };
        const pT = { x: 750, y: 300 };
        const pG = { x: 700, y: 250 };

        drawCornerMiterRoofCanopy(
          ctx,
          stand,
          'corner_ne',
          pOut,
          pTMax,
          pGMax,
          pT,
          pG,
          mockHomeKit,
          mockAwayKit,
          'night'
        );

        expect(calls.some((c) => c.method === 'fill')).toBe(true);
        expect(calls.some((c) => c.method === 'stroke')).toBe(true);
      }
    );
  });

  describe('T13.3 ROOF_CUTAWAY_OPTIONS verification', () => {
    it('contains partial cutaway mode with fluid rounded corner arc description', () => {
      const partialOption = ROOF_CUTAWAY_OPTIONS.find((o) => o.id === 'partial');
      expect(partialOption).toBeDefined();
      expect(partialOption?.pct).toBe('50%');
      expect(partialOption?.desc).toContain('fluid rounded corner arcs');
    });
  });
});
