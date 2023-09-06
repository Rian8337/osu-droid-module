import { OsuSkill } from "./OsuSkill";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { Mod } from "@rian8337/osu-base";
import { OsuSpeedEvaluator } from "../../evaluators/osu/OsuSpeedEvaluator";
import { OsuRhythmEvaluator } from "../../evaluators/osu/OsuRhythmEvaluator";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class OsuSpeed extends OsuSkill {
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly reducedSectionCount: number = 5;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly difficultyMultiplier: number = 1.04;
    protected override readonly decayWeight: number = 0.9;

    private currentSpeedStrain: number = 0;
    private currentRhythm: number = 0;

    private readonly skillMultiplier: number = 1375;
    private readonly greatWindow: number;

    constructor(mods: Mod[], greatWindow: number) {
        super(mods);

        this.greatWindow = greatWindow;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
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
        current: DifficultyHitObject,
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
    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.tapStrain = this.currentSpeedStrain * this.currentRhythm;
        current.rhythmMultiplier = this.currentRhythm;
    }
}
