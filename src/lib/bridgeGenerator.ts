import type {
  BridgeBoxPart,
  BridgeCable,
  BridgeGuides,
  BridgeModelData,
  BridgeParams
} from '../types/bridge';

const DECK_THICKNESS = 4.2;
const ROAD_SURFACE_THICKNESS = 0.42;
const TOWER_RATIO = 0.19;
const PYLON_CONCRETE_BASE = '#b8c0c9';
const PYLON_CONCRETE_MID = '#c2cad3';
const PYLON_CONCRETE_TOP = '#cbd3db';
const PYLON_CONCRETE_DARK = '#9aa5b0';
const PYLON_CONCRETE_FOOTING = '#858f9a';
const GIRDER_STEEL = '#5f7384';
const GIRDER_STEEL_DARK = '#465968';
const GIRDER_STEEL_LIGHT = '#708495';
const GIRDER_HARDWARE = '#4b5d6a';
const CABLE_HARDWARE = '#b6c0c8';
const ASPHALT = '#333941';
const STEEL_CABLE = '#d7dee8';
const CONCRETE = '#aab3bd';

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
    color: '#f6d9a8'
  }));
};

const createDeckDetails = (params: BridgeParams, guides: BridgeGuides): BridgeBoxPart[] => {
  const shoulderWidth = Math.max(1.15, params.deckWidth * 0.11);
  const roadWidth = Math.max(8, guides.roadHalfWidth * 2);
  const roadSurfaceCenterY = guides.roadSurfaceY - ROAD_SURFACE_THICKNESS / 2;
  const spanInset = params.deckWidth * 0.9;
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
      id: 'guardrail-left',
      position: [0, guides.roadSurfaceY + 0.82, guides.deckEdgeZ - 0.14],
      size: [params.spanLength * 0.985, 1.1, 0.18],
      color: '#b1b9c2'
    },
    {
      id: 'guardrail-right',
      position: [0, guides.roadSurfaceY + 0.82, -guides.deckEdgeZ + 0.14],
      size: [params.spanLength * 0.985, 1.1, 0.18],
      color: '#b1b9c2'
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
    ...createLaneMarkers(params, spanInset, guides.roadSurfaceY)
  ];
};

const createCableAnchors = (
  cables: BridgeCable[],
  guides: BridgeGuides
): BridgeBoxPart[] =>
  cables.flatMap((cable) => {
    const sideSign = Math.sign(cable.end[2]) || 1;
    const housingOffsetZ = Math.max(0.34, guides.deckEdgeZ * 0.04);

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
          cable.end[2] + sideSign * housingOffsetZ
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
  const deckSoffitY = params.deckElevation - DECK_THICKNESS / 2 + 0.22;
  const cablePlaneOffset = deckEdgeZ + Math.max(0.38, params.deckWidth * 0.03);
  const towerX = params.spanLength * TOWER_RATIO;
  const approachPierOffset = towerX + (halfDeck - towerX) * 0.52;
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
    deckEdgeZ,
    deckFasciaZ,
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
        color: '#8894a0'
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
        color: '#c7ced5'
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
        color: '#95a0ab'
      },
      {
        id: `bearing-seat-${side}`,
        position: [towerX, guides.deckSoffitY + 0.62, 0],
        size: [params.deckWidth * 0.72, bearingHeight, params.deckWidth * 0.44],
        color: '#d4d9df'
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
