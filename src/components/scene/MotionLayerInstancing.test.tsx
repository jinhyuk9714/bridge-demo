import React from 'react';
import { render } from '@testing-library/react';
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

const sumInstanceCount = (container: HTMLElement, name: string) =>
  [...container.querySelectorAll(`[name="${name}"]`)].reduce(
    (total, node) => total + Number(node.getAttribute('count') ?? 0),
    0
  );

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

    const { container } = render(<TrafficLayer trafficVehicles={layout.trafficVehicles} />);

    expect(container.querySelector('[name="traffic-body-instanced"]')).toHaveAttribute(
      'count',
      String(layout.trafficVehicles.length)
    );
    expect(container.querySelector('[name="traffic-cabin-instanced"]')).toHaveAttribute(
      'count',
      String(layout.trafficVehicles.length)
    );
    expect(container.querySelector('[name="traffic-vehicle"]')).toBeNull();
    expect(container.querySelector('[data-testid]')).toBeNull();
    expect(container.querySelector('[data-instance-count]')).toBeNull();
  });

  it('renders atmosphere drift bands through instanced planes and keeps water surfaces', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);

    const { container } = render(<AtmosphereLayer atmosphereBands={layout.atmosphereBands} />);

    expect(sumInstanceCount(container, 'atmosphere-band-instanced')).toBe(
      layout.atmosphereBands.length
    );
    expect(container.querySelector('[name="water-surface"]')).toBeInTheDocument();
    expect(container.querySelector('[name="water-shimmer"]')).toBeInTheDocument();
    expect(container.querySelector('[name="atmosphere-band"]')).toBeNull();
    expect(container.querySelector('[data-testid]')).toBeNull();
    expect(container.querySelector('[data-instance-count]')).toBeNull();
  });
});
