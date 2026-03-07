import { memo, useMemo } from 'react';

import type { SceneLayoutData } from '../../types/bridge';
import { buildBoxInstanceGroups, InstancedBoxes } from './shared';

export const CliffEnvironment = memo(({ layout }: { layout: SceneLayoutData }) => {
  const cliffGroups = useMemo(
    () =>
      buildBoxInstanceGroups(layout.cliffs, (part) => ({
        key: `cliff:${part.color}`,
        testId: 'cliff-mass-instanced',
        color: part.color,
        castShadow: true,
        receiveShadow: true,
        metalness: 0.02,
        roughness: 0.96
      })),
    [layout.cliffs]
  );
  const shorelineGroups = useMemo(
    () =>
      buildBoxInstanceGroups(layout.shoreline, (part) => ({
        key: `shoreline:${part.color}`,
        testId: 'shoreline-shelf-instanced',
        color: part.color,
        castShadow: false,
        receiveShadow: true,
        metalness: 0.01,
        roughness: 0.98
      })),
    [layout.shoreline]
  );
  const backdropGroups = useMemo(
    () =>
      buildBoxInstanceGroups(layout.backdrops, (part) => ({
        key: `backdrop:${part.color}`,
        testId: 'backdrop-ridge-instanced',
        color: part.color,
        castShadow: false,
        receiveShadow: false,
        metalness: 0,
        roughness: 1
      })),
    [layout.backdrops]
  );

  return (
    <group>
      {cliffGroups.map((group) => (
        <InstancedBoxes group={group} key={group.key} />
      ))}

      {shorelineGroups.map((group) => (
        <InstancedBoxes group={group} key={group.key} />
      ))}

      {backdropGroups.map((group) => (
        <InstancedBoxes group={group} key={group.key} />
      ))}
    </group>
  );
});

CliffEnvironment.displayName = 'CliffEnvironment';
