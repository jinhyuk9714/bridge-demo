import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { balancedPreset } from './data/bridgePresets';
import { saveLastSession } from './lib/shareState';
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
    localStorage.clear();
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

  const enterStudio = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Enter Studio' }));

    await act(async () => {
      vi.advanceTimersToNextFrame();
      await vi.dynamicImportSettled();
    });
  };

  it('keeps the intro cover on first paint and only boots the scene after Enter is clicked', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Bridge studio' })).toBeInTheDocument();
    expect(screen.getByText('Default preset ready.')).toBeInTheDocument();
    expect(screen.queryByTestId('bridge-scene-mock')).not.toBeInTheDocument();

    await enterStudio();

    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();
  });

  it('shows shared-link copy before entry and applies the shared state only after Enter', async () => {
    window.history.replaceState(
      {},
      '',
      '/?preset=monumental&cam=front&span=810&elev=66&width=30&tower=240&cables=12&slope=44'
    );

    render(<App />);

    expect(screen.getByText('Shared link ready.')).toBeInTheDocument();
    expect(useBridgeStore.getState().selectedPreset).toBe('balanced');

    await enterStudio();

    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();
    expect(useBridgeStore.getState().selectedPreset).toBe('monumental');
    expect(useBridgeStore.getState().cameraPreset).toBe('front');
    expect(screen.getByRole('button', { name: 'Front' })).toHaveClass('active');
  });

  it('shows session-resume copy when a last session exists and autosaves after Enter', async () => {
    saveLastSession({
      params: { ...balancedPreset.params, spanLength: 660 },
      selectedPreset: balancedPreset.id,
      cameraPreset: 'side'
    });

    render(<App />);

    expect(screen.getByText('Resume last session.')).toBeInTheDocument();
    expect(useBridgeStore.getState().params.spanLength).toBe(balancedPreset.params.spanLength);

    await enterStudio();

    expect(useBridgeStore.getState().params.spanLength).toBe(660);

    fireEvent.click(screen.getByRole('button', { name: 'Hero' }));

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(localStorage.getItem('bridge-demo:last-session')).toContain('"cameraPreset":"hero"');
  });

  it('shows camera preset controls and updates the active preset in store after entering', async () => {
    render(<App />);

    await enterStudio();
    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bridge Parameters' })).toBeInTheDocument();
    expect(
      screen.getByText('Drag to orbit · Scroll to zoom · Click scene + WASD to move camera')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hero' })).toHaveClass('active');

    fireEvent.click(screen.getByRole('button', { name: 'Side' }));

    expect(useBridgeStore.getState().cameraPreset).toBe('side');
    expect(
      (useBridgeStore.getState() as { cameraFocusRequestId?: number }).cameraFocusRequestId
    ).toBe(1);
    expect(screen.getByRole('button', { name: 'Side' })).toHaveClass('active');
  });

  it('treats re-clicking the active viewpoint as a new camera focus request', async () => {
    render(<App />);

    await enterStudio();
    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hero' }));

    expect(useBridgeStore.getState().cameraPreset).toBe('hero');
    expect(
      (useBridgeStore.getState() as { cameraFocusRequestId?: number }).cameraFocusRequestId
    ).toBe(1);
  });

  it('triggers the scene export handle from the Export PNG button', async () => {
    render(<App />);

    await enterStudio();
    expect(screen.getByTestId('bridge-scene-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    expect(exportPngSpy).toHaveBeenCalledTimes(1);
  });
});
