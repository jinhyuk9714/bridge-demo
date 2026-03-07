export type AgentWorkflowMode = 'hybrid';
export type AgentSplitBasis = 'subsystem';
export type AgentIsolationMode = 'worktree';
export type ReviewGate = 'spec-review' | 'code-quality-review';
export type AgentLaneId =
  | 'scene-hud'
  | 'geometry-generator'
  | 'store-share'
  | 'build-perf';

export type LaneDefinition = {
  id: AgentLaneId;
  label: string;
  editablePrefixes: string[];
  defaultChecks: string[];
  completionCriteria: string[];
};

export type WorkflowPolicy = {
  mode: AgentWorkflowMode;
  splitBasis: AgentSplitBasis;
  isolationMode: AgentIsolationMode;
  reviewGates: readonly [ReviewGate, ReviewGate];
  sharedHotspots: string[];
};

export type TaskClassification = {
  lanes: AgentLaneId[];
  sharedHotspots: string[];
};

export type TaskPacketInput = {
  topic: string;
  goal: string;
  editablePaths: string[];
  protectedPaths: string[];
};

export type TaskPacket = {
  topic: string;
  goal: string;
  lane: LaneDefinition;
  editablePaths: string[];
  protectedPaths: string[];
  branchName: string;
  worktreePath: string;
  requiredChecks: string[];
  reviewGates: readonly [ReviewGate, ReviewGate];
  completionCriteria: string[];
};

export const AGENT_WORKFLOW_POLICY: WorkflowPolicy = {
  mode: 'hybrid',
  splitBasis: 'subsystem',
  isolationMode: 'worktree',
  reviewGates: ['spec-review', 'code-quality-review'],
  sharedHotspots: [
    'src/components/BridgeScene.tsx',
    'src/lib/bridgeGenerator.ts',
    'src/types/bridge.ts',
    'src/styles.css'
  ]
};

export const LANE_DEFINITIONS: LaneDefinition[] = [
  {
    id: 'scene-hud',
    label: 'Scene / HUD',
    editablePrefixes: [
      'src/App.tsx',
      'src/components/BridgeScene.tsx',
      'src/components/scene/',
      'src/components/BridgeControls.tsx',
      'src/components/PresetSwitcher.tsx',
      'src/styles.css'
    ],
    defaultChecks: ['npm test -- --run', 'npm run build'],
    completionCriteria: [
      'HUD and scene interactions stay within the assigned lane scope.',
      'No shared hotspot is modified without explicit controller approval.'
    ]
  },
  {
    id: 'geometry-generator',
    label: 'Geometry / Generator',
    editablePrefixes: [
      'src/lib/bridgeGenerator.ts',
      'src/lib/sceneLayout.ts',
      'src/data/bridgePresets.ts'
    ],
    defaultChecks: ['npm test -- --run', 'npm run build'],
    completionCriteria: [
      'Bridge geometry or environment generation remains deterministic for the lane scope.',
      'Type or contract changes are escalated to the controller before integration.'
    ]
  },
  {
    id: 'store-share',
    label: 'Store / Share',
    editablePrefixes: [
      'src/store/bridgeStore.ts',
      'src/lib/shareState.ts',
      'src/lib/exportImage.ts'
    ],
    defaultChecks: ['npm test -- --run', 'npm run build'],
    completionCriteria: [
      'State, preset, and share flows remain compatible with the current UI contract.',
      'No scene or generator file is changed inside this lane packet.'
    ]
  },
  {
    id: 'build-perf',
    label: 'Build / Performance',
    editablePrefixes: [
      'vite.config.ts',
      'src/build/',
      'package.json',
      'src/viteManualChunks.test.ts'
    ],
    defaultChecks: ['npm test -- --run', 'npm run build'],
    completionCriteria: [
      'Chunking or build changes preserve current runtime behavior.',
      'Build-oriented edits stay isolated from scene and generator implementation details.'
    ]
  }
];

const SAFE_PARALLEL_PAIRS = new Set([
  'build-perf|store-share',
  'scene-hud|store-share'
]);

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const unique = <T>(values: T[]) => Array.from(new Set(values));

const getLaneForPath = (path: string): AgentLaneId[] =>
  LANE_DEFINITIONS.filter((lane) =>
    lane.editablePrefixes.some((prefix) => path.startsWith(prefix))
  ).map((lane) => lane.id);

export const classifyTaskPaths = (paths: string[]): TaskClassification => {
  const lanes = unique(
    paths.flatMap((path) => {
      const directMatches = getLaneForPath(path);

      if (directMatches.length > 0) {
        return directMatches;
      }

      if (path.startsWith('src/components/')) {
        return ['scene-hud'];
      }

      if (path.startsWith('src/lib/')) {
        return ['geometry-generator'];
      }

      return [];
    })
  ).sort() as AgentLaneId[];

  const sharedHotspots = AGENT_WORKFLOW_POLICY.sharedHotspots.filter((hotspot) =>
    paths.includes(hotspot)
  );

  return { lanes, sharedHotspots };
};

export const canRunInParallel = (lanes: AgentLaneId[]) => {
  const normalized = unique(lanes).sort();

  if (normalized.length <= 1) {
    return { allowed: false, reason: 'Parallel execution requires at least two independent lanes.' };
  }

  if (normalized.length > 2) {
    return { allowed: false, reason: 'This workflow only permits two-lane parallel batches.' };
  }

  const pairKey = normalized.join('|');

  if (SAFE_PARALLEL_PAIRS.has(pairKey)) {
    return { allowed: true as const };
  }

  return {
    allowed: false as const,
    reason: 'This lane pair is treated as shared-state or shared-contract sensitive.'
  };
};

const resolveSingleLane = (editablePaths: string[]) => {
  const classification = classifyTaskPaths(editablePaths);

  if (classification.lanes.length !== 1) {
    throw new Error(
      `Task packet requires exactly one lane, received: ${classification.lanes.join(', ') || 'none'}`
    );
  }

  return {
    lane: LANE_DEFINITIONS.find((candidate) => candidate.id === classification.lanes[0])!,
    classification
  };
};

export const buildTaskPacket = (input: TaskPacketInput): TaskPacket => {
  const topicSlug = slugify(input.topic);
  const { lane } = resolveSingleLane(input.editablePaths);
  const branchName = `codex/${topicSlug}-${lane.id}`;

  return {
    topic: input.topic,
    goal: input.goal,
    lane,
    editablePaths: [...input.editablePaths],
    protectedPaths: [...input.protectedPaths],
    branchName,
    worktreePath: `.worktrees/${branchName}`,
    requiredChecks: unique([...lane.defaultChecks, 'npm test -- --run', 'npm run build']),
    reviewGates: AGENT_WORKFLOW_POLICY.reviewGates,
    completionCriteria: [
      `Stay inside the ${lane.label} lane boundaries.`,
      ...lane.completionCriteria
    ]
  };
};
