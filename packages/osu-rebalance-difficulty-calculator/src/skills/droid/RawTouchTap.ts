import { Mod } from "@rian8337/osu-base";
import { DroidTapEvaluator } from "../../evaluators/droid/DroidTapEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";
import { RawTouchSkill } from "./RawTouchSkill";
import { DifficultyHitObjectCache } from "../../utils/DifficultyHitObjectCache";

export class RawTouchTap extends RawTouchSkill {
    protected override readonly strainDecayBase = 0.3;

    private readonly skillMultiplier = 1375;
    private readonly greatWindow: number;
    private readonly considerCheesability: boolean;

    constructor(
        mods: Mod[],
        clockRate: number,
        isForceAR: boolean,
        objectCache: DifficultyHitObjectCache<DroidDifficultyHitObject>,
        greatWindow: number,
        considerCheesability: boolean,
    ) {
        super(mods, clockRate, isForceAR, objectCache);

        this.greatWindow = greatWindow;
        this.considerCheesability = considerCheesability;
    }

    override clone(): RawTouchTap {
        const clone = new RawTouchTap(
            this.mods,
            this.clockRate,
            this.isForceAR,
            this.objectCache,
            this.greatWindow,
            this.considerCheesability,
        );

        clone._currentStrain = this._currentStrain;
        clone.lastHand = this.lastHand;

        for (let i = 0; i < this.lastObjects.length; ++i) {
            clone.lastObjects[i] = this.lastObjects[i].slice();
        }

        for (let i = 0; i < this.lastDifficultyObjects.length; ++i) {
            clone.lastDifficultyObjects[i] =
                this.lastDifficultyObjects[i].slice();
        }

        return clone;
    }

    protected override strainValueOf(current: DroidDifficultyHitObject) {
        return (
            DroidTapEvaluator.evaluateDifficultyOf(
                current,
                this.greatWindow,
                this.considerCheesability,
                false,
            ) * this.skillMultiplier
        );
    }

    protected override strainValueIf(
        simulated: DroidDifficultyHitObject,
        currentHand: TouchHand.left | TouchHand.right,
        lastHand: TouchHand.left | TouchHand.right,
    ) {
        let singletapMultiplier = 1;

        if (currentHand === lastHand) {
            // Reduction in speed value for singletapping consecutive notes.
            singletapMultiplier *= 0.93;
        }

        return (
            DroidTapEvaluator.evaluateDifficultyOf(
                simulated,
                this.greatWindow,
                this.considerCheesability,
                true,
            ) *
            this.skillMultiplier *
            singletapMultiplier
        );
    }
}
