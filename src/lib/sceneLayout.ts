import type {
  AtmosphereBand,
  BridgeBoxPart,
  BridgeGuides,
  NavigationMarkerData,
  SceneLayoutData,
  TrafficVehicleData,
  BridgeParams,
  Vec3
} from '../types/bridge';
import { sceneAtmosphere, scenePalette } from '../components/scene/sceneLook';

const createCliffBlocks = (params: BridgeParams): BridgeBoxPart[] => {
  const halfSpan = params.spanLength / 2;
  const baseHeight = params.deckElevation + params.towerHeight * 0.2;
  const cliffDepth = params.spanLength * 0.34;
  const leftCenter = -halfSpan - params.deckWidth * 2.2;
  const rightCenter = halfSpan + params.deckWidth * 2.2;

  return [
    {
      id: 'left-cliff-main',
      position: [leftCenter, baseHeight / 2 - 6, -26],
      size: [params.spanLength * 0.44, baseHeight, cliffDepth],
      color: scenePalette.environment.cliffs[0],
      rotation: [0.02, -0.05, -0.02]
    },
    {
      id: 'left-cliff-shelf',
      position: [leftCenter - params.deckWidth * 3.4, params.deckElevation * 0.46, 66],
      size: [params.spanLength * 0.26, params.deckElevation * 0.92, params.spanLength * 0.22],
      color: scenePalette.environment.cliffs[1],
      rotation: [0.01, 0.08, -0.03]
    },
    {
      id: 'left-cliff-rim',
      position: [leftCenter + params.deckWidth * 2.8, baseHeight * 0.62, -140],
      size: [params.spanLength * 0.24, baseHeight * 0.45, params.spanLength * 0.2],
      color: scenePalette.environment.cliffs[2],
      rotation: [0.03, 0.1, 0]
    },
    {
      id: 'right-cliff-main',
      position: [rightCenter, baseHeight / 2 - 4, 18],
      size: [params.spanLength * 0.46, baseHeight * 0.96, cliffDepth],
      color: scenePalette.environment.cliffs[3],
      rotation: [-0.01, 0.06, 0.02]
    },
    {
      id: 'right-cliff-shelf',
      position: [rightCenter + params.deckWidth * 3.8, params.deckElevation * 0.44, -74],
      size: [params.spanLength * 0.28, params.deckElevation * 0.88, params.spanLength * 0.24],
      color: scenePalette.environment.cliffs[4],
      rotation: [0.02, -0.07, 0.02]
    },
    {
      id: 'right-cliff-rim',
      position: [rightCenter - params.deckWidth * 2.6, baseHeight * 0.58, 124],
      size: [params.spanLength * 0.24, baseHeight * 0.42, params.spanLength * 0.19],
      color: scenePalette.environment.cliffs[5],
      rotation: [-0.02, -0.09, 0]
    }
  ];
};

