import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

import type { NavigationMarkerData } from '../../types/bridge';
import { scenePalette } from './sceneLook';

type MarkerObject = {
  position?: { y: number };
  material?: { opacity?: number };
};

const hasPosition = (value: unknown): value is { position: { y: number } } =>
  typeof value === 'object' &&
  value !== null &&
  'position' in value &&
  typeof (value as { position?: { y?: number } }).position?.y === 'number';

const hasOpacityMaterial = (value: unknown): value is { material: { opacity: number } } =>
  typeof value === 'object' &&
  value !== null &&
  'material' in value &&
  typeof (value as { material?: { opacity?: number } }).material?.opacity === 'number';

export const NavigationMarkerLayer = memo(
  ({ navigationMarkers }: { navigationMarkers: NavigationMarkerData[] }) => {
    const buoyRefs = useRef<Array<MarkerObject | null>>([]);
    const beaconLightRefs = useRef<Array<MarkerObject | null>>([]);
    const timeRef = useRef(0);
    const buoyMarkers = useMemo(
      () => navigationMarkers.filter((marker) => marker.kind === 'buoy'),
      [navigationMarkers]
    );
    const beaconMarkers = useMemo(
      () => navigationMarkers.filter((marker) => marker.kind === 'beacon'),
      [navigationMarkers]
    );

    useFrame((_, delta) => {
      timeRef.current += delta;

      buoyMarkers.forEach((marker, index) => {
        const ref = buoyRefs.current[index];

        if (hasPosition(ref)) {
          ref.position.y =
            marker.position[1] +
            Math.sin(timeRef.current * marker.bobSpeed + index * 0.55) * marker.bobRange;
        }
      });

      beaconMarkers.forEach((marker, index) => {
        const ref = beaconLightRefs.current[index];

        if (hasOpacityMaterial(ref)) {
          ref.material.opacity =
            0.2 + (Math.sin(timeRef.current * marker.blinkSpeed + index * 0.8) * 0.5 + 0.5) * 0.7;
        }
      });
    });

    return (
      <group>
        {buoyMarkers.map((marker, index) => (
          <group
            key={marker.id}
            name="navigation-marker-buoy"
            position={marker.position}
            ref={((node: MarkerObject | null) => {
              buoyRefs.current[index] = node;
            }) as never}
          >
            <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.26, 0.34, 0.54, 6]} />
              <meshStandardMaterial color={marker.color} metalness={0.08} roughness={0.64} />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.16, 0.22, 0.16]} />
              <meshStandardMaterial
                color={scenePalette.navigation.buoyStripe}
                metalness={0.04}
                roughness={0.72}
              />
            </mesh>
          </group>
        ))}

        {beaconMarkers.map((marker, index) => (
          <group key={marker.id} name="navigation-marker-beacon" position={marker.position}>
            <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
              <boxGeometry args={[0.18, 0.84, 0.18]} />
              <meshStandardMaterial color={marker.color} metalness={0.08} roughness={0.66} />
            </mesh>
            <mesh
              name="navigation-marker-light"
              position={[0, 0.98, 0]}
              ref={((node: MarkerObject | null) => {
                beaconLightRefs.current[index] = node;
              }) as never}
            >
              <sphereGeometry args={[0.11, 8, 8]} />
              <meshBasicMaterial
                color={scenePalette.navigation.lightOn}
                opacity={0.82}
                transparent
              />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[0.34, 0.18, 0.34]} />
              <meshStandardMaterial
                color={scenePalette.navigation.lightOff}
                metalness={0.06}
                roughness={0.74}
              />
            </mesh>
          </group>
        ))}
      </group>
    );
  }
);

NavigationMarkerLayer.displayName = 'NavigationMarkerLayer';
