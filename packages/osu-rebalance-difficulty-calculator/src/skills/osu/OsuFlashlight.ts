import { Mod, ModHidden } from "@rian8337/osu-base";
import { OsuFlashlightEvaluator } from "../../evaluators/osu/OsuFlashlightEvaluator";
import { OsuSkill } from "./OsuSkill";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * Represents the skill required to memorize and hit every object in a beatmap with the Flashlight mod enabled.
 */
export class OsuFlashlight extends OsuSkill {
    protected override readonly strainDecayBase: number = 0.15;
    protected override readonly reducedSectionCount: number = 0;
    protected override readonly reducedSectionBaseline: number = 1;
    protected override readonly decayWeight: number = 1;

    private currentFlashlightStrain: number = 0;
    private readonly skillMultiplier: number = 0.052;
    private readonly isHidden: boolean;

    constructor(mods: Mod[]) {
        super(mods);

        this.isHidden = mods.some((m) => m instanceof ModHidden);
    }

    protected override strainValueAt(current: OsuDifficultyHitObject): number {
        this.currentFlashlightStrain *= this.strainDecay(current.deltaTime);
        this.currentFlashlightStrain +=
            OsuFlashlightEvaluator.evaluateDifficultyOf(
                current,
                this.isHidden,
            ) * this.skillMultiplier;

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
