import { describe, expect, it } from 'vitest';

import { sceneAtmosphere, sceneLighting, scenePalette, sceneSky } from './sceneLook';

describe('sceneLook', () => {
  it('defines a neutral twilight palette for bridge structure and environment', () => {
    expect(scenePalette.concrete.base).toBe('#b7b5b1');
    expect(scenePalette.concrete.mid).toBe('#c5c3bf');
    expect(scenePalette.concrete.top).toBe('#d3d0cb');
    expect(scenePalette.concrete.dark).toBe('#999792');
    expect(scenePalette.concrete.footing).toBe('#817f7a');
    expect(scenePalette.steel.core).toBe('#5d6d7c');
    expect(scenePalette.steel.soffit).toBe('#44535f');
    expect(scenePalette.steel.fascia).toBe('#70808d');
    expect(scenePalette.steel.hardware).toBe('#4c5a66');
    expect(scenePalette.road.asphalt).toBe('#30343a');
    expect(scenePalette.road.laneMarker).toBe('#e1c69b');
    expect(scenePalette.hardware.guardrail).toBe('#b8c0c7');
    expect(scenePalette.hardware.cableAnchor).toBe('#bcc4cc');
    expect(scenePalette.cable.main).toBe('#dbe2ea');
    expect(scenePalette.water.base).toBe('#506b84');
    expect(scenePalette.water.shimmer).toBe('#afc4cf');
    expect(scenePalette.environment.fog).toBe('#cfc4b8');
    expect(scenePalette.environment.background).toBe('#ddd1c8');
  });

  it('defines calibrated twilight lighting and sky settings', () => {
    expect(sceneLighting.ambientIntensity).toBe(0.34);
    expect(sceneLighting.hemisphereArgs).toEqual(['#f3cba8', '#3d4f64', 0.58]);
    expect(sceneLighting.directional.color).toBe('#ffd1a6');
    expect(sceneLighting.directional.intensity).toBe(1.24);
    expect(sceneLighting.directional.position).toEqual([164, 118, -190]);
    expect(sceneLighting.fogArgs).toEqual(['#cfc4b8', 180, 980]);
    expect(sceneLighting.background).toBe('#ddd1c8');
    expect(sceneSky).toEqual({
      distance: 450000,
      inclination: 0.53,
      azimuth: 0.22,
      mieCoefficient: 0.0055,
      rayleigh: 0.72,
      turbidity: 8.6
    });
    expect(sceneAtmosphere.near.opacity).toBe(0.08);
    expect(sceneAtmosphere.mid.opacity).toBe(0.06);
    expect(sceneAtmosphere.far.opacity).toBe(0.045);
  });
});
