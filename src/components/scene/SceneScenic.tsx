import { Sky } from '@react-three/drei';
import { memo, useMemo } from 'react';

import { generateSceneLayout } from '../../lib/sceneLayout';
import type { BridgeGuides, BridgeParams } from '../../types/bridge';
import { AtmosphereLayer } from './AtmosphereLayer';
import { CliffEnvironment } from './CliffEnvironment';
import { NavigationMarkerLayer } from './NavigationMarkerLayer';
import { sceneSky } from './sceneLook';
import { TrafficLayer } from './TrafficLayer';

export const SceneScenic = memo(
  ({ params, guides }: { params: BridgeParams; guides: BridgeGuides }) => {
    const layout = useMemo(() => generateSceneLayout(params, guides), [guides, params]);

    return (
      <>
        <Sky
          azimuth={sceneSky.azimuth}
          distance={sceneSky.distance}
          inclination={sceneSky.inclination}
          mieCoefficient={sceneSky.mieCoefficient}
          rayleigh={sceneSky.rayleigh}
          turbidity={sceneSky.turbidity}
        />
        <CliffEnvironment layout={layout} />
        <AtmosphereLayer atmosphereBands={layout.atmosphereBands} />
        <TrafficLayer trafficVehicles={layout.trafficVehicles} />
        <NavigationMarkerLayer navigationMarkers={layout.navigationMarkers} />
      </>
    );
  }
);

SceneScenic.displayName = 'SceneScenic';
