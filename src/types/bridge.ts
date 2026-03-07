export type Vec3 = [number, number, number];

export type BridgeParams = {
  spanLength: number;
  deckElevation: number;
  deckWidth: number;
  towerHeight: number;
  cableCountPerSide: number;
  cableSlope: number;
};

export type BridgePreset = {
  id: string;
  label: string;
  params: BridgeParams;
};

export type CameraPreset = 'hero' | 'front' | 'side';

export type BridgeSceneHandle = {
  exportPng: () => void;
};

export type ShareableBridgeState = {
  params: BridgeParams;
  selectedPreset: string;
  cameraPreset: CameraPreset;
};

export type SavedBridgePreset = {
  id: string;
  name: string;
  snapshot: ShareableBridgeState;
  updatedAt: string;
};

export type BridgeBoxPart = {
  id: string;
  position: Vec3;
  size: Vec3;
  color: string;
  rotation?: Vec3;
};

export type BridgeCable = {
  id: string;
  start: Vec3;
  end: Vec3;
  color: string;
};

export type TrafficVehicleData = {
  id: string;
  size: Vec3;
  color: string;
  laneZ: number;
  baseY: number;
  travelStartX: number;
  travelEndX: number;
  speed: number;
  progress: number;
};

export type NavigationMarkerData = {
  id: string;
  kind: 'buoy' | 'beacon';
  position: Vec3;
  color: string;
  bobRange: number;
  bobSpeed: number;
  blinkSpeed: number;
};

export type BridgeGuides = {
  roadSurfaceY: number;
  deckSoffitY: number;
  roadHalfWidth: number;
  laneCentersZ: [number, number];
  deckEndXs: [number, number];
  abutmentXs: [number, number];
  deckEdgeZ: number;
  deckFasciaZ: number;
  parapetZ: number;
  walkwayZ: number;
  jointXs: number[];
  diaphragmXs: number[];
  cablePlaneOffsetsZ: [number, number];
  towerXs: [number, number];
  towerInnerClearZ: number;
  towerCableAnchorZ: number;
  towerCableAnchorInsetX: number;
  approachPierXs: [number, number];
};

export type AtmosphereBand = {
  id: string;
  position: Vec3;
  size: Vec3;
  color: string;
  opacity: number;
  driftSpeed: number;
  driftRange: number;
};

export type BridgeModelData = {
  deck: BridgeBoxPart;
  towers: BridgeBoxPart[];
  deckDetails: BridgeBoxPart[];
  towerFrames: BridgeBoxPart[];
  cables: BridgeCable[];
  piers: BridgeBoxPart[];
  guides: BridgeGuides;
};

export type SceneLayoutData = {
  cliffs: BridgeBoxPart[];
  shoreline: BridgeBoxPart[];
  backdrops: BridgeBoxPart[];
  atmosphereBands: AtmosphereBand[];
  trafficVehicles: TrafficVehicleData[];
  navigationMarkers: NavigationMarkerData[];
};
