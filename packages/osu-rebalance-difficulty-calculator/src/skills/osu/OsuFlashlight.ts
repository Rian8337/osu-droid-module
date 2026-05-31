import { OsuFlashlightEvaluator } from "../../evaluators/osu/OsuFlashlightEvaluator";
import { OsuSkill } from "./OsuSkill";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";
import {
    ModTouchDevice,
    ModRelax,
    ModAutopilot,
    ModMagnetised,
    ModDeflate,
    MathUtils,
    Interpolation,
    ModMap,
} from "@rian8337/osu-base";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class OsuFlashlight extends OsuSkill {
    protected override readonly reducedSectionCount = 0;
    protected override readonly reducedSectionBaseline = 1;
    protected override readonly decayWeight = 1;

    private currentFlashlightStrain = 0;
    private readonly skillMultiplier = 0.058;

    static override difficultyToPerformance(difficulty: number): number {
        return Math.pow(difficulty, 2) * 25;
    }

    constructor(
        mods: ModMap,
        private readonly totalObjects: number,
    ) {
        super(mods);
    }

    override difficultyValue(): number {
        let sum = this.currentStrainPeaks.reduce((a, b) => a + b, 0);

        // Account for shorter beatmaps having a higher ratio of 0 combo/100 combo flashlight radius.
        sum *=
            0.7 +
            0.1 * Math.min(1, this.totalObjects / 200) +
            (this.totalObjects > 200
                ? 0.2 * Math.min(1, (this.totalObjects - 200) / 200)
                : 0);

        return sum;
    }

    protected override strainValueAt(current: OsuDifficultyHitObject): number {
        this.currentFlashlightStrain *= this.strainDecay(current.deltaTime);
        this.currentFlashlightStrain +=
            this.calculateAdjustedDifficulty(current) * this.skillMultiplier;

        return this.currentFlashlightStrain;
    }

    protected override calculateInitialStrain(
        time: number,
        current: OsuDifficultyHitObject,
    ): number {
        return (
            this.currentFlashlightStrain *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override saveToHitObject(current: OsuDifficultyHitObject): void {
        current.flashlightStrain = this.currentFlashlightStrain;
    }

    private calculateAdjustedDifficulty(
        current: OsuDifficultyHitObject,
    ): number {
        let difficulty = OsuFlashlightEvaluator.evaluateDifficultyOf(
            current,
            this.mods,
        );

        if (this.mods.has(ModTouchDevice)) {
            difficulty = Math.pow(difficulty, 0.8);
        }

        if (this.mods.has(ModMagnetised)) {
            const magnetisedStrength =
                this.mods.get(ModMagnetised)!.attractionStrength.value;

            difficulty *= 1 - magnetisedStrength;
        }

        if (this.mods.has(ModDeflate)) {
            const deflateInitialScale =
                this.mods.get(ModDeflate)!.startScale.value;

            difficulty *= MathUtils.clamp(
                Interpolation.reverseLerp(deflateInitialScale, 11, 1),
                0.1,
                1,
            );
        }

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
