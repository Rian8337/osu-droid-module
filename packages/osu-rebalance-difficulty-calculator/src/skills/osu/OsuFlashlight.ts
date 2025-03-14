import { OsuFlashlightEvaluator } from "../../evaluators/osu/OsuFlashlightEvaluator";
import { OsuSkill } from "./OsuSkill";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class OsuFlashlight extends OsuSkill {
    protected override readonly strainDecayBase = 0.15;
    protected override readonly reducedSectionCount = 0;
    protected override readonly reducedSectionBaseline = 1;
    protected override readonly decayWeight = 1;

    private currentFlashlightStrain = 0;
    private readonly skillMultiplier = 0.05512;

    override difficultyValue(): number {
        return this.strainPeaks.reduce((a, b) => a + b, 0);
    }

    protected override strainValueAt(current: OsuDifficultyHitObject): number {
        this.currentFlashlightStrain *= this.strainDecay(current.deltaTime);
        this.currentFlashlightStrain +=
            OsuFlashlightEvaluator.evaluateDifficultyOf(current, this.mods) *
            this.skillMultiplier;

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
}
