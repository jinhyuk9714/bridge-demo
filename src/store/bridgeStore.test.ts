import { beforeEach, describe, expect, it } from 'vitest';

import {
  balancedPreset,
  compactPreset,
  monumentalPreset
} from '../data/bridgePresets';
import { bridgeParamConfig, useBridgeStore } from './bridgeStore';

describe('useBridgeStore', () => {
  beforeEach(() => {
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

  it('starts from the balanced preset state', () => {
    const state = useBridgeStore.getState() as typeof useBridgeStore.getState extends () => infer T
      ? T & {
          cameraFocusRequestId?: number;
          resetSnapshot?: { params: typeof balancedPreset.params; selectedPreset: string };
        }
      : never;

    expect(state.selectedPreset).toBe('balanced');
    expect(state.cameraPreset).toBe('hero');
    expect(state.cameraFocusRequestId).toBe(0);
    expect(state.resetSnapshot?.params).toEqual(balancedPreset.params);
    expect(state.params).toEqual(balancedPreset.params);
  });

  it('clamps parameter updates into the supported bridge range', () => {
    const state = useBridgeStore.getState();

    state.updateParam('spanLength', 120);
    state.updateParam('cableCountPerSide', 40);

    expect(useBridgeStore.getState().params.spanLength).toBe(
      bridgeParamConfig.spanLength.min
    );
    expect(useBridgeStore.getState().params.cableCountPerSide).toBe(
      bridgeParamConfig.cableCountPerSide.max
    );
  });

  it('applies a preset and can reset back to that preset after edits', () => {
    const state = useBridgeStore.getState();

    state.applyPreset(monumentalPreset.id);
    state.updateParam('towerHeight', monumentalPreset.params.towerHeight - 25);

    expect(useBridgeStore.getState().selectedPreset).toBe('monumental');
    expect(useBridgeStore.getState().params.towerHeight).toBe(
      monumentalPreset.params.towerHeight - 25
    );

    useBridgeStore.getState().resetParams();

    expect(useBridgeStore.getState().params).toEqual(monumentalPreset.params);
  });

  it('captures the current shareable bridge state', () => {
    useBridgeStore.getState().applyPreset(compactPreset.id);
    useBridgeStore.getState().setCameraPreset('front');

    expect(useBridgeStore.getState().captureShareState()).toEqual({
      params: compactPreset.params,
      selectedPreset: compactPreset.id,
      cameraPreset: 'front'
    });
  });

  it('updates the active camera preset independently from bridge params and tracks focus requests', () => {
    useBridgeStore.getState().setCameraPreset('side');

    expect(useBridgeStore.getState().cameraPreset).toBe('side');
    expect(
      (useBridgeStore.getState() as { cameraFocusRequestId?: number }).cameraFocusRequestId
    ).toBe(1);
    expect(useBridgeStore.getState().params).toEqual(balancedPreset.params);
  });

  it('increments the focus request even when re-selecting the active preset', () => {
    useBridgeStore.getState().setCameraPreset('hero');
    useBridgeStore.getState().setCameraPreset('hero');

    expect(useBridgeStore.getState().cameraPreset).toBe('hero');
    expect(
      (useBridgeStore.getState() as { cameraFocusRequestId?: number }).cameraFocusRequestId
    ).toBe(2);
  });

  it('applies a shared state as the new reset baseline and re-focuses the camera', () => {
    useBridgeStore.getState().applySharedState({
      params: { ...compactPreset.params, spanLength: 470 },
      selectedPreset: compactPreset.id,
      cameraPreset: 'front'
    });

    expect(useBridgeStore.getState().params.spanLength).toBe(470);
    expect(useBridgeStore.getState().selectedPreset).toBe(compactPreset.id);
    expect(useBridgeStore.getState().cameraPreset).toBe('front');
    expect(
      (useBridgeStore.getState() as { cameraFocusRequestId?: number }).cameraFocusRequestId
    ).toBe(1);

    useBridgeStore.getState().updateParam('towerHeight', 220);
    useBridgeStore.getState().resetParams();

    expect(useBridgeStore.getState().params).toEqual({
      ...compactPreset.params,
      spanLength: 470
    });
  });
});
