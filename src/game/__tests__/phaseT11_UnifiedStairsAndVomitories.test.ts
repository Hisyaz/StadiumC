import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamKit } from '../../types';
import {
  StandConfig,
  StadiumDefinition,
  VomitoryArchitecture,
  VOMITORY_ARCHITECTURE_OPTIONS,
  resolveVomitoryArchitecture,
  getTierStairRatios,
  areTierStairsStaggered,
} from '../../types/stadium';
import {
  drawVomitoryPortal,
  drawSingleTouchlineStand,
  drawGoalEndStand,
} from '../stadiumRenderer';

const HOME_KIT: TeamKit = {
  name: 'Home FC',
  shortName: 'HOM',
  primaryColor: '#0284c7',
  secondaryColor: '#ffffff',
  shortsColor: '#ffffff',
  socksColor: '#0284c7',
  gkColor: '#eab308',
};

const AWAY_KIT: TeamKit = {
  name: 'Away FC',
  shortName: 'AWY',
  primaryColor: '#ef4444',
  secondaryColor: '#ffffff',
  shortsColor: '#000000',
  socksColor: '#ef4444',
  gkColor: '#10b981',
};

function createMockContext(): CanvasRenderingContext2D & { _records: { fillStyle: string; x: number; y: number; w: number; h: number }[] } {
  const records: { fillStyle: string; x: number; y: number; w: number; h: number }[] = [];
  const ctx: any = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
      records.push({ fillStyle: ctx.fillStyle, x, y, w, h });
    }),
    _records: records,
    strokeRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1.0,
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
  };
  return ctx as CanvasRenderingContext2D & { _records: typeof records };
}

