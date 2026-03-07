import type {
  BridgeBoxPart,
  BridgeCable,
  BridgeGuides,
  BridgeModelData,
  BridgeParams
} from '../types/bridge';
import { scenePalette } from '../components/scene/sceneLook';

const DECK_THICKNESS = 4.2;
const ROAD_SURFACE_THICKNESS = 0.42;
const TOWER_RATIO = 0.19;
const PYLON_CONCRETE_BASE = scenePalette.concrete.base;
const PYLON_CONCRETE_MID = scenePalette.concrete.mid;
const PYLON_CONCRETE_TOP = scenePalette.concrete.top;
const PYLON_CONCRETE_DARK = scenePalette.concrete.dark;
const PYLON_CONCRETE_FOOTING = scenePalette.concrete.footing;
const GIRDER_STEEL = scenePalette.steel.core;
const GIRDER_STEEL_DARK = scenePalette.steel.soffit;
const GIRDER_STEEL_LIGHT = scenePalette.steel.fascia;
const GIRDER_HARDWARE = scenePalette.steel.hardware;
const CABLE_HARDWARE = scenePalette.hardware.cableAnchor;
const ASPHALT = scenePalette.road.asphalt;
const STEEL_CABLE = scenePalette.cable.main;
const CONCRETE = scenePalette.concrete.base;

const getTowerDimensions = (params: BridgeParams, towerInnerClearZ: number) => {
  const legThicknessX = Math.max(2.8, params.deckWidth * 0.16);
  const legThicknessZ = Math.max(2.6, params.deckWidth * 0.14);
  const legCenterZ = towerInnerClearZ / 2 + legThicknessZ / 2;

  return {
    legThicknessX,
    legThicknessZ,
    legCenterZ
  };
};

const createLaneMarkers = (
  params: BridgeParams,
  spanInset: number,
  roadSurfaceY: number
): BridgeBoxPart[] => {
  const laneMarkerCount = Math.max(8, Math.round(params.spanLength / 42));
  const markerLength = params.spanLength / (laneMarkerCount * 2.2);
  const usableSpan = params.spanLength - spanInset * 2;
  const startX = -usableSpan / 2;
  const step = usableSpan / (laneMarkerCount - 1);

  return Array.from({ length: laneMarkerCount }, (_, index) => ({
    id: `lane-marker-${index + 1}`,
    position: [startX + step * index, roadSurfaceY + 0.04, 0],
    size: [markerLength, 0.05, Math.max(0.16, params.deckWidth * 0.012)],
    color: scenePalette.road.laneMarker
  }));
};

