import { memo } from 'react';
import { Quaternion, Vector3 } from 'three';

import type {
  BridgeBoxPart,
  BridgeCable,
  CameraPreset,
  Vec3
} from '../../types/bridge';

export type CameraView = {
  position: Vec3;
  target: Vec3;
};

export type OrbitControlsApi = {
  enabled: boolean;
  target: Vector3;
  update: () => void;
  addEventListener?: (event: string, listener: () => void) => void;
  removeEventListener?: (event: string, listener: () => void) => void;
};

type TransformLike = {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
};

export const FLIGHT_KEYS = new Set(['w', 'a', 's', 'd', 'shift']);
export const MOVEMENT_KEYS = ['w', 'a', 's', 'd'] as const;
export const FLIGHT_SPEED = 96;
export const FLIGHT_SHIFT_MULTIPLIER = 2.35;
export const MIN_ORBIT_SYNC_DISTANCE = 120;

const normalizeKey = (key: string) => key.toLowerCase();

export const normalizeFlightInput = (input: { code?: string; key: string }) => {
  switch (input.code) {
    case 'KeyW':
      return 'w';
    case 'KeyA':
      return 'a';
    case 'KeyS':
      return 's';
    case 'KeyD':
      return 'd';
    case 'ShiftLeft':
    case 'ShiftRight':
      return 'shift';
    default: {
      const normalized = normalizeKey(input.key);

      return FLIGHT_KEYS.has(normalized) ? normalized : null;
    }
  }
};

export const hasPosition = (value: unknown): value is Required<Pick<TransformLike, 'position'>> =>
  typeof value === 'object' &&
  value !== null &&
  'position' in value &&
  typeof (value as TransformLike).position === 'object' &&
  (value as TransformLike).position !== null &&
  typeof (value as TransformLike).position?.x === 'number' &&
  typeof (value as TransformLike).position?.y === 'number' &&
  typeof (value as TransformLike).position?.z === 'number';

export const hasRotation = (value: unknown): value is Required<Pick<TransformLike, 'rotation'>> =>
  typeof value === 'object' &&
  value !== null &&
  'rotation' in value &&
  typeof (value as TransformLike).rotation === 'object' &&
  (value as TransformLike).rotation !== null &&
  typeof (value as TransformLike).rotation?.x === 'number' &&
  typeof (value as TransformLike).rotation?.y === 'number' &&
  typeof (value as TransformLike).rotation?.z === 'number';

export const getCameraPresetView = (
  preset: CameraPreset,
  deckElevation: number
): CameraView => {
  const target: Vec3 = [0, deckElevation, 0];

  switch (preset) {
    case 'front':
      return {
        position: [0, deckElevation + 86, 348],
        target
      };
    case 'side':
      return {
        position: [382, deckElevation + 58, 28],
        target
      };
    case 'hero':
    default:
      return {
        position: [248, deckElevation + 78, 286],
        target
      };
  }
};

export const SceneBox = memo(
  ({
    part,
    castShadow = true,
    metalness = 0.06,
    receiveShadow = true,
    roughness = 0.84,
    testId
  }: {
    part: BridgeBoxPart;
    testId?: string;
    castShadow?: boolean;
    receiveShadow?: boolean;
    roughness?: number;
    metalness?: number;
  }) => (
    <mesh
      castShadow={castShadow}
      data-testid={testId}
      position={part.position}
      receiveShadow={receiveShadow}
      rotation={part.rotation ?? [0, 0, 0]}
    >
      <boxGeometry args={part.size} />
      <meshStandardMaterial color={part.color} metalness={metalness} roughness={roughness} />
    </mesh>
  )
);

SceneBox.displayName = 'SceneBox';

export const CableSegment = memo(
  ({
    cable,
    radius
  }: {
    cable: BridgeCable;
    radius: number;
  }) => {
    const start = new Vector3(...cable.start);
    const end = new Vector3(...cable.end);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      direction.normalize()
    );

    return (
      <mesh
        castShadow
        data-testid="bridge-cable-mesh"
        position={midpoint.toArray()}
        quaternion={quaternion}
        receiveShadow
      >
        <cylinderGeometry args={[radius, radius, length, 8]} />
        <meshStandardMaterial color={cable.color} metalness={0.22} roughness={0.38} />
      </mesh>
    );
  }
);

CableSegment.displayName = 'CableSegment';
