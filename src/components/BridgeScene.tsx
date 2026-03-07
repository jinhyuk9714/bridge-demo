import { Canvas } from '@react-three/fiber';
import {
  Suspense,
  lazy,
  startTransition,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';

import { downloadCanvasPng } from '../lib/exportImage';
import { generateBridgeModel } from '../lib/bridgeGenerator';
import { useBridgeStore } from '../store/bridgeStore';
import type { BridgeSceneHandle } from '../types/bridge';
import { BridgeStructure } from './scene/BridgeStructure';
import { CameraRig } from './scene/CameraRig';
import { getCameraPresetView, normalizeFlightInput } from './scene/shared';
import { sceneLighting } from './scene/sceneLook';

export { getCameraPresetView } from './scene/shared';

const SceneScenic = lazy(async () => {
  const module = await import('./scene/SceneScenic');

  return { default: module.SceneScenic };
});

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

export const BridgeScene = forwardRef<BridgeSceneHandle>((_, ref) => {
  const params = useBridgeStore((state) => state.params);
  const selectedPreset = useBridgeStore((state) => state.selectedPreset);
  const cameraPreset = useBridgeStore((state) => state.cameraPreset);
  const cameraFocusRequestId = useBridgeStore((state) => state.cameraFocusRequestId);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isSceneFocusedRef = useRef(false);
  const pressedKeysRef = useRef(new Set<string>());
  const initialViewRef = useRef(getCameraPresetView(cameraPreset, params.deckElevation));
  const scenicBootHandleRef = useRef<number | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [scenicEnabled, setScenicEnabled] = useState(false);
  const model = useMemo(() => generateBridgeModel(params), [params]);

  useEffect(() => {
    if (!isCanvasReady || scenicEnabled) {
      return;
    }

    scenicBootHandleRef.current = scheduleFrame(() => {
      startTransition(() => {
        setScenicEnabled(true);
      });
    });

    return () => {
      if (scenicBootHandleRef.current !== null) {
        cancelScheduledFrame(scenicBootHandleRef.current);
        scenicBootHandleRef.current = null;
      }
    };
  }, [isCanvasReady, scenicEnabled]);

  useImperativeHandle(
    ref,
    () => ({
      exportPng: () => {
        if (!canvasRef.current) {
          return;
        }

        downloadCanvasPng(canvasRef.current, selectedPreset);
      }
    }),
    [selectedPreset]
  );

  return (
    <div
      className="scene-canvas-shell"
      data-testid="scene-canvas-shell"
      tabIndex={0}
      onBlur={() => {
        isSceneFocusedRef.current = false;
        pressedKeysRef.current.clear();
      }}
      onFocus={() => {
        isSceneFocusedRef.current = true;
      }}
      onKeyDown={(event) => {
        const key = normalizeFlightInput(event);

        if (!key) {
          return;
        }

        pressedKeysRef.current.add(key);
        event.preventDefault();
      }}
      onKeyUp={(event) => {
        const key = normalizeFlightInput(event);

        if (!key) {
          return;
        }

        pressedKeysRef.current.delete(key);
        event.preventDefault();
      }}
      onPointerDown={(event) => {
        event.currentTarget.focus();
      }}
    >
      <Canvas
        camera={{ fov: 37, position: initialViewRef.current.position }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        shadows
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
          setIsCanvasReady(true);
        }}
      >
        <color attach="background" args={[sceneLighting.background]} />
        <fog attach="fog" args={sceneLighting.fogArgs} />
        <ambientLight intensity={sceneLighting.ambientIntensity} />
        <hemisphereLight args={sceneLighting.hemisphereArgs} />
        <directionalLight
          castShadow
          color={sceneLighting.directional.color}
          intensity={sceneLighting.directional.intensity}
          position={sceneLighting.directional.position}
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
        <BridgeStructure model={model} />
        <Suspense fallback={null}>
          {scenicEnabled ? <SceneScenic guides={model.guides} params={params} /> : null}
        </Suspense>
        <CameraRig
          cameraFocusRequestId={cameraFocusRequestId}
          cameraPreset={cameraPreset}
          deckElevation={params.deckElevation}
          isSceneFocusedRef={isSceneFocusedRef}
          pressedKeysRef={pressedKeysRef}
        />
      </Canvas>
    </div>
  );
});

BridgeScene.displayName = 'BridgeScene';
