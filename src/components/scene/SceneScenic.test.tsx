import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { balancedPreset } from '../../data/bridgePresets';
import { generateBridgeModel } from '../../lib/bridgeGenerator';
import { generateSceneLayout } from '../../lib/sceneLayout';
import { SceneScenic } from './SceneScenic';

vi.mock('@react-three/drei', () => ({
  Sky: (props: Record<string, unknown>) => <sky-shell data-testid="sky-shell" {...props} />
}));

vi.mock('../../lib/sceneLayout', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/sceneLayout')>();

  return {
    ...actual,
    generateSceneLayout: vi.fn(actual.generateSceneLayout)
  };
});

vi.mock('./CliffEnvironment', () => ({
  CliffEnvironment: () => <div data-testid="cliff-layer" />
}));

vi.mock('./AtmosphereLayer', () => ({
  AtmosphereLayer: () => <div data-testid="atmosphere-layer" />
}));

vi.mock('./TrafficLayer', () => ({
  TrafficLayer: () => <div data-testid="traffic-layer" />
}));

vi.mock('./NavigationMarkerLayer', () => ({
  NavigationMarkerLayer: () => <div data-testid="navigation-marker-layer" />
}));

describe('SceneScenic', () => {
  beforeEach(() => {
    vi.mocked(generateSceneLayout).mockClear();
  });

  it('renders the deferred scenic layers from bridge params and guides', () => {
    const model = generateBridgeModel(balancedPreset.params);

    render(<SceneScenic guides={model.guides} params={balancedPreset.params} />);

    expect(vi.mocked(generateSceneLayout)).toHaveBeenCalledWith(
      balancedPreset.params,
      model.guides
    );
    expect(screen.getByTestId('sky-shell')).toBeInTheDocument();
    expect(screen.getByTestId('sky-shell')).toHaveAttribute('distance', '450000');
    expect(screen.getByTestId('sky-shell')).toHaveAttribute('inclination', '0.53');
    expect(screen.getByTestId('sky-shell')).toHaveAttribute('azimuth', '0.22');
    expect(screen.getByTestId('sky-shell')).toHaveAttribute('miecoefficient', '0.0055');
    expect(screen.getByTestId('sky-shell')).toHaveAttribute('rayleigh', '0.72');
    expect(screen.getByTestId('sky-shell')).toHaveAttribute('turbidity', '8.6');
    expect(screen.getByTestId('cliff-layer')).toBeInTheDocument();
    expect(screen.getByTestId('atmosphere-layer')).toBeInTheDocument();
    expect(screen.getByTestId('traffic-layer')).toBeInTheDocument();
    expect(screen.getByTestId('navigation-marker-layer')).toBeInTheDocument();
  });
});