const createDeckDetails = (params: BridgeParams, guides: BridgeGuides): BridgeBoxPart[] => {
  const shoulderWidth = Math.max(1.15, params.deckWidth * 0.11);
  const roadWidth = Math.max(8, guides.roadHalfWidth * 2);
  const roadSurfaceCenterY = guides.roadSurfaceY - ROAD_SURFACE_THICKNESS / 2;
  const spanInset = params.deckWidth * 0.9;
  const curbWidth = 0.38;
  const curbHeight = 0.3;
  const walkwayWidth = Math.max(0.88, params.deckWidth * 0.055);
  const parapetWidth = 0.28;
  const parapetHeight = 1.36;
  const fasciaHeight = Math.max(2.6, DECK_THICKNESS * 0.64);
  const fasciaThickness = 0.44;
  const soffitThickness = 0.36;
  const undersideWebHeight = Math.max(1.6, DECK_THICKNESS * 0.5);
  const undersideWebInsetZ = Math.max(1.6, guides.roadHalfWidth * 0.62);
  const boxGirderWidth = Math.max(6.8, guides.roadHalfWidth * 1.36);
  const edgeGirderInset = Math.max(0.72, params.deckWidth * 0.06);

  return [
    {
      id: 'road-surface',
      position: [0, roadSurfaceCenterY, 0],
      size: [params.spanLength * 0.995, ROAD_SURFACE_THICKNESS, roadWidth],
      color: ASPHALT
    },
    {
      id: 'shoulder-left',
      position: [0, roadSurfaceCenterY - 0.08, guides.deckEdgeZ - shoulderWidth / 2],
      size: [params.spanLength * 0.99, 0.28, shoulderWidth],
      color: GIRDER_STEEL_DARK
    },
    {
      id: 'shoulder-right',
      position: [0, roadSurfaceCenterY - 0.08, -guides.deckEdgeZ + shoulderWidth / 2],
      size: [params.spanLength * 0.99, 0.28, shoulderWidth],
      color: GIRDER_STEEL_DARK
    },
    {
      id: 'curb-left',
      position: [0, guides.roadSurfaceY + curbHeight / 2 - 0.04, guides.parapetZ - curbWidth * 0.72],
      size: [params.spanLength * 0.986, curbHeight, curbWidth],
      color: GIRDER_HARDWARE
    },
    {
      id: 'curb-right',
      position: [0, guides.roadSurfaceY + curbHeight / 2 - 0.04, -guides.parapetZ + curbWidth * 0.72],
      size: [params.spanLength * 0.986, curbHeight, curbWidth],
      color: GIRDER_HARDWARE
    },
    {
      id: 'parapet-left',
      position: [0, guides.roadSurfaceY + parapetHeight / 2 + 0.24, guides.parapetZ],
      size: [params.spanLength * 0.985, parapetHeight, parapetWidth],
      color: scenePalette.hardware.guardrail
    },
    {
      id: 'parapet-right',
      position: [0, guides.roadSurfaceY + parapetHeight / 2 + 0.24, -guides.parapetZ],
      size: [params.spanLength * 0.985, parapetHeight, parapetWidth],
      color: scenePalette.hardware.guardrail
    },
    {
      id: 'walkway-left',
      position: [0, guides.roadSurfaceY - 0.2, guides.walkwayZ],
      size: [params.spanLength * 0.982, 0.22, walkwayWidth],
      color: GIRDER_STEEL_LIGHT
    },
    {
      id: 'walkway-right',
      position: [0, guides.roadSurfaceY - 0.2, -guides.walkwayZ],
      size: [params.spanLength * 0.982, 0.22, walkwayWidth],
      color: GIRDER_STEEL_LIGHT
    },
    {
      id: 'outer-rail-left',
      position: [0, guides.roadSurfaceY + 0.44, guides.walkwayZ + walkwayWidth / 2 - 0.08],
      size: [params.spanLength * 0.978, 0.78, 0.1],
      color: scenePalette.hardware.guardrail
    },
    {
      id: 'outer-rail-right',
      position: [0, guides.roadSurfaceY + 0.44, -guides.walkwayZ - walkwayWidth / 2 + 0.08],
      size: [params.spanLength * 0.978, 0.78, 0.1],
      color: scenePalette.hardware.guardrail
    },
    {
      id: 'deck-fascia-left',
      position: [0, guides.deckSoffitY + fasciaHeight / 2 + 0.12, guides.deckFasciaZ],
      size: [params.spanLength * 0.982, fasciaHeight, fasciaThickness],
      color: GIRDER_STEEL_LIGHT
    },
    {
      id: 'deck-fascia-right',
      position: [0, guides.deckSoffitY + fasciaHeight / 2 + 0.12, -guides.deckFasciaZ],
      size: [params.spanLength * 0.982, fasciaHeight, fasciaThickness],
      color: GIRDER_STEEL_LIGHT
    },
    {
      id: 'edge-girder-left',
      position: [0, guides.deckSoffitY + 0.66, guides.deckFasciaZ - edgeGirderInset],
      size: [params.spanLength * 0.97, 0.74, 0.84],
      color: GIRDER_HARDWARE
    },
    {
      id: 'edge-girder-right',
      position: [0, guides.deckSoffitY + 0.66, -guides.deckFasciaZ + edgeGirderInset],
      size: [params.spanLength * 0.97, 0.74, 0.84],
      color: GIRDER_HARDWARE
    },
    ...guides.jointXs.map((jointX, index) => ({
      id: `expansion-joint-${index + 1}`,
      position: [jointX, guides.roadSurfaceY + 0.05, 0] as [number, number, number],
      size: [0.58, 0.08, roadWidth + shoulderWidth * 0.6] as [number, number, number],
      color: scenePalette.steel.hardware
    })),
    {
      id: 'box-girder-core',
      position: [0, params.deckElevation - 0.42, 0],
      size: [params.spanLength * 0.95, 2.28, boxGirderWidth],
      color: GIRDER_STEEL
    },
    {
      id: 'box-girder-soffit',
      position: [0, guides.deckSoffitY, 0],
      size: [params.spanLength * 0.938, soffitThickness + 0.1, Math.max(7.4, boxGirderWidth * 1.1)],
      color: GIRDER_STEEL_DARK
    },
    {
      id: 'underside-web-left',
      position: [0, guides.deckSoffitY + soffitThickness / 2 + undersideWebHeight / 2, undersideWebInsetZ],
      size: [params.spanLength * 0.936, undersideWebHeight + 0.36, 0.28],
      color: GIRDER_HARDWARE
    },
    {
      id: 'underside-web-right',
      position: [
        0,
        guides.deckSoffitY + soffitThickness / 2 + undersideWebHeight / 2,
        -undersideWebInsetZ
      ],
      size: [params.spanLength * 0.936, undersideWebHeight + 0.36, 0.28],
      color: GIRDER_HARDWARE
    },
    ...guides.diaphragmXs.map((diaphragmX, index) => ({
      id: `diaphragm-${index + 1}`,
      position: [diaphragmX, guides.deckSoffitY + 0.82, 0] as [number, number, number],
      size: [0.34, undersideWebHeight + 1.24, boxGirderWidth * 0.88] as [number, number, number],
      color: GIRDER_HARDWARE
    })),
    ...guides.jointXs.map((jointX, index) => ({
      id: `transition-girder-${index + 1}`,
      position: [jointX, guides.deckSoffitY + 1.18, 0] as [number, number, number],
      size: [Math.max(4.8, params.deckWidth * 0.32), 1.08, boxGirderWidth * 1.02] as [
        number,
        number,
        number
      ],
      color: GIRDER_STEEL_LIGHT
    })),
    ...createLaneMarkers(params, spanInset, guides.roadSurfaceY)
  ];
};

