import { create } from 'zustand';

import { balancedPreset, bridgePresets } from '../data/bridgePresets';
import type {
  BridgeParams,
  CameraPreset,
  ShareableBridgeState
} from '../types/bridge';

type BridgeParamKey = keyof BridgeParams;

type BridgeParamConfig = {
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
};

type BridgeStore = {
  params: BridgeParams;
  selectedPreset: string;
  cameraPreset: CameraPreset;
  cameraFocusRequestId: number;
  resetSnapshot: ShareableBridgeState;
  updateParam: (key: BridgeParamKey, value: number) => void;
  applyPreset: (presetId: string) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  captureShareState: () => ShareableBridgeState;
  applySharedState: (snapshot: ShareableBridgeState) => void;
  resetParams: () => void;
};

export const bridgeParamConfig: Record<BridgeParamKey, BridgeParamConfig> = {
  spanLength: { label: 'Span length', min: 320, max: 900, step: 10, unit: 'm' },
  deckElevation: { label: 'Deck elevation', min: 28, max: 90, step: 1, unit: 'm' },
  deckWidth: { label: 'Deck width', min: 12, max: 36, step: 1, unit: 'm' },
  towerHeight: { label: 'Tower height', min: 110, max: 260, step: 1, unit: 'm' },
  cableCountPerSide: { label: 'Cables / side', min: 3, max: 12, step: 1, unit: '' },
  cableSlope: { label: 'Cable slope', min: 34, max: 68, step: 1, unit: 'deg' }
};

const presetMap = new Map(bridgePresets.map((preset) => [preset.id, preset]));

const clampValue = (key: BridgeParamKey, value: number): number => {
  const config = bridgeParamConfig[key];
  const clamped = Math.min(config.max, Math.max(config.min, value));

  if (config.step >= 1) {
    return Math.round(clamped / config.step) * config.step;
  }

  return clamped;
};

const createSnapshot = (
  params: BridgeParams,
  selectedPreset: string,
  cameraPreset: CameraPreset
): ShareableBridgeState => ({
  params: { ...params },
  selectedPreset,
  cameraPreset
});

export const useBridgeStore = create<BridgeStore>((set, get) => ({
  params: { ...balancedPreset.params },
  selectedPreset: balancedPreset.id,
  cameraPreset: 'hero',
  cameraFocusRequestId: 0,
  resetSnapshot: createSnapshot(
    balancedPreset.params,
    balancedPreset.id,
    'hero'
  ),
  updateParam: (key, value) => {
    set((state) => ({
      params: {
        ...state.params,
        [key]: clampValue(key, value)
      }
    }));
  },
  applyPreset: (presetId) => {
    const preset = presetMap.get(presetId) ?? balancedPreset;

    set((state) => ({
      selectedPreset: preset.id,
      params: { ...preset.params },
      resetSnapshot: createSnapshot(
        preset.params,
        preset.id,
        state.cameraPreset
      )
    }));
  },
  setCameraPreset: (preset) => {
    set((state) => ({
      cameraPreset: preset,
      cameraFocusRequestId: state.cameraFocusRequestId + 1
    }));
  },
  captureShareState: () => {
    const state = get();

    return createSnapshot(state.params, state.selectedPreset, state.cameraPreset);
  },
  applySharedState: (snapshot) => {
    set((state) => ({
      params: { ...snapshot.params },
      selectedPreset: snapshot.selectedPreset,
      cameraPreset: snapshot.cameraPreset,
      cameraFocusRequestId: state.cameraFocusRequestId + 1,
      resetSnapshot: createSnapshot(
        snapshot.params,
        snapshot.selectedPreset,
        snapshot.cameraPreset
      )
    }));
  },
  resetParams: () => {
    set((state) => ({
      params: { ...state.resetSnapshot.params },
      selectedPreset: state.resetSnapshot.selectedPreset
    }));
  }
}));
