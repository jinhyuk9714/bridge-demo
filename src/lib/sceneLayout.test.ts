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

  it('wraps traffic progress when a vehicle loops past the end of its lane', () => {
    expect(advanceTrafficProgress(0.98, 0.1, 0.4)).toBeCloseTo(0.02, 5);
    expect(advanceTrafficProgress(0.25, 0.05, 0.2)).toBeCloseTo(0.26, 5);
  });
});
