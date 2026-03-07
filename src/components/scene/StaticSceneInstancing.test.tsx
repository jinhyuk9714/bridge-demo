import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { balancedPreset } from '../../data/bridgePresets';
import { generateBridgeModel } from '../../lib/bridgeGenerator';
import { generateSceneLayout } from '../../lib/sceneLayout';
import { BridgeStructure } from './BridgeStructure';
import { CliffEnvironment } from './CliffEnvironment';

const sumInstanceCount = (testId: string) =>
  screen
    .getAllByTestId(testId)
    .reduce((total, node) => total + Number(node.getAttribute('data-instance-count') ?? 0), 0);

describe('scene static instancing', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders bridge structure through instanced box and cable groups', () => {
    const model = generateBridgeModel(balancedPreset.params);

    render(<BridgeStructure model={model} />);

    expect(sumInstanceCount('bridge-deck-detail-instanced')).toBeGreaterThan(0);
    expect(sumInstanceCount('bridge-cable-anchor-instanced')).toBe(
      model.deckDetails.filter((detail) => detail.id.startsWith('cable-anchor-')).length
    );
    expect(sumInstanceCount('bridge-tower-frame-instanced')).toBeGreaterThan(0);
    expect(sumInstanceCount('bridge-tower-cable-anchor-instanced')).toBe(
      model.towerFrames.filter((part) => part.id.includes('-cable-anchor-')).length
    );
    expect(sumInstanceCount('bridge-pier-instanced')).toBe(
      model.piers.filter((part) => !part.id.includes('bearing')).length
    );
    expect(sumInstanceCount('bridge-bearing-instanced')).toBe(
      model.piers.filter((part) => part.id.includes('bearing')).length
    );
    expect(screen.getByTestId('bridge-cable-instanced')).toHaveAttribute(
      'data-instance-count',
      String(model.cables.length)
    );
    expect(screen.queryByTestId('bridge-cable-mesh')).not.toBeInTheDocument();
  });

  it('renders cliff and shoreline masses through instanced box groups', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);

    render(<CliffEnvironment layout={layout} />);

    expect(sumInstanceCount('cliff-mass-instanced')).toBe(layout.cliffs.length);
    expect(sumInstanceCount('shoreline-shelf-instanced')).toBe(layout.shoreline.length);
    expect(sumInstanceCount('backdrop-ridge-instanced')).toBe(layout.backdrops.length);
    expect(screen.queryByTestId('cliff-mass')).not.toBeInTheDocument();
  });
});
