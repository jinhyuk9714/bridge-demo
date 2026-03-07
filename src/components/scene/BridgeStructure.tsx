import { memo, useMemo } from 'react';

import type { BridgeModelData } from '../../types/bridge';
import {
  buildBoxInstanceGroups,
  buildCableInstanceGroups,
  InstancedBoxes,
  InstancedCables,
  SceneBox
} from './shared';

export const BridgeStructure = memo(({ model }: { model: BridgeModelData }) => {
  const cableRadius = Math.max(0.045, model.guides.deckEdgeZ * 0.008);
  const deckDetailGroups = useMemo(
    () =>
      buildBoxInstanceGroups(model.deckDetails, (part) => ({
        key: [
          part.id.startsWith('cable-anchor-') ? 'anchor' : 'detail',
          part.color,
          part.id.includes('lane-marker') ? 'lane' : 'solid'
        ].join(':'),
        testId: part.id.startsWith('cable-anchor-')
          ? 'bridge-cable-anchor-instanced'
          : 'bridge-deck-detail-instanced',
        color: part.color,
        castShadow: !part.id.includes('lane-marker'),
        receiveShadow: true,
        metalness: part.id.includes('lane-marker') ? 0 : 0.18,
        roughness: part.id.includes('lane-marker') ? 0.34 : 0.72
      })),
    [model.deckDetails]
  );
  const towerFrameGroups = useMemo(
    () =>
      buildBoxInstanceGroups(model.towerFrames, (part) => ({
        key: [
          part.id.includes('-cable-anchor-') ? 'tower-anchor' : 'tower-frame',
          part.color
        ].join(':'),
        testId: part.id.includes('-cable-anchor-')
          ? 'bridge-tower-cable-anchor-instanced'
          : 'bridge-tower-frame-instanced',
        color: part.color,
        castShadow: true,
        receiveShadow: true,
        metalness: 0.2,
        roughness: 0.62
      })),
    [model.towerFrames]
  );
  const pierGroups = useMemo(
    () =>
      buildBoxInstanceGroups(model.piers, (part) => ({
        key: [part.id.includes('bearing') ? 'bearing' : 'pier', part.color].join(':'),
        testId: part.id.includes('bearing')
          ? 'bridge-bearing-instanced'
          : 'bridge-pier-instanced',
        color: part.color,
        castShadow: true,
        receiveShadow: true,
        metalness: 0.03,
        roughness: 0.9
      })),
    [model.piers]
  );
  const cableGroups = useMemo(
    () =>
      buildCableInstanceGroups(model.cables, cableRadius, {
        testId: 'bridge-cable-instanced',
        metalness: 0.22,
        roughness: 0.38
      }),
    [cableRadius, model.cables]
  );

  return (
    <group position={[0, 0, 0]}>
      <SceneBox metalness={0.14} part={model.deck} roughness={0.76} testId="bridge-deck" />

      {deckDetailGroups.map((group) => (
        <InstancedBoxes group={group} key={group.key} />
      ))}

      {towerFrameGroups.map((group) => (
        <InstancedBoxes group={group} key={group.key} />
      ))}

      {pierGroups.map((group) => (
        <InstancedBoxes group={group} key={group.key} />
      ))}

      {cableGroups.map((group) => (
        <InstancedCables group={group} key={group.key} />
      ))}
    </group>
  );
});

BridgeStructure.displayName = 'BridgeStructure';