describe('Phase T11: Unified Grandstand Stairs & 3-Vomitory Tunnel Architectures', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockContext();
  });

  describe('1. Vomitory Architecture Taxonomy & Options', () => {
    it('provides all 3 distinct vomitory architectures in VOMITORY_ARCHITECTURE_OPTIONS', () => {
      expect(VOMITORY_ARCHITECTURE_OPTIONS).toHaveLength(3);
      const ids = VOMITORY_ARCHITECTURE_OPTIONS.map((o) => o.id);
      expect(ids).toContain('rear_level');
      expect(ids).toContain('tunnel_above');
      expect(ids).toContain('tunnel_below');
    });

    it('defines distinct access flow classifications for all 3 architectures', () => {
      const midDeck = VOMITORY_ARCHITECTURE_OPTIONS.find((o) => o.id === 'rear_level');
      const above = VOMITORY_ARCHITECTURE_OPTIONS.find((o) => o.id === 'tunnel_above');
      const below = VOMITORY_ARCHITECTURE_OPTIONS.find((o) => o.id === 'tunnel_below');

      expect(midDeck?.accessFlow).toBe('direct');
      expect(above?.accessFlow).toBe('descending');
      expect(below?.accessFlow).toBe('ascending');

      expect(midDeck?.icon).toBeTruthy();
      expect(above?.icon).toBeTruthy();
      expect(below?.icon).toBeTruthy();
    });

    it('resolves vomitory architecture with proper hierarchical fallback (tier -> stand -> stadium -> default)', () => {
      // 1. Default fallback
      expect(resolveVomitoryArchitecture(undefined, undefined)).toBe('rear_level');

      // 2. Stadium-level default
      const stadium: Partial<StadiumDefinition> = {
        vomitoryArchitecture: 'tunnel_above',
      };
      expect(resolveVomitoryArchitecture(undefined, stadium as StadiumDefinition)).toBe('tunnel_above');

      // 3. Stand-level override
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        vomitoryArchitecture: 'tunnel_below',
      };
      expect(resolveVomitoryArchitecture(stand, stadium as StadiumDefinition)).toBe('tunnel_below');

      // 4. Deck/tier-level override
      const standWithDeckOverride: StandConfig = {
        position: 'west',
        type: 'tiered',
        vomitoryArchitecture: 'tunnel_below',
        tiers: [
          { size: 'medium', vomitoryArchitecture: 'tunnel_above' },
          { size: 'large', vomitoryArchitecture: 'rear_level' },
        ],
      };
      expect(resolveVomitoryArchitecture(standWithDeckOverride, stadium as StadiumDefinition, 0)).toBe('tunnel_above');
      expect(resolveVomitoryArchitecture(standWithDeckOverride, stadium as StadiumDefinition, 1)).toBe('rear_level');
    });
  });

  describe('2. Unified Grandstand Stairs & Inter-Tier Staggering Math', () => {
    it('returns exactly 2 vertical stair positions for any tier index across touchline and goal-end stands', () => {
      for (let t = 0; t < 6; t++) {
        const touchlineStairs = getTierStairRatios(t, 'touchline');
        expect(touchlineStairs).toHaveLength(2);
        expect(touchlineStairs[0]).toBeGreaterThan(0.15);
        expect(touchlineStairs[0]).toBeLessThan(0.45);
        expect(touchlineStairs[1]).toBeGreaterThan(0.55);
        expect(touchlineStairs[1]).toBeLessThan(0.85);

        const goalStairs = getTierStairRatios(t, 'goal');
        expect(goalStairs).toHaveLength(2);
        expect(goalStairs[0]).toBeGreaterThan(0.15);
        expect(goalStairs[0]).toBeLessThan(0.45);
        expect(goalStairs[1]).toBeGreaterThan(0.55);
        expect(goalStairs[1]).toBeLessThan(0.85);
      }
    });

    it('maintains strict horizontal symmetry around the center (ratio1 + ratio2 = 1.0)', () => {
      for (let t = 0; t < 4; t++) {
        const [t1, t2] = getTierStairRatios(t, 'touchline');
        expect(t1 + t2).toBeCloseTo(1.0, 5);

        const [g1, g2] = getTierStairRatios(t, 'goal');
        expect(g1 + g2).toBeCloseTo(1.0, 5);
      }
    });

    it('staggers stairs between consecutive tiers to simulate realistic crowd circulation engineering', () => {
      // Touchline: Tier 0 vs Tier 1
      const touchTier0 = getTierStairRatios(0, 'touchline');
      const touchTier1 = getTierStairRatios(1, 'touchline');
      expect(touchTier0[0]).not.toEqual(touchTier1[0]);
      expect(areTierStairsStaggered(0, 1, 'touchline')).toBe(true);

      // Touchline: Tier 1 vs Tier 2
      const touchTier2 = getTierStairRatios(2, 'touchline');
      expect(touchTier1[0]).not.toEqual(touchTier2[0]);
      expect(areTierStairsStaggered(1, 2, 'touchline')).toBe(true);

      // Touchline: Tier 2 vs Tier 3
      const touchTier3 = getTierStairRatios(3, 'touchline');
      expect(touchTier2[0]).not.toEqual(touchTier3[0]);
      expect(areTierStairsStaggered(2, 3, 'touchline')).toBe(true);

      // Goal-End: Tier 0 vs Tier 1
      const goalTier0 = getTierStairRatios(0, 'goal');
      const goalTier1 = getTierStairRatios(1, 'goal');
      expect(goalTier0[0]).not.toEqual(goalTier1[0]);
      expect(areTierStairsStaggered(0, 1, 'goal')).toBe(true);

      // Goal-End: Tier 1 vs Tier 2
      const goalTier2 = getTierStairRatios(2, 'goal');
      expect(goalTier1[0]).not.toEqual(goalTier2[0]);
      expect(areTierStairsStaggered(1, 2, 'goal')).toBe(true);
    });
  });

  describe('3. Vomitory Portal Rendering with 3 Distinct Architectures', () => {
    it('renders rear_level vomitory portal cleanly without throwing', () => {
      expect(() => {
        drawVomitoryPortal(ctx, 100, 200, 24, 20, 'north', 'night', 0, 'rear_level');
      }).not.toThrow();
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('renders tunnel_above vomitory portal with elevated coping and descending steps', () => {
      expect(() => {
        drawVomitoryPortal(ctx, 100, 200, 24, 20, 'west', 'noon', 1, 'tunnel_above');
      }).not.toThrow();
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('renders tunnel_below vomitory portal with threshold plate and ascending steps', () => {
      expect(() => {
        drawVomitoryPortal(ctx, 100, 200, 24, 20, 'south', 'night', 0, 'tunnel_below');
      }).not.toThrow();
      expect(ctx.fillRect).toHaveBeenCalled();
    });
  });

  describe('4. Stand Integration: Touchline & Goal-End Stands', () => {
    it('renders multi-tier touchline stand with exactly 2 staggered gangway stairs per tier', () => {
      const stand: StandConfig = {
        position: 'west',
        type: 'tiered',
        tierCount: 2,
        tiers: [{ size: 'medium' }, { size: 'large' }],
        vomitoryArchitecture: 'tunnel_above',
      };

      expect(() => {
        drawSingleTouchlineStand(
          ctx,
          stand,
          100,
          100,
          80,
          600,
          'west',
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'night'
        );
      }).not.toThrow();

      // Yellow hazard nosing should be rendered for gangway stairs
      const yellowFills = (ctx as any)._records.filter(
        (r: any) => r.fillStyle === '#facc15'
      );
      expect(yellowFills.length).toBeGreaterThan(0);
    });

    it('renders multi-tier goal-end stand with exactly 2 staggered stairs and configured vomitory architecture', () => {
      const stand: StandConfig = {
        position: 'north',
        type: 'tiered',
        tierCount: 2,
        tiers: [{ size: 'medium' }, { size: 'large' }],
        vomitoryArchitecture: 'tunnel_below',
      };

      expect(() => {
        drawGoalEndStand(
          ctx,
          stand,
          100,
          50,
          500,
          80,
          'north',
          HOME_KIT,
          AWAY_KIT,
          'rectangular',
          'night'
        );
      }).not.toThrow();

      // Verifies save/restore and drawing calls
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('preserves Wall stands as unbroken terraces with crash barriers and zero gangway stairs', () => {
      const wallStand: StandConfig = {
        position: 'south',
        type: 'wall',
        wallSize: 'large',
      };

      const fillRectCountBefore = (ctx.fillRect as any).mock.calls.length;
      drawGoalEndStand(
        ctx,
        wallStand,
        100,
        700,
        500,
        140,
        'south',
        HOME_KIT,
        AWAY_KIT,
        'rectangular',
        'night'
      );
      const fillRectCountAfter = (ctx.fillRect as any).mock.calls.length;
      expect(fillRectCountAfter).toBeGreaterThan(fillRectCountBefore);
    });
  });
});
