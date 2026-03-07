import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { balancedPreset } from '../../data/bridgePresets';
import { generateBridgeModel } from '../../lib/bridgeGenerator';
import { generateSceneLayout } from '../../lib/sceneLayout';

const frameCallbacks: Array<(state: unknown, delta: number) => void> = [];

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((callback: (state: unknown, delta: number) => void) => {
    frameCallbacks.push(callback);
  })
}));

import { AtmosphereLayer } from './AtmosphereLayer';
import { TrafficLayer } from './TrafficLayer';

const sumInstanceCount = (testId: string) =>
  screen
    .getAllByTestId(testId)
    .reduce((total, node) => total + Number(node.getAttribute('data-instance-count') ?? 0), 0);

describe('scene motion instancing', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    frameCallbacks.length = 0;
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders traffic vehicles through instanced body and cabin meshes', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);

    render(<TrafficLayer trafficVehicles={layout.trafficVehicles} />);

    expect(screen.getByTestId('traffic-body-instanced')).toHaveAttribute(
      'data-instance-count',
      String(layout.trafficVehicles.length)
    );
    expect(screen.getByTestId('traffic-cabin-instanced')).toHaveAttribute(
      'data-instance-count',
      String(layout.trafficVehicles.length)
    );
    expect(screen.queryByTestId('traffic-vehicle')).not.toBeInTheDocument();
  });

  it('renders atmosphere drift bands through instanced planes and keeps water surfaces', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);

    render(<AtmosphereLayer atmosphereBands={layout.atmosphereBands} />);

    expect(sumInstanceCount('atmosphere-band-instanced')).toBe(layout.atmosphereBands.length);
    expect(screen.getByTestId('water-surface')).toBeInTheDocument();
    expect(screen.getByTestId('water-shimmer')).toBeInTheDocument();
    expect(screen.queryByTestId('atmosphere-band')).not.toBeInTheDocument();
  });
});
