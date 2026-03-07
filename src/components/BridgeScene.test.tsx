import React, { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Vector3 } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { balancedPreset } from '../data/bridgePresets';
import { useBridgeStore } from '../store/bridgeStore';
import type { BridgeSceneHandle } from '../types/bridge';
import { downloadCanvasPng } from '../lib/exportImage';
import { BridgeScene, getCameraPresetView } from './BridgeScene';

const mockCanvas = document.createElement('canvas');
const mockCamera = {
  position: new Vector3(0, 0, 0),
  lookAt: vi.fn()
};
const orbitListeners = new Map<string, Set<() => void>>();
const orbitControlsApi = {
  target: new Vector3(0, 0, 0),
  enabled: true,
  update: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};
let orbitControlsProps: Record<string, unknown> | null = null;
const frameCallbacks: Array<(state: unknown, delta: number) => void> = [];

const runFrame = (delta = 0.016) => {
  act(() => {
    frameCallbacks.forEach((callback) => callback({}, delta));
  });
};

const emitOrbitEvent = (event: string) => {
  act(() => {
    orbitListeners.get(event)?.forEach((listener) => listener());
  });
};

const sumInstanceCount = (testId: string) =>
  screen
    .getAllByTestId(testId)
    .reduce((total, node) => total + Number(node.getAttribute('data-instance-count') ?? 0), 0);

vi.mock('../lib/exportImage', () => ({
  downloadCanvasPng: vi.fn()
}));

vi.mock('./scene/SceneScenic', () => ({
  SceneScenic: () => (
    <>
      <sky-shell data-testid="sky-shell" />
      <group data-testid="cliff-mass" />
      <group data-testid="atmosphere-band" />
      <group data-testid="traffic-vehicle" />
      <group data-testid="shoreline-shelf" />
    </>
  )
}));

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
  OrbitControls: React.forwardRef((props, ref) => {
    orbitControlsProps = props as Record<string, unknown>;
    React.useImperativeHandle(ref, () => orbitControlsApi);

    return <orbit-controls data-testid="orbit-controls" />;
  }),
  Sky: () => <sky-shell data-testid="sky-shell" />
}));

