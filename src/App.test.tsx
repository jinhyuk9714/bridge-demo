import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { balancedPreset } from './data/bridgePresets';
import { useBridgeStore } from './store/bridgeStore';

const exportPngSpy = vi.fn();

vi.mock('./components/BridgeScene', () => ({
  BridgeScene: React.forwardRef((_props, ref: React.Ref<{ exportPng: () => void }>) => {
    React.useImperativeHandle(ref, () => ({
      exportPng: exportPngSpy
    }));

    return <div data-testid="bridge-scene-mock">Scene</div>;
  })
}));

import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    exportPngSpy.mockReset();
    window.history.replaceState({}, '', '/');
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const bootScene = async () => {
    await act(async () => {
      vi.advanceTimersToNextFrame();
      await vi.dynamicImportSettled();
    });
  };

  it('keeps the loading shell on the first paint and boots the scene on the next frame', async () => {
    render(<App />);

    expect(screen.getByText('Loading bridge scene...')).toBeInTheDocument();
    expect(screen.queryByTestId('bridge-scene-mock')).not.toBeInTheDocument();

    await bootScene();

    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();
  });

  it('shows camera preset controls and updates the active preset in store', async () => {
    render(<App />);

    await bootScene();
    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Bridge Parameters' })).toBeInTheDocument();
    expect(
      screen.getByText('Drag to orbit · Scroll to zoom · Click scene + WASD to move camera')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hero' })).toHaveClass('active');
    expect(
      screen.queryByRole('heading', {
        name: 'Shape the skyline with six structural controls.'
      })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Side' }));

    expect(useBridgeStore.getState().cameraPreset).toBe('side');
    expect(
      (useBridgeStore.getState() as { cameraFocusRequestId?: number }).cameraFocusRequestId
    ).toBe(1);
    expect(screen.getByRole('button', { name: 'Side' })).toHaveClass('active');
  });

  it('treats re-clicking the active viewpoint as a new camera focus request', async () => {
    render(<App />);

    await bootScene();
    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hero' }));

    expect(useBridgeStore.getState().cameraPreset).toBe('hero');
    expect(
      (useBridgeStore.getState() as { cameraFocusRequestId?: number }).cameraFocusRequestId
    ).toBe(1);
  });

  it('triggers the scene export handle from the Export PNG button', async () => {
    render(<App />);

    await bootScene();
    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    expect(exportPngSpy).toHaveBeenCalledTimes(1);
  });

  it('applies shared state from the url on initial render', async () => {
    window.history.replaceState(
      {},
      '',
      '/?preset=monumental&cam=front&span=810&elev=66&width=30&tower=240&cables=12&slope=44'
    );

    render(<App />);

    await bootScene();
    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();
    await act(async () => {
      await Promise.resolve();
    });

    expect(useBridgeStore.getState().selectedPreset).toBe('monumental');
    expect(useBridgeStore.getState().cameraPreset).toBe('front');
    expect(useBridgeStore.getState().params).toEqual({
      spanLength: 810,
      deckElevation: 66,
      deckWidth: 30,
      towerHeight: 240,
      cableCountPerSide: 12,
      cableSlope: 44
    });
    expect(screen.getByRole('button', { name: 'Front' })).toHaveClass('active');
  });
});