const createShorelineShelves = (
  params: BridgeParams,
  guides: BridgeGuides
): BridgeBoxPart[] => {
  const spanOffset = params.spanLength * 0.52;
  const [leftDeckEndX, rightDeckEndX] = guides.deckEndXs;
  const [leftAbutmentX, rightAbutmentX] = guides.abutmentXs;
  const wingWallLength = Math.max(14, params.deckWidth * 1.15);
  const wingWallDepth = Math.max(10, params.deckWidth * 0.68);
  const bankCenterZ = params.deckWidth * 1.04;
  const bankOuterZ = params.deckWidth * 2.2;
  const transitionOffset = params.deckWidth * 0.72;
  const approachRoadLength = Math.max(28, params.deckWidth * 2.7);
  const approachRoadWidth = params.deckWidth * 1.64;
  const retainingWallLength = Math.max(18, params.deckWidth * 1.48);
  const terraceLength = Math.max(34, params.deckWidth * 2.85);
  const terraceDepth = Math.max(18, params.deckWidth * 1.36);
  const revetmentLength = Math.max(24, params.deckWidth * 2.05);
  const revetmentDepth = Math.max(12, params.deckWidth * 0.92);
  const embankmentLength = Math.max(18, params.deckWidth * 1.68);
  const embankmentDepth = Math.max(12, params.deckWidth * 0.98);
  const leftTransitionX = leftDeckEndX - transitionOffset;
  const rightTransitionX = rightDeckEndX + transitionOffset;
  const leftApproachRoadX = leftAbutmentX - approachRoadLength * 0.52;
  const rightApproachRoadX = rightAbutmentX + approachRoadLength * 0.52;
  const leftRetainingX = leftAbutmentX - retainingWallLength * 0.36;
  const rightRetainingX = rightAbutmentX + retainingWallLength * 0.36;
  const leftTerraceX = leftAbutmentX - terraceLength * 0.22;
  const rightTerraceX = rightAbutmentX + terraceLength * 0.22;
  const leftRevetmentX = (leftAbutmentX + guides.approachPierXs[0]) / 2;
  const rightRevetmentX = (rightAbutmentX + guides.approachPierXs[1]) / 2;
  const leftPierPadX = guides.approachPierXs[0] - params.deckWidth * 0.14;
  const rightPierPadX = guides.approachPierXs[1] + params.deckWidth * 0.14;
  const leftApronX = guides.approachPierXs[0] - params.deckWidth * 0.42;
  const rightApronX = guides.approachPierXs[1] + params.deckWidth * 0.42;
  const leftServiceX = leftApproachRoadX - approachRoadLength * 0.62;
  const rightServiceX = rightApproachRoadX + approachRoadLength * 0.62;
  const leftHarborApronX = leftApronX - params.deckWidth * 0.18;
  const rightHarborApronX = rightApronX + params.deckWidth * 0.18;
  const leftFenderX = guides.approachPierXs[0] - params.deckWidth * 0.22;
  const rightFenderX = guides.approachPierXs[1] + params.deckWidth * 0.22;
  const leftDolphinX = guides.approachPierXs[0] - params.deckWidth * 0.62;
  const rightDolphinX = guides.approachPierXs[1] + params.deckWidth * 0.62;
  const leftBreakwaterX = leftAbutmentX - params.deckWidth * 1.42;
  const rightBreakwaterX = rightAbutmentX + params.deckWidth * 1.42;

  return [
    {
      id: 'abutment-left',
      position: [leftAbutmentX, params.deckElevation * 0.26, bankCenterZ],
      size: [params.deckWidth * 2.4, params.deckElevation * 0.52, params.deckWidth * 4.8],
      color: scenePalette.concrete.abutmentLeft,
      rotation: [0, -0.03, 0]
    },
    {
      id: 'abutment-right',
      position: [rightAbutmentX, params.deckElevation * 0.24, -bankCenterZ],
      size: [params.deckWidth * 2.4, params.deckElevation * 0.48, params.deckWidth * 4.6],
      color: scenePalette.concrete.abutmentRight,
      rotation: [0, 0.03, 0]
    },
    {
      id: 'transition-slab-left',
      position: [leftTransitionX, params.deckElevation * 0.44, 0],
      size: [params.deckWidth * 1.18, 0.6, params.deckWidth * 1.56],
      color: scenePalette.concrete.top,
      rotation: [0, -0.02, 0]
    },
    {
      id: 'transition-slab-right',
      position: [rightTransitionX, params.deckElevation * 0.42, 0],
      size: [params.deckWidth * 1.18, 0.6, params.deckWidth * 1.56],
      color: scenePalette.concrete.top,
      rotation: [0, 0.02, 0]
    },
    {
      id: 'wing-wall-left-inner',
      position: [leftAbutmentX - params.deckWidth * 0.24, params.deckElevation * 0.24, bankCenterZ * 0.42],
      size: [wingWallLength, params.deckElevation * 0.4, wingWallDepth],
      color: scenePalette.concrete.mid,
      rotation: [0, -0.26, 0]
    },
    {
      id: 'wing-wall-left-outer',
      position: [leftAbutmentX - params.deckWidth * 0.12, params.deckElevation * 0.22, bankOuterZ],
      size: [wingWallLength * 0.9, params.deckElevation * 0.34, wingWallDepth],
      color: scenePalette.concrete.base,
      rotation: [0, -0.18, 0]
    },
    {
      id: 'wing-wall-right-inner',
      position: [rightAbutmentX + params.deckWidth * 0.24, params.deckElevation * 0.22, -bankCenterZ * 0.42],
      size: [wingWallLength, params.deckElevation * 0.38, wingWallDepth],
      color: scenePalette.concrete.mid,
      rotation: [0, 0.26, 0]
    },
    {
      id: 'wing-wall-right-outer',
      position: [rightAbutmentX + params.deckWidth * 0.12, params.deckElevation * 0.2, -bankOuterZ],
      size: [wingWallLength * 0.92, params.deckElevation * 0.32, wingWallDepth],
      color: scenePalette.concrete.base,
      rotation: [0, 0.18, 0]
    },
    {
      id: 'approach-road-left',
      position: [leftApproachRoadX, params.deckElevation * 0.46, 0],
      size: [approachRoadLength, 0.42, approachRoadWidth],
      color: scenePalette.road.asphalt,
      rotation: [0, -0.014, 0]
    },
    {
      id: 'approach-road-right',
      position: [rightApproachRoadX, params.deckElevation * 0.46, 0],
      size: [approachRoadLength, 0.42, approachRoadWidth],
      color: scenePalette.road.asphalt,
      rotation: [0, 0.014, 0]
    },
    {
      id: 'embankment-left-inner',
      position: [leftAbutmentX - params.deckWidth * 0.42, params.deckElevation * 0.17, bankCenterZ],
      size: [embankmentLength, params.deckElevation * 0.3, embankmentDepth],
      color: scenePalette.environment.shoreline[0],
      rotation: [0.04, -0.12, -0.07]
    },
    {
      id: 'embankment-left-outer',
      position: [leftAbutmentX - params.deckWidth * 0.88, params.deckElevation * 0.13, bankOuterZ + params.deckWidth * 0.28],
      size: [embankmentLength * 1.08, params.deckElevation * 0.22, embankmentDepth * 1.18],
      color: scenePalette.environment.shoreline[1],
      rotation: [0.05, -0.18, -0.08]
    },
    {
      id: 'embankment-right-inner',
      position: [rightAbutmentX + params.deckWidth * 0.42, params.deckElevation * 0.16, -bankCenterZ],
      size: [embankmentLength, params.deckElevation * 0.28, embankmentDepth],
      color: scenePalette.environment.shoreline[0],
      rotation: [-0.04, 0.12, 0.07]
    },
    {
      id: 'embankment-right-outer',
      position: [rightAbutmentX + params.deckWidth * 0.88, params.deckElevation * 0.12, -bankOuterZ - params.deckWidth * 0.28],
      size: [embankmentLength * 1.08, params.deckElevation * 0.22, embankmentDepth * 1.18],
      color: scenePalette.environment.shoreline[1],
      rotation: [-0.05, 0.18, 0.08]
    },
    {
      id: 'retaining-wall-left',
      position: [leftRetainingX, params.deckElevation * 0.2, bankCenterZ * 0.68],
      size: [retainingWallLength, params.deckElevation * 0.34, Math.max(2.8, params.deckWidth * 0.18)],
      color: scenePalette.concrete.dark,
      rotation: [0, -0.1, 0]
    },
    {
      id: 'retaining-wall-right',
      position: [rightRetainingX, params.deckElevation * 0.19, -bankCenterZ * 0.68],
      size: [retainingWallLength, params.deckElevation * 0.32, Math.max(2.8, params.deckWidth * 0.18)],
      color: scenePalette.concrete.dark,
      rotation: [0, 0.1, 0]
    },
    {
      id: 'shore-terrace-left',
      position: [leftTerraceX, params.deckElevation * 0.12, bankOuterZ + params.deckWidth * 1.18],
      size: [terraceLength, params.deckElevation * 0.18, terraceDepth],
      color: scenePalette.environment.shoreline[2],
      rotation: [0.02, -0.1, 0]
    },
    {
      id: 'shore-terrace-right',
      position: [rightTerraceX, params.deckElevation * 0.11, -bankOuterZ - params.deckWidth * 1.18],
      size: [terraceLength, params.deckElevation * 0.18, terraceDepth],
      color: scenePalette.environment.shoreline[2],
      rotation: [-0.02, 0.1, 0]
    },
    {
      id: 'revetment-left',
      position: [leftRevetmentX, params.deckElevation * 0.05, bankOuterZ + params.deckWidth * 0.78],
      size: [revetmentLength, params.deckElevation * 0.12, revetmentDepth],
      color: scenePalette.environment.shoreline[3],
      rotation: [0.08, -0.06, -0.12]
    },
    {
      id: 'revetment-right',
      position: [rightRevetmentX, params.deckElevation * 0.05, -bankOuterZ - params.deckWidth * 0.78],
      size: [revetmentLength, params.deckElevation * 0.12, revetmentDepth],
      color: scenePalette.environment.shoreline[3],
      rotation: [0.08, 0.06, 0.12]
    },
    {
      id: 'pier-pad-left',
      position: [leftPierPadX, 1.8, bankCenterZ + params.deckWidth * 0.34],
      size: [params.deckWidth * 0.9, 1.2, params.deckWidth * 0.72],
      color: scenePalette.concrete.footing
    },
    {
      id: 'pier-pad-right',
      position: [rightPierPadX, 1.8, -bankCenterZ - params.deckWidth * 0.34],
      size: [params.deckWidth * 0.9, 1.2, params.deckWidth * 0.72],
      color: scenePalette.concrete.footing
    },
    {
      id: 'maintenance-apron-left',
      position: [leftApronX, 2.6, bankCenterZ * 0.86],
      size: [params.deckWidth * 1.04, 0.48, params.deckWidth * 0.82],
      color: scenePalette.concrete.mid,
      rotation: [0, -0.04, 0]
    },
    {
      id: 'maintenance-apron-right',
      position: [rightApronX, 2.6, -bankCenterZ * 0.86],
      size: [params.deckWidth * 1.04, 0.48, params.deckWidth * 0.82],
      color: scenePalette.concrete.mid,
      rotation: [0, 0.04, 0]
    },
    {
      id: 'service-yard-left',
      position: [leftServiceX, params.deckElevation * 0.4, bankCenterZ * 0.3],
      size: [approachRoadLength * 0.94, 0.32, params.deckWidth * 1.3],
      color: scenePalette.concrete.dark,
      rotation: [0, -0.02, 0]
    },
    {
      id: 'service-yard-right',
      position: [rightServiceX, params.deckElevation * 0.4, -bankCenterZ * 0.3],
      size: [approachRoadLength * 0.94, 0.32, params.deckWidth * 1.3],
      color: scenePalette.concrete.dark,
      rotation: [0, 0.02, 0]
    },
    {
      id: 'harbor-apron-left',
      position: [leftHarborApronX, 1.9, bankCenterZ * 1.18],
      size: [params.deckWidth * 1.34, 0.44, params.deckWidth * 0.98],
      color: scenePalette.concrete.base,
      rotation: [0, -0.06, 0]
    },
    {
      id: 'harbor-apron-right',
      position: [rightHarborApronX, 1.9, -bankCenterZ * 1.18],
      size: [params.deckWidth * 1.34, 0.44, params.deckWidth * 0.98],
      color: scenePalette.concrete.base,
      rotation: [0, 0.06, 0]
    },
    {
      id: 'fender-wall-left',
      position: [leftFenderX, 1.7, bankCenterZ * 1.42],
      size: [params.deckWidth * 0.92, 1.8, params.deckWidth * 0.18],
      color: scenePalette.concrete.footing,
      rotation: [0, -0.08, 0]
    },
    {
      id: 'fender-wall-right',
      position: [rightFenderX, 1.7, -bankCenterZ * 1.42],
      size: [params.deckWidth * 0.92, 1.8, params.deckWidth * 0.18],
      color: scenePalette.concrete.footing,
      rotation: [0, 0.08, 0]
    },
    {
      id: 'mooring-dolphin-left',
      position: [leftDolphinX, 2.2, bankCenterZ * 1.72],
      size: [params.deckWidth * 0.28, 2.6, params.deckWidth * 0.28],
      color: scenePalette.concrete.footing
    },
    {
      id: 'mooring-dolphin-right',
      position: [rightDolphinX, 2.2, -bankCenterZ * 1.72],
      size: [params.deckWidth * 0.28, 2.6, params.deckWidth * 0.28],
      color: scenePalette.concrete.footing
    },
    {
      id: 'breakwater-left',
      position: [leftBreakwaterX, 1.2, bankOuterZ + params.deckWidth * 2.4],
      size: [params.deckWidth * 2.2, 2.4, params.deckWidth * 0.56],
      color: scenePalette.environment.shoreline[1],
      rotation: [0.04, -0.14, 0]
    },
    {
      id: 'breakwater-right',
      position: [rightBreakwaterX, 1.2, -bankOuterZ - params.deckWidth * 2.4],
      size: [params.deckWidth * 2.2, 2.4, params.deckWidth * 0.56],
      color: scenePalette.environment.shoreline[1],
      rotation: [0.04, 0.14, 0]
    },
    {
      id: 'maintenance-shed-left',
      position: [leftServiceX - params.deckWidth * 0.18, params.deckElevation * 0.56, bankCenterZ * 0.72],
      size: [params.deckWidth * 0.52, params.deckElevation * 0.22, params.deckWidth * 0.34],
      color: scenePalette.concrete.mid,
      rotation: [0, -0.04, 0]
    },
    {
      id: 'maintenance-shed-right',
      position: [rightServiceX + params.deckWidth * 0.18, params.deckElevation * 0.56, -bankCenterZ * 0.72],
      size: [params.deckWidth * 0.52, params.deckElevation * 0.22, params.deckWidth * 0.34],
      color: scenePalette.concrete.mid,
      rotation: [0, 0.04, 0]
    },
    {
      id: 'light-pole-base-left',
      position: [leftHarborApronX + params.deckWidth * 0.28, 2.2, bankCenterZ * 1.02],
      size: [params.deckWidth * 0.1, 1.4, params.deckWidth * 0.1],
      color: scenePalette.concrete.dark
    },
    {
      id: 'light-pole-base-right',
      position: [rightHarborApronX - params.deckWidth * 0.28, 2.2, -bankCenterZ * 1.02],
      size: [params.deckWidth * 0.1, 1.4, params.deckWidth * 0.1],
      color: scenePalette.concrete.dark
    },
    {
      id: 'bollard-left-1',
      position: [leftHarborApronX - params.deckWidth * 0.18, 2.3, bankCenterZ * 1.42],
      size: [params.deckWidth * 0.08, 0.36, params.deckWidth * 0.08],
      color: scenePalette.concrete.dark
    },
    {
      id: 'bollard-left-2',
      position: [leftHarborApronX + params.deckWidth * 0.22, 2.3, bankCenterZ * 1.46],
      size: [params.deckWidth * 0.08, 0.36, params.deckWidth * 0.08],
      color: scenePalette.concrete.dark
    },
    {
      id: 'bollard-right-1',
      position: [rightHarborApronX + params.deckWidth * 0.18, 2.3, -bankCenterZ * 1.42],
      size: [params.deckWidth * 0.08, 0.36, params.deckWidth * 0.08],
      color: scenePalette.concrete.dark
    },
    {
      id: 'bollard-right-2',
      position: [rightHarborApronX - params.deckWidth * 0.22, 2.3, -bankCenterZ * 1.46],
      size: [params.deckWidth * 0.08, 0.36, params.deckWidth * 0.08],
      color: scenePalette.concrete.dark
    },
    {
      id: 'shore-left',
      position: [-spanOffset, params.deckElevation * 0.18, 132],
      size: [params.spanLength * 0.52, params.deckElevation * 0.36, params.spanLength * 0.18],
      color: scenePalette.environment.shoreline[0],
      rotation: [0, -0.05, 0]
    },
    {
      id: 'shore-right',
      position: [spanOffset, params.deckElevation * 0.16, -140],
      size: [params.spanLength * 0.5, params.deckElevation * 0.32, params.spanLength * 0.2],
      color: scenePalette.environment.shoreline[1],
      rotation: [0, 0.04, 0]
    },
    {
      id: 'shoal-left',
      position: [-Math.abs(guides.approachPierXs[0]) * 0.52, 2.8, 188],
      size: [params.spanLength * 0.3, 5.6, params.spanLength * 0.14],
      color: scenePalette.environment.shoreline[2]
    },
    {
      id: 'shoal-right',
      position: [Math.abs(guides.approachPierXs[1]) * 0.6, 2.4, -196],
      size: [params.spanLength * 0.28, 4.8, params.spanLength * 0.12],
      color: scenePalette.environment.shoreline[3]
    }
  ];
};

