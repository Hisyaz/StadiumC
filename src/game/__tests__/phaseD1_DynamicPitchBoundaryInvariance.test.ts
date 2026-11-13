/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PITCH_CONFIG } from '../constants';
import {
  resolvePitchMetrics,
  syncPitchConfigWithMetrics,
  PITCH_DIMENSION_PRESETS,
} from '../pitchDimensions';
import {
  isPointInsidePitch,
  raycastPitchBoundary,
} from '../pitchBoundary';
import {
  createAssistantReferees,
  syncLinesmenToPitchConfig,
} from '../linesman';
import { getStadiumShapeMetrics } from '../stadiumRenderer';
import { MatchEngine } from '../engine';

describe('Phase D1: Dynamic Pitch Boundary Invariance & Venue Architecture', () => {
  beforeEach(() => {
    // Reset PITCH_CONFIG to standard FIFA benchmark before each test
    syncPitchConfigWithMetrics({ preset: 'standard' });
  });

  describe('D1.1: IFAB Dynamic Playable Boundary Invariance & PITCH_CONFIG Synchronization', () => {
    it('synchronizes PITCH_CONFIG with compact ground metrics (100m × 64m)', () => {
      const metrics = syncPitchConfigWithMetrics({ preset: 'compact' });

      expect(metrics.lengthMeters).toBe(100);
      expect(metrics.widthMeters).toBe(64);

      // Compact boundaries are centered inside the 1500×2500 canvas area
      expect(PITCH_CONFIG.PITCH_LEFT).toBe(metrics.pitchLeft);
      expect(PITCH_CONFIG.PITCH_RIGHT).toBe(metrics.pitchRight);
      expect(PITCH_CONFIG.PITCH_TOP).toBe(metrics.pitchTop);
      expect(PITCH_CONFIG.PITCH_BOTTOM).toBe(metrics.pitchBottom);
      expect(PITCH_CONFIG.FIELD_WIDTH).toBe(metrics.fieldWidth);
      expect(PITCH_CONFIG.FIELD_HEIGHT).toBe(metrics.fieldHeight);
      expect(PITCH_CONFIG.CENTER_X).toBe(930);
      expect(PITCH_CONFIG.CENTER_Y).toBe(1470);

      // Verify compact bounds are physically narrower and shorter than standard
      expect(PITCH_CONFIG.PITCH_LEFT).toBeGreaterThan(180);
      expect(PITCH_CONFIG.PITCH_RIGHT).toBeLessThan(1680);
      expect(PITCH_CONFIG.PITCH_TOP).toBeGreaterThan(220);
      expect(PITCH_CONFIG.PITCH_BOTTOM).toBeLessThan(2720);
    });

    it('synchronizes PITCH_CONFIG with expansive cathedral metrics (110m × 74m)', () => {
      const metrics = syncPitchConfigWithMetrics({ preset: 'expansive' });

      expect(metrics.lengthMeters).toBe(110);
      expect(metrics.widthMeters).toBe(74);

      // Expansive boundaries occupy the maximum legal pitch area (1500×2500)
      expect(PITCH_CONFIG.PITCH_LEFT).toBe(180);
      expect(PITCH_CONFIG.PITCH_RIGHT).toBe(1680);
      expect(PITCH_CONFIG.PITCH_TOP).toBe(220);
      expect(PITCH_CONFIG.PITCH_BOTTOM).toBe(2720);
      expect(PITCH_CONFIG.FIELD_WIDTH).toBe(1500);
      expect(PITCH_CONFIG.FIELD_HEIGHT).toBe(2500);
    });

    it('enforces exact physical out-of-bounds evaluation in isPointInsidePitch for compact turf', () => {
      syncPitchConfigWithMetrics({ preset: 'compact' });

      const insideX = PITCH_CONFIG.CENTER_X;
      const insideY = PITCH_CONFIG.CENTER_Y;
      expect(isPointInsidePitch(insideX, insideY)).toBe(true);

      // A coordinate at x = 200 is outside compact touchline (pitchLeft ~281), but would have been inside standard (180)
      expect(isPointInsidePitch(200, insideY)).toBe(false);

      // Just inside compact left touchline
      expect(isPointInsidePitch(PITCH_CONFIG.PITCH_LEFT + 5, insideY)).toBe(true);
      // Just outside compact left touchline
      expect(isPointInsidePitch(PITCH_CONFIG.PITCH_LEFT - 5, insideY)).toBe(false);
    });

    it('accurately raycasts out-of-bounds at the active dynamic boundary', () => {
      syncPitchConfigWithMetrics({ preset: 'compact' });

      const prevX = PITCH_CONFIG.PITCH_LEFT + 20;
      const prevY = PITCH_CONFIG.CENTER_Y;
      const currX = PITCH_CONFIG.PITCH_LEFT - 30;
      const currY = PITCH_CONFIG.CENTER_Y;

      const result = raycastPitchBoundary(prevX, prevY, 0, currX, currY, 0);
      expect(result.hasExited).toBe(true);
      expect(result.type).toBe('touchline_left');
      expect(result.crossingX).toBe(PITCH_CONFIG.PITCH_LEFT);
    });

    it('synchronizes assistant referees (linesmen) to the active dynamic touchlines', () => {
      const [ar1, ar2] = createAssistantReferees();

      // On standard pitch
      syncPitchConfigWithMetrics({ preset: 'standard' });
      syncLinesmenToPitchConfig(ar1, ar2);
      expect(ar1.x).toBe(PITCH_CONFIG.PITCH_RIGHT + 14);
      expect(ar2.x).toBe(PITCH_CONFIG.PITCH_LEFT - 14);

      // Switch to compact pitch
      syncPitchConfigWithMetrics({ preset: 'compact' });
      syncLinesmenToPitchConfig(ar1, ar2);
      expect(ar1.x).toBe(PITCH_CONFIG.PITCH_RIGHT + 14);
      expect(ar2.x).toBe(PITCH_CONFIG.PITCH_LEFT - 14);
      expect(ar1.patrolMinY).toBe(PITCH_CONFIG.PITCH_TOP - 10);
      expect(ar2.patrolMaxY).toBe(PITCH_CONFIG.PITCH_BOTTOM + 10);
    });

    it('MatchEngine setPitchDimensions dynamically synchronizes PITCH_CONFIG and linesmen', () => {
      const engine = new MatchEngine();

      // Switch to compact
      engine.setPitchDimensions('compact');
      expect(engine.pitchPreset).toBe('compact');
      expect(engine.pitchLengthMeters).toBe(100);
      expect(engine.pitchWidthMeters).toBe(64);
      expect(PITCH_CONFIG.FIELD_WIDTH).toBe(Math.round(engine.pitchWidthMeters * (1500 / 74)));
      expect(engine.ar1.x).toBe(PITCH_CONFIG.PITCH_RIGHT + 14);
      expect(engine.ar2.x).toBe(PITCH_CONFIG.PITCH_LEFT - 14);

      // Switch to expansive
      engine.setPitchDimensions('expansive');
      expect(engine.pitchPreset).toBe('expansive');
      expect(engine.pitchLengthMeters).toBe(110);
      expect(engine.pitchWidthMeters).toBe(74);
      expect(PITCH_CONFIG.PITCH_LEFT).toBe(180);
      expect(PITCH_CONFIG.PITCH_RIGHT).toBe(1680);
      expect(engine.ar1.x).toBe(1680 + 14);
      expect(engine.ar2.x).toBe(180 - 14);
    });
  });

  describe('D1.2 & S1: Invariant Stadium Footprint & Fixed Infill Zone Containment', () => {
    it('maintains invariant stadium grandstand bowl geometry across all 4 shapes regardless of turf preset', () => {
      // Test when compact turf is active
      syncPitchConfigWithMetrics({ preset: 'compact' });
      const rectCompact = getStadiumShapeMetrics('rectangular');
      const roundCompact = getStadiumShapeMetrics('round');
      const ovalCompact = getStadiumShapeMetrics('oval');
      const squareCompact = getStadiumShapeMetrics('square');

      // Test when expansive turf is active
      syncPitchConfigWithMetrics({ preset: 'expansive' });
      const rectExpansive = getStadiumShapeMetrics('rectangular');
      const roundExpansive = getStadiumShapeMetrics('round');
      const ovalExpansive = getStadiumShapeMetrics('oval');
      const squareExpansive = getStadiumShapeMetrics('square');

      // Grandstand bowl inner boundaries must be 100% invariant
      expect(rectCompact.westInnerX).toBe(rectExpansive.westInnerX);
      expect(rectCompact.eastInnerX).toBe(rectExpansive.eastInnerX);
      expect(rectCompact.northInnerY).toBe(rectExpansive.northInnerY);
      expect(rectCompact.southInnerY).toBe(rectExpansive.southInnerY);

      expect(roundCompact.westInnerX).toBe(roundExpansive.westInnerX);
      expect(roundCompact.northInnerY).toBe(roundExpansive.northInnerY);

      expect(ovalCompact.westInnerX).toBe(ovalExpansive.westInnerX);
      expect(ovalCompact.northInnerY).toBe(ovalExpansive.northInnerY);

      expect(squareCompact.westInnerX).toBe(squareExpansive.westInnerX);
      expect(squareCompact.northInnerY).toBe(squareExpansive.northInnerY);
    });

    it('verifies the 76m × 112m fixed infill zone accommodates all legal IFAB turf dimensions', () => {
      const compactMetrics = resolvePitchMetrics({ preset: 'compact' });
      const standardMetrics = resolvePitchMetrics({ preset: 'standard' });
      const expansiveMetrics = resolvePitchMetrics({ preset: 'expansive' });

      // All pitches sit strictly inside the 76m × 112m infill area with >= 1.0m margin
      expect(compactMetrics.marginToInfillMetersX).toBeGreaterThanOrEqual(1.0);
      expect(compactMetrics.marginToInfillMetersY).toBeGreaterThanOrEqual(1.0);

      expect(standardMetrics.marginToInfillMetersX).toBeGreaterThanOrEqual(1.0);
      expect(standardMetrics.marginToInfillMetersY).toBeGreaterThanOrEqual(1.0);

      expect(expansiveMetrics.marginToInfillMetersX).toBeGreaterThanOrEqual(1.0);
      expect(expansiveMetrics.marginToInfillMetersY).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe('D1.3: Team Home Venue Configuration & Tactical Modifiers', () => {
    it('provides tactical multipliers for stamina and space based on IFAB pitch dimensions', () => {
      const compact = PITCH_DIMENSION_PRESETS.compact;
      const expansive = PITCH_DIMENSION_PRESETS.expansive;

      expect(compact.pressingTrapMultiplier).toBeGreaterThan(1.0);
      expect(compact.staminaDrainMultiplier).toBeLessThan(1.0);

      expect(expansive.spaceHalfSpaceMultiplier).toBeGreaterThan(1.0);
      expect(expansive.staminaDrainMultiplier).toBeGreaterThan(1.0);
    });
  });
});
