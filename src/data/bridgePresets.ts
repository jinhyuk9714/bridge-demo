import type { BridgePreset } from '../types/bridge';

export const compactPreset: BridgePreset = {
  id: 'compact',
  label: 'Compact',
  params: {
    spanLength: 420,
    deckElevation: 48,
    deckWidth: 18,
    towerHeight: 132,
    cableCountPerSide: 6,
    cableSlope: 56
  }
};

export const balancedPreset: BridgePreset = {
  id: 'balanced',
  label: 'Balanced',
  params: {
    spanLength: 560,
    deckElevation: 54,
    deckWidth: 22,
    towerHeight: 162,
    cableCountPerSide: 8,
    cableSlope: 52
  }
};

export const monumentalPreset: BridgePreset = {
  id: 'monumental',
  label: 'Monumental',
  params: {
    spanLength: 760,
    deckElevation: 60,
    deckWidth: 28,
    towerHeight: 210,
    cableCountPerSide: 10,
    cableSlope: 48
  }
};

export const bridgePresets = [
  compactPreset,
  balancedPreset,
  monumentalPreset
];
