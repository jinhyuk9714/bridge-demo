import { useState } from 'react';

import {
  copyTextToClipboard,
  loadSavedPresets,
  removeSavedPreset,
  serializeShareState,
  upsertSavedPreset
} from '../lib/shareState';
import type { BridgeParams } from '../types/bridge';
import { bridgeParamConfig, useBridgeStore } from '../store/bridgeStore';
import { PresetSwitcher } from './PresetSwitcher';

const paramOrder: Array<keyof BridgeParams> = [
  'spanLength',
  'deckElevation',
  'deckWidth',
  'towerHeight',
  'cableCountPerSide',
  'cableSlope'
];

const formatValue = (key: keyof BridgeParams, value: number) => {
  const unit = bridgeParamConfig[key].unit;

  if (!unit) {
    return String(value);
  }

  if (unit === 'deg') {
    return `${value}°`;
  }

  return `${value} ${unit}`;
};

type BridgeControlsProps = {
  onExport: () => void;
};

export const BridgeControls = ({ onExport }: BridgeControlsProps) => {
  const [isParametersOpen, setIsParametersOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [savedPresets, setSavedPresets] = useState(() => loadSavedPresets());
  const params = useBridgeStore((state) => state.params);
  const selectedPreset = useBridgeStore((state) => state.selectedPreset);
  const updateParam = useBridgeStore((state) => state.updateParam);
  const applyPreset = useBridgeStore((state) => state.applyPreset);
  const applySharedState = useBridgeStore((state) => state.applySharedState);
  const captureShareState = useBridgeStore((state) => state.captureShareState);
  const resetParams = useBridgeStore((state) => state.resetParams);

  const handleSavePreset = () => {
    const trimmedName = presetName.trim();

    if (!trimmedName) {
      setSaveStatus('Enter a preset name to save this view.');
      return;
    }

    setSavedPresets(upsertSavedPreset(trimmedName, captureShareState()));
    setSaveStatus(`Saved ${trimmedName}.`);
  };

  const handleCopyLink = async () => {
    const shareUrl = new URL(window.location.pathname, window.location.origin);

    shareUrl.search = serializeShareState(captureShareState()).toString();
    shareUrl.hash = window.location.hash;

    try {
      await copyTextToClipboard(shareUrl.toString());
      setSaveStatus('Share link copied.');
    } catch {
      setSaveStatus('Copy failed. Try again.');
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = savedPresets.find((entry) => entry.id === presetId);

    if (!preset) {
      return;
    }

    applySharedState(preset.snapshot);
    setSaveStatus(`Loaded ${preset.name}.`);
  };

  const handleDeletePreset = (presetId: string) => {
    const preset = savedPresets.find((entry) => entry.id === presetId);

    setSavedPresets(removeSavedPreset(presetId));
    setSaveStatus(preset ? `Deleted ${preset.name}.` : 'Preset removed.');
  };

  return (
    <aside className="control-overlay">
      <div className="control-card">
        <p className="eyebrow">Parametric Bridge Lab</p>
        <h1>Bridge studio</h1>
        <p className="overlay-copy">
          Shape a cable-stayed bridge in a full-screen viewport with quick presets
          and compact structural controls.
        </p>
        <section className="overlay-section">
          <div className="section-heading compact">
            <h2>Presets</h2>
            <button className="ghost-button" type="button" onClick={resetParams}>
              Reset
            </button>
          </div>

          <PresetSwitcher activePreset={selectedPreset} onSelect={applyPreset} />
        </section>

        <section className="overlay-section">
          <div className="metric-stack">
            <div className="metric-pill">
              <span>Main span</span>
              <strong>{formatValue('spanLength', params.spanLength)}</strong>
            </div>
            <div className="metric-pill">
              <span>Tower height</span>
              <strong>{formatValue('towerHeight', params.towerHeight)}</strong>
            </div>
            <div className="metric-pill">
              <span>Cable fan</span>
              <strong>{formatValue('cableCountPerSide', params.cableCountPerSide)} / side</strong>
            </div>
          </div>
        </section>

        <section className="overlay-section">
          <button
            aria-controls="bridge-parameters-panel"
            aria-expanded={isParametersOpen}
            className="accordion-toggle"
            type="button"
            onClick={() => setIsParametersOpen((current) => !current)}
          >
            <span>Bridge Parameters</span>
            <span aria-hidden="true" className="accordion-state">
              {isParametersOpen ? 'Hide' : 'Show'}
            </span>
          </button>

          {isParametersOpen ? (
            <div className="accordion-panel" id="bridge-parameters-panel">
              <div className="slider-list">
                {paramOrder.map((key) => {
                  const config = bridgeParamConfig[key];

                  return (
                    <label className="slider-card" key={key} htmlFor={key}>
                      <span className="slider-label-row">
                        <span>{config.label}</span>
                        <span className="slider-value">{formatValue(key, params[key])}</span>
                      </span>
                      <input
                        id={key}
                        aria-label={config.label}
                        max={config.max}
                        min={config.min}
                        step={config.step}
                        type="range"
                        value={params[key]}
                        onChange={(event) => updateParam(key, Number(event.target.value))}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        <button className="toolbar-export overlay-export" type="button" onClick={onExport}>
          Export PNG
        </button>

        <section className="overlay-section save-share-section">
          <div className="section-heading compact">
            <h2>Save &amp; Share</h2>
          </div>

          <label className="text-field" htmlFor="preset-name">
            <span>Preset name</span>
            <input
              id="preset-name"
              aria-label="Preset name"
              placeholder="Golden pass"
              type="text"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
            />
          </label>

          <div className="save-share-actions">
            <button
              className="toolbar-chip"
              type="button"
              onClick={handleSavePreset}
            >
              Save Preset
            </button>
            <button className="toolbar-chip" type="button" onClick={handleCopyLink}>
              Copy Link
            </button>
          </div>

          <div className="saved-preset-list">
            {savedPresets.length ? (
              savedPresets.map((preset) => (
                <div className="saved-preset-item" key={preset.id}>
                  <div className="saved-preset-copy">
                    <strong>{preset.name}</strong>
                    <span>
                      {preset.snapshot.selectedPreset} · {preset.snapshot.cameraPreset}
                    </span>
                  </div>
                  <div className="saved-preset-actions">
                    <button
                      aria-label={`Load ${preset.name}`}
                      className="ghost-button saved-preset-button"
                      type="button"
                      onClick={() => handleLoadPreset(preset.id)}
                    >
                      Load
                    </button>
                    <button
                      aria-label={`Delete ${preset.name}`}
                      className="ghost-button saved-preset-button"
                      type="button"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="saved-preset-empty">No saved presets yet.</p>
            )}
          </div>

          <p aria-live="polite" className="save-share-status" role="status">
            {saveStatus}
          </p>
        </section>
      </div>
    </aside>
  );
};
