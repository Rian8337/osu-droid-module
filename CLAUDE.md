# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

This is a pnpm/lerna monorepo of TypeScript modules for working with osu! beatmaps, replays, and difficulty/performance calculation, used across the maintainer's other projects (Alice, droidppboard, tournament-set-maker). Modules **only support osu!standard beatmaps**. Node.js >= 18 is required.

## Packages

| Package                               | Purpose                                                                                                                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `osu-base`                            | Core module: beatmap decoding/encoding, hit objects, mods, math, storyboard. All other packages depend on this.                                                                                    |
| `osu-difficulty-calculator`           | Difficulty/performance calculator using the **current (stable)** osu! algorithm.                                                                                                                   |
| `osu-rebalance-difficulty-calculator` | Difficulty/performance calculator using the **latest osu!lazer (rebalance)** algorithm. Mirrors the structure of `osu-difficulty-calculator` but with evolving/experimental skills and evaluators. |
| `osu-strain-graph-generator`          | Generates strain graphs from beatmaps, depends on both difficulty calculators.                                                                                                                     |
| `osu-droid-utilities`                 | osu!droid API utilities (`Player`, `Score`, `APIPlayer`, `APIScore`).                                                                                                                              |
| `osu-droid-replay-analyzer`           | Parses/analyzes osu!droid replay files (cheese/three-finger/two-hand detection), depends on both difficulty calculators.                                                                           |

Dependency direction is strictly one-way: `osu-base` → difficulty calculators → `osu-droid-replay-analyzer` / `osu-strain-graph-generator`. Cross-package imports use the published package name (`@rian8337/osu-base`, etc.), resolved via pnpm workspace links (`workspace:*`), not relative paths.

## Common commands

Run from the repo root unless noted. Lerna fans these out to each package.

```bash
pnpm install                 # install deps; postinstall builds all packages
pnpm build                   # lerna run build (rollup, per package)
pnpm lint                    # lerna run lint (eslint over src/**/*.ts)
pnpm test                    # lerna run test (jest, per package)
pnpm format-code              # prettier -w over packages/**
```

Per-package (run inside `packages/<name>/`, or via `lerna run --scope @rian8337/<name> <script>`):

```bash
pnpm build                   # rollup -c ../../rollup.config.mjs -> dist/index.js + typings/index.d.ts
pnpm lint                    # eslint 'src/**/*.ts'
pnpm test                    # jest --silent
```

Running a single test file (ts-jest, from inside the package directory):

```bash
npx jest tests/OsuDifficultyCalculator.test.ts
npx jest -t "name of test or describe block"
```

Each package's `jest.config.js` extends the root `jest.config.base.js` (roots at `tests/`, isolated-modules ts-jest transform). The root `jest.config.js` aggregates all packages as projects, so `pnpm test` from root runs everything.

Building is required before another package can pick up changes via its `dependencies` entry, since packages import compiled `dist`/`typings` output, not raw `src`, when consumed as a dependency (e.g. `osu-rebalance-difficulty-calculator` imports `osu-base`'s built output).

## Architecture: difficulty calculators

`osu-difficulty-calculator` and `osu-rebalance-difficulty-calculator` share the same internal architecture (the latter is a fork tracking osu!lazer's in-progress rebalance):

- `base/DifficultyCalculator.ts` — abstract base class. `calculate()` pipeline: build a `PlayableBeatmap` from a `Beatmap` + `ModMap` → create `DifficultyHitObject`s → create `Skill`s → feed every object through every skill (`skill.process(object)`) → produce `DifficultyAttributes`. Subclassed per ruleset as `DroidDifficultyCalculator` / `OsuDifficultyCalculator`.
- `base/PerformanceCalculator.ts` — converts `DifficultyAttributes` into a performance (pp) value; subclassed as `DroidPerformanceCalculator` / `OsuPerformanceCalculator`.
- `base/Skill.ts`, `StrainSkill.ts`, `VariableLengthStrainSkill.ts`, `HarmonicSkill.ts` — skill base classes implementing strain decay/peak tracking that individual skills extend.
- `skills/{droid,osu}/` — concrete skills (Aim, Tap/Speed, Flashlight, Reading, Rhythm) per ruleset, each processing a stream of `DifficultyHitObject`s and accumulating strain.
- `evaluators/{droid,osu}/` — pure evaluation logic factored out of skills (e.g. `DroidAimEvaluator`, `OsuSpeedEvaluator`), so skills stay thin wrappers around strain bookkeeping while evaluators hold the actual difficulty math.
- `preprocessing/` — `DifficultyHitObject` and ruleset-specific subclasses (`DroidDifficultyHitObject`, `OsuDifficultyHitObject`) that wrap a beatmap's hit objects with precomputed difficulty-relevant data (e.g. movement vectors, rhythm info) before skills consume them.
- `structures/` — output/attribute types (`DifficultyAttributes`, `DroidDifficultyAttributes`, `OsuDifficultyAttributes`, `CacheableDifficultyAttributes`, `StrainPeaks`, etc.) and calculation option types.

When changing difficulty math, check whether the change belongs in the evaluator (the formula) or the skill (strain aggregation/decay), and whether it should land in `osu-difficulty-calculator` (stable), `osu-rebalance-difficulty-calculator` (rebalance), or both.

## Architecture: osu-base

`beatmap/` is the core: `BeatmapDecoder`/`BeatmapEncoder` read/write `.osu` files into a `Beatmap`, `BeatmapProcessor` applies post-processing (stacking, etc.), and `BeatmapConverter` plus `DroidPlayableBeatmap`/`OsuPlayableBeatmap` turn a raw `Beatmap` into a ruleset-specific `PlayableBeatmap` with mods applied (this is the object difficulty calculators consume). `mods/` defines all `Mod` subclasses and `ModMap` for combining them. `beatmap/hitobjects/` defines `HitObject`, `Circle`, `Slider` (with nested objects like `SliderTick`/`SliderRepeat`/`SliderTail`), and `Spinner`. `beatmap/sections/` mirrors `.osu` file sections (`BeatmapDifficulty`, `BeatmapMetadata`, `BeatmapHitObjects`, etc.). `math/` and `utils/` hold ruleset-agnostic helpers used throughout.

## Code style

- ESLint config (`eslint.config.mjs`) uses `typescript-eslint` `strictTypeChecked` + `stylisticTypeChecked` presets with type-aware linting (`projectService: true`). Non-null assertions and extraneous classes are explicitly allowed (rules turned off).
- `tsconfig.json`: `strict: true`, `noImplicitOverride: true`, target ES6/ES2022 lib, CommonJS-interop friendly (`esModuleInterop`).
- Prettier formats all of `packages/**` (`prettier.config.mjs`).
- Each package builds to CommonJS (`dist/index.js`) plus a bundled `.d.ts` (`typings/index.d.ts`) via the shared root `rollup.config.mjs`; only those built files (not `src/`) are published (see each package's `files` field).

## Testing difficulty calculation results

If difficulty calculation tests failed, let the user update the values by themselves.
