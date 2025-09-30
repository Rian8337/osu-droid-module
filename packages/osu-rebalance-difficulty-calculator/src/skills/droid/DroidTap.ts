import { MathUtils, ModMap } from "@rian8337/osu-base";
import { DroidTapEvaluator } from "../../evaluators/droid/DroidTapEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSkill } from "./DroidSkill";

/**
 * Represents the skill required to press keys or tap with regards to keeping up with the speed at which objects need to be hit.
 */
export class DroidTap extends DroidSkill {
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly strainDecayBase = 0.3;
    protected override readonly starsPerDouble = 1.1;

    private currentTapStrain = 0;
    private currentRhythmMultiplier = 0;

    private readonly skillMultiplier = 1.375;

    private readonly _objectDeltaTimes: number[] = [];

    /**
     * The delta time of hitobjects.
     */
    get objectDeltaTimes(): readonly number[] {
        return this._objectDeltaTimes;
    }

    readonly considerCheesability: boolean;
    private readonly strainTimeCap?: number;

    constructor(
        mods: ModMap,
        considerCheesability: boolean,
        strainTimeCap?: number,
    ) {
        super(mods);

        this.considerCheesability = considerCheesability;
        this.strainTimeCap = strainTimeCap;
    }

    /**
     * The amount of notes that are relevant to the difficulty.
     */
    relevantNoteCount(): number {
        if (this._objectStrains.length === 0) {
            return 0;
        }

        const maxStrain = MathUtils.max(this._objectStrains);

        if (maxStrain === 0) {
            return 0;
        }

        return this._objectStrains.reduce(
            (total, next) =>
                total + 1 / (1 + Math.exp(-((next / maxStrain) * 12 - 6))),
            0,
        );
    }

    /**
     * The delta time relevant to the difficulty.
     */
    relevantDeltaTime(): number {
        if (this._objectStrains.length === 0) {
            return 0;
        }

        const maxStrain = MathUtils.max(this._objectStrains);

        if (maxStrain === 0) {
            return 0;
        }

        return (
            this._objectDeltaTimes.reduce(
                (total, next, index) =>
                    total +
                    next /
                        (1 +
                            Math.exp(
                                -(
                                    (this._objectStrains[index] / maxStrain) *
                                        25 -
                                    20
                                ),
                            )),
                0,
            ) /
            this._objectStrains.reduce(
                (total, next) =>
                    total + 1 / (1 + Math.exp(-((next / maxStrain) * 25 - 20))),
                0,
            )
        );
    }

    protected override strainValueAt(
        current: DroidDifficultyHitObject,
    ): number {
        this.currentTapStrain *= this.strainDecay(current.strainTime);
        this.currentTapStrain +=
            DroidTapEvaluator.evaluateDifficultyOf(
                current,
                this.considerCheesability,
                this.strainTimeCap,
            ) * this.skillMultiplier;

        this.currentRhythmMultiplier = current.rhythmMultiplier;

        this._objectDeltaTimes.push(current.deltaTime);

        return this.currentTapStrain * current.rhythmMultiplier;
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ): number {
        return (
            this.currentTapStrain *
            this.currentRhythmMultiplier *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override getObjectStrain(): number {
        return this.currentTapStrain * this.currentRhythmMultiplier;
    }

    /**
     * @param current The hitobject to save to.
     */
    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
    ): void {
        if (this.strainTimeCap !== undefined) {
            return;
        }

        const strain = this.currentTapStrain * this.currentRhythmMultiplier;

        if (this.considerCheesability) {
            current.tapStrain = strain;
        } else {
            current.originalTapStrain = strain;
        }
    }
}
