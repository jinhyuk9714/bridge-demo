import { lazy, Suspense, useEffect, useRef, useState } from 'react';

import { BridgeControls } from './components/BridgeControls';
import { loadRestorableState, saveLastSession } from './lib/shareState';
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
  const params = useBridgeStore((state) => state.params);
  const selectedPreset = useBridgeStore((state) => state.selectedPreset);
  const cameraPreset = useBridgeStore((state) => state.cameraPreset);
  const setCameraPreset = useBridgeStore((state) => state.setCameraPreset);
  const captureShareState = useBridgeStore((state) => state.captureShareState);
  const applySharedState = useBridgeStore((state) => state.applySharedState);
  const sceneRef = useRef<BridgeSceneHandle | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [shouldBootScene, setShouldBootScene] = useState(false);
  const [pendingRestorable] = useState(() => loadRestorableState());

  useEffect(() => {
    if (!hasEntered) {
      return;
    }

    const bootHandle = scheduleFrame(() => {
      setShouldBootScene(true);
    });

    return () => {
      cancelScheduledFrame(bootHandle);
    };
  }, [hasEntered]);

  useEffect(() => {
    if (!hasEntered) {
      return;
    }

    const saveHandle = window.setTimeout(() => {
      saveLastSession(captureShareState());
    }, 300);

    return () => {
      window.clearTimeout(saveHandle);
    };
  }, [captureShareState, hasEntered, params, selectedPreset, cameraPreset]);

  const handleEnterStudio = () => {
    if (pendingRestorable.snapshot) {
      applySharedState(pendingRestorable.snapshot);
    }

    setHasEntered(true);
  };

  const statusCopy =
    pendingRestorable.source === 'url'
      ? 'Shared link ready.'
      : pendingRestorable.source === 'session'
        ? 'Resume last session.'
        : 'Default preset ready.';

  return (
    <main className="app-shell">
      {hasEntered ? (
        shouldBootScene ? (
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
        )
      ) : (
        <div className="intro-shell">
          <div className="intro-card">
            <p className="eyebrow">Parametric Bridge Lab</p>
            <h1>Bridge studio</h1>
            <p className="overlay-copy">
              Enter a full-screen cable-stayed bridge studio with presets, structural
              controls, and cinematic viewpoints.
            </p>
            <div className="intro-status">
              <strong>{statusCopy}</strong>
              <span>
                {pendingRestorable.source === 'url'
                  ? 'The shared snapshot will load as soon as you enter.'
                  : pendingRestorable.source === 'session'
                    ? 'Your latest saved bridge session is ready to restore.'
                    : 'Start from the balanced bridge preset and shape from there.'}
              </span>
            </div>
            <button className="intro-enter" type="button" onClick={handleEnterStudio}>
              Enter Studio
            </button>
          </div>
        </div>
      )}

      {hasEntered ? (
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

          <div className="scene-hint">
            Drag to orbit · Scroll to zoom · Click scene + WASD to move camera
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default App;
