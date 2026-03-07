// @vitest-environment node

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveManualChunk } from './build/manualChunks';

describe('vite manual chunk configuration', () => {
  it('does not keep a stale vite.config.js shadowing the source config', () => {
    expect(existsSync(join(process.cwd(), 'vite.config.js'))).toBe(false);
  });

  it('routes scene, react, and three modules through function-based chunk rules', () => {
    expect(typeof resolveManualChunk).toBe('function');
    expect(resolveManualChunk('/repo/src/components/scene/SceneScenic.tsx')).toBe('scene-scenic');
    expect(resolveManualChunk('/repo/src/components/scene/AtmosphereLayer.tsx')).toBe(
      'scene-scenic'
    );
    expect(resolveManualChunk('/repo/src/lib/sceneLayout.ts')).toBe('scene-scenic');
    expect(resolveManualChunk('/repo/src/components/BridgeScene.tsx')).toBe('scene-core');
    expect(resolveManualChunk('/repo/node_modules/react/index.js')).toBe('react-vendor');
    expect(resolveManualChunk('/repo/node_modules/react-dom/client.js')).toBe('react-vendor');
    expect(resolveManualChunk('/repo/node_modules/three/build/three.module.js')).toBe(
      'three-core'
    );
    expect(resolveManualChunk('/repo/node_modules/@react-three/fiber/dist/index.js')).toBe(
      'r3f-runtime'
    );
    expect(resolveManualChunk('/repo/node_modules/@react-three/drei/index.js')).toBe(
      'r3f-runtime'
    );
    expect(resolveManualChunk('/repo/node_modules/three-stdlib/index.js')).toBe('r3f-runtime');
    expect(resolveManualChunk('/repo/src/components/scene/BridgeStructure.tsx')).toBe(
      'scene-core'
    );
    expect(resolveManualChunk('/repo/src/lib/bridgeGenerator.ts')).toBe('scene-core');
    expect(resolveManualChunk('/repo/src/App.tsx')).toBeUndefined();
  });
});