const createBackdropSilhouettes = (params: BridgeParams): BridgeBoxPart[] => [
  {
    id: 'ridge-west',
    position: [-params.spanLength * 0.88, params.deckElevation * 0.58, -420],
    size: [params.spanLength * 0.92, params.deckElevation * 0.46, params.spanLength * 0.22],
    color: scenePalette.environment.backdrops[0],
    rotation: [0, 0.02, 0]
  },
  {
    id: 'ridge-east',
    position: [params.spanLength * 0.82, params.deckElevation * 0.54, -452],
    size: [params.spanLength * 0.88, params.deckElevation * 0.42, params.spanLength * 0.18],
    color: scenePalette.environment.backdrops[1],
    rotation: [0, -0.04, 0]
  },
  {
    id: 'ridge-far',
    position: [0, params.deckElevation * 0.64, -580],
    size: [params.spanLength * 1.8, params.deckElevation * 0.5, params.spanLength * 0.16],
    color: scenePalette.environment.backdrops[2]
  }
];

const createAtmosphereBands = (params: BridgeParams): AtmosphereBand[] => {
  const baseBandHeight = Math.max(5.5, params.deckElevation * 0.1);

  return [
    {
      id: 'fog-band-near',
      position: [0, params.deckElevation * 0.18, 40],
      size: [params.spanLength * 1.75, baseBandHeight, params.spanLength * 0.72],
      color: sceneAtmosphere.near.color,
      opacity: sceneAtmosphere.near.opacity,
      driftSpeed: sceneAtmosphere.near.driftSpeed,
      driftRange: sceneAtmosphere.near.driftRange
    },
    {
      id: 'fog-band-mid',
      position: [0, params.deckElevation * 0.12, -86],
      size: [params.spanLength * 1.92, baseBandHeight * 1.18, params.spanLength * 0.84],
      color: sceneAtmosphere.mid.color,
      opacity: sceneAtmosphere.mid.opacity,
      driftSpeed: sceneAtmosphere.mid.driftSpeed,
      driftRange: sceneAtmosphere.mid.driftRange
    },
    {
      id: 'fog-band-far',
      position: [0, params.deckElevation * 0.1, -218],
      size: [params.spanLength * 2.3, baseBandHeight * 1.28, params.spanLength * 0.92],
      color: sceneAtmosphere.far.color,
      opacity: sceneAtmosphere.far.opacity,
      driftSpeed: sceneAtmosphere.far.driftSpeed,
      driftRange: sceneAtmosphere.far.driftRange
    }
  ];
};

