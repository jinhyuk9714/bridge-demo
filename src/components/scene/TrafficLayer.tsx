import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';

import {
  advanceTrafficProgress,
  getTrafficVehiclePosition
} from '../../lib/sceneLayout';
import type { TrafficVehicleData } from '../../types/bridge';

const yAxis = new Vector3(0, 1, 0);

const hasInstancedMeshApi = (value: unknown): value is InstancedMesh =>
  typeof value === 'object' &&
  value !== null &&
  'setMatrixAt' in value &&
  typeof (value as InstancedMesh).setMatrixAt === 'function' &&
  'instanceMatrix' in value;

const buildVehicleQuaternion = (vehicle: TrafficVehicleData) =>
  new Quaternion().setFromAxisAngle(
    yAxis,
    vehicle.travelEndX < vehicle.travelStartX ? Math.PI : 0
  );

const buildBodyMatrix = (vehicle: TrafficVehicleData, progress: number) => {
  const position = new Vector3(...getTrafficVehiclePosition(vehicle, progress));
  const quaternion = buildVehicleQuaternion(vehicle);
  const scale = new Vector3(...vehicle.size);

  return new Matrix4().compose(position, quaternion, scale);
};

const buildCabinMatrix = (vehicle: TrafficVehicleData, progress: number) => {
  const position = new Vector3(...getTrafficVehiclePosition(vehicle, progress));
  const quaternion = buildVehicleQuaternion(vehicle);
  const size = new Vector3(
    vehicle.size[0] * 0.44,
    vehicle.size[1] * 0.64,
    vehicle.size[2] * 0.86
  );
  const localOffset = new Vector3(0.1, vehicle.size[1] * 0.42, 0).applyQuaternion(quaternion);

  return new Matrix4().compose(position.add(localOffset), quaternion, size);
};

export const TrafficLayer = memo(
  ({ trafficVehicles }: { trafficVehicles: TrafficVehicleData[] }) => {
    const bodyRef = useRef<InstancedMesh | null>(null);
    const cabinRef = useRef<InstancedMesh | null>(null);
    const progressRef = useRef<number[]>([]);
    const bodyColor = useMemo(() => new Color(), []);
    const cabinColor = useMemo(() => new Color('#20242c'), []);

    if (progressRef.current.length !== trafficVehicles.length) {
      progressRef.current = trafficVehicles.map((vehicle) => vehicle.progress);
    }

    useLayoutEffect(() => {
      if (!hasInstancedMeshApi(bodyRef.current) || !hasInstancedMeshApi(cabinRef.current)) {
        return;
      }

      trafficVehicles.forEach((vehicle, index) => {
        bodyRef.current?.setMatrixAt(index, buildBodyMatrix(vehicle, vehicle.progress));
        bodyRef.current?.setColorAt(index, bodyColor.set(vehicle.color));
        cabinRef.current?.setMatrixAt(index, buildCabinMatrix(vehicle, vehicle.progress));
        cabinRef.current?.setColorAt(index, cabinColor);
      });

      bodyRef.current.instanceMatrix.needsUpdate = true;
      cabinRef.current.instanceMatrix.needsUpdate = true;

      if (bodyRef.current.instanceColor) {
        bodyRef.current.instanceColor.needsUpdate = true;
      }

      if (cabinRef.current.instanceColor) {
        cabinRef.current.instanceColor.needsUpdate = true;
      }
    }, [bodyColor, cabinColor, trafficVehicles]);

    useFrame((_, delta) => {
      if (!hasInstancedMeshApi(bodyRef.current) || !hasInstancedMeshApi(cabinRef.current)) {
        return;
      }

      trafficVehicles.forEach((vehicle, index) => {
        const nextProgress = advanceTrafficProgress(
          progressRef.current[index] ?? vehicle.progress,
          vehicle.speed,
          delta
        );

        progressRef.current[index] = nextProgress;
        bodyRef.current?.setMatrixAt(index, buildBodyMatrix(vehicle, nextProgress));
        cabinRef.current?.setMatrixAt(index, buildCabinMatrix(vehicle, nextProgress));
      });

      bodyRef.current.instanceMatrix.needsUpdate = true;
      cabinRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
      <group>
        <instancedMesh
          castShadow
          data-instance-count={trafficVehicles.length}
          data-testid="traffic-body-instanced"
          receiveShadow
          ref={bodyRef}
          args={[undefined, undefined, trafficVehicles.length]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial metalness={0.08} roughness={0.52} vertexColors />
        </instancedMesh>

        <instancedMesh
          castShadow
          data-instance-count={trafficVehicles.length}
          data-testid="traffic-cabin-instanced"
          receiveShadow
          ref={cabinRef}
          args={[undefined, undefined, trafficVehicles.length]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#20242c" metalness={0.18} roughness={0.36} vertexColors />
        </instancedMesh>
      </group>
    );
  }
);

TrafficLayer.displayName = 'TrafficLayer';
