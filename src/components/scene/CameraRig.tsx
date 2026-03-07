import { useEffect, useRef, type MutableRefObject } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import type { CameraPreset } from '../../types/bridge';
import {
  FLIGHT_SHIFT_MULTIPLIER,
  FLIGHT_SPEED,
  getCameraPresetView,
  MIN_ORBIT_SYNC_DISTANCE,
  MOVEMENT_KEYS,
  type OrbitControlsApi
} from './shared';

export const CameraRig = ({
  cameraPreset,
  cameraFocusRequestId,
  deckElevation,
  isSceneFocusedRef,
  pressedKeysRef
}: {
  cameraPreset: CameraPreset;
  cameraFocusRequestId: number;
  deckElevation: number;
  isSceneFocusedRef: MutableRefObject<boolean>;
  pressedKeysRef: MutableRefObject<Set<string>>;
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsApi | null>(null);
  const initialViewRef = useRef(getCameraPresetView(cameraPreset, deckElevation));
  const desiredPosition = useRef(new Vector3(...initialViewRef.current.position));
  const desiredTarget = useRef(new Vector3(...initialViewRef.current.target));
  const initialLookDirection = new Vector3(...initialViewRef.current.target)
    .sub(new Vector3(...initialViewRef.current.position))
    .normalize();
  const lookDirectionRef = useRef(initialLookDirection);
  const orbitDistanceRef = useRef(
    Math.max(
      MIN_ORBIT_SYNC_DISTANCE,
      new Vector3(...initialViewRef.current.target).distanceTo(
        new Vector3(...initialViewRef.current.position)
      )
    )
  );
  const isTransitioning = useRef(false);
  const wasKeyboardMoving = useRef(false);
  const isOrbitInteractingRef = useRef(false);
  const didOrbitDuringKeyboardMoveRef = useRef(false);
  const lastHandledFocusRequestId = useRef(cameraFocusRequestId);

  const syncLookState = (target: Vector3) => {
    const direction = target.clone().sub(camera.position);
    const distance = direction.length();

    if (distance < 0.0001) {
      return;
    }

    lookDirectionRef.current.copy(direction.normalize());
    orbitDistanceRef.current = Math.max(MIN_ORBIT_SYNC_DISTANCE, distance);
  };

  useEffect(() => {
    camera.position.set(...initialViewRef.current.position);
    desiredPosition.current.set(...initialViewRef.current.position);
    desiredTarget.current.set(...initialViewRef.current.target);
    syncLookState(desiredTarget.current);

    if (controlsRef.current) {
      controlsRef.current.target.set(...initialViewRef.current.target);
      controlsRef.current.update();
      return;
    }

    camera.lookAt(...initialViewRef.current.target);
  }, [camera]);

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls?.addEventListener) {
      return;
    }

    const hasActiveKeyboardMovement = () =>
      isSceneFocusedRef.current && MOVEMENT_KEYS.some((key) => pressedKeysRef.current.has(key));

    const startOrbitInteraction = () => {
      isTransitioning.current = false;
      isOrbitInteractingRef.current = true;
    };

    const syncFromControls = () => {
      desiredTarget.current.copy(controls.target);
      syncLookState(controls.target);

      if (hasActiveKeyboardMovement()) {
        didOrbitDuringKeyboardMoveRef.current = true;
      }
    };

    const endOrbitInteraction = () => {
      syncFromControls();
      isOrbitInteractingRef.current = false;
    };

    controls.addEventListener('start', startOrbitInteraction);
    controls.addEventListener('change', syncFromControls);
    controls.addEventListener('end', endOrbitInteraction);

    return () => {
      controls.removeEventListener?.('start', startOrbitInteraction);
      controls.removeEventListener?.('change', syncFromControls);
      controls.removeEventListener?.('end', endOrbitInteraction);
    };
  }, [camera, isSceneFocusedRef, pressedKeysRef]);

  useEffect(() => {
    if (cameraFocusRequestId === lastHandledFocusRequestId.current) {
      return;
    }

    lastHandledFocusRequestId.current = cameraFocusRequestId;

    const nextView = getCameraPresetView(cameraPreset, deckElevation);

    desiredPosition.current.set(...nextView.position);
    desiredTarget.current.set(...nextView.target);
    isTransitioning.current = true;
  }, [cameraFocusRequestId, cameraPreset, deckElevation]);

  useFrame((_, delta) => {
    const activeKeys = pressedKeysRef.current;
    const isMoving =
      isSceneFocusedRef.current && MOVEMENT_KEYS.some((key) => activeKeys.has(key));

    if (isMoving) {
      if (!wasKeyboardMoving.current) {
        didOrbitDuringKeyboardMoveRef.current = false;
      }

      isTransitioning.current = false;
      wasKeyboardMoving.current = true;
      const orbitDirection =
        controlsRef.current && isOrbitInteractingRef.current
          ? controlsRef.current.target.clone().sub(camera.position)
          : null;
      const forward =
        orbitDirection && orbitDirection.lengthSq() > 0.0001
          ? orbitDirection.normalize()
          : lookDirectionRef.current.clone();

      if (forward.lengthSq() <= 0.0001) {
        forward.copy(desiredTarget.current).sub(camera.position);
      }

      if (forward.lengthSq() > 0.0001) {
        forward.normalize();
      } else {
        forward.set(0, -0.3, -1).normalize();
      }

      const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0));

      if (right.lengthSq() > 0.0001) {
        right.normalize();
      } else {
        right.set(1, 0, 0);
      }

      const movement = new Vector3();

      if (activeKeys.has('w')) {
        movement.add(forward);
      }

      if (activeKeys.has('s')) {
        movement.sub(forward);
      }

      if (activeKeys.has('d')) {
        movement.add(right);
      }

      if (activeKeys.has('a')) {
        movement.sub(right);
      }

      if (movement.lengthSq() > 0.0001) {
        const speedMultiplier = activeKeys.has('shift') ? FLIGHT_SHIFT_MULTIPLIER : 1;
        const step = movement.normalize().multiplyScalar(FLIGHT_SPEED * speedMultiplier * delta);
        const nextLookTarget =
          controlsRef.current && didOrbitDuringKeyboardMoveRef.current
            ? controlsRef.current.target.clone()
            : camera.position
                .clone()
                .add(step)
                .add(forward.clone().multiplyScalar(orbitDistanceRef.current));

        camera.position.add(step);
        desiredPosition.current.copy(camera.position);
        camera.lookAt(nextLookTarget);
      }

      return;
    }

    if (wasKeyboardMoving.current) {
      const controls = controlsRef.current;

      if (!isTransitioning.current) {
        if (controls && didOrbitDuringKeyboardMoveRef.current) {
          desiredTarget.current.copy(controls.target);
          syncLookState(controls.target);
          camera.lookAt(controls.target);
        } else {
          const syncedTarget = camera.position
            .clone()
            .add(lookDirectionRef.current.clone().multiplyScalar(orbitDistanceRef.current));

          desiredTarget.current.copy(syncedTarget);
          syncLookState(syncedTarget);

          if (controls) {
            controls.target.copy(syncedTarget);
            controls.update();
          } else {
            camera.lookAt(syncedTarget);
          }
        }
      }

      didOrbitDuringKeyboardMoveRef.current = false;
      wasKeyboardMoving.current = false;
      return;
    }

    if (!isTransitioning.current) {
      return;
    }

    const smoothing = 1 - Math.exp(-delta * 4.6);
    camera.position.lerp(desiredPosition.current, smoothing);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredTarget.current, smoothing);
      controlsRef.current.update();

      const settled =
        camera.position.distanceTo(desiredPosition.current) < 0.12 &&
        controlsRef.current.target.distanceTo(desiredTarget.current) < 0.12;

      if (settled) {
        camera.position.copy(desiredPosition.current);
        controlsRef.current.target.copy(desiredTarget.current);
        controlsRef.current.update();
        syncLookState(desiredTarget.current);
        isTransitioning.current = false;
      }

      return;
    }

    camera.lookAt(desiredTarget.current);

    if (camera.position.distanceTo(desiredPosition.current) < 0.12) {
      camera.position.copy(desiredPosition.current);
      syncLookState(desiredTarget.current);
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef as never}
      enableDamping
      maxDistance={620}
      maxPolarAngle={Math.PI / 2.02}
      minDistance={110}
      target={initialViewRef.current.target}
      zoomSpeed={0.25}
    />
  );
};

CameraRig.displayName = 'CameraRig';