const createCableAnchors = (
  cables: BridgeCable[],
  guides: BridgeGuides
): BridgeBoxPart[] =>
  cables.flatMap((cable) => {
    const sideSign = Math.sign(cable.end[2]) || 1;
    const housingTargetZ = sideSign * Math.min(guides.walkwayZ + 0.24, guides.walkwayZ + 0.18);
    const housingOffsetZ = housingTargetZ - cable.end[2];

    return [
      {
        id: `cable-anchor-${cable.id}`,
        position: cable.end,
        size: [0.94, 0.24, 0.34],
        color: CABLE_HARDWARE
      },
      {
        id: `cable-housing-${cable.id}`,
        position: [
          cable.end[0],
          cable.end[1] - 0.24,
          cable.end[2] + housingOffsetZ
        ],
        size: [1.24, 0.74, 0.56],
        color: GIRDER_HARDWARE
      }
    ];
  });

const createTowerFrames = (
  towerX: number,
  params: BridgeParams,
  index: number,
  guides: BridgeGuides
): BridgeBoxPart[] => {
  const towerId = `tower-${index + 1}`;
  const { legThicknessX, legThicknessZ, legCenterZ } = getTowerDimensions(
    params,
    guides.towerInnerClearZ
  );
  const beamSpanZ = guides.towerInnerClearZ + legThicknessZ * 0.95;
  const topBeamY = params.towerHeight * 0.78;
  const midBeamY = params.towerHeight * 0.57;
  const lowerSegmentHeight = params.towerHeight * 0.36;
  const midSegmentHeight = params.towerHeight * 0.34;
  const upperSegmentHeight = params.towerHeight - lowerSegmentHeight - midSegmentHeight;
  const lowerSegmentY = lowerSegmentHeight / 2;
  const midSegmentY = lowerSegmentHeight + midSegmentHeight / 2;
  const upperSegmentY = lowerSegmentHeight + midSegmentHeight + upperSegmentHeight / 2;
  const basePedestalHeight = Math.max(5.6, params.deckElevation * 0.12);
  const footingHeight = Math.max(2.4, params.deckElevation * 0.055);
  const topCapY = params.towerHeight + 0.88;
  const topCapSpanZ = beamSpanZ * 0.84;
  const saddleCoverY = params.towerHeight - Math.max(8, params.deckWidth * 0.2) + 0.34;
  const serviceCrosswalkY = midBeamY - Math.max(4.8, params.towerHeight * 0.08);

  return [
    {
      id: `${towerId}-leg-left-lower`,
      position: [towerX, lowerSegmentY, legCenterZ],
      size: [legThicknessX * 1.18, lowerSegmentHeight, legThicknessZ * 1.12],
      color: PYLON_CONCRETE_BASE
    },
    {
      id: `${towerId}-leg-right-lower`,
      position: [towerX, lowerSegmentY, -legCenterZ],
      size: [legThicknessX * 1.18, lowerSegmentHeight, legThicknessZ * 1.12],
      color: PYLON_CONCRETE_BASE
    },
    {
      id: `${towerId}-leg-left-mid`,
      position: [towerX, midSegmentY, legCenterZ],
      size: [legThicknessX * 1.02, midSegmentHeight, legThicknessZ * 0.98],
      color: PYLON_CONCRETE_MID
    },
    {
      id: `${towerId}-leg-right-mid`,
      position: [towerX, midSegmentY, -legCenterZ],
      size: [legThicknessX * 1.02, midSegmentHeight, legThicknessZ * 0.98],
      color: PYLON_CONCRETE_MID
    },
    {
      id: `${towerId}-leg-left-upper`,
      position: [towerX, upperSegmentY, legCenterZ],
      size: [legThicknessX * 0.88, upperSegmentHeight, legThicknessZ * 0.84],
      color: PYLON_CONCRETE_TOP
    },
    {
      id: `${towerId}-leg-right-upper`,
      position: [towerX, upperSegmentY, -legCenterZ],
      size: [legThicknessX * 0.88, upperSegmentHeight, legThicknessZ * 0.84],
      color: PYLON_CONCRETE_TOP
    },
    {
      id: `${towerId}-beam-mid`,
      position: [towerX, midBeamY, 0],
      size: [legThicknessX * 0.72, Math.max(2.2, params.deckWidth * 0.1), beamSpanZ],
      color: PYLON_CONCRETE_MID
    },
    {
      id: `${towerId}-beam-top`,
      position: [towerX, topBeamY, 0],
      size: [legThicknessX * 0.68, Math.max(2, params.deckWidth * 0.09), beamSpanZ * 0.96],
      color: PYLON_CONCRETE_TOP
    },
    {
      id: `${towerId}-base-left`,
      position: [towerX, basePedestalHeight / 2 - 1.1, legCenterZ],
      size: [legThicknessX * 1.16, basePedestalHeight, legThicknessZ * 1.18],
      color: PYLON_CONCRETE_DARK
    },
    {
      id: `${towerId}-base-right`,
      position: [towerX, basePedestalHeight / 2 - 1.1, -legCenterZ],
      size: [legThicknessX * 1.16, basePedestalHeight, legThicknessZ * 1.18],
      color: PYLON_CONCRETE_DARK
    },
    {
      id: `${towerId}-footing-left`,
      position: [towerX, footingHeight / 2 - 0.7, legCenterZ],
      size: [legThicknessX * 1.56, footingHeight, legThicknessZ * 1.6],
      color: PYLON_CONCRETE_FOOTING
    },
    {
      id: `${towerId}-footing-right`,
      position: [towerX, footingHeight / 2 - 0.7, -legCenterZ],
      size: [legThicknessX * 1.56, footingHeight, legThicknessZ * 1.6],
      color: PYLON_CONCRETE_FOOTING
    },
    {
      id: `${towerId}-top-cap-left`,
      position: [towerX, topCapY, legCenterZ],
      size: [legThicknessX * 0.76, 0.64, legThicknessZ * 0.82],
      color: PYLON_CONCRETE_TOP
    },
    {
      id: `${towerId}-top-cap-right`,
      position: [towerX, topCapY, -legCenterZ],
      size: [legThicknessX * 0.76, 0.64, legThicknessZ * 0.82],
      color: PYLON_CONCRETE_TOP
    },
    {
      id: `${towerId}-saddle-cover-left`,
      position: [towerX, saddleCoverY, guides.towerCableAnchorZ],
      size: [legThicknessX * 0.52, 0.42, 0.58],
      color: GIRDER_HARDWARE
    },
    {
      id: `${towerId}-saddle-cover-right`,
      position: [towerX, saddleCoverY, -guides.towerCableAnchorZ],
      size: [legThicknessX * 0.52, 0.42, 0.58],
      color: GIRDER_HARDWARE
    },
    {
      id: `${towerId}-service-crosswalk-main`,
      position: [towerX, serviceCrosswalkY, 0],
      size: [legThicknessX * 0.26, 0.24, topCapSpanZ],
      color: GIRDER_STEEL_LIGHT
    }
  ];
};

