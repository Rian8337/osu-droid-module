import { Mod, OsuHitWindow } from "@rian8337/osu-base";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchProbability } from "./TouchProbability";
import { TouchSkill } from "./TouchSkill";
import { RawTouchAim } from "./RawTouchAim";
import { RawTouchTap } from "./RawTouchTap";
import { DifficultyHitObjectCache } from "../../utils/DifficultyHitObjectCache";

export class TouchTap extends TouchSkill {
    protected override readonly reducedSectionCount = 10;
    protected override readonly reducedSectionBaseline = 0.75;
    protected override readonly strainDecayBase = 0.3;
    protected override readonly starsPerDouble = 1.1;

    private currentTapStrain = 0;
    private currentRhythmMultiplier = 0;

    private readonly clockRate: number;
    private readonly greatWindow: number;
    private readonly isForceAR: boolean;
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
        objectCache: DifficultyHitObjectCache<DroidDifficultyHitObject>,
        clockRate: number,
        overallDifficulty: number,
        isForceAR: boolean,
        considerCheesability: boolean,
    ) {
        super(mods, objectCache);

        this.clockRate = clockRate;
        this.greatWindow = new OsuHitWindow(
            overallDifficulty,
        ).hitWindowFor300();
        this.isForceAR = isForceAR;
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
        this.currentRhythmMultiplier = current.rhythmMultiplier;

        this.currentTapStrain = super.strainValueAt(current);

        this._objectDeltaTimes.push(current.deltaTime);

        return this.currentTapStrain * this.currentRhythmMultiplier;
    }

    protected override getRawSkills() {
        return [
            new RawTouchAim(
                this.mods,
                this.clockRate,
                this.isForceAR,
                this.objectCache,
                true,
            ),
            new RawTouchTap(
                this.mods,
                this.clockRate,
                this.isForceAR,
                this.objectCache,
                this.greatWindow,
                this.considerCheesability,
            ),
        ];
    }

    protected override getProbabilityStrain(probability: TouchProbability) {
        return probability.skills[1].currentStrain;
    }

    protected override getProbabilityTotalStrain(
        probability: TouchProbability,
    ) {
        return this.calculateTotalStrain(
            probability.skills[0].currentStrain,
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
        const strain = this.currentTapStrain * this.currentRhythmMultiplier;

        if (this.considerCheesability) {
            current.tapStrain = strain;
        } else {
            current.originalTapStrain = strain;
        }
    }
}
