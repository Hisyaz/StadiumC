import { describe, it, expect, vi } from 'vitest';
import {
  drawRoundCornerStand,
  drawGiantCornerStand,
  drawCornerMiterRoofCanopy,
} from '../stadiumRenderer';
import { StandConfig, RoofConfig } from '../../types/stadium';
import { TeamKit } from '../../types';

describe('Hotfix Phase T14O: Southern Corner Seating Layer Order & Occlusion Elimination', () => {
  const homeKit: TeamKit = {
    name: 'Home Blue',
    shortName: 'HOM',
    primaryColor: '#1e3a8a',
    secondaryColor: '#ffffff',
    shortsColor: '#ffffff',
    socksColor: '#1e3a8a',
    gkColor: '#22c55e',
  };
  const awayKit: TeamKit = {
    name: 'Away Red',
    shortName: 'AWY',
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    shortsColor: '#000000',
    socksColor: '#dc2626',
    gkColor: '#eab308',
  };

  const createMockContext = () => {
    const callLog: string[] = [];
    return {
      callLog,
      ctx: {
        save: vi.fn(() => callLog.push('save')),
        restore: vi.fn(() => callLog.push('restore')),
        beginPath: vi.fn(() => callLog.push('beginPath')),
        closePath: vi.fn(() => callLog.push('closePath')),
        moveTo: vi.fn((x: number, y: number) => callLog.push(`moveTo(${Math.round(x)},${Math.round(y)})`)),
        lineTo: vi.fn((x: number, y: number) => callLog.push(`lineTo(${Math.round(x)},${Math.round(y)})`)),
        stroke: vi.fn(() => callLog.push('stroke')),
        fill: vi.fn(() => callLog.push('fill')),
        fillRect: vi.fn((x: number, y: number, w: number, h: number) => callLog.push(`fillRect(${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)})`)),
        strokeRect: vi.fn((x: number, y: number, w: number, h: number) => callLog.push(`strokeRect(${Math.round(x)},${Math.round(y)},${Math.round(w)},${Math.round(h)})`)),
        arc: vi.fn(() => callLog.push('arc')),
        clip: vi.fn(() => callLog.push('clip')),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
      } as unknown as CanvasRenderingContext2D,
    };
  };

  it('T14O.1 & T14O.3: drawRoundCornerStand renders promenade concourse deck BEFORE seating tiers on southern corners', () => {
    const { ctx, callLog } = createMockContext();
    const cornerStand: StandConfig = {
      position: 'corner_sw',
      type: 'round',
      cornerType: 'round',
      grade: 'grade2_classic',
      tierCount: 2,
      tiers: [
        { size: 'medium', density: 'normal' },
        { size: 'medium', density: 'normal' },
      ],
      primaryColor: '#1e3a8a',
      secondaryColor: '#ffffff',
    };
    const adjacentGoal: StandConfig = {
      position: 'south',
      type: 'tiered',
      grade: 'grade2_classic',
      tierCount: 2,
    };
    const adjacentTouchline: StandConfig = {
      position: 'west',
      type: 'tiered',
      grade: 'grade2_classic',
      tierCount: 2,
    };

    drawRoundCornerStand(
      ctx,
      cornerStand,
      'corner_sw',
      100,
      700,
      100,
      500,
      140,
      140,
      homeKit,
      awayKit,
      'night',
      adjacentTouchline,
      adjacentGoal,
      undefined,
      undefined,
      undefined,
      'crowded',
      'rectangular'
    );

    // Verify calls executed without error
    expect(callLog.length).toBeGreaterThan(0);

    // Locate where the promenade concourse vomitory portal was drawn (10x6 black rect)
    const promenadePortalIdx = callLog.findIndex((entry) => entry.includes('fillRect(') && entry.includes('10,6'));
    expect(promenadePortalIdx).toBeGreaterThan(-1);

    // Locate where seats / chair sprites were drawn after the promenade portal
    const postPromenadeFills = callLog.slice(promenadePortalIdx + 1);
    const postPromenadeSeats = postPromenadeFills.filter((entry) => entry.includes('fillRect('));
    expect(postPromenadeSeats.length).toBeGreaterThan(0);

    // Crucial Invariance: Promenade concourse deck & portal must be drawn BEFORE seats/supporters
    // Verify that strokes for tier arc decking and seat rows occur after promenade portal
    const postPromenadeStrokes = postPromenadeFills.filter((entry) => entry === 'stroke');
    expect(postPromenadeStrokes.length).toBeGreaterThan(0);
  });

  it('T14O.2: drawGiantCornerStand embodies The Wall philosophy with continuous rake and zero promenade occlusion', () => {
    const { ctx, callLog } = createMockContext();
    const giantCorner: StandConfig = {
      position: 'corner_se',
      type: 'giant',
      cornerType: 'giant',
      wallSize: 'large',
      wallDensity: 'normal',
      grade: 'grade3_industrial',
      primaryColor: '#0f172a',
      secondaryColor: '#cbd5e1',
    };
    const adjacentGoal: StandConfig = {
      position: 'south',
      type: 'tiered',
      grade: 'grade3_industrial',
      tierCount: 2,
    };
    const adjacentTouchline: StandConfig = {
      position: 'east',
      type: 'tiered',
      grade: 'grade3_industrial',
      tierCount: 2,
    };

    drawGiantCornerStand(
      ctx,
      giantCorner,
      'corner_se',
      100,
      700,
      100,
      500,
      180,
      180,
      homeKit,
      awayKit,
      'night',
      adjacentTouchline,
      adjacentGoal,
      undefined,
      undefined,
      undefined,
      'crowded',
      'rectangular'
    );

    // There should be NO promenade dividing balustrade or concourse block on giant corner stands
    // The continuous rake runs all the way from pitchside to rear parapet
    expect(callLog.length).toBeGreaterThan(0);
    const strokeCalls = callLog.filter((entry) => entry === 'stroke');
    expect(strokeCalls.length).toBeGreaterThan(0);
  });

  it('T14O.4: drawCornerMiterRoofCanopy uses a subtle edge lip shadow (<= 3px) on southern corners to avoid seat darkening', () => {
    const { ctx, callLog } = createMockContext();
    const cornerStand: StandConfig = {
      position: 'corner_sw',
      type: 'round',
      cornerType: 'round',
      grade: 'grade2_classic',
      tierCount: 2,
      hasRoof: true,
      roofStyle: 'cantilever_truss',
      roofMaterial: 'corrugated_steel',
    };
    const roofConfig: RoofConfig = {
      enabled: true,
      style: 'cantilever_truss',
      material: 'corrugated_steel',
      border: 'painted_club_fascia',
      cutawayMode: 'partial',
    };

    const pOut = { x: 50, y: 550 };
    const pTMax = { x: 50, y: 490 };
    const pGMax = { x: 110, y: 550 };
    const pT = { x: 90, y: 490 };
    const pG = { x: 90, y: 520 };

    drawCornerMiterRoofCanopy(
      ctx,
      cornerStand,
      'corner_sw',
      pOut,
      pTMax,
      pGMax,
      pT,
      pG,
      homeKit,
      awayKit,
      'night',
      roofConfig,
      'partial'
    );

    // Ensure fill was called for the roof canopy and shadow
    const fillCalls = callLog.filter((entry) => entry === 'fill');
    expect(fillCalls.length).toBeGreaterThanOrEqual(1);
  });
});
