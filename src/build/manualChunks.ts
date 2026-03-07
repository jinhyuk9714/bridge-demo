export const resolveManualChunk = (id: string) => {
  if (
    id.includes('/src/components/scene/SceneScenic.tsx') ||
    id.includes('/src/components/scene/AtmosphereLayer.tsx') ||
    id.includes('/src/components/scene/CliffEnvironment.tsx') ||
    id.includes('/src/components/scene/TrafficLayer.tsx') ||
    id.includes('/src/lib/sceneLayout.ts')
  ) {
    return 'scene-scenic';
  }

  if (
    id.includes('/src/components/BridgeScene.tsx') ||
    id.includes('/src/components/scene/BridgeStructure.tsx') ||
    id.includes('/src/components/scene/CameraRig.tsx') ||
    id.includes('/src/components/scene/shared.tsx') ||
    id.includes('/src/lib/bridgeGenerator.ts')
  ) {
    return 'scene-core';
  }

  if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
    return 'react-vendor';
  }

  if (id.includes('/node_modules/three/')) {
    return 'three-core';
  }

  if (
    id.includes('/node_modules/@react-three/fiber/') ||
    id.includes('/node_modules/@react-three/drei/') ||
    id.includes('/node_modules/three-stdlib/')
  ) {
    return 'r3f-runtime';
  }

  return undefined;
};
