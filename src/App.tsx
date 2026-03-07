import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { BridgeControls } from './components/BridgeControls';
import { parseShareState } from './lib/shareState';
import { useBridgeStore } from './store/bridgeStore';
import type { BridgeSceneHandle, CameraPreset } from './types/bridge';

const BridgeScene = lazy(async () => {
  const module = await import('./components/BridgeScene');

  return { default: module.BridgeScene };
});

const cameraPresets: Array<{ id: CameraPreset; label: string }> = [
  { id: 'hero', label: 'Hero' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' }
];

const SHARE_HYDRATION_STATE_KEY = '__bridgeSharedStateHydrated';
const scheduleFrame = (callback: FrameRequestCallback) =>
  window.requestAnimationFrame?.(callback) ??
  window.setTimeout(() => callback(performance.now()), 16);
const cancelScheduledFrame = (handle: number) => {
  if (window.cancelAnimationFrame) {
    window.cancelAnimationFrame(handle);
    return;
  }

  window.clearTimeout(handle);
};

const App = () => {
  const cameraPreset = useBridgeStore((state) => state.cameraPreset);
  const setCameraPreset = useBridgeStore((state) => state.setCameraPreset);
  const applySharedState = useBridgeStore((state) => state.applySharedState);
  const sceneRef = useRef<BridgeSceneHandle | null>(null);
  const [shouldBootScene, setShouldBootScene] = useState(false);

  useEffect(() => {
    const bootHandle = scheduleFrame(() => {
      setShouldBootScene(true);
    });

    return () => {
      cancelScheduledFrame(bootHandle);
    };
  }, []);

  useEffect(() => {
    const search = window.location.search;
    const snapshot = parseShareState(search);

    if (!snapshot) {
      return;
    }

    const historyState =
      typeof window.history.state === 'object' && window.history.state !== null
        ? (window.history.state as Record<string, unknown>)
        : {};

    if (historyState[SHARE_HYDRATION_STATE_KEY] === search) {
      return;
    }

    applySharedState(snapshot);
    window.history.replaceState(
      {
        ...historyState,
        [SHARE_HYDRATION_STATE_KEY]: search
      },
      '',
      window.location.href
    );
  }, [applySharedState]);

  return (
    <main className="app-shell">
      {shouldBootScene ? (
        <Suspense
          fallback={
            <div className="scene-loading" role="status">
              Loading bridge scene...
            </div>
          }
        >
          <BridgeScene ref={sceneRef} />
        </Suspense>
      ) : (
        <div className="scene-loading" role="status">
          Loading bridge scene...
        </div>
      )}

      <div className="hud-layer">
        <div className="hud-top">
          <BridgeControls onExport={() => sceneRef.current?.exportPng()} />

          <aside className="viewpoint-overlay">
            <div className="viewpoint-card">
              <p className="eyebrow">Viewpoints</p>
              <p className="overlay-copy compact">
                Jump between structural passes and wide scenic angles.
              </p>

              <div className="camera-toggle-group">
                {cameraPresets.map((preset) => (
                  <button
                    key={preset.id}
                    className={
                      cameraPreset === preset.id ? 'toolbar-chip active' : 'toolbar-chip'
                    }
                    type="button"
                    onClick={() => setCameraPreset(preset.id)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="scene-hint">Drag to orbit · Scroll to zoom · Click scene + WASD to move camera</div>
      </div>
    </main>
  );
};

export default App;