const vehiclePalette = scenePalette.traffic.body;

const createTrafficVehicles = (
  params: BridgeParams,
  guides: BridgeGuides
): TrafficVehicleData[] => {
  const halfSpan = params.spanLength / 2;
  const laneInset = params.deckWidth * 1.05;
  const travelStart = -halfSpan + laneInset;
  const travelEnd = halfSpan - laneInset;
  const vehicles: TrafficVehicleData[] = [];

  for (let index = 0; index < 8; index += 1) {
    const isNorthbound = index < 4;
    const paletteIndex = index % vehiclePalette.length;
    const directionStart = isNorthbound ? travelStart : travelEnd;
    const directionEnd = isNorthbound ? travelEnd : travelStart;
    const progress = (index % 4) / 4 + (isNorthbound ? 0 : 0.125);
    const size: Vec3 = [4.8 + (index % 2) * 0.9, 1.45 + (index % 3) * 0.08, 2.02];

    vehicles.push({
      id: `vehicle-${index + 1}`,
      size,
      color: vehiclePalette[paletteIndex],
      laneZ: isNorthbound ? guides.laneCentersZ[0] : guides.laneCentersZ[1],
      baseY: guides.roadSurfaceY + size[1] / 2 + 0.12,
      travelStartX: directionStart,
      travelEndX: directionEnd,
      speed: 0.045 + (index % 4) * 0.012,
      progress
    });
  }

  return vehicles;
};

