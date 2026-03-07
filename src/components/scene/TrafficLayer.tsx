import { memo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';

import {
  advanceTrafficProgress,
  getTrafficVehiclePosition
} from '../../lib/sceneLayout';
import type { SceneLayoutData, TrafficVehicleData } from '../../types/bridge';
import { hasPosition } from './shared';

const TrafficVehicle = memo(
  ({
    index,
    vehicle,
    vehicleRefs
  }: {
    index: number;
    vehicle: TrafficVehicleData;
    vehicleRefs: MutableRefObject<Array<unknown>>;
  }) => {
    const initialPosition = getTrafficVehiclePosition(vehicle, vehicle.progress);
    const heading = vehicle.travelEndX < vehicle.travelStartX ? Math.PI : 0;

    return (
      <group
        data-testid="traffic-vehicle"
        position={initialPosition}
        rotation={[0, heading, 0]}
        ref={((node: unknown) => {
          vehicleRefs.current[index] = node;
        }) as never}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={vehicle.size} />
          <meshStandardMaterial color={vehicle.color} metalness={0.08} roughness={0.52} />
        </mesh>
        <mesh castShadow position={[0.1, vehicle.size[1] * 0.42, 0]}>
          <boxGeometry
            args={[vehicle.size[0] * 0.44, vehicle.size[1] * 0.64, vehicle.size[2] * 0.86]}
          />
          <meshStandardMaterial color="#20242c" metalness={0.18} roughness={0.36} />
        </mesh>
      </group>
    );
  }
);

TrafficVehicle.displayName = 'TrafficVehicle';

export const TrafficLayer = memo(({ layout }: { layout: SceneLayoutData }) => {
  const vehicleRefs = useRef<Array<unknown>>([]);
  const progressRef = useRef<number[]>([]);

  if (progressRef.current.length !== layout.trafficVehicles.length) {
    progressRef.current = layout.trafficVehicles.map((vehicle) => vehicle.progress);
  }

  useFrame((_, delta) => {
    layout.trafficVehicles.forEach((vehicle, index) => {
      const nextProgress = advanceTrafficProgress(
        progressRef.current[index] ?? vehicle.progress,
        vehicle.speed,
        delta
      );

      progressRef.current[index] = nextProgress;

      const vehicleRef = vehicleRefs.current[index];

      if (!hasPosition(vehicleRef)) {
        return;
      }

      const [x, y, z] = getTrafficVehiclePosition(vehicle, nextProgress);

      vehicleRef.position.x = x;
      vehicleRef.position.y = y;
      vehicleRef.position.z = z;
    });
  });

  return (
    <group>
      {layout.trafficVehicles.map((vehicle, index) => (
        <TrafficVehicle index={index} key={vehicle.id} vehicle={vehicle} vehicleRefs={vehicleRefs} />
      ))}
    </group>
  );
});

TrafficLayer.displayName = 'TrafficLayer';
