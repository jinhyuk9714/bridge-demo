# Multi-Agent Workflow

This repository uses a hybrid controller model.

## Defaults

- Mode: `hybrid`
- Split basis: `subsystem`
- Isolation: `project-local worktree`
- Review gates: `spec-review -> code-quality-review`

## Lanes

| Lane | Scope |
| --- | --- |
| `scene-hud` | `BridgeScene`, scene subcomponents, HUD layout, visual shell |
| `geometry-generator` | bridge geometry, cable/tower generation, scene layout math |
| `store-share` | Zustand store, share state, export wiring |
| `build-perf` | Vite config, build helpers, bundle/perf tests |

## Shared Hotspots

These files are treated as controller-owned or shared-contract sensitive and should not be edited in parallel across lanes:

- `src/components/BridgeScene.tsx`
- `src/lib/bridgeGenerator.ts`
- `src/types/bridge.ts`
- `src/styles.css`

## Parallel Rules

- Parallel execution is allowed only when file boundaries are explicit and the acceptance criteria are independent.
- Approved pairs:
  - `build-perf` + `store-share`
  - `scene-hud` + `store-share` when the packet excludes shared hotspots outside the assigned lane
- Disallowed pairs:
  - `scene-hud` + `geometry-generator`
  - `geometry-generator` + `build-perf` when types or shared contracts may change

## Task Packet Contract

Every lane starts with one task packet that includes:

- Goal
- Editable paths
- Protected paths
- Required checks
- Completion criteria
- Branch name: `codex/<topic>-<lane>`
- Worktree path: `.worktrees/<branch-name>`
- Review gates: `spec-review`, then `code-quality-review`

## Review Flow

1. Implementer finishes lane work with TDD and local verification.
2. Spec reviewer checks missing requirements and rejects extra scope.
3. Code quality reviewer checks bugs, regressions, and test gaps.
4. Controller integrates only after both reviews pass.
5. Controller runs full-repo verification: `npm test -- --run`, `npm run build`.
