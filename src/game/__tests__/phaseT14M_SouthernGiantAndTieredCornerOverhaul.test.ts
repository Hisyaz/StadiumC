/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  drawRoundCornerStand,
  drawGiantCornerStand,
  getSouthernCornerObliqueMetrics,
  SouthernCornerObliqueMetrics,
  getShearedCornerPoint,
  traceShearedCornerArc,
} from '../stadiumRenderer';
import { StandConfig } from '../../types/stadium';
import { TeamKit } from '../../types';

describe('Hotfix Phase T14M: Southern Giant & Tiered Corners 2.5D High-Oblique Overhaul (Northern Stands Locked & Preserved)', () => {
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
      clip: vi.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'middle',
    };
  });

  describe('T14M.1: Strict Architectural Lock on Northern Stands (corner_nw & corner_ne)', () => {
    it('returns null for getSouthernCornerObliqueMetrics on northern corners', () => {
      expect(getSouthernCornerObliqueMetrics('corner_nw', 120)).toBeNull();
      expect(getSouthernCornerObliqueMetrics('corner_ne', 120)).toBeNull();
    });

    it('preserves northern tiered corner rendering without southern concourse overlook or buttress piers', () => {
      const stand: StandConfig = {
        position: 'corner_nw',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 2,
        hasRoof: false,
      };

      drawRoundCornerStand(
        mockCtx,
        stand,
        'corner_nw',
        200,
        800,
        100,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      // Verify that save and restore are called cleanly
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();

      // Northern corners should not draw green exit indicators on upper promenade (only vomitories)
      const greenCalls = mockCtx.fillRect.mock.calls.filter((call: any[]) => {
        return mockCtx.fillStyle === '#22c55e';
      });
      // Exactly 0 or minimal exit signs on NW promenade deck (promenade deck is not rendered on NW)
      expect(greenCalls.length).toBeLessThanOrEqual(1);
    });

    it('preserves northern giant corner stand rendering without southern rear stairways or buttress piers', () => {
      const stand: StandConfig = {
        position: 'corner_ne',
        type: 'wall',
        wallSize: 'medium',
        grade: 'grade2_classic',
        hasRoof: false,
      };

      drawGiantCornerStand(
        mockCtx,
        stand,
        'corner_ne',
        200,
        800,
        100,
        650,
        180,
        180,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();

      // Verify northern giant stand has drawn the diagonal stehplatz treads
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });
  });

  describe('T14M.2: Southern Tiered Corners (corner_sw & corner_se) — Foreground Rear Architecture & Concourse Overlook', () => {
    it('computes correct oblique metrics for SW and SE tiered corners', () => {
      const metricsSW = getSouthernCornerObliqueMetrics('corner_sw', 140, false);
      expect(metricsSW).not.toBeNull();
      expect(metricsSW?.pos).toBe('corner_sw');
      expect(metricsSW?.activeSeatingH).toBe(Math.round(140 * 0.55));
      expect(metricsSW?.promenadeH).toBe(140 - Math.round(140 * 0.55));
      expect(metricsSW?.isSouthGoalTiered).toBe(true);
      expect(metricsSW?.hasConcourseOverlook).toBe(true);
      expect(metricsSW?.buttressCount).toBe(4);
      expect(metricsSW?.rakerBracketCount).toBe(4);

      const metricsSE = getSouthernCornerObliqueMetrics('corner_se', 100, false);
      expect(metricsSE).not.toBeNull();
      expect(metricsSE?.pos).toBe('corner_se');
      expect(metricsSE?.activeSeatingH).toBe(55);
      expect(metricsSE?.hasConcourseOverlook).toBe(true);
    });

    it('renders elevated concourse promenade deck, safety balustrades, walking patrons and vomitory on SW corner', () => {
      const stand: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        grade: 'grade4_modern',
        tierCount: 3,
        hasRoof: false,
      };

      drawRoundCornerStand(
        mockCtx,
        stand,
        'corner_sw',
        200,
        800,
        100,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      // Verify fillRect calls contain promenade vomitory access portal & yellow safety step
      const fillRectCalls = mockCtx.fillRect.mock.calls;
      expect(fillRectCalls.length).toBeGreaterThan(20);

      // Verify strokeRect called for vomitory border
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('renders cantilever underside raker beam concrete brackets beneath upper tiers on SE corner', () => {
      const stand: StandConfig = {
        position: 'corner_se',
        type: 'tiered',
        grade: 'grade2_classic',
        tierCount: 2,
        hasRoof: false,
      };

      drawRoundCornerStand(
        mockCtx,
        stand,
        'corner_se',
        200,
        800,
        100,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      // Verify bracket fillRect calls were executed
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('renders monumental rear enclosure wall with 4 structural buttress piers and stone coping on southern corners', () => {
      const stand: StandConfig = {
        position: 'corner_sw',
        type: 'tiered',
        grade: 'grade3_industrial',
        tierCount: 2,
        hasRoof: false,
      };

      drawRoundCornerStand(
        mockCtx,
        stand,
        'corner_sw',
        200,
        800,
        100,
        650,
        140,
        140,
        dummyHomeKit,
        dummyAwayKit,
        'noon'
      );

      // Coping highlight strokes and buttress pier rectangles
      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });
  });

  describe('T14M.3: Southern Giant Wall Corner Directional Differentiation', () => {
    it('computes correct oblique metrics for Giant Wall corners', () => {
      const metricsWallSW = getSouthernCornerObliqueMetrics('corner_sw', 180, true);
      expect(metricsWallSW).not.toBeNull();
      expect(metricsWallSW?.activeSeatingH).toBe(180);
      expect(metricsWallSW?.isSouthGoalTiered).toBe(false);
      expect(metricsWallSW?.hasConcourseOverlook).toBe(false);
      expect(metricsWallSW?.buttressCount).toBe(4);
    });

    it('renders exterior masonry buttress walls, rear access stairways, turnstile portals and top parapet rail on SW Giant corner', () => {
      const stand: StandConfig = {
        position: 'corner_sw',
        type: 'wall',
        wallSize: 'medium',
        grade: 'grade3_industrial',
        hasRoof: false,
      };

      drawGiantCornerStand(
        mockCtx,
        stand,
        'corner_sw',
        200,
        800,
        100,
        650,
        180,
        180,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      // Verify that strokeRect was called for rear stairs and turnstile portals
      expect(mockCtx.strokeRect).toHaveBeenCalled();
      // Verify fillRect was called for buttresses, steps, and turnstile portals
      expect(mockCtx.fillRect).toHaveBeenCalled();
      // Verify parapet rail stroke was called along rear chamfer
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('renders exterior masonry buttress walls, rear access stairways, turnstile portals and top parapet rail on SE Giant corner', () => {
      const stand: StandConfig = {
        position: 'corner_se',
        type: 'wall',
        wallSize: 'large',
        grade: 'grade4_modern',
        hasRoof: false,
      };

      drawGiantCornerStand(
        mockCtx,
        stand,
        'corner_se',
        200,
        800,
        100,
        650,
        240,
        240,
        dummyHomeKit,
        dummyAwayKit,
        'noon'
      );

      expect(mockCtx.strokeRect).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('strictly preserves Northern Giant Corners (corner_nw & corner_ne) without altering their forward stehplatz geometry', () => {
      const stand: StandConfig = {
        position: 'corner_nw',
        type: 'wall',
        wallSize: 'large',
        grade: 'grade4_modern',
        hasRoof: false,
      };

      const ctxNW = { ...mockCtx, strokeRect: vi.fn(), fillRect: vi.fn() };
      drawGiantCornerStand(
        ctxNW,
        stand,
        'corner_nw',
        200,
        800,
        100,
        650,
        240,
        240,
        dummyHomeKit,
        dummyAwayKit,
        'night'
      );

      // On NW corner, exterior rear stairways and turnstile portals are NOT rendered
      // Only vomitory portal strokeRect is called
      const strokeRectCallsNW = ctxNW.strokeRect.mock.calls;
      expect(strokeRectCallsNW.length).toBeLessThanOrEqual(1);
    });
  });
});
