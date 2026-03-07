import { bridgePresets } from '../data/bridgePresets';

type PresetSwitcherProps = {
  activePreset: string;
  onSelect: (presetId: string) => void;
};

export const PresetSwitcher = ({
  activePreset,
  onSelect
}: PresetSwitcherProps) => (
  <div className="preset-strip" aria-label="Bridge presets">
    {bridgePresets.map((preset) => (
      <button
        key={preset.id}
        className={preset.id === activePreset ? 'preset-chip active' : 'preset-chip'}
        type="button"
        onClick={() => onSelect(preset.id)}
      >
        {preset.label}
      </button>
    ))}
  </div>
);
