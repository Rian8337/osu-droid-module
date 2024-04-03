import { OsuSkill } from "./OsuSkill";
import { Mod, OsuHitWindow } from "@rian8337/osu-base";
import { OsuSpeedEvaluator } from "../../evaluators/osu/OsuSpeedEvaluator";
import { OsuRhythmEvaluator } from "../../evaluators/osu/OsuRhythmEvaluator";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class OsuSpeed extends OsuSkill {
    protected override readonly strainDecayBase = 0.3;
    protected override readonly reducedSectionCount = 5;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly difficultyMultiplier = 1.04;
    protected override readonly decayWeight = 0.9;

    private currentSpeedStrain = 0;
    private currentRhythm = 0;

    private readonly skillMultiplier = 1375;
    private readonly greatWindow: number;

    constructor(mods: Mod[], overallDifficulty: number) {
        super(mods);

        this.greatWindow = new OsuHitWindow(
            overallDifficulty,
        ).hitWindowFor300();
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: OsuDifficultyHitObject): number {
        this.currentSpeedStrain *= this.strainDecay(current.strainTime);
        this.currentSpeedStrain +=
            OsuSpeedEvaluator.evaluateDifficultyOf(current, this.greatWindow) *
            this.skillMultiplier;

        this.currentRhythm = OsuRhythmEvaluator.evaluateDifficultyOf(
            current,
            this.greatWindow,
        );

        return this.currentSpeedStrain * this.currentRhythm;
    }

    protected override calculateInitialStrain(
        time: number,
        current: OsuDifficultyHitObject,
    ): number {
        return (
            this.currentSpeedStrain *
            this.currentRhythm *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(current: OsuDifficultyHitObject): void {
        current.speedStrain = this.currentSpeedStrain * this.currentRhythm;
        current.rhythmMultiplier = this.currentRhythm;
    }
}
