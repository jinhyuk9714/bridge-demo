import { describe, expect, it } from 'vitest';

import { balancedPreset } from '../data/bridgePresets';
import { generateBridgeModel } from './bridgeGenerator';

describe('generateBridgeModel', () => {
  it('creates a two-tower cable-stayed bridge with roadway guides and dual cable planes', () => {
    const model = generateBridgeModel(balancedPreset.params);

    expect(model.deck.size[0]).toBe(balancedPreset.params.spanLength);
    expect(model.towers).toHaveLength(2);
    expect(model.deckDetails.length).toBeGreaterThan(6);
    expect(model.towerFrames.length).toBeGreaterThan(8);
    expect(model.cables).toHaveLength(balancedPreset.params.cableCountPerSide * 8);
    expect(model.guides.roadSurfaceY).toBeGreaterThan(balancedPreset.params.deckElevation);
    expect(model.guides.deckSoffitY).toBeLessThan(model.guides.roadSurfaceY);
    expect(model.guides.laneCentersZ).toHaveLength(2);
    expect(model.guides.roadHalfWidth).toBeGreaterThan(0);
    expect(model.guides.deckFasciaZ).toBeGreaterThan(0);
    expect(model.guides.approachPierXs).toHaveLength(2);
    expect(model.guides.deckEndXs).toEqual([
      -balancedPreset.params.spanLength / 2,
      balancedPreset.params.spanLength / 2
    ]);
    expect(model.guides.abutmentXs).toHaveLength(2);
    expect(model.guides.parapetZ).toBeGreaterThan(model.guides.deckEdgeZ);
    expect(model.guides.walkwayZ).toBeGreaterThan(model.guides.parapetZ);
    expect(model.guides.jointXs).toHaveLength(4);
    expect(model.guides.diaphragmXs.length).toBeGreaterThan(6);
    expect(model.guides.cablePlaneOffsetsZ).toEqual(
      expect.arrayContaining([expect.any(Number), expect.any(Number)])
    );
    expect(model.guides.towerCableAnchorZ).toBeGreaterThan(0);
    expect(model.guides.towerCableAnchorZ).toBeLessThan(model.guides.towerInnerClearZ / 2);
    expect(model.guides.towerCableAnchorInsetX).toBeGreaterThan(0);
  });

  it('raises tower geometry and cable anchors when tower height increases', () => {
    const lower = generateBridgeModel({
      ...balancedPreset.params,
      towerHeight: 140
    });
    const taller = generateBridgeModel({
      ...balancedPreset.params,
      towerHeight: 210
    });

    expect(taller.towers[0].size[1]).toBeGreaterThan(lower.towers[0].size[1]);
    expect(taller.cables[0].start[1]).toBeGreaterThan(lower.cables[0].start[1]);
  });

  it('keeps drivable lanes inside the tower portal and mirrors cables onto both deck edges', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const cableEndSigns = new Set(model.cables.map((cable) => Math.sign(cable.end[2])));
    const cableStartSigns = new Set(model.cables.map((cable) => Math.sign(cable.start[2])));

    expect(
      Math.max(...model.guides.laneCentersZ.map((laneCenter) => Math.abs(laneCenter)))
    ).toBeLessThan(model.guides.towerInnerClearZ / 2);
    expect(cableStartSigns.has(-1)).toBe(true);
    expect(cableStartSigns.has(1)).toBe(true);
    expect(cableEndSigns.has(-1)).toBe(true);
    expect(cableEndSigns.has(1)).toBe(true);
  });

  it('recomputes cable count and guides when cable count changes', () => {
    const sparse = generateBridgeModel({
      ...balancedPreset.params,
      cableCountPerSide: 5
    });
    const dense = generateBridgeModel({
      ...balancedPreset.params,
      cableCountPerSide: 9
    });

    expect(sparse.cables).toHaveLength(40);
    expect(dense.cables).toHaveLength(72);
    expect(sparse.guides.cablePlaneOffsetsZ).toEqual(
      expect.arrayContaining([-Math.abs(sparse.guides.cablePlaneOffsetsZ[0]), Math.abs(sparse.guides.cablePlaneOffsetsZ[1])])
    );
    expect(dense.guides.cablePlaneOffsetsZ).toEqual(
      expect.arrayContaining([-Math.abs(dense.guides.cablePlaneOffsetsZ[0]), Math.abs(dense.guides.cablePlaneOffsetsZ[1])])
    );
  });

  it('keeps cable reach ordering consistent on both sides of each tower', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const cableGroups = new Map<string, typeof model.cables>();

    model.cables.forEach((cable) => {
      const groupKey = `${cable.start[0]}-${cable.start[2]}-${Math.sign(cable.end[0] - cable.start[0])}`;
      const group = cableGroups.get(groupKey) ?? [];

      group.push(cable);
      cableGroups.set(groupKey, group);
    });

    expect(cableGroups.size).toBe(8);

    cableGroups.forEach((group) => {
      const ordered = [...group].sort((left, right) => right.start[1] - left.start[1]);

      for (let index = 0; index < ordered.length - 1; index += 1) {
        const currentReach = Math.abs(ordered[index].end[0] - ordered[index].start[0]);
        const nextReach = Math.abs(ordered[index + 1].end[0] - ordered[index + 1].start[0]);

        expect(currentReach).toBeGreaterThan(nextReach);
      }
    });
  });

  it('adds a deck anchor block for every cable endpoint so cables terminate on the bridge', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const cableAnchors = model.deckDetails.filter((part) =>
      part.id.startsWith('cable-anchor-')
    );

    expect(cableAnchors).toHaveLength(model.cables.length);

    model.cables.forEach((cable) => {
      const anchor = cableAnchors.find((part) => part.id === `cable-anchor-${cable.id}`);

      expect(anchor).toBeDefined();
      expect(anchor?.position).toEqual(cable.end);
      expect(Math.abs(anchor?.position[2] ?? 0)).toBeGreaterThan(model.guides.deckEdgeZ);
      expect(anchor?.position[1]).toBeLessThan(model.guides.roadSurfaceY);
      expect(anchor?.position[1]).toBeGreaterThan(balancedPreset.params.deckElevation - 1.2);
    });
  });

  it('adds a visible side anchor housing behind every cable saddle', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const cableAnchors = model.deckDetails.filter((part) =>
      part.id.startsWith('cable-anchor-')
    );
    const cableHousings = model.deckDetails.filter((part) =>
      part.id.startsWith('cable-housing-')
    );

    expect(cableHousings).toHaveLength(model.cables.length);

    model.cables.forEach((cable) => {
      const anchor = cableAnchors.find((part) => part.id === `cable-anchor-${cable.id}`);
      const housing = cableHousings.find((part) => part.id === `cable-housing-${cable.id}`);

      expect(anchor).toBeDefined();
      expect(housing).toBeDefined();
      expect(Math.abs(housing?.position[2] ?? 0)).toBeGreaterThan(
        Math.abs(anchor?.position[2] ?? 0)
      );
      expect(housing?.position[1]).toBeLessThan(anchor?.position[1] ?? 0);
    });
  });

  it('adds a box-girder underside and fascia below the roadway', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const soffit = model.deckDetails.find((part) => part.id === 'box-girder-soffit');
    const leftFascia = model.deckDetails.find((part) => part.id === 'deck-fascia-left');
    const rightFascia = model.deckDetails.find((part) => part.id === 'deck-fascia-right');
    const undersideWebs = model.deckDetails.filter((part) => part.id.startsWith('underside-web-'));

    expect(soffit).toBeDefined();
    expect(leftFascia).toBeDefined();
    expect(rightFascia).toBeDefined();
    expect(undersideWebs.length).toBeGreaterThanOrEqual(2);
    expect(soffit?.position[1]).toBeCloseTo(model.guides.deckSoffitY, 5);
    expect(Math.abs(leftFascia?.position[2] ?? 0)).toBeCloseTo(model.guides.deckFasciaZ, 5);
    expect(Math.abs(rightFascia?.position[2] ?? 0)).toBeCloseTo(model.guides.deckFasciaZ, 5);
    expect(soffit?.position[1]).toBeLessThan(model.guides.roadSurfaceY);
  });

  it('adds a parapet and maintenance walkway system outside the drivable lanes', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const parapets = model.deckDetails.filter((part) => part.id.startsWith('parapet-'));
    const walkways = model.deckDetails.filter((part) => part.id.startsWith('walkway-'));
    const curbs = model.deckDetails.filter((part) => part.id.startsWith('curb-'));

    expect(parapets).toHaveLength(2);
    expect(walkways).toHaveLength(2);
    expect(curbs).toHaveLength(2);
    expect(Math.max(...model.guides.laneCentersZ.map((laneCenter) => Math.abs(laneCenter)))).toBeLessThan(
      model.guides.parapetZ
    );
    expect(model.guides.parapetZ).toBeLessThan(model.guides.walkwayZ);
    expect(Math.abs(parapets[0]?.position[2] ?? 0)).toBeCloseTo(model.guides.parapetZ, 5);
    expect(Math.abs(walkways[0]?.position[2] ?? 0)).toBeCloseTo(model.guides.walkwayZ, 5);
  });

  it('places expansion joints near stayed-span and approach transitions', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const joints = model.deckDetails.filter((part) => part.id.startsWith('expansion-joint-'));

    expect(joints).toHaveLength(model.guides.jointXs.length);
    expect(joints.map((part) => part.position[0])).toEqual(model.guides.jointXs);
    expect(Math.abs(model.guides.jointXs[1])).toBeCloseTo(Math.abs(model.guides.towerXs[0]), 5);
    expect(Math.abs(model.guides.jointXs[0])).toBeGreaterThan(Math.abs(model.guides.approachPierXs[0]));
  });

  it('adds repeated underside diaphragms and transition girder zones along the box girder', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const diaphragms = model.deckDetails.filter((part) => part.id.startsWith('diaphragm-'));
    const transitions = model.deckDetails.filter((part) => part.id.startsWith('transition-girder-'));

    expect(diaphragms).toHaveLength(model.guides.diaphragmXs.length);
    expect(diaphragms.map((part) => part.position[0])).toEqual(model.guides.diaphragmXs);
    expect(transitions).toHaveLength(4);
    expect(transitions.every((part) => part.position[1] <= model.guides.deckSoffitY + 1.8)).toBe(true);
  });

  it('builds each pylon leg from tapered stacked concrete segments', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const lowerSegment = model.towerFrames.find((part) => part.id === 'tower-1-leg-left-lower');
    const midSegment = model.towerFrames.find((part) => part.id === 'tower-1-leg-left-mid');
    const upperSegment = model.towerFrames.find((part) => part.id === 'tower-1-leg-left-upper');

    expect(lowerSegment).toBeDefined();
    expect(midSegment).toBeDefined();
    expect(upperSegment).toBeDefined();
    expect(lowerSegment?.color).toBe('#b7b5b1');
    expect(midSegment?.color).toBe('#c5c3bf');
    expect(upperSegment?.color).toBe('#d3d0cb');
    expect((lowerSegment?.size[0] ?? 0) > (midSegment?.size[0] ?? 0)).toBe(true);
    expect((midSegment?.size[0] ?? 0) > (upperSegment?.size[0] ?? 0)).toBe(true);
    expect((lowerSegment?.size[2] ?? 0) > (upperSegment?.size[2] ?? 0)).toBe(true);
  });

  it('uses a desaturated steel palette for the box girder and cable hardware', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const boxGirderCore = model.deckDetails.find((part) => part.id === 'box-girder-core');
    const soffit = model.deckDetails.find((part) => part.id === 'box-girder-soffit');
    const fascia = model.deckDetails.find((part) => part.id === 'deck-fascia-left');
    const cableHousing = model.deckDetails.find((part) => part.id.startsWith('cable-housing-'));
    const towerCableAnchor = model.towerFrames.find((part) => part.id.includes('-cable-anchor-'));

    expect(boxGirderCore?.color).toBe('#5d6d7c');
    expect(soffit?.color).toBe('#44535f');
    expect(fascia?.color).toBe('#70808d');
    expect(cableHousing?.color).toBe('#4c5a66');
    expect(towerCableAnchor?.color).toBe('#bcc4cc');
  });

  it('adds a tower anchor block for every cable start so cables originate on the pylon', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const towerCableAnchors = model.towerFrames.filter((part) =>
      part.id.includes('-cable-anchor-')
    );
    const towerCableBrackets = model.towerFrames.filter((part) =>
      part.id.includes('-cable-bracket-')
    );

    expect(towerCableAnchors).toHaveLength(model.cables.length);
    expect(towerCableBrackets).toHaveLength(model.cables.length);

    model.cables.forEach((cable) => {
      const anchor = towerCableAnchors.find((part) =>
        part.id.endsWith(`cable-anchor-${cable.id}`)
      );
      const bracket = towerCableBrackets.find((part) =>
        part.id.endsWith(`cable-bracket-${cable.id}`)
      );
      const nearestTowerX = model.guides.towerXs.reduce((closest, towerX) =>
        Math.abs(towerX - cable.start[0]) < Math.abs(closest - cable.start[0]) ? towerX : closest
      );
      const nearestLeg = model.towerFrames
        .filter((part) => part.id.startsWith(`tower-${nearestTowerX === model.guides.towerXs[0] ? 1 : 2}-leg-`))
        .sort(
          (left, right) =>
            Math.abs(Math.abs(left.position[2]) - Math.abs(cable.start[2])) -
            Math.abs(Math.abs(right.position[2]) - Math.abs(cable.start[2]))
        )[0];

      expect(anchor).toBeDefined();
      expect(bracket).toBeDefined();
      expect(nearestLeg).toBeDefined();
      expect(anchor?.position).toEqual(cable.start);
      expect(Math.abs(anchor?.position[2] ?? 0)).toBeLessThan(model.guides.towerInnerClearZ / 2);
      expect(Math.abs(anchor?.position[2] ?? 0)).toBeGreaterThan(Math.abs(cable.end[2]));
      expect(Math.abs(anchor?.position[2] ?? 0)).toBeCloseTo(
        model.guides.towerCableAnchorZ,
        5
      );
      expect(Math.abs((anchor?.position[0] ?? 0) - nearestTowerX)).toBeCloseTo(
        model.guides.towerCableAnchorInsetX,
        5
      );
      expect(Math.abs(anchor?.position[2] ?? 0)).toBeLessThan(
        Math.abs(nearestLeg?.position[2] ?? Infinity)
      );
      expect(Math.abs(bracket?.position[2] ?? 0)).toBeGreaterThan(
        Math.abs(anchor?.position[2] ?? 0)
      );
    });
  });

  it('adds top caps, saddle covers, and service crosswalks to the tower frame', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const topCaps = model.towerFrames.filter((part) => part.id.includes('-top-cap-'));
    const saddleCovers = model.towerFrames.filter((part) => part.id.includes('-saddle-cover-'));
    const serviceCrosswalks = model.towerFrames.filter((part) =>
      part.id.includes('-service-crosswalk-')
    );

    expect(topCaps).toHaveLength(4);
    expect(saddleCovers).toHaveLength(4);
    expect(serviceCrosswalks).toHaveLength(2);
    expect(serviceCrosswalks.every((part) => Math.abs(part.position[2]) < model.guides.towerInnerClearZ / 2)).toBe(true);
  });

  it('keeps cable deck anchor housings integrated behind the parapet edge system', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const cableHousings = model.deckDetails.filter((part) => part.id.startsWith('cable-housing-'));

    expect(cableHousings.length).toBeGreaterThan(0);
    expect(cableHousings.every((part) => Math.abs(part.position[2]) > model.guides.parapetZ)).toBe(true);
    expect(cableHousings.every((part) => Math.abs(part.position[2]) < model.guides.walkwayZ + 1.2)).toBe(true);
  });

  it('keeps tower placement proportional as span length changes', () => {
    const shorter = generateBridgeModel({
      ...balancedPreset.params,
      spanLength: 420
    });
    const longer = generateBridgeModel({
      ...balancedPreset.params,
      spanLength: 760
    });

    const shorterRatio =
      Math.abs(shorter.towers[0].position[0]) / shorter.deck.size[0];
    const longerRatio =
      Math.abs(longer.towers[0].position[0]) / longer.deck.size[0];

    expect(longer.deck.size[0]).toBeGreaterThan(shorter.deck.size[0]);
    expect(Math.abs(longer.towers[0].position[0])).toBeGreaterThan(
      Math.abs(shorter.towers[0].position[0])
    );
    expect(shorterRatio).toBeCloseTo(longerRatio, 5);
  });

  it('places approach piers outside the tower bay and adds bearing seats under the deck', () => {
    const model = generateBridgeModel(balancedPreset.params);
    const approachShafts = model.piers.filter((part) => part.id.startsWith('approach-pier-shaft-'));
    const approachCaps = model.piers.filter((part) => part.id.startsWith('approach-pier-cap-'));
    const bearingSeats = model.piers.filter((part) => part.id.startsWith('bearing-seat-'));
    const towerLimit = Math.max(...model.guides.towerXs.map((towerX) => Math.abs(towerX)));

    expect(approachShafts).toHaveLength(2);
    expect(approachCaps).toHaveLength(2);
    expect(bearingSeats).toHaveLength(2);

    approachShafts.forEach((shaft, index) => {
      expect(Math.abs(shaft.position[0])).toBeGreaterThan(towerLimit);
      expect(Math.abs(shaft.position[0])).toBeCloseTo(
        Math.abs(model.guides.approachPierXs[index]),
        5
      );
    });

    bearingSeats.forEach((seat) => {
      expect(seat.position[1]).toBeLessThan(model.guides.roadSurfaceY);
      expect(seat.position[1]).toBeGreaterThan(model.guides.deckSoffitY);
    });
  });

  it('adds more lane markers as the bridge span grows', () => {
    const shorter = generateBridgeModel({
      ...balancedPreset.params,
      spanLength: 420
    });
    const longer = generateBridgeModel({
      ...balancedPreset.params,
      spanLength: 820
    });

    const shortMarkers = shorter.deckDetails.filter((part) =>
      part.id.includes('lane-marker')
    );
    const longMarkers = longer.deckDetails.filter((part) =>
      part.id.includes('lane-marker')
    );

    expect(longMarkers.length).toBeGreaterThan(0);
    expect(longMarkers.length).toBeGreaterThan(shortMarkers.length);
  });

  it('recomputes roadway and tower clearance guides when the deck width changes', () => {
    const narrower = generateBridgeModel({
      ...balancedPreset.params,
      deckWidth: 14
    });
    const wider = generateBridgeModel({
      ...balancedPreset.params,
      deckWidth: 30
    });

    expect(Math.abs(wider.guides.laneCentersZ[0])).toBeGreaterThan(
      Math.abs(narrower.guides.laneCentersZ[0])
    );
    expect(wider.guides.towerInnerClearZ).toBeGreaterThan(
      narrower.guides.towerInnerClearZ
    );
    expect(Math.abs(wider.guides.cablePlaneOffsetsZ[0])).toBeGreaterThan(
      Math.abs(narrower.guides.cablePlaneOffsetsZ[0])
    );
    expect(wider.guides.roadHalfWidth).toBeGreaterThan(narrower.guides.roadHalfWidth);
    expect(wider.guides.deckFasciaZ).toBeGreaterThan(narrower.guides.deckFasciaZ);
  });
});
