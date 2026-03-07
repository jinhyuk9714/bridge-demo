import { balancedPreset, bridgePresets } from '../data/bridgePresets';
import { bridgeParamConfig } from '../store/bridgeStore';
import type {
  BridgeParams,
  CameraPreset,
  SavedBridgePreset,
  ShareableBridgeState
} from '../types/bridge';

export const PRESET_STORAGE_KEY = 'bridge-demo:saved-presets';

const presetIds = new Set(bridgePresets.map((preset) => preset.id));

const clampParamValue = <TKey extends keyof BridgeParams>(
  key: TKey,
  value: number
): number => {
  const config = bridgeParamConfig[key];
  const clamped = Math.min(config.max, Math.max(config.min, value));

  if (config.step >= 1) {
    return Math.round(clamped / config.step) * config.step;
  }

  return clamped;
};

const normalizePresetId = (presetId: string): string =>
  presetIds.has(presetId) ? presetId : balancedPreset.id;

const normalizeCameraPreset = (cameraPreset: string): CameraPreset =>
  cameraPreset === 'front' || cameraPreset === 'side' || cameraPreset === 'hero'
    ? cameraPreset
    : 'hero';

const getBaseParamsForPreset = (presetId: string): BridgeParams => ({
  ...(bridgePresets.find((preset) => preset.id === presetId) ?? balancedPreset).params
});

const normalizeSnapshot = (snapshot: ShareableBridgeState): ShareableBridgeState => {
  const selectedPreset = normalizePresetId(snapshot.selectedPreset);
  const baseParams = getBaseParamsForPreset(selectedPreset);

  return {
    selectedPreset,
    cameraPreset: normalizeCameraPreset(snapshot.cameraPreset),
    params: {
      ...baseParams,
      spanLength: clampParamValue('spanLength', snapshot.params.spanLength),
      deckElevation: clampParamValue('deckElevation', snapshot.params.deckElevation),
      deckWidth: clampParamValue('deckWidth', snapshot.params.deckWidth),
      towerHeight: clampParamValue('towerHeight', snapshot.params.towerHeight),
      cableCountPerSide: clampParamValue(
        'cableCountPerSide',
        snapshot.params.cableCountPerSide
      ),
      cableSlope: clampParamValue('cableSlope', snapshot.params.cableSlope)
    }
  };
};

const parseNumeric = (
  searchParams: URLSearchParams,
  key: string,
  fallback: number
): number => {
  const raw = searchParams.get(key);
  const parsed = raw === null ? Number.NaN : Number(raw);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const toSortedPresets = (presets: SavedBridgePreset[]): SavedBridgePreset[] =>
  [...presets].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );

const readStoredPresets = (): SavedBridgePreset[] => {
  const stored = localStorage.getItem(PRESET_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return toSortedPresets(
      parsed.filter(
        (preset): preset is SavedBridgePreset =>
          typeof preset?.id === 'string' &&
          typeof preset?.name === 'string' &&
          typeof preset?.updatedAt === 'string' &&
          typeof preset?.snapshot === 'object' &&
          preset.snapshot !== null
      )
    );
  } catch {
    return [];
  }
};

const writeStoredPresets = (presets: SavedBridgePreset[]) => {
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(toSortedPresets(presets)));
};

export const serializeShareState = (
  snapshot: ShareableBridgeState
): URLSearchParams => {
  const normalized = normalizeSnapshot(snapshot);
  const searchParams = new URLSearchParams();

  searchParams.set('preset', normalized.selectedPreset);
  searchParams.set('cam', normalized.cameraPreset);
  searchParams.set('span', String(normalized.params.spanLength));
  searchParams.set('elev', String(normalized.params.deckElevation));
  searchParams.set('width', String(normalized.params.deckWidth));
  searchParams.set('tower', String(normalized.params.towerHeight));
  searchParams.set('cables', String(normalized.params.cableCountPerSide));
  searchParams.set('slope', String(normalized.params.cableSlope));

  return searchParams;
};

export const parseShareState = (search: string): ShareableBridgeState | null => {
  const searchParams = new URLSearchParams(search);
  const hasShareState = ['preset', 'cam', 'span', 'elev', 'width', 'tower', 'cables', 'slope']
    .some((key) => searchParams.has(key));

  if (!hasShareState) {
    return null;
  }

  const selectedPreset = normalizePresetId(searchParams.get('preset') ?? balancedPreset.id);
  const baseParams = getBaseParamsForPreset(selectedPreset);

  return normalizeSnapshot({
    selectedPreset,
    cameraPreset: normalizeCameraPreset(searchParams.get('cam') ?? 'hero'),
    params: {
      spanLength: parseNumeric(searchParams, 'span', baseParams.spanLength),
      deckElevation: parseNumeric(searchParams, 'elev', baseParams.deckElevation),
      deckWidth: parseNumeric(searchParams, 'width', baseParams.deckWidth),
      towerHeight: parseNumeric(searchParams, 'tower', baseParams.towerHeight),
      cableCountPerSide: parseNumeric(
        searchParams,
        'cables',
        baseParams.cableCountPerSide
      ),
      cableSlope: parseNumeric(searchParams, 'slope', baseParams.cableSlope)
    }
  });
};

export const loadSavedPresets = (): SavedBridgePreset[] => readStoredPresets();

export const upsertSavedPreset = (
  name: string,
  snapshot: ShareableBridgeState
): SavedBridgePreset[] => {
  const trimmedName = name.trim();
  const normalized = normalizeSnapshot(snapshot);
  const presets = readStoredPresets();
  const existing = presets.find(
    (preset) => preset.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );

  const nextPreset: SavedBridgePreset = {
    id: existing?.id ?? `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: existing?.name ?? trimmedName,
    snapshot: normalized,
    updatedAt: new Date().toISOString()
  };
  const filtered = presets.filter((preset) => preset.id !== existing?.id);
  const nextPresets = [nextPreset, ...filtered];

  writeStoredPresets(nextPresets);

  return toSortedPresets(nextPresets);
};

export const removeSavedPreset = (presetId: string): SavedBridgePreset[] => {
  const nextPresets = readStoredPresets().filter((preset) => preset.id !== presetId);

  writeStoredPresets(nextPresets);

  return toSortedPresets(nextPresets);
};

export const copyTextToClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');

  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand?.('copy');

    if (!copied) {
      throw new Error('Copy failed');
    }
  } finally {
    document.body.removeChild(textarea);
  }
};
