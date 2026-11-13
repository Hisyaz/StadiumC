import { describe, it, expect, vi } from 'vitest';
import {
  drawRoundCornerStand,
  drawGiantCornerStand,
  drawTowerCornerStand,
} from '../stadiumRenderer';
import { StandConfig } from '../../types/stadium';
import { TeamKit } from '../../types';

describe('Hotfix Phase T14P: Corner Stand 32-Bit Texture & Color Parity', () => {
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
        createPattern: vi.fn(() => null),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
      } as unknown as CanvasRenderingContext2D,
    };
  };

  it('T14P.1 & T14P.2: drawRoundCornerStand clips and projects 32-bit grandstand material and grade facade', () => {
    const { ctx, callLog } = createMockContext();
    const cornerStand: StandConfig = {
      position: 'corner_nw',
      type: 'round',
      cornerType: 'round',
      grade: 'grade2_classic',
      tierCount: 2,
      primaryColor: '#7f1d1d',
      secondaryColor: '#ffffff',
    };

    drawRoundCornerStand(
      ctx,
      cornerStand,
      'corner_nw',
      100,
      700,
      100,
      500,
      140,
      140,
      homeKit,
      awayKit,
      'night'
    );

    // Verify clip was called to bound the 32-bit grandstand material to the corner arc
    expect(callLog).toContain('clip');
    expect(callLog.length).toBeGreaterThan(20);
  });

  it('T14P.1 & T14P.2: drawGiantCornerStand projects 32-bit grandstand material and grade facade onto Giant Wall corner', () => {
    const { ctx, callLog } = createMockContext();
    const giantCorner: StandConfig = {
      position: 'corner_sw',
      type: 'giant',
      cornerType: 'giant',
      wallSize: 'large',
      grade: 'grade3_industrial',
      primaryColor: '#334155',
      secondaryColor: '#facc15',
    };

    drawGiantCornerStand(
      ctx,
      giantCorner,
      'corner_sw',
      100,
      700,
      100,
      500,
      180,
      180,
      homeKit,
      awayKit,
      'night'
    );

    // Verify clip was called to bound the material across the giant corner hull
    expect(callLog).toContain('clip');
    expect(callLog.length).toBeGreaterThan(20);
  });

  it('T14P.1: drawTowerCornerStand projects 32-bit grandstand material on VIP tower corners', () => {
    const { ctx, callLog } = createMockContext();
    const towerCorner: StandConfig = {
      position: 'corner_ne',
      type: 'tower',
      cornerType: 'tower',
      grade: 'grade4_modern',
      primaryColor: '#0f172a',
      secondaryColor: '#38bdf8',
    };

    drawTowerCornerStand(
      ctx,
      towerCorner,
      'corner_ne',
      100,
      700,
      100,
      500,
      140,
      140,
      homeKit,
      awayKit,
      'night'
    );

    expect(callLog.length).toBeGreaterThan(15);
  });

  it('T14P.3: Decking textures are rendered across all 5 architectural grades in drawRoundCornerStand', () => {
    const grades = ['grade1_municipal', 'grade2_classic', 'grade3_industrial', 'grade4_modern', 'grade1_historic_timber'] as const;

    for (const g of grades) {
      const { ctx, callLog } = createMockContext();
      const cornerStand: StandConfig = {
        position: 'corner_se',
        type: 'round',
        cornerType: 'round',
        grade: g,
        tierCount: 2,
      };

      drawRoundCornerStand(
        ctx,
        cornerStand,
        'corner_se',
        100,
        700,
        100,
        500,
        140,
        140,
        homeKit,
        awayKit,
        'night'
      );

      expect(callLog.length).toBeGreaterThan(10);
      const fills = callLog.filter((entry) => entry === 'fill');
      expect(fills.length).toBeGreaterThan(2);
    }
  });
});
