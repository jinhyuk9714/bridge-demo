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

import { NavigationMarkerLayer } from './NavigationMarkerLayer';

describe('NavigationMarkerLayer', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    frameCallbacks.length = 0;
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders buoy and beacon markers from the scenic layout data', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);

    const { container } = render(
      <NavigationMarkerLayer navigationMarkers={layout.navigationMarkers} />
    );

    expect(container.querySelectorAll('[name="navigation-marker-buoy"]').length).toBe(
      layout.navigationMarkers.filter((marker) => marker.kind === 'buoy').length
    );
    expect(container.querySelectorAll('[name="navigation-marker-beacon"]').length).toBe(
      layout.navigationMarkers.filter((marker) => marker.kind === 'beacon').length
    );
    expect(container.querySelectorAll('[name="navigation-marker-light"]').length).toBe(
      layout.navigationMarkers.filter((marker) => marker.kind === 'beacon').length
    );
  });
});
