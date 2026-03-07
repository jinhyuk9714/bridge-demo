import React from 'react';
import { act, render } from '@testing-library/react';
import { Vector3 } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { balancedPreset } from '../data/bridgePresets';
import { useBridgeStore } from '../store/bridgeStore';

const mockCanvas = document.createElement('canvas');
const mockCamera = {
  position: new Vector3(0, 0, 0),
  lookAt: vi.fn()
};
const orbitControlsApi = {
  target: new Vector3(0, 0, 0),
  enabled: true,
  update: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};
const frameCallbacks: Array<(state: unknown, delta: number) => void> = [];

vi.mock('../lib/exportImage', () => ({
  downloadCanvasPng: vi.fn()
}));

vi.mock('../lib/bridgeGenerator', async () => {
  const actual = await vi.importActual<typeof import('../lib/bridgeGenerator')>(
    '../lib/bridgeGenerator'
  );

  return {
    ...actual,
    generateBridgeModel: vi.fn(actual.generateBridgeModel)
  };
});

vi.mock('../lib/sceneLayout', async () => {
  const actual = await vi.importActual<typeof import('../lib/sceneLayout')>(
    '../lib/sceneLayout'
  );

  return {
    ...actual,
    generateSceneLayout: vi.fn(actual.generateSceneLayout)
  };
});

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    onCreated
  }: {
    children: React.ReactNode;
    onCreated?: (state: { gl: { domElement: HTMLCanvasElement } }) => void;
  }) => {
    React.useEffect(() => {
      onCreated?.({ gl: { domElement: mockCanvas } });
    }, [onCreated]);

    return <div data-testid="bridge-canvas">{children}</div>;
  },
  useFrame: vi.fn((callback: (state: unknown, delta: number) => void) => {
    frameCallbacks.push(callback);
  }),
  useThree: () => ({
    camera: mockCamera
  })
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: React.forwardRef((_props, ref) => {
    React.useImperativeHandle(ref, () => orbitControlsApi);

    return <orbit-controls data-testid="orbit-controls" />;
  }),
  Sky: () => <sky-shell data-testid="sky-shell" />
}));

import { generateBridgeModel } from '../lib/bridgeGenerator';
import { generateSceneLayout } from '../lib/sceneLayout';
import { BridgeScene } from './BridgeScene';

describe('BridgeScene performance orchestration', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    useBridgeStore.setState({
      params: { ...balancedPreset.params },
      selectedPreset: balancedPreset.id,
      cameraPreset: 'hero',
      cameraFocusRequestId: 0,
      resetSnapshot: {
        params: { ...balancedPreset.params },
        selectedPreset: balancedPreset.id,
        cameraPreset: 'hero'
      }
    });
    vi.mocked(generateBridgeModel).mockClear();
    vi.mocked(generateSceneLayout).mockClear();
    mockCamera.position.set(0, 0, 0);
    mockCamera.lookAt.mockReset();
    orbitControlsApi.target.set(0, 0, 0);
    orbitControlsApi.update.mockReset();
    orbitControlsApi.addEventListener.mockReset();
    orbitControlsApi.removeEventListener.mockReset();
    frameCallbacks.length = 0;
  });

  afterEach(() => {
    consoleError.mockRestore();
    vi.useRealTimers();
  });

  const enableScenicLayers = async () => {
    await import('./scene/SceneScenic');

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
      await vi.dynamicImportSettled();
      await vi.runAllTimersAsync();
      await Promise.resolve();
    });
  };

  it('does not regenerate scene geometry when only camera focus state changes', async () => {
    render(<BridgeScene />);

    expect(generateBridgeModel).toHaveBeenCalledTimes(1);
    expect(generateSceneLayout).toHaveBeenCalledTimes(0);

    await enableScenicLayers();

    expect(generateSceneLayout).toHaveBeenCalledTimes(1);

    act(() => {
      useBridgeStore.getState().setCameraPreset('side');
    });

    expect(generateBridgeModel).toHaveBeenCalledTimes(1);
    expect(generateSceneLayout).toHaveBeenCalledTimes(1);
  });

  it('regenerates scene geometry when bridge params change', async () => {
    render(<BridgeScene />);

    expect(generateBridgeModel).toHaveBeenCalledTimes(1);
    expect(generateSceneLayout).toHaveBeenCalledTimes(0);

    await enableScenicLayers();

    expect(generateSceneLayout).toHaveBeenCalledTimes(1);

    act(() => {
      useBridgeStore.getState().updateParam('deckWidth', balancedPreset.params.deckWidth + 4);
    });

    expect(generateBridgeModel).toHaveBeenCalledTimes(2);
    expect(generateSceneLayout).toHaveBeenCalledTimes(2);
  });
});
