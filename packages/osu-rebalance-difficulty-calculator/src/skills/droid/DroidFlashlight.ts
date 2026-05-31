import {
    ModAutopilot,
    ModFlashlight,
    ModMap,
    ModRelax,
} from "@rian8337/osu-base";
import { DroidFlashlightEvaluator } from "../../evaluators/droid/DroidFlashlightEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class DroidFlashlight extends DroidSkill {
    protected override readonly reducedSectionCount = 0;
    protected override readonly reducedSectionBaseline = 1;
    protected override readonly starsPerDouble = 1.06;

    private readonly skillMultiplier = 0.024;
    private currentFlashlightStrain = 0;

    static override difficultyToPerformance(difficulty: number): number {
        return Math.pow(difficulty, 1.6) * 25;
    }

    constructor(
        mods: ModMap,
        private readonly totalObjects: number,
    ) {
        super(mods);
    }

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        if (!this.mods.has(ModFlashlight)) {
            return 0;
        }

        this.currentFlashlightStrain *= this.strainDecay(current.deltaTime);
        this.currentFlashlightStrain +=
            this.calculateAdjustedDifficulty(current) * this.skillMultiplier;

        return this.currentFlashlightStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DifficultyHitObject,
    ): number {
        return (
            this.currentFlashlightStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override getObjectStrain(): number {
        return this.currentFlashlightStrain;
    }

    protected override saveToHitObject(current: DroidDifficultyHitObject) {
        current.flashlightStrain = this.currentFlashlightStrain;
    }

    override difficultyValue(): number {
        let sum =
            this.currentStrainPeaks.reduce((a, v) => a + v, 0) *
            this.starsPerDouble;

        // Account for shorter beatmaps having a higher ratio of 0 combo/100 combo flashlight radius.
        sum *=
            0.7 +
            0.1 * Math.min(1, this.totalObjects / 200) +
            (this.totalObjects > 200
                ? 0.2 * Math.min(1, (this.totalObjects - 200) / 200)
                : 0);

        return sum;
    }

    private calculateAdjustedDifficulty(
        current: DroidDifficultyHitObject,
    ): number {
        let difficulty = DroidFlashlightEvaluator.evaluateDifficultyOf(
            current,
            this.mods,
        );

        if (this.mods.has(ModRelax)) {
            difficulty *= 0.7;
        } else if (this.mods.has(ModAutopilot)) {
            difficulty *= 0.4;
        }

        return difficulty;
    }

    private strainDecay(ms: number): number {
        return Math.pow(0.15, ms / 1000);
    }
}
