export const scenePalette = {
  concrete: {
    base: '#b7b5b1',
    mid: '#c5c3bf',
    top: '#d3d0cb',
    dark: '#999792',
    footing: '#817f7a',
    abutmentLeft: '#a8afb5',
    abutmentRight: '#a1a8ae'
  },
  steel: {
    core: '#5d6d7c',
    soffit: '#44535f',
    fascia: '#70808d',
    hardware: '#4c5a66'
  },
  road: {
    asphalt: '#30343a',
    laneMarker: '#e1c69b'
  },
  hardware: {
    guardrail: '#b8c0c7',
    cableAnchor: '#bcc4cc'
  },
  cable: {
    main: '#dbe2ea'
  },
  water: {
    base: '#506b84',
    shimmer: '#afc4cf'
  },
  environment: {
    background: '#ddd1c8',
    fog: '#cfc4b8',
    cliffs: ['#666b63', '#595d56', '#83867f', '#6b7067', '#5f635b', '#8a8d84'],
    shoreline: ['#7f755e', '#786d58', '#94846a', '#8a7d63'],
    backdrops: ['#8f938d', '#7b8079', '#a1a49e']
  },
  traffic: {
    body: ['#f4f1eb', '#d7b587', '#aab9c9', '#d7dce1', '#cbb08c', '#edf0f4'],
    cabin: '#222830'
  },
  navigation: {
    buoy: '#cf6e52',
    buoyStripe: '#efe7dc',
    beacon: '#6c7379',
    lightOn: '#ffd79a',
    lightOff: '#685f55'
  }
} as const;

export const sceneLighting = {
  background: scenePalette.environment.background,
  fogArgs: [scenePalette.environment.fog, 180, 980] as const,
  ambientIntensity: 0.34,
  hemisphereArgs: ['#f3cba8', '#3d4f64', 0.58] as const,
  directional: {
    color: '#ffd1a6',
    intensity: 1.24,
    position: [164, 118, -190] as const
  }
} as const;

export const sceneSky = {
  distance: 450000,
  inclination: 0.53,
  azimuth: 0.22,
  mieCoefficient: 0.0055,
  rayleigh: 0.72,
  turbidity: 8.6
} as const;

export const sceneAtmosphere = {
  near: {
    color: '#ece2d8',
    opacity: 0.08,
    driftSpeed: 0.13,
    driftRange: 12
  },
  mid: {
    color: '#d6cec7',
    opacity: 0.06,
    driftSpeed: 0.09,
    driftRange: 18
  },
  far: {
    color: '#bbb7b3',
    opacity: 0.045,
    driftSpeed: 0.06,
    driftRange: 24
  }
} as const;