describe('BridgeScene', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    useBridgeStore.setState({
      params: { ...balancedPreset.params },
      selectedPreset: balancedPreset.id,
      cameraPreset: 'hero',
      cameraFocusRequestId: 0
    });
    vi.mocked(downloadCanvasPng).mockReset();
    mockCamera.position.set(0, 0, 0);
    mockCamera.lookAt.mockReset();
    orbitControlsApi.target.set(0, 0, 0);
    orbitControlsApi.enabled = true;
    orbitControlsApi.update.mockReset();
    orbitControlsApi.addEventListener.mockReset();
    orbitControlsApi.removeEventListener.mockReset();
    orbitControlsProps = null;
    frameCallbacks.length = 0;
    orbitListeners.clear();

    orbitControlsApi.addEventListener.mockImplementation((event: string, listener: () => void) => {
      const listeners = orbitListeners.get(event) ?? new Set<() => void>();

      listeners.add(listener);
      orbitListeners.set(event, listeners);
    });

    orbitControlsApi.removeEventListener.mockImplementation((event: string, listener: () => void) => {
      orbitListeners.get(event)?.delete(listener);
    });

    orbitControlsApi.update.mockImplementation(() => {
      orbitListeners.get('change')?.forEach((listener) => listener());
    });
  });

  afterEach(() => {
    consoleError.mockRestore();
    vi.useRealTimers();
  });

  const enableScenicLayers = async () => {
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await vi.runAllTimersAsync();
      await vi.dynamicImportSettled();
      await Promise.resolve();
    });
  };

  it('renders core bridge geometry first, then enables scenic layers on the next frame', async () => {
    render(<BridgeScene />);

    expect(screen.getByTestId('scene-canvas-shell')).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId('bridge-canvas')).toBeInTheDocument();
    expect(orbitControlsProps?.zoomSpeed).toBe(0.25);
    expect(sumInstanceCount('bridge-tower-frame-instanced')).toBeGreaterThan(0);
    expect(
      Number(screen.getByTestId('bridge-cable-instanced').getAttribute('data-instance-count'))
    ).toBe(
      balancedPreset.params.cableCountPerSide * 8
    );
    expect(sumInstanceCount('bridge-cable-anchor-instanced')).toBe(
      balancedPreset.params.cableCountPerSide * 8
    );
    expect(sumInstanceCount('bridge-tower-cable-anchor-instanced')).toBe(
      balancedPreset.params.cableCountPerSide * 8
    );
    expect(sumInstanceCount('bridge-pier-instanced')).toBeGreaterThanOrEqual(6);
    expect(sumInstanceCount('bridge-bearing-instanced')).toBeGreaterThanOrEqual(2);
    expect(screen.queryByTestId('bridge-cable-mesh')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sky-shell')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cliff-mass')).not.toBeInTheDocument();
    expect(screen.queryByTestId('atmosphere-band')).not.toBeInTheDocument();
    expect(screen.queryByTestId('traffic-vehicle')).not.toBeInTheDocument();

    await enableScenicLayers();

    expect(screen.getByTestId('sky-shell')).toBeInTheDocument();
    expect(screen.getByTestId('cliff-mass')).toBeInTheDocument();
    expect(screen.getByTestId('atmosphere-band')).toBeInTheDocument();
    expect(screen.getByTestId('traffic-vehicle')).toBeInTheDocument();
    expect(screen.getByTestId('shoreline-shelf')).toBeInTheDocument();
  });

  it('returns distinct camera views for hero, front, and side presets', () => {
    const hero = getCameraPresetView('hero', balancedPreset.params.deckElevation);
    const front = getCameraPresetView('front', balancedPreset.params.deckElevation);
    const side = getCameraPresetView('side', balancedPreset.params.deckElevation);

    expect(hero.position).not.toEqual(front.position);
    expect(front.position).not.toEqual(side.position);
    expect(hero.target[1]).toBe(balancedPreset.params.deckElevation);
    expect(front.target[1]).toBe(balancedPreset.params.deckElevation);
    expect(side.target[1]).toBe(balancedPreset.params.deckElevation);
  });

  it('keeps the user camera position when only bridge params change', () => {
    render(<BridgeScene />);

    mockCamera.position.set(480, 120, 90);
    orbitControlsApi.target.set(24, 52, -16);

    act(() => {
      useBridgeStore.getState().updateParam('deckElevation', balancedPreset.params.deckElevation + 8);
    });

    runFrame();

    expect(mockCamera.position.toArray()).toEqual([480, 120, 90]);
    expect(orbitControlsApi.target.toArray()).toEqual([24, 52, -16]);
  });

  it('does not move the camera from keyboard input until the scene shell is focused', () => {
    render(<BridgeScene />);

    const initialPosition = mockCamera.position.toArray();
    const initialTarget = orbitControlsApi.target.toArray();

    fireEvent.keyDown(document.body, { key: 'ㅈ', code: 'KeyW' });
    runFrame(0.1);

    expect(mockCamera.position.toArray()).toEqual(initialPosition);
    expect(orbitControlsApi.target.toArray()).toEqual(initialTarget);
  });

  it('focuses the scene shell on pointer down and moves only the camera during wasd input', () => {
    render(<BridgeScene />);

    const shell = screen.getByTestId('scene-canvas-shell');
    const initialPosition = mockCamera.position.clone();
    const initialTarget = orbitControlsApi.target.clone();

    fireEvent.pointerDown(shell);

    expect(shell).toHaveFocus();

    fireEvent.keyDown(shell, { key: 'ㅈ', code: 'KeyW' });
    runFrame(0.1);

    expect(mockCamera.position.x).toBeLessThan(initialPosition.x);
    expect(mockCamera.position.y).toBeLessThan(initialPosition.y);
    expect(mockCamera.position.z).toBeLessThan(initialPosition.z);
    expect(orbitControlsApi.target.toArray()).toEqual(initialTarget.toArray());
    expect(orbitControlsApi.enabled).toBe(true);
  });

  it('accelerates wasd movement while shift is pressed', () => {
    render(<BridgeScene />);

    const shell = screen.getByTestId('scene-canvas-shell');
    const initialPosition = mockCamera.position.clone();
    const initialTarget = orbitControlsApi.target.clone();

    fireEvent.pointerDown(shell);
    fireEvent.keyDown(shell, { key: 'w' });
    runFrame(0.1);
    fireEvent.keyUp(shell, { key: 'w' });

    const normalDistance = mockCamera.position.distanceTo(initialPosition);

    mockCamera.position.copy(initialPosition);
    orbitControlsApi.target.copy(initialTarget);

    fireEvent.keyDown(shell, { key: 'Shift', code: 'ShiftRight' });
    fireEvent.keyDown(shell, { key: 'ㅈ', code: 'KeyW' });
    runFrame(0.1);
    fireEvent.keyUp(shell, { key: 'ㅈ', code: 'KeyW' });
    fireEvent.keyUp(shell, { key: 'Shift', code: 'ShiftRight' });

    const acceleratedDistance = mockCamera.position.distanceTo(initialPosition);

    expect(acceleratedDistance).toBeGreaterThan(normalDistance);
  });

  it('cancels preset transitions when wasd movement starts', () => {
    render(<BridgeScene />);

    const shell = screen.getByTestId('scene-canvas-shell');

    fireEvent.pointerDown(shell);

    act(() => {
      useBridgeStore.getState().setCameraPreset('side');
    });

    fireEvent.keyDown(shell, { key: 'ㅈ', code: 'KeyW' });
    runFrame(0.1);
    fireEvent.keyUp(shell, { key: 'ㅈ', code: 'KeyW' });
    runFrame();

    const movedPosition = mockCamera.position.toArray();
    const movedTarget = orbitControlsApi.target.toArray();

    for (let frame = 0; frame < 12; frame += 1) {
      runFrame(0.1);
    }

    expect(mockCamera.position.toArray()).toEqual(movedPosition);
    expect(orbitControlsApi.target.toArray()).toEqual(movedTarget);
  });

  it('re-syncs orbit target in front of the camera after wasd movement ends', () => {
    render(<BridgeScene />);

    const shell = screen.getByTestId('scene-canvas-shell');
    const initialDirection = orbitControlsApi.target
      .clone()
      .sub(mockCamera.position)
      .normalize();
    const initialTarget = orbitControlsApi.target.clone();

    fireEvent.pointerDown(shell);
    fireEvent.keyDown(shell, { key: 'ㅈ', code: 'KeyW' });
    runFrame(0.1);

    expect(orbitControlsApi.target.toArray()).toEqual(initialTarget.toArray());

    fireEvent.keyUp(shell, { key: 'ㅈ', code: 'KeyW' });
    runFrame();

    const syncedDirection = orbitControlsApi.target.clone().sub(mockCamera.position).normalize();

    expect(orbitControlsApi.enabled).toBe(true);
    expect(orbitControlsApi.target.toArray()).not.toEqual(initialTarget.toArray());
    expect(syncedDirection.x).toBeCloseTo(initialDirection.x, 5);
    expect(syncedDirection.y).toBeCloseTo(initialDirection.y, 5);
    expect(syncedDirection.z).toBeCloseTo(initialDirection.z, 5);
  });

  it('updates wasd movement direction from orbit changes while keyboard movement is active', () => {
    render(<BridgeScene />);

    const shell = screen.getByTestId('scene-canvas-shell');

    fireEvent.pointerDown(shell);
    fireEvent.keyDown(shell, { key: 'ㅈ', code: 'KeyW' });
    runFrame(0.05);

    const positionBeforeOrbit = mockCamera.position.clone();

    emitOrbitEvent('start');
    orbitControlsApi.target.copy(mockCamera.position.clone().add(new Vector3(0, 0, 320)));
    emitOrbitEvent('change');
    runFrame(0.05);

    expect(mockCamera.position.z).toBeGreaterThan(positionBeforeOrbit.z);
  });

  it('keeps the live orbit target after keyboard movement if orbit changed during that movement', () => {
    render(<BridgeScene />);

    const shell = screen.getByTestId('scene-canvas-shell');

    fireEvent.pointerDown(shell);
    fireEvent.keyDown(shell, { key: 'ㅈ', code: 'KeyW' });
    runFrame(0.05);

    emitOrbitEvent('start');

    const orbitTarget = mockCamera.position.clone().add(new Vector3(60, 24, 280));

    orbitControlsApi.target.copy(orbitTarget);
    emitOrbitEvent('change');
    emitOrbitEvent('end');

    fireEvent.keyUp(shell, { key: 'ㅈ', code: 'KeyW' });
    runFrame();

    expect(orbitControlsApi.target.toArray()).toEqual(orbitTarget.toArray());
  });

  it('exposes an export handle that forwards the current canvas to the png utility', async () => {
    const ref = createRef<BridgeSceneHandle>();

    render(<BridgeScene ref={ref} />);

    await act(async () => {
      await Promise.resolve();
    });

    ref.current?.exportPng();

    expect(downloadCanvasPng).toHaveBeenCalledWith(mockCanvas, balancedPreset.id);
  });

  it('falls back to key values when keyboard code is unavailable', () => {
    render(<BridgeScene />);

    const shell = screen.getByTestId('scene-canvas-shell');
    const initialPosition = mockCamera.position.clone();

    fireEvent.pointerDown(shell);
    fireEvent.keyDown(shell, { key: 'w' });
    runFrame(0.1);

    expect(mockCamera.position.distanceTo(initialPosition)).toBeGreaterThan(0);
  });
});
