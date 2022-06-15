import { OsuSkill } from "./OsuSkill";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { Mod } from "@rian8337/osu-base";
import { OsuSpeedEvaluator } from "../../evaluators/osu/OsuSpeedEvaluator";
import { OsuRhythmEvaluator } from "../../evaluators/osu/OsuRhythmEvaluator";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class OsuSpeed extends OsuSkill {
    protected override readonly skillMultiplier: number = 1375;
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly reducedSectionCount: number = 5;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly difficultyMultiplier: number = 1.04;
    protected override readonly decayWeight: number = 0.9;

    private currentSpeedStrain: number = 0;
    private currentRhythm: number = 0;

    // ~200 1/4 BPM streams
    private readonly minSpeedBonus: number = 75;

    private readonly greatWindow: number;

    constructor(mods: Mod[], greatWindow: number) {
        super(mods);

        this.greatWindow = greatWindow;
    }

    /**
     * @param current The hitobject to calculate.
     */
    protected override strainValueAt(current: DifficultyHitObject): number {
        this.currentSpeedStrain *= this.strainDecay(current.deltaTime);
        this.currentSpeedStrain +=
            OsuSpeedEvaluator.evaluateDifficultyOf(current, this.greatWindow) *
            this.skillMultiplier;

        this.currentRhythm = OsuRhythmEvaluator.evaluateDifficultyOf(
            current,
            this.greatWindow
        );

        return this.currentSpeedStrain * this.currentRhythm;
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(current: DifficultyHitObject): void {
        current.tapStrain = this.currentStrain;
        current.rhythmMultiplier = this.currentRhythm;
    }
}