const createTowerCableAnchors = (
  cables: BridgeCable[],
  guides: BridgeGuides
): BridgeBoxPart[] =>
  cables.flatMap((cable) => {
    const nearestTowerX = guides.towerXs.reduce((closest, towerX) =>
      Math.abs(towerX - cable.start[0]) < Math.abs(closest - cable.start[0]) ? towerX : closest
    );
    const towerIndex = nearestTowerX === guides.towerXs[0] ? 1 : 2;
    const directionSign = Math.sign(cable.end[0] - cable.start[0]) || 1;
    const sideSign = Math.sign(cable.start[2]) || 1;
    const bracketReachX = Math.max(0.58, guides.towerCableAnchorInsetX * 0.42);
    const bracketInsetZ = Math.max(0.24, guides.towerInnerClearZ * 0.028);

    return [
      {
        id: `tower-${towerIndex}-cable-anchor-${cable.id}`,
        position: cable.start,
        size: [0.92, 0.24, 0.34],
        color: CABLE_HARDWARE
      },
      {
        id: `tower-${towerIndex}-cable-bracket-${cable.id}`,
        position: [
          cable.start[0] - directionSign * bracketReachX,
          cable.start[1] - 0.22,
          cable.start[2] + sideSign * bracketInsetZ
        ],
        size: [0.88, 0.56, 0.42],
        color: GIRDER_HARDWARE
      }
    ];
  });

