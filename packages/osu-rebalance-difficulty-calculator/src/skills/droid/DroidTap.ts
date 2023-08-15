import { OsuHitWindow, Mod } from "@rian8337/osu-base";
import { DroidTapEvaluator } from "../../evaluators/droid/DroidTapEvaluator";
import { DifficultyHitObject } from "../../preprocessing/DifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class DroidTap extends DroidSkill {
    protected override readonly reducedSectionCount: number = 10;
    protected override readonly reducedSectionBaseline: number = 0.75;
    protected override readonly strainDecayBase: number = 0.3;
    protected override readonly starsPerDouble: number = 1.1;

    private currentTapStrain: number = 0;
    private currentRhythmMultiplier: number = 0;

    private readonly skillMultiplier: number = 1375;
    private readonly greatWindow: number;
    private readonly considerCheesability: boolean;

    constructor(
        mods: Mod[],
        overallDifficulty: number,
        considerCheesability: boolean,
    ) {
        super(mods);

        this.greatWindow = new OsuHitWindow(
            overallDifficulty,
        ).hitWindowFor300();
        this.considerCheesability = considerCheesability;
    }

    protected override strainValueAt(current: DifficultyHitObject): number {
        const decay: number = this.strainDecay(current.strainTime);

        this.currentTapStrain *= decay;
        this.currentTapStrain +=
            DroidTapEvaluator.evaluateDifficultyOf(
                current,
                this.greatWindow,
                this.considerCheesability,
            ) * this.skillMultiplier;

        this.currentRhythmMultiplier = current.rhythmMultiplier;

        return this.currentTapStrain * current.rhythmMultiplier;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DifficultyHitObject,
    ): number {
        return (
            this.currentTapStrain *
            this.currentRhythmMultiplier *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(current: DifficultyHitObject): void {
        const strain: number =
            this.currentTapStrain * this.currentRhythmMultiplier;

        if (this.considerCheesability) {
            current.tapStrain = strain;
        } else {
            current.originalTapStrain = strain;
        }
    }
}
