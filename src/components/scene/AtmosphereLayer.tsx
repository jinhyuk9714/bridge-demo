import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Color,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  Quaternion,
  Vector3
} from 'three';

import type { AtmosphereBand } from '../../types/bridge';
import { hasPosition, hasRotation } from './shared';

const xAxis = new Vector3(1, 0, 0);

const hasInstancedMeshApi = (value: unknown): value is InstancedMesh =>
  typeof value === 'object' &&
  value !== null &&
  'setMatrixAt' in value &&
  typeof (value as InstancedMesh).setMatrixAt === 'function' &&
  'instanceMatrix' in value;

const buildBandMatrix = (band: AtmosphereBand, xOffset = 0) => {
  const position = new Vector3(band.position[0] + xOffset, band.position[1], band.position[2]);
  const quaternion = new Quaternion().setFromAxisAngle(xAxis, -Math.PI / 2);
  const scale = new Vector3(band.size[0], band.size[2], 1);

  return new Matrix4().compose(position, quaternion, scale);
};

const WaterSurface = memo(() => {
  const shimmerRef = useRef<unknown>(null);
  const timeRef = useRef(0);
  const baseGeometry = useMemo(() => new PlaneGeometry(2800, 2800, 1, 1), []);
  const shimmerGeometry = useMemo(() => new PlaneGeometry(2600, 2600, 1, 1), []);
  const baseMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: '#416f95',
        metalness: 0.04,
        reflectivity: 0.68,
        roughness: 0.3,
        transmission: 0.02
      }),
    []
  );
  const shimmerMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: '#9ec5d9',
        metalness: 0,
        opacity: 0.15,
        roughness: 0.42,
        transparent: true
      }),
    []
  );

  useEffect(
    () => () => {
      baseGeometry.dispose();
      shimmerGeometry.dispose();
      baseMaterial.dispose();
      shimmerMaterial.dispose();
    },
    [baseGeometry, shimmerGeometry, baseMaterial, shimmerMaterial]
  );

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (hasPosition(shimmerRef.current)) {
      shimmerRef.current.position.y = -0.18 + Math.sin(timeRef.current * 0.6) * 0.06;
    }

    if (hasRotation(shimmerRef.current)) {
      shimmerRef.current.rotation.z = Math.sin(timeRef.current * 0.12) * 0.01;
    }
  });

  return (
    <group>
      <mesh
        data-testid="water-surface"
        receiveShadow
        position={[0, -0.34, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <primitive attach="geometry" object={baseGeometry} />
        <primitive attach="material" object={baseMaterial} />
      </mesh>

      <mesh
        data-testid="water-shimmer"
        ref={shimmerRef as never}
        position={[0, -0.18, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <primitive attach="geometry" object={shimmerGeometry} />
        <primitive attach="material" object={shimmerMaterial} />
      </mesh>
    </group>
  );
});

WaterSurface.displayName = 'WaterSurface';

export const AtmosphereLayer = memo(
  ({ atmosphereBands }: { atmosphereBands: AtmosphereBand[] }) => {
    const bandGroups = useMemo(() => {
      const groups = new Map<
        string,
        { key: string; opacity: number; bands: AtmosphereBand[] }
      >();

      atmosphereBands.forEach((band) => {
        const key = String(band.opacity);
        const group = groups.get(key);

        if (group) {
          group.bands.push(band);
          return;
        }

        groups.set(key, {
          key,
          opacity: band.opacity,
          bands: [band]
        });
      });

      return [...groups.values()];
    }, [atmosphereBands]);
    const bandRefs = useRef<Array<InstancedMesh | null>>([]);
    const timeRef = useRef(0);
    const bandColor = useMemo(() => new Color(), []);

    useLayoutEffect(() => {
      bandGroups.forEach((group, groupIndex) => {
        const bandRef = bandRefs.current[groupIndex];

        if (!hasInstancedMeshApi(bandRef)) {
          return;
        }

        group.bands.forEach((band, index) => {
          bandRef.setMatrixAt(index, buildBandMatrix(band));
          bandRef.setColorAt(index, bandColor.set(band.color));
        });

        bandRef.instanceMatrix.needsUpdate = true;

        if (bandRef.instanceColor) {
          bandRef.instanceColor.needsUpdate = true;
        }
      });
    }, [bandColor, bandGroups]);

    useFrame((_, delta) => {
      timeRef.current += delta;

      bandGroups.forEach((group, groupIndex) => {
        const bandRef = bandRefs.current[groupIndex];

        if (!hasInstancedMeshApi(bandRef)) {
          return;
        }

        group.bands.forEach((band, index) => {
          const xOffset =
            Math.sin(timeRef.current * band.driftSpeed + index * 0.7) * band.driftRange;

          bandRef.setMatrixAt(index, buildBandMatrix(band, xOffset));
        });

        bandRef.instanceMatrix.needsUpdate = true;
      });
    });

    return (
      <group>
        <WaterSurface />

        {bandGroups.map((group, index) => (
          <instancedMesh
            data-instance-count={group.bands.length}
            data-testid="atmosphere-band-instanced"
            key={group.key}
            ref={((node: InstancedMesh | null) => {
              bandRefs.current[index] = node;
            }) as never}
            args={[undefined, undefined, group.bands.length]}
          >
            <planeGeometry args={[1, 1, 1, 1]} />
            <meshBasicMaterial opacity={group.opacity} transparent vertexColors />
          </instancedMesh>
        ))}
      </group>
    );
  }
);

AtmosphereLayer.displayName = 'AtmosphereLayer';
