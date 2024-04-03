import { OsuHitWindow, Mod } from "@rian8337/osu-base";
import { DroidTapEvaluator } from "../../evaluators/droid/DroidTapEvaluator";
import { DroidSkill } from "./DroidSkill";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";

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

    private readonly skillMultiplier = 1375;
    private readonly greatWindow: number;
    private readonly considerCheesability: boolean;
    private readonly strainTimeCap?: number;

    private readonly _objectDeltaTimes: number[];

    /**
     * The delta time of hitobjects.
     */
    get objectDeltaTimes(): readonly number[] {
        return this._objectDeltaTimes;
    }

    constructor(
        mods: Mod[],
        objectCount: number,
        overallDifficulty: number,
        considerCheesability: boolean,
        strainTimeCap?: number,
    ) {
        super(mods, objectCount);

        this.greatWindow = new OsuHitWindow(
            overallDifficulty,
        ).hitWindowFor300();
        this.considerCheesability = considerCheesability;
        this.strainTimeCap = strainTimeCap;

        this._objectDeltaTimes = new Array(objectCount);
    }

    /**
     * The amount of notes that are relevant to the difficulty.
     */
    relevantNoteCount(): number {
        if (this._objectStrains.length === 0) {
            return 0;
        }

        const maxStrain = Math.max(...this._objectStrains);

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

        const maxStrain = Math.max(...this._objectStrains);

        if (maxStrain === 0) {
            return 0;
        }

        return (
            this._objectDeltaTimes.reduce(
                (total, next, index) =>
                    total +
                    (next * 1) /
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
        this.currentTapStrain *= this.strainDecay(current.strainTime);
        this.currentTapStrain +=
            DroidTapEvaluator.evaluateDifficultyOf(
                current,
                this.greatWindow,
                this.considerCheesability,
                false,
                this.strainTimeCap,
            ) * this.skillMultiplier;

        this.currentRhythmMultiplier = current.rhythmMultiplier;

        this._objectDeltaTimes[current.index] = current.deltaTime;

        return this.currentTapStrain * this.currentRhythmMultiplier;
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

    protected override saveToHitObject(): void {
        // if (this.strainTimeCap !== undefined) {
        //     return;
        // }
        // const strain: number =
        //     this.currentTapStrain * this.currentRhythmMultiplier;
        // if (this.considerCheesability) {
        //     current.tapStrain = strain;
        // } else {
        //     current.originalTapStrain = strain;
        // }
    }
}