const createNavigationMarkers = (
  params: BridgeParams,
  guides: BridgeGuides
): NavigationMarkerData[] => {
  const bankZ = params.deckWidth * 1.8;
  const channelZ = params.deckWidth * 2.34;
  const leftInnerX = guides.approachPierXs[0] - params.deckWidth * 0.6;
  const rightInnerX = guides.approachPierXs[1] + params.deckWidth * 0.6;
  const leftOuterX = guides.abutmentXs[0] - params.deckWidth * 1.08;
  const rightOuterX = guides.abutmentXs[1] + params.deckWidth * 1.08;

  return [
    {
      id: 'buoy-left-channel',
      kind: 'buoy',
      position: [leftInnerX, 0.34, channelZ],
      color: scenePalette.navigation.buoy,
      bobRange: 0.22,
      bobSpeed: 1.1,
      blinkSpeed: 0
    },
    {
      id: 'buoy-right-channel',
      kind: 'buoy',
      position: [rightInnerX, 0.34, -channelZ],
      color: scenePalette.navigation.buoy,
      bobRange: 0.22,
      bobSpeed: 1.1,
      blinkSpeed: 0
    },
    {
      id: 'beacon-left-harbor',
      kind: 'beacon',
      position: [leftOuterX, 0.4, bankZ],
      color: scenePalette.navigation.beacon,
      bobRange: 0,
      bobSpeed: 0,
      blinkSpeed: 1.6
    },
    {
      id: 'beacon-right-harbor',
      kind: 'beacon',
      position: [rightOuterX, 0.4, -bankZ],
      color: scenePalette.navigation.beacon,
      bobRange: 0,
      bobSpeed: 0,
      blinkSpeed: 1.6
    }
  ];
};

export const advanceTrafficProgress = (
  progress: number,
  speed: number,
  delta: number
): number => {
  const next = progress + speed * delta;

  return next - Math.floor(next);
};

export const getTrafficVehiclePosition = (
  vehicle: TrafficVehicleData,
  progress: number
): Vec3 => [
  vehicle.travelStartX + (vehicle.travelEndX - vehicle.travelStartX) * progress,
  vehicle.baseY,
  vehicle.laneZ
];

export const generateSceneLayout = (
  params: BridgeParams,
  guides: BridgeGuides
): SceneLayoutData => ({
  cliffs: createCliffBlocks(params),
  shoreline: createShorelineShelves(params, guides),
  backdrops: createBackdropSilhouettes(params),
  atmosphereBands: createAtmosphereBands(params),
  trafficVehicles: createTrafficVehicles(params, guides),
  navigationMarkers: createNavigationMarkers(params, guides)
});
