import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { balancedPreset } from '../../data/bridgePresets';
import { generateBridgeModel } from '../../lib/bridgeGenerator';
import { generateSceneLayout } from '../../lib/sceneLayout';
import { BridgeStructure } from './BridgeStructure';
import { CliffEnvironment } from './CliffEnvironment';

const sumInstanceCount = (container: HTMLElement, name: string) =>
  [...container.querySelectorAll(`[name="${name}"]`)].reduce(
    (total, node) => total + Number(node.getAttribute('count') ?? 0),
    0
  );

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

    const { container } = render(<BridgeStructure model={model} />);

    expect(sumInstanceCount(container, 'bridge-deck-detail-instanced')).toBeGreaterThan(0);
    expect(sumInstanceCount(container, 'bridge-cable-anchor-instanced')).toBe(
      model.deckDetails.filter((detail) => detail.id.startsWith('cable-anchor-')).length
    );
    expect(sumInstanceCount(container, 'bridge-tower-frame-instanced')).toBeGreaterThan(0);
    expect(sumInstanceCount(container, 'bridge-tower-cable-anchor-instanced')).toBe(
      model.towerFrames.filter((part) => part.id.includes('-cable-anchor-')).length
    );
    expect(sumInstanceCount(container, 'bridge-pier-instanced')).toBe(
      model.piers.filter((part) => !part.id.includes('bearing')).length
    );
    expect(sumInstanceCount(container, 'bridge-bearing-instanced')).toBe(
      model.piers.filter((part) => part.id.includes('bearing')).length
    );
    expect(container.querySelector('[name="bridge-cable-instanced"]')).toHaveAttribute(
      'count',
      String(model.cables.length)
    );
    expect(container.querySelector('[name="bridge-cable-mesh"]')).toBeNull();
    expect(container.querySelector('[data-testid]')).toBeNull();
    expect(container.querySelector('[data-instance-count]')).toBeNull();
  });

  it('renders cliff and shoreline masses through instanced box groups', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);

    const { container } = render(<CliffEnvironment layout={layout} />);

    expect(sumInstanceCount(container, 'cliff-mass-instanced')).toBe(layout.cliffs.length);
    expect(sumInstanceCount(container, 'shoreline-shelf-instanced')).toBe(layout.shoreline.length);
    expect(sumInstanceCount(container, 'backdrop-ridge-instanced')).toBe(layout.backdrops.length);
    expect(container.querySelector('[name="cliff-mass"]')).toBeNull();
    expect(container.querySelector('[data-testid]')).toBeNull();
    expect(container.querySelector('[data-instance-count]')).toBeNull();
  });
});
