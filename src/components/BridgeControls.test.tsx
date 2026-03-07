import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { balancedPreset, monumentalPreset } from '../data/bridgePresets';
import { useBridgeStore } from '../store/bridgeStore';
import { BridgeControls } from './BridgeControls';

describe('BridgeControls', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
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

  it('starts as a compact overlay card with collapsed parameters and key metrics', () => {
    render(<BridgeControls onExport={() => {}} />);

    expect(screen.getByText('Main span')).toBeInTheDocument();
    expect(screen.getByText('Bridge Parameters')).toBeInTheDocument();
    expect(screen.getByText('Save & Share')).toBeInTheDocument();
    expect(screen.queryByLabelText('Tower height')).not.toBeInTheDocument();
  });

  it('expands bridge parameters and updates the active slider value', () => {
    render(<BridgeControls onExport={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Bridge Parameters' }));

    const towerHeight = screen.getByLabelText('Tower height');

    expect(towerHeight).toHaveValue(String(balancedPreset.params.towerHeight));

    fireEvent.change(towerHeight, { target: { value: '175' } });

    expect(useBridgeStore.getState().params.towerHeight).toBe(175);
    expect(towerHeight).toHaveValue('175');
  });

  it('switches presets and clamps user input to the configured maximum', () => {
    render(<BridgeControls onExport={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Monumental' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bridge Parameters' }));

    const spanLength = screen.getByLabelText('Span length');

    expect(spanLength).toHaveValue(String(monumentalPreset.params.spanLength));

    fireEvent.change(spanLength, { target: { value: '1200' } });

    expect(useBridgeStore.getState().selectedPreset).toBe('monumental');
    expect(useBridgeStore.getState().params.spanLength).toBe(900);
    expect(spanLength).toHaveValue('900');
  });

  it('saves named presets and overwrites duplicates by name', async () => {
    render(<BridgeControls onExport={() => {}} />);

    fireEvent.change(screen.getByLabelText('Preset name'), {
      target: { value: 'Harbor Dawn' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }));

    await waitFor(() =>
      expect(screen.getByText('Harbor Dawn')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Bridge Parameters' }));
    fireEvent.change(screen.getByLabelText('Span length'), {
      target: { value: '640' }
    });
    fireEvent.change(screen.getByLabelText('Preset name'), {
      target: { value: ' harbor dawn ' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }));

    expect(screen.getAllByText('Harbor Dawn')).toHaveLength(1);
    expect(screen.getByText('balanced · hero')).toBeInTheDocument();
  });

  it('copies the current state as a share link', async () => {
    render(<BridgeControls onExport={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy Link' }));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    );

    expect(vi.mocked(navigator.clipboard.writeText).mock.calls[0]?.[0]).toContain(
      'preset=balanced'
    );
  });

  it('loads and deletes saved presets from the list', async () => {
    render(<BridgeControls onExport={() => {}} />);

    fireEvent.change(screen.getByLabelText('Preset name'), {
      target: { value: 'Load Test' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }));
    await waitFor(() =>
      expect(screen.getByText('Load Test')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Bridge Parameters' }));
    fireEvent.change(screen.getByLabelText('Tower height'), {
      target: { value: '220' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Load Load Test' }));

    expect(useBridgeStore.getState().params.towerHeight).toBe(
      balancedPreset.params.towerHeight
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete Load Test' }));

    await waitFor(() =>
      expect(screen.queryByText('Load Test')).not.toBeInTheDocument()
    );
  });
});
