import { memo } from 'react';

import type { BridgeModelData } from '../../types/bridge';
import { CableSegment, SceneBox } from './shared';

export const BridgeStructure = memo(({ model }: { model: BridgeModelData }) => (
  <group position={[0, 0, 0]}>
    <SceneBox metalness={0.14} part={model.deck} roughness={0.76} testId="bridge-deck" />

    {model.deckDetails.map((detail) => (
      <SceneBox
        castShadow={!detail.id.includes('lane-marker')}
        key={detail.id}
        metalness={detail.id.includes('lane-marker') ? 0 : 0.18}
        part={detail}
        receiveShadow
        roughness={detail.id.includes('lane-marker') ? 0.34 : 0.72}
        testId={detail.id.startsWith('cable-anchor-') ? 'bridge-cable-anchor' : undefined}
      />
    ))}

    {model.towers.map((tower) => (
      <group data-testid="bridge-tower" key={tower.id}>
        {model.towerFrames
          .filter((part) => part.id.startsWith(tower.id))
          .map((part) => (
            <SceneBox
              key={part.id}
              metalness={0.2}
              part={part}
              roughness={0.62}
              testId={
                part.id.includes('-cable-anchor-') ? 'bridge-tower-cable-anchor' : undefined
              }
            />
          ))}
      </group>
    ))}

    {model.piers.map((pier) => (
      <SceneBox
        key={pier.id}
        metalness={0.03}
        part={pier}
        roughness={0.9}
        testId={pier.id.includes('bearing') ? 'bridge-bearing' : 'bridge-pier'}
      />
    ))}

    {model.cables.map((cable) => (
      <CableSegment
        cable={cable}
        key={cable.id}
        radius={Math.max(0.045, model.guides.deckEdgeZ * 0.008)}
      />
    ))}
  </group>
));

BridgeStructure.displayName = 'BridgeStructure';
