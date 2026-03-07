// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  AGENT_WORKFLOW_POLICY,
  buildTaskPacket,
  canRunInParallel,
  classifyTaskPaths,
  LANE_DEFINITIONS
} from './multiAgentWorkflow';

describe('multi-agent workflow policy', () => {
  it('locks the repository defaults for hybrid multi-agent execution', () => {
    expect(AGENT_WORKFLOW_POLICY.mode).toBe('hybrid');
    expect(AGENT_WORKFLOW_POLICY.splitBasis).toBe('subsystem');
    expect(AGENT_WORKFLOW_POLICY.isolationMode).toBe('worktree');
    expect(AGENT_WORKFLOW_POLICY.reviewGates).toEqual([
      'spec-review',
      'code-quality-review'
    ]);
    expect(LANE_DEFINITIONS.map((lane) => lane.id)).toEqual([
      'scene-hud',
      'geometry-generator',
      'store-share',
      'build-perf'
    ]);
  });

  it('classifies files into the expected subsystem lanes', () => {
    expect(classifyTaskPaths(['src/components/BridgeScene.tsx']).lanes).toEqual(['scene-hud']);
    expect(classifyTaskPaths(['src/lib/bridgeGenerator.ts']).lanes).toEqual([
      'geometry-generator'
    ]);
    expect(classifyTaskPaths(['src/store/bridgeStore.ts', 'src/lib/shareState.ts']).lanes).toEqual(
      ['store-share']
    );
    expect(classifyTaskPaths(['vite.config.ts', 'src/build/manualChunks.ts']).lanes).toEqual([
      'build-perf'
    ]);
  });

  it('marks shared hotspots as non-parallel even when a lane is otherwise isolated', () => {
    const bridgeSceneTask = classifyTaskPaths(['src/components/BridgeScene.tsx']);
    const sharedTypesTask = classifyTaskPaths(['src/types/bridge.ts']);

    expect(bridgeSceneTask.sharedHotspots).toContain('src/components/BridgeScene.tsx');
    expect(sharedTypesTask.sharedHotspots).toContain('src/types/bridge.ts');
  });

  it('allows only the approved parallel lane combinations', () => {
    expect(canRunInParallel(['build-perf', 'store-share']).allowed).toBe(true);
    expect(canRunInParallel(['scene-hud', 'store-share']).allowed).toBe(true);
    expect(canRunInParallel(['scene-hud', 'geometry-generator']).allowed).toBe(false);
    expect(canRunInParallel(['geometry-generator', 'build-perf']).allowed).toBe(false);
  });

  it('builds a task packet with fixed branch, worktree, review, and verification rules', () => {
    const packet = buildTaskPacket({
      topic: 'camera polish',
      goal: 'Tune orbit zoom and preset transitions',
      editablePaths: ['src/components/BridgeScene.tsx', 'src/styles.css'],
      protectedPaths: ['src/lib/bridgeGenerator.ts']
    });

    expect(packet.lane.id).toBe('scene-hud');
    expect(packet.branchName).toBe('codex/camera-polish-scene-hud');
    expect(packet.worktreePath).toBe('.worktrees/codex/camera-polish-scene-hud');
    expect(packet.reviewGates).toEqual(['spec-review', 'code-quality-review']);
    expect(packet.requiredChecks).toEqual(
      expect.arrayContaining(['npm test -- --run', 'npm run build'])
    );
    expect(packet.completionCriteria.length).toBeGreaterThan(0);
  });
});

describe('multi-agent workflow repository assets', () => {
  it('ships the workflow docs and templates that define the controller handoff', () => {
    expect(existsSync(join(process.cwd(), 'docs/operations/multi-agent-workflow.md'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'docs/templates/task-packet.md'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'docs/templates/spec-review.md'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'docs/templates/code-quality-review.md'))).toBe(true);
  });

  it('prepares project-local worktrees by ignoring the .worktrees directory', () => {
    const gitignore = readFileSync(join(process.cwd(), '.gitignore'), 'utf8');

    expect(gitignore).toContain('.worktrees/');
  });
});
