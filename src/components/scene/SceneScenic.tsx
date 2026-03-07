import { Sky } from '@react-three/drei';
import { memo, useMemo } from 'react';

import { generateSceneLayout } from '../../lib/sceneLayout';
import type { BridgeGuides, BridgeParams } from '../../types/bridge';
import { AtmosphereLayer } from './AtmosphereLayer';
import { CliffEnvironment } from './CliffEnvironment';
import { TrafficLayer } from './TrafficLayer';

export const SceneScenic = memo(
  ({ params, guides }: { params: BridgeParams; guides: BridgeGuides }) => {
    const layout = useMemo(() => generateSceneLayout(params, guides), [guides, params]);

    return (
      <>
        <Sky
          distance={450000}
          inclination={0.58}
          mieCoefficient={0.004}
          rayleigh={1.3}
          turbidity={7}
        />
        <CliffEnvironment layout={layout} />
        <AtmosphereLayer atmosphereBands={layout.atmosphereBands} />
        <TrafficLayer trafficVehicles={layout.trafficVehicles} />
      </>
    );
  }
);

SceneScenic.displayName = 'SceneScenic';