const createCablePlane = ({
  anchorDrop,
  anchorY,
  cablePlaneZ,
  count,
  deckAnchorY,
  direction,
  farReach,
  nearReach,
  towerAnchorInsetX,
  towerAnchorZ,
  towerX
}: {
  anchorDrop: number;
  anchorY: number;
  cablePlaneZ: number;
  count: number;
  deckAnchorY: number;
  direction: -1 | 1;
  farReach: number;
  nearReach: number;
  towerAnchorInsetX: number;
  towerAnchorZ: number;
  towerX: number;
}): BridgeCable[] => {
  const cables: BridgeCable[] = [];
  const step = count === 1 ? 0 : (farReach - nearReach) / (count - 1);
  const anchorStep = count === 1 ? 0 : anchorDrop / (count - 1);
  const towerSideSign = Math.sign(cablePlaneZ) || 1;

  for (let index = 0; index < count; index += 1) {
    const reach = farReach - step * index;

    cables.push({
      id: `${towerX}-${direction}-${cablePlaneZ}-${index}`,
      start: [
        towerX + direction * towerAnchorInsetX,
        anchorY - anchorStep * index,
        towerSideSign * towerAnchorZ
      ],
      end: [towerX + direction * reach, deckAnchorY, cablePlaneZ],
      color: STEEL_CABLE
    });
  }

  return cables;
};

