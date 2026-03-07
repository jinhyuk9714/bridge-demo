import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import type { SceneLayoutData } from '../../types/bridge';
import { hasPosition, hasRotation } from './shared';

const WaterSurface = memo(() => {
  const shimmerRef = useRef<unknown>(null);
  const timeRef = useRef(0);

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
      <mesh receiveShadow position={[0, -0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2800, 2800, 1, 1]} />
        <meshPhysicalMaterial
          color="#416f95"
          metalness={0.04}
          reflectivity={0.68}
          roughness={0.3}
          transmission={0.02}
        />
      </mesh>

      <mesh
        ref={shimmerRef as never}
        position={[0, -0.18, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[2600, 2600, 1, 1]} />
        <meshPhysicalMaterial
          color="#9ec5d9"
          metalness={0}
          opacity={0.15}
          roughness={0.42}
          transparent
        />
      </mesh>
    </group>
  );
});

WaterSurface.displayName = 'WaterSurface';

export const AtmosphereLayer = memo(({ layout }: { layout: SceneLayoutData }) => {
  const bandRefs = useRef<Array<unknown>>([]);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;

    layout.atmosphereBands.forEach((band, index) => {
      const bandRef = bandRefs.current[index];

      if (!hasPosition(bandRef)) {
        return;
      }

      bandRef.position.x =
        band.position[0] +
        Math.sin(timeRef.current * band.driftSpeed + index * 0.7) * band.driftRange;
    });
  });

  return (
    <group>
      <WaterSurface />

      {layout.atmosphereBands.map((band, index) => (
        <group
          data-testid="atmosphere-band"
          key={band.id}
          position={band.position}
          ref={((node: unknown) => {
            bandRefs.current[index] = node;
          }) as never}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[band.size[0], band.size[2], 1, 1]} />
            <meshBasicMaterial color={band.color} opacity={band.opacity} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
});

AtmosphereLayer.displayName = 'AtmosphereLayer';
