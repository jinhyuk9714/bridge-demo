import { describe, expect, it } from 'vitest';

import { balancedPreset } from '../data/bridgePresets';
import { generateBridgeModel } from './bridgeGenerator';
import { advanceTrafficProgress, generateSceneLayout } from './sceneLayout';

describe('generateSceneLayout', () => {
  it('creates coastal cliffs, atmosphere bands, and decorative traffic vehicles', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);

    expect(layout.cliffs.length).toBeGreaterThan(4);
    expect(layout.backdrops.length).toBeGreaterThan(1);
    expect(layout.atmosphereBands.length).toBeGreaterThan(1);
    expect(layout.trafficVehicles.length).toBeGreaterThanOrEqual(6);
    expect(layout.trafficVehicles.length).toBeLessThanOrEqual(10);
    expect(layout.trafficVehicles[0].baseY).toBeGreaterThan(model.guides.roadSurfaceY);
  });

  it('recomputes cliff massing and traffic lanes from shared bridge guides', () => {
    const compactParams = {
      ...balancedPreset.params,
      spanLength: 420,
      deckWidth: 14
    };
    const monumentalParams = {
      ...balancedPreset.params,
      spanLength: 820,
      deckWidth: 30
    };
    const compactModel = generateBridgeModel(compactParams);
    const monumentalModel = generateBridgeModel(monumentalParams);
    const compact = generateSceneLayout({
      ...compactParams
    }, compactModel.guides);
    const monumental = generateSceneLayout({
      ...monumentalParams
    }, monumentalModel.guides);

    const compactRange =
      compact.trafficVehicles[0].travelEndX - compact.trafficVehicles[0].travelStartX;
    const monumentalRange =
      monumental.trafficVehicles[0].travelEndX -
      monumental.trafficVehicles[0].travelStartX;

    expect(Math.abs(monumental.cliffs[0].position[0])).toBeGreaterThan(
      Math.abs(compact.cliffs[0].position[0])
    );
    expect(Math.abs(monumental.trafficVehicles[0].laneZ)).toBeGreaterThan(
      Math.abs(compact.trafficVehicles[0].laneZ)
    );
    expect(monumentalRange).toBeGreaterThan(compactRange);
    expect(compactModel.guides.laneCentersZ).toContain(compact.trafficVehicles[0].laneZ);
    expect(monumentalModel.guides.laneCentersZ).toContain(monumental.trafficVehicles[0].laneZ);
    expect(
      Math.max(...compact.trafficVehicles.map((vehicle) => Math.abs(vehicle.laneZ)))
    ).toBeLessThan(compactModel.guides.towerInnerClearZ / 2);
    expect(
      Math.max(...monumental.trafficVehicles.map((vehicle) => Math.abs(vehicle.laneZ)))
    ).toBeLessThan(monumentalModel.guides.towerInnerClearZ / 2);
  });

  it('keeps prominent bridge-end cliff masses framing the hero view corridor', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);
    const leftCliff = layout.cliffs.find((part) => part.id === 'left-cliff-main');
    const rightCliff = layout.cliffs.find((part) => part.id === 'right-cliff-main');

    expect(leftCliff).toBeDefined();
    expect(rightCliff).toBeDefined();
    expect(leftCliff?.size[1]).toBeGreaterThan(balancedPreset.params.towerHeight * 0.4);
    expect(rightCliff?.size[1]).toBeGreaterThan(balancedPreset.params.towerHeight * 0.4);
    expect(Math.abs(leftCliff?.position[2] ?? 0)).toBeLessThan(balancedPreset.params.deckWidth * 2);
    expect(Math.abs(rightCliff?.position[2] ?? 0)).toBeLessThan(balancedPreset.params.deckWidth * 2);
  });

  it('aligns shoreline abutment masses near the bridge ends', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);
    const halfSpan = balancedPreset.params.spanLength / 2;
    const leftAbutment = layout.shoreline.find((part) => part.id === 'abutment-left');
    const rightAbutment = layout.shoreline.find((part) => part.id === 'abutment-right');

    expect(leftAbutment).toBeDefined();
    expect(rightAbutment).toBeDefined();
    expect(Math.abs(leftAbutment?.position[0] ?? 0)).toBeGreaterThan(halfSpan);
    expect(Math.abs(rightAbutment?.position[0] ?? 0)).toBeGreaterThan(halfSpan);
    expect(Math.abs(Math.abs(leftAbutment?.position[0] ?? 0) - halfSpan)).toBeLessThan(
      balancedPreset.params.deckWidth * 2.5
    );
    expect(Math.abs(Math.abs(rightAbutment?.position[0] ?? 0) - halfSpan)).toBeLessThan(
      balancedPreset.params.deckWidth * 2.5
    );
  });

  it('adds bridge-end transition and wing-wall structures around the abutments', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);
    const wingWalls = layout.shoreline.filter((part) => part.id.startsWith('wing-wall-'));
    const transitionSlabs = layout.shoreline.filter((part) =>
      part.id.startsWith('transition-slab-')
    );
    const approachRoads = layout.shoreline.filter((part) => part.id.startsWith('approach-road-'));
    const embankments = layout.shoreline.filter((part) => part.id.startsWith('embankment-'));
    const retainingWalls = layout.shoreline.filter((part) =>
      part.id.startsWith('retaining-wall-')
    );
    const revetments = layout.shoreline.filter((part) => part.id.startsWith('revetment-'));
    const terraces = layout.shoreline.filter((part) => part.id.startsWith('shore-terrace-'));
    const pierPads = layout.shoreline.filter((part) => part.id.startsWith('pier-pad-'));
    const maintenanceAprons = layout.shoreline.filter((part) =>
      part.id.startsWith('maintenance-apron-')
    );
    const serviceYards = layout.shoreline.filter((part) => part.id.startsWith('service-yard-'));
    const harborAprons = layout.shoreline.filter((part) => part.id.startsWith('harbor-apron-'));
    const fenderWalls = layout.shoreline.filter((part) => part.id.startsWith('fender-wall-'));
    const mooringDolphins = layout.shoreline.filter((part) =>
      part.id.startsWith('mooring-dolphin-')
    );
    const breakwaters = layout.shoreline.filter((part) => part.id.startsWith('breakwater-'));
    const sheds = layout.shoreline.filter((part) => part.id.startsWith('maintenance-shed-'));
    const lightPoleBases = layout.shoreline.filter((part) =>
      part.id.startsWith('light-pole-base-')
    );
    const bollards = layout.shoreline.filter((part) => part.id.startsWith('bollard-'));

    expect(wingWalls).toHaveLength(4);
    expect(transitionSlabs).toHaveLength(2);
    expect(approachRoads).toHaveLength(2);
    expect(embankments).toHaveLength(4);
    expect(retainingWalls).toHaveLength(2);
    expect(revetments).toHaveLength(2);
    expect(terraces).toHaveLength(2);
    expect(pierPads).toHaveLength(2);
    expect(maintenanceAprons).toHaveLength(2);
    expect(serviceYards).toHaveLength(2);
    expect(harborAprons).toHaveLength(2);
    expect(fenderWalls).toHaveLength(2);
    expect(mooringDolphins).toHaveLength(2);
    expect(breakwaters).toHaveLength(2);
    expect(sheds).toHaveLength(2);
    expect(lightPoleBases).toHaveLength(2);
    expect(bollards).toHaveLength(4);
    expect(transitionSlabs.every((part) => Math.abs(part.position[0]) > balancedPreset.params.spanLength / 2)).toBe(true);
    expect(approachRoads.every((part) => Math.abs(part.position[0]) > Math.abs(transitionSlabs[0]?.position[0] ?? 0))).toBe(true);
    expect(retainingWalls.every((part) => Math.abs(part.position[0]) > balancedPreset.params.spanLength / 2)).toBe(true);
    expect(pierPads.every((part) => Math.abs(part.position[0]) < balancedPreset.params.spanLength / 2)).toBe(true);
    expect(maintenanceAprons.every((part) => Math.abs(part.position[0]) < balancedPreset.params.spanLength / 2)).toBe(true);
    expect(serviceYards.every((part) => Math.abs(part.position[0]) > Math.abs(approachRoads[0]?.position[0] ?? 0))).toBe(true);
    expect(harborAprons.every((part) => Math.abs(part.position[0]) > Math.abs(pierPads[0]?.position[0] ?? 0))).toBe(true);
    expect(mooringDolphins.every((part) => Math.abs(part.position[0]) < balancedPreset.params.spanLength / 2)).toBe(true);
    expect(breakwaters.every((part) => Math.abs(part.position[0]) > Math.abs(mooringDolphins[0]?.position[0] ?? 0))).toBe(true);
  });

  it('adds navigation markers near bridge-end water edges and approach piers', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);
    const buoys = layout.navigationMarkers.filter((marker) => marker.kind === 'buoy');
    const beacons = layout.navigationMarkers.filter((marker) => marker.kind === 'beacon');

    expect(buoys.length).toBeGreaterThanOrEqual(2);
    expect(beacons.length).toBeGreaterThanOrEqual(2);
    expect(
      layout.navigationMarkers.every((marker) => Math.abs(marker.position[0]) > Math.abs(model.guides.approachPierXs[0]) * 0.65)
    ).toBe(true);
    expect(
      layout.navigationMarkers.some((marker) => Math.abs(marker.position[0]) < balancedPreset.params.spanLength / 2)
    ).toBe(true);
    expect(
      layout.navigationMarkers.some((marker) => Math.abs(marker.position[0]) > balancedPreset.params.spanLength / 2)
    ).toBe(true);
    expect(buoys.every((marker) => marker.bobRange > 0 && marker.bobSpeed > 0)).toBe(true);
    expect(beacons.every((marker) => marker.blinkSpeed > 0)).toBe(true);
  });

  it('uses concrete-toned abutments while keeping shoreline shelves earthy', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);
    const leftAbutment = layout.shoreline.find((part) => part.id === 'abutment-left');
    const rightAbutment = layout.shoreline.find((part) => part.id === 'abutment-right');
    const shoreLeft = layout.shoreline.find((part) => part.id === 'shore-left');

    expect(leftAbutment?.color).toBe('#a8afb5');
    expect(rightAbutment?.color).toBe('#a1a8ae');
    expect(shoreLeft?.color).not.toBe(leftAbutment?.color);
    expect(shoreLeft?.color).not.toBe(rightAbutment?.color);
  });

  it('uses softened twilight fog colors for atmosphere bands', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const layout = generateSceneLayout(balancedPreset.params, model.guides);

    expect(layout.atmosphereBands.map((band) => band.color)).toEqual([
      '#ece2d8',
      '#d6cec7',
      '#bbb7b3'
    ]);
    expect(layout.atmosphereBands.map((band) => band.opacity)).toEqual([0.08, 0.06, 0.045]);
  });

  it('wraps traffic progress when a vehicle loops past the end of its lane', () => {
    expect(advanceTrafficProgress(0.98, 0.1, 0.4)).toBeCloseTo(0.02, 5);
    expect(advanceTrafficProgress(0.25, 0.05, 0.2)).toBeCloseTo(0.26, 5);
  });
});