const createGuides = (params: BridgeParams): BridgeGuides => {
  const halfDeck = params.spanLength / 2;
  const deckHalfWidth = params.deckWidth / 2;
  const roadSurfaceY =
    params.deckElevation + DECK_THICKNESS / 2 + ROAD_SURFACE_THICKNESS * 0.88;
  const shoulderWidth = Math.max(1.15, params.deckWidth * 0.11);
  const roadHalfWidth = Math.max(4.8, deckHalfWidth - shoulderWidth - 0.32);
  const laneCenterOffset = Math.max(1.8, roadHalfWidth * 0.56);
  const towerStandoff = Math.max(1.4, params.deckWidth * 0.08);
  const towerInnerClearZ = params.deckWidth + towerStandoff * 2;
  const { legThicknessX, legThicknessZ, legCenterZ } = getTowerDimensions(
    params,
    towerInnerClearZ
  );
  const deckEdgeZ = deckHalfWidth - 0.58;
  const deckFasciaZ = deckHalfWidth - 0.24;
  const parapetZ = deckEdgeZ + Math.max(0.22, params.deckWidth * 0.012);
  const walkwayZ = parapetZ + Math.max(0.78, params.deckWidth * 0.052);
  const deckSoffitY = params.deckElevation - DECK_THICKNESS / 2 + 0.22;
  const cablePlaneOffset = parapetZ + Math.max(0.26, params.deckWidth * 0.016);
  const towerX = params.spanLength * TOWER_RATIO;
  const approachPierOffset = towerX + (halfDeck - towerX) * 0.52;
  const abutmentReach = Math.max(
    params.deckWidth * 0.9,
    (halfDeck - approachPierOffset) * 0.42
  );
  const abutmentOffset = halfDeck + abutmentReach;
  const approachJointOffset = Math.max(8, (halfDeck - approachPierOffset) * 0.46);
  const jointXs = [
    -approachPierOffset - approachJointOffset,
    -towerX,
    towerX,
    approachPierOffset + approachJointOffset
  ];
  const diaphragmCount = Math.max(8, Math.round(params.spanLength / 72));
  const diaphragmStart = -halfDeck + params.deckWidth * 1.45;
  const diaphragmEnd = halfDeck - params.deckWidth * 1.45;
  const diaphragmStep = diaphragmCount === 1 ? 0 : (diaphragmEnd - diaphragmStart) / (diaphragmCount - 1);
  const diaphragmXs = Array.from({ length: diaphragmCount }, (_, index) =>
    Number((diaphragmStart + diaphragmStep * index).toFixed(3))
  );
  const towerInnerFaceZ = legCenterZ - legThicknessZ / 2;
  const towerCableAnchorZ =
    towerInnerFaceZ - Math.max(0.14, legThicknessZ * 0.08);
  const towerCableAnchorInsetX =
    legThicknessX / 2 + Math.max(0.24, legThicknessX * 0.08);

  return {
    roadSurfaceY,
    deckSoffitY,
    roadHalfWidth,
    laneCentersZ: [-laneCenterOffset, laneCenterOffset],
    deckEndXs: [-halfDeck, halfDeck],
    abutmentXs: [-abutmentOffset, abutmentOffset],
    deckEdgeZ,
    deckFasciaZ,
    parapetZ,
    walkwayZ,
    jointXs,
    diaphragmXs,
    cablePlaneOffsetsZ: [-cablePlaneOffset, cablePlaneOffset],
    towerXs: [-towerX, towerX],
    towerInnerClearZ,
    towerCableAnchorZ,
    towerCableAnchorInsetX,
    approachPierXs: [-approachPierOffset, approachPierOffset]
  };
};

const createSubstructure = (params: BridgeParams, guides: BridgeGuides): BridgeBoxPart[] => {
  const approachShaftHeight = Math.max(16, guides.deckSoffitY - 5.4);
  const footingHeight = Math.max(3.4, params.deckElevation * 0.075);
  const pierCapHeight = 0.96;
  const bearingHeight = 0.58;
  const towerBearingPedestalHeight = 1.18;

  const approachPiers: BridgeBoxPart[] = guides.approachPierXs.flatMap((pierX, index) => {
    const side = index === 0 ? 'left' : 'right';

    return [
      {
        id: `approach-pier-footing-${side}`,
        position: [pierX, footingHeight / 2 - 0.9, 0],
        size: [params.deckWidth * 0.92, footingHeight, params.deckWidth * 0.82],
        color: scenePalette.concrete.footing
      },
      {
        id: `approach-pier-shaft-${side}`,
        position: [pierX, approachShaftHeight / 2 - 0.82, 0],
        size: [params.deckWidth * 0.26, approachShaftHeight, params.deckWidth * 0.34],
        color: CONCRETE
      },
      {
        id: `approach-pier-cap-${side}`,
        position: [pierX, guides.deckSoffitY + 0.46, 0],
        size: [params.deckWidth * 1.02, pierCapHeight, params.deckWidth * 0.6],
        color: scenePalette.concrete.mid
      }
    ];
  });

  const towerBearings: BridgeBoxPart[] = guides.towerXs.flatMap((towerX, index) => {
    const side = index === 0 ? 'left' : 'right';

    return [
      {
        id: `bearing-pedestal-${side}`,
        position: [towerX, guides.deckSoffitY - 0.06, 0],
        size: [params.deckWidth * 0.42, towerBearingPedestalHeight, params.deckWidth * 0.32],
        color: scenePalette.concrete.dark
      },
      {
        id: `bearing-seat-${side}`,
        position: [towerX, guides.deckSoffitY + 0.62, 0],
        size: [params.deckWidth * 0.72, bearingHeight, params.deckWidth * 0.44],
        color: scenePalette.concrete.top
      },
      {
        id: `bearing-housing-${side}`,
        position: [towerX, guides.deckSoffitY + 1.28, 0],
        size: [params.deckWidth * 0.58, 0.42, params.deckWidth * 0.32],
        color: GIRDER_HARDWARE
      },
      {
        id: `pier-cap-contact-${side}`,
        position: [towerX, guides.deckSoffitY + 0.9, 0],
        size: [params.deckWidth * 0.5, 0.22, params.deckWidth * 0.26],
        color: scenePalette.concrete.mid
      }
    ];
  });

  return [...approachPiers, ...towerBearings];
};

