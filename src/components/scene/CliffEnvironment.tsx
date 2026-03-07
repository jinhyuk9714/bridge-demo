import { memo } from 'react';

import type { SceneLayoutData } from '../../types/bridge';
import { SceneBox } from './shared';

export const CliffEnvironment = memo(({ layout }: { layout: SceneLayoutData }) => (
  <group>
    {layout.cliffs.map((cliff) => (
      <SceneBox
        key={cliff.id}
        metalness={0.02}
        part={cliff}
        roughness={0.96}
        testId="cliff-mass"
      />
    ))}

    {layout.shoreline.map((shelf) => (
      <SceneBox
        key={shelf.id}
        castShadow={false}
        metalness={0.01}
        part={shelf}
        roughness={0.98}
        testId="shoreline-shelf"
      />
    ))}

    {layout.backdrops.map((ridge) => (
      <SceneBox
        key={ridge.id}
        castShadow={false}
        metalness={0}
        part={ridge}
        receiveShadow={false}
        roughness={1}
      />
    ))}
  </group>
));

CliffEnvironment.displayName = 'CliffEnvironment';
