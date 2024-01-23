import { Mod, OsuHitWindow } from "@rian8337/osu-base";
import { DroidRhythmEvaluator } from "../../evaluators/droid/DroidRhythmEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchProbability } from "./TouchProbability";
import { TouchSkill } from "./TouchSkill";

export class TouchTap extends TouchSkill {
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly strainDecayBase = 0.3;
    protected override readonly starsPerDouble = 1.1;

    private currentTapStrain = 0;
    private currentRhythmMultiplier = 0;

    private readonly considerCheesability: boolean;

    private readonly _objectDeltaTimes: number[] = [];

    /**
     * The delta time of hitobjects.
     */
    get objectDeltaTimes(): readonly number[] {
        return this._objectDeltaTimes;
    }

    constructor(
        mods: Mod[],
        clockRate: number,
        overallDifficulty: number,
        isForceAR: boolean,
        considerCheesability: boolean,
    ) {
        super(
            mods,
            clockRate,
            new OsuHitWindow(overallDifficulty).hitWindowFor300(),
            isForceAR,
        );

        this.considerCheesability = considerCheesability;
    }

    /**
     * The amount of notes that are relevant to the difficulty.
     */
    relevantNoteCount(): number {
        if (this._objectStrains.length === 0) {
            return 0;
        }

        const maxStrain: number = Math.max(...this._objectStrains);

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

        const maxStrain: number = Math.max(...this._objectStrains);

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

    protected override strainValueAt(current: DroidDifficultyHitObject) {
        this.currentRhythmMultiplier =
            DroidRhythmEvaluator.evaluateDifficultyOf(
                current,
                this.greatWindow,
            );

        this.currentTapStrain = super.strainValueAt(current);

        this._objectDeltaTimes.push(current.deltaTime);

        return this.currentTapStrain * this.currentRhythmMultiplier;
    }

    protected override getProbabilityStrain(probability: TouchProbability) {
        if (this.considerCheesability) {
            return probability.skills.tapWithCheesability.currentStrain;
        } else {
            return probability.skills.tapWithoutCheesability.currentStrain;
        }
    }

    protected override getProbabilityTotalStrain(
        probability: TouchProbability,
    ) {
        return this.calculateTotalStrain(
            probability.skills.aimWithSliders.currentStrain,
            this.getProbabilityStrain(probability),
        );
    }

    protected override calculateInitialStrain(
        time: number,
        current: DroidDifficultyHitObject,
    ) {
        return (
            this.currentTapStrain *
            this.currentRhythmMultiplier *
            this.strainDecay(time - (current.previous(0)?.startTime ?? 0))
        );
    }

    protected override getObjectStrain() {
        return this.currentTapStrain * this.currentRhythmMultiplier;
    }

    protected override saveToHitObject(
        current: DroidDifficultyHitObject,
    ): void {
        const strain: number =
            this.currentTapStrain * this.currentRhythmMultiplier;

        if (this.considerCheesability) {
            current.tapStrain = strain;
        } else {
            current.originalTapStrain = strain;
        }
    }
}
