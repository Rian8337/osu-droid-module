import { Slider } from "@rian8337/osu-base";
import { OsuRhythmEvaluator } from "../../evaluators/osu/OsuRhythmEvaluator";
import { OsuSpeedEvaluator } from "../../evaluators/osu/OsuSpeedEvaluator";
import { OsuDifficultyHitObject } from "../../preprocessing/OsuDifficultyHitObject";
import { StrainUtils } from "../../utils/StrainUtils";
import { OsuSkill } from "./OsuSkill";

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

    private readonly skillMultiplier = 1.47;

    private readonly sliderStrains: number[] = [];
    private maxStrain = 0;

    /**
     * The amount of notes that are relevant to the difficulty.
     */
    relevantNoteCount(): number {
        if (this._objectStrains.length === 0 || this.maxStrain === 0) {
            return 0;
        }

        return this._objectStrains.reduce(
            (total, next) =>
                total + 1 / (1 + Math.exp(-((next / this.maxStrain) * 12 - 6))),
            0,
        );
    }

    /**
     * Obtains the amount of sliders that are considered difficult in terms of relative strain, weighted by consistency.
     */
    countTopWeightedSliders(): number {
        return StrainUtils.countTopWeightedSliders(
            this._objectStrains,
            this.difficulty,
        );
    }

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
        this.maxStrain = Math.max(this.maxStrain, strain);

        if (current.object instanceof Slider) {
            this.sliderStrains.push(strain);
        }

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
