import type {
  AtmosphereBand,
  BridgeBoxPart,
  BridgeGuides,
  SceneLayoutData,
  TrafficVehicleData,
  BridgeParams,
  Vec3
} from '../types/bridge';

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
      color: '#4d5e46',
      rotation: [0.02, -0.05, -0.02]
    },
    {
      id: 'left-cliff-shelf',
      position: [leftCenter - params.deckWidth * 3.4, params.deckElevation * 0.46, 66],
      size: [params.spanLength * 0.26, params.deckElevation * 0.92, params.spanLength * 0.22],
      color: '#42533d',
      rotation: [0.01, 0.08, -0.03]
    },
    {
      id: 'left-cliff-rim',
      position: [leftCenter + params.deckWidth * 2.8, baseHeight * 0.62, -140],
      size: [params.spanLength * 0.24, baseHeight * 0.45, params.spanLength * 0.2],
      color: '#61705a',
      rotation: [0.03, 0.1, 0]
    },
    {
      id: 'right-cliff-main',
      position: [rightCenter, baseHeight / 2 - 4, 18],
      size: [params.spanLength * 0.46, baseHeight * 0.96, cliffDepth],
      color: '#51624a',
      rotation: [-0.01, 0.06, 0.02]
    },
    {
      id: 'right-cliff-shelf',
      position: [rightCenter + params.deckWidth * 3.8, params.deckElevation * 0.44, -74],
      size: [params.spanLength * 0.28, params.deckElevation * 0.88, params.spanLength * 0.24],
      color: '#44533d',
      rotation: [0.02, -0.07, 0.02]
    },
    {
      id: 'right-cliff-rim',
      position: [rightCenter - params.deckWidth * 2.6, baseHeight * 0.58, 124],
      size: [params.spanLength * 0.24, baseHeight * 0.42, params.spanLength * 0.19],
      color: '#68765f',
      rotation: [-0.02, -0.09, 0]
    }
  ];
};

const createShorelineShelves = (
  params: BridgeParams,
  guides: BridgeGuides
): BridgeBoxPart[] => {
  const halfSpan = params.spanLength / 2;
  const spanOffset = params.spanLength * 0.52;
  const abutmentReach = Math.max(
    params.deckWidth * 0.9,
    (halfSpan - Math.abs(guides.approachPierXs[0])) * 0.42
  );
  const abutmentOffset = halfSpan + abutmentReach;

  return [
    {
      id: 'abutment-left',
      position: [-abutmentOffset, params.deckElevation * 0.26, 48],
      size: [params.deckWidth * 2.4, params.deckElevation * 0.52, params.deckWidth * 4.8],
      color: '#9ea7b0',
      rotation: [0, -0.03, 0]
    },
    {
      id: 'abutment-right',
      position: [abutmentOffset, params.deckElevation * 0.24, -46],
      size: [params.deckWidth * 2.4, params.deckElevation * 0.48, params.deckWidth * 4.6],
      color: '#98a2ab',
      rotation: [0, 0.03, 0]
    },
    {
      id: 'shore-left',
      position: [-spanOffset, params.deckElevation * 0.18, 132],
      size: [params.spanLength * 0.52, params.deckElevation * 0.36, params.spanLength * 0.18],
      color: '#74694c',
      rotation: [0, -0.05, 0]
    },
    {
      id: 'shore-right',
      position: [spanOffset, params.deckElevation * 0.16, -140],
      size: [params.spanLength * 0.5, params.deckElevation * 0.32, params.spanLength * 0.2],
      color: '#6d6248',
      rotation: [0, 0.04, 0]
    },
    {
      id: 'shoal-left',
      position: [-Math.abs(guides.approachPierXs[0]) * 0.52, 2.8, 188],
      size: [params.spanLength * 0.3, 5.6, params.spanLength * 0.14],
      color: '#8d7e5e'
    },
    {
      id: 'shoal-right',
      position: [Math.abs(guides.approachPierXs[1]) * 0.6, 2.4, -196],
      size: [params.spanLength * 0.28, 4.8, params.spanLength * 0.12],
      color: '#85785a'
    }
  ];
};

const createBackdropSilhouettes = (params: BridgeParams): BridgeBoxPart[] => [
  {
    id: 'ridge-west',
    position: [-params.spanLength * 0.88, params.deckElevation * 0.58, -420],
    size: [params.spanLength * 0.92, params.deckElevation * 0.46, params.spanLength * 0.22],
    color: '#7f837b',
    rotation: [0, 0.02, 0]
  },
  {
    id: 'ridge-east',
    position: [params.spanLength * 0.82, params.deckElevation * 0.54, -452],
    size: [params.spanLength * 0.88, params.deckElevation * 0.42, params.spanLength * 0.18],
    color: '#737870',
    rotation: [0, -0.04, 0]
  },
  {
    id: 'ridge-far',
    position: [0, params.deckElevation * 0.64, -580],
    size: [params.spanLength * 1.8, params.deckElevation * 0.5, params.spanLength * 0.16],
    color: '#8c8f88'
  }
];

const createAtmosphereBands = (params: BridgeParams): AtmosphereBand[] => {
  const baseBandHeight = Math.max(5.5, params.deckElevation * 0.1);

  return [
    {
      id: 'fog-band-near',
      position: [0, params.deckElevation * 0.18, 40],
      size: [params.spanLength * 1.75, baseBandHeight, params.spanLength * 0.72],
      color: '#f5eee7',
      opacity: 0.12,
      driftSpeed: 0.17,
      driftRange: 18
    },
    {
      id: 'fog-band-mid',
      position: [0, params.deckElevation * 0.12, -86],
      size: [params.spanLength * 1.92, baseBandHeight * 1.18, params.spanLength * 0.84],
      color: '#ded8d0',
      opacity: 0.1,
      driftSpeed: 0.12,
      driftRange: 24
    },
    {
      id: 'fog-band-far',
      position: [0, params.deckElevation * 0.1, -218],
      size: [params.spanLength * 2.3, baseBandHeight * 1.28, params.spanLength * 0.92],
      color: '#cbc8c5',
      opacity: 0.08,
      driftSpeed: 0.08,
      driftRange: 32
    }
  ];
};

const vehiclePalette = ['#f8f5ef', '#f6b76d', '#b3d0e8', '#d9dee5', '#ffc68f', '#f0f4ff'];

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
  trafficVehicles: createTrafficVehicles(params, guides)
});