export const generateBridgeModel = (params: BridgeParams): BridgeModelData => {
  const guides = createGuides(params);
  const deck: BridgeBoxPart = {
    id: 'deck',
    position: [0, params.deckElevation, 0],
    size: [params.spanLength, DECK_THICKNESS, params.deckWidth],
    color: GIRDER_STEEL_DARK
  };

  const towers: BridgeBoxPart[] = guides.towerXs.map((x, index) => ({
    id: `tower-${index + 1}`,
    position: [x, params.towerHeight / 2, 0],
    size: [Math.max(2.8, params.deckWidth * 0.16), params.towerHeight, guides.towerInnerClearZ],
    color: PYLON_CONCRETE_MID
  }));

  const towerFrames = guides.towerXs.flatMap((towerX, index) =>
    createTowerFrames(towerX, params, index, guides)
  );

  const halfDeck = params.spanLength / 2;
  const towerX = Math.abs(guides.towerXs[1]);
  const availableOuterReach = halfDeck - towerX - params.deckWidth * 0.56;
  const availableInnerReach = towerX - params.deckWidth * 0.86;
  const slopeRadians = (params.cableSlope * Math.PI) / 180;
  const preferredReach =
    (params.towerHeight - guides.roadSurfaceY) / Math.tan(slopeRadians);
  const farOuterReach = Math.max(
    params.deckWidth * 0.9,
    Math.min(availableOuterReach, preferredReach * 1.04)
  );
  const farInnerReach = Math.max(
    params.deckWidth * 0.62,
    Math.min(availableInnerReach, preferredReach * 0.84)
  );
  const nearReach = Math.max(params.deckWidth * 0.3, farInnerReach * 0.28);
  const cableCount = Math.max(3, Math.round(params.cableCountPerSide));
  const cableAnchorY = params.towerHeight - Math.max(8, params.deckWidth * 0.2);
  const cableAnchorDrop = params.towerHeight * 0.22;
  const deckAnchorY = guides.roadSurfaceY - 0.42;

  const cables: BridgeCable[] = guides.towerXs.flatMap((currentTowerX) => {
    const isLeftTower = currentTowerX < 0;
    const innerDirection: -1 | 1 = isLeftTower ? 1 : -1;
    const outerDirection: -1 | 1 = isLeftTower ? -1 : 1;

    return [
      ...guides.cablePlaneOffsetsZ.flatMap((cablePlaneZ) => [
        ...createCablePlane({
          anchorDrop: cableAnchorDrop,
          anchorY: cableAnchorY,
          cablePlaneZ,
          count: cableCount,
          deckAnchorY,
          direction: outerDirection,
          farReach: farOuterReach,
          nearReach,
          towerAnchorInsetX: guides.towerCableAnchorInsetX,
          towerAnchorZ: guides.towerCableAnchorZ,
          towerX: currentTowerX
        }),
        ...createCablePlane({
          anchorDrop: cableAnchorDrop,
          anchorY: cableAnchorY,
          cablePlaneZ,
          count: cableCount,
          deckAnchorY,
          direction: innerDirection,
          farReach: farInnerReach,
          nearReach,
          towerAnchorInsetX: guides.towerCableAnchorInsetX,
          towerAnchorZ: guides.towerCableAnchorZ,
          towerX: currentTowerX
        })
      ])
    ];
  });
  const towerCableAnchors = createTowerCableAnchors(cables, guides);
  const deckDetails = [
    ...createDeckDetails(params, guides),
    ...createCableAnchors(cables, guides)
  ];
  const piers = createSubstructure(params, guides);

  return {
    deck,
    towers,
    deckDetails,
    towerFrames: [...towerFrames, ...towerCableAnchors],
    cables,
    piers,
    guides
  };
};
