import { beforeEach, describe, expect, it } from 'vitest';

import { balancedPreset, monumentalPreset } from '../data/bridgePresets';
import {
  loadSavedPresets,
  parseShareState,
  PRESET_STORAGE_KEY,
  removeSavedPreset,
  serializeShareState,
  upsertSavedPreset
} from './shareState';

describe('shareState helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a shareable state through url params', () => {
    const snapshot = {
      params: { ...monumentalPreset.params, spanLength: 810 },
      selectedPreset: monumentalPreset.id,
      cameraPreset: 'side' as const
    };

    const params = serializeShareState(snapshot);

    expect(parseShareState(`?${params.toString()}`)).toEqual(snapshot);
  });

  it('falls back and clamps invalid url values', () => {
    const parsed = parseShareState(
      '?preset=unknown&cam=nope&span=1200&elev=bad&width=1&tower=999&cables=0&slope=100'
    );

    expect(parsed).toEqual({
      params: {
        ...balancedPreset.params,
        spanLength: 900,
        deckWidth: 12,
        towerHeight: 260,
        cableCountPerSide: 3,
        cableSlope: 68
      },
      selectedPreset: balancedPreset.id,
      cameraPreset: 'hero'
    });
  });

  it('loads, overwrites, and deletes saved presets from local storage', () => {
    const firstSnapshot = {
      params: { ...balancedPreset.params },
      selectedPreset: balancedPreset.id,
      cameraPreset: 'hero' as const
    };
    const updated = {
      params: { ...balancedPreset.params, spanLength: 610 },
      selectedPreset: balancedPreset.id,
      cameraPreset: 'front' as const
    };

    const firstSave = upsertSavedPreset('Bay Study', firstSnapshot);
    const secondSave = upsertSavedPreset(' bay study ', updated);

    expect(firstSave).toHaveLength(1);
    expect(secondSave).toHaveLength(1);
    expect(loadSavedPresets()[0].snapshot).toEqual(updated);

    const storageValue = localStorage.getItem(PRESET_STORAGE_KEY);

    expect(storageValue).toContain('Bay Study');

    removeSavedPreset(loadSavedPresets()[0].id);

    expect(loadSavedPresets()).toEqual([]);
  });
});
