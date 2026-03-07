import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import { Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';

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

export type BoxInstanceProfile = {
  key: string;
  testId?: string;
  color: string;
  castShadow: boolean;
  receiveShadow: boolean;
  metalness: number;
  roughness: number;
};

export type BoxInstanceGroup = BoxInstanceProfile & {
  parts: BridgeBoxPart[];
};

export type CableInstanceGroup = {
  key: string;
  testId?: string;
  color: string;
  metalness: number;
  roughness: number;
  radius: number;
  cables: BridgeCable[];
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

const yAxis = new Vector3(0, 1, 0);

const buildBoxMatrix = (part: BridgeBoxPart) => {
  const position = new Vector3(...part.position);
  const rotation = new Euler(...(part.rotation ?? [0, 0, 0]));
  const quaternion = new Quaternion().setFromEuler(rotation);
  const scale = new Vector3(...part.size);

  return new Matrix4().compose(position, quaternion, scale);
};

const buildCableMatrix = (cable: BridgeCable, radius: number) => {
  const start = new Vector3(...cable.start);
  const end = new Vector3(...cable.end);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const quaternion = new Quaternion().setFromUnitVectors(yAxis, direction.normalize());
  const scale = new Vector3(radius, length, radius);

  return new Matrix4().compose(midpoint, quaternion, scale);
};

export const buildBoxInstanceGroups = (
  parts: BridgeBoxPart[],
  getProfile: (part: BridgeBoxPart) => BoxInstanceProfile
): BoxInstanceGroup[] => {
  const groups = new Map<string, BoxInstanceGroup>();

  parts.forEach((part) => {
    const profile = getProfile(part);
    const group = groups.get(profile.key);

    if (group) {
      group.parts.push(part);
      return;
    }

    groups.set(profile.key, {
      ...profile,
      parts: [part]
    });
  });

  return [...groups.values()];
};

export const buildCableInstanceTransforms = (cables: BridgeCable[], radius: number) =>
  cables.map((cable) => ({
    id: cable.id,
    color: cable.color,
    matrix: buildCableMatrix(cable, radius)
  }));

export const buildCableInstanceGroups = (
  cables: BridgeCable[],
  radius: number,
  profile: Pick<CableInstanceGroup, 'testId' | 'metalness' | 'roughness'>
): CableInstanceGroup[] => {
  const groups = new Map<string, CableInstanceGroup>();

  buildCableInstanceTransforms(cables, radius).forEach(({ id, color }) => {
    const groupKey = `${color}:${radius}:${profile.metalness}:${profile.roughness}:${profile.testId ?? ''}`;
    const cable = cables.find((entry) => entry.id === id);

    if (!cable) {
      return;
    }

    const group = groups.get(groupKey);

    if (group) {
      group.cables.push(cable);
      return;
    }

    groups.set(groupKey, {
      key: groupKey,
      color,
      radius,
      cables: [cable],
      ...profile
    });
  });

  return [...groups.values()];
};

const hasInstancedMeshApi = (value: unknown): value is InstancedMesh =>
  typeof value === 'object' &&
  value !== null &&
  'setMatrixAt' in value &&
  typeof (value as InstancedMesh).setMatrixAt === 'function' &&
  'instanceMatrix' in value;

export const InstancedBoxes = memo(({ group }: { group: BoxInstanceGroup }) => {
  const meshRef = useRef<InstancedMesh | null>(null);
  const matrices = useMemo(() => group.parts.map(buildBoxMatrix), [group.parts]);

  useLayoutEffect(() => {
    if (!hasInstancedMeshApi(meshRef.current)) {
      return;
    }

    matrices.forEach((matrix, index) => {
      meshRef.current?.setMatrixAt(index, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh
      castShadow={group.castShadow}
      count={group.parts.length}
      name={group.testId}
      receiveShadow={group.receiveShadow}
      ref={meshRef}
      args={[undefined, undefined, group.parts.length]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={group.color}
        metalness={group.metalness}
        roughness={group.roughness}
      />
    </instancedMesh>
  );
});

InstancedBoxes.displayName = 'InstancedBoxes';

export const InstancedCables = memo(({ group }: { group: CableInstanceGroup }) => {
  const meshRef = useRef<InstancedMesh | null>(null);
  const matrices = useMemo(
    () => group.cables.map((cable) => buildCableMatrix(cable, group.radius)),
    [group.cables, group.radius]
  );

  useLayoutEffect(() => {
    if (!hasInstancedMeshApi(meshRef.current)) {
      return;
    }

    matrices.forEach((matrix, index) => {
      meshRef.current?.setMatrixAt(index, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh
      castShadow
      count={group.cables.length}
      name={group.testId}
      receiveShadow
      ref={meshRef}
      args={[undefined, undefined, group.cables.length]}
    >
      <cylinderGeometry args={[1, 1, 1, 8]} />
      <meshStandardMaterial
        color={group.color}
        metalness={group.metalness}
        roughness={group.roughness}
      />
    </instancedMesh>
  );
});

InstancedCables.displayName = 'InstancedCables';

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
      name={testId}
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
        name="bridge-cable-mesh"
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
