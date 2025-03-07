import { OsuSkill } from "./OsuSkill";
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
    protected override readonly decayWeight = 0.9;

    private currentSpeedStrain = 0;
    private currentRhythm = 0;

    private readonly skillMultiplier = 1.46;

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: OsuDifficultyHitObject): number {
        this.currentSpeedStrain *= this.strainDecay(current.strainTime);
        this.currentSpeedStrain +=
            OsuSpeedEvaluator.evaluateDifficultyOf(current, this.mods) *
            this.skillMultiplier;

        this.currentRhythm = OsuRhythmEvaluator.evaluateDifficultyOf(current);

        const strain = this.currentSpeedStrain * this.currentRhythm;
        this._objectStrains.push(strain);

        return strain;
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
