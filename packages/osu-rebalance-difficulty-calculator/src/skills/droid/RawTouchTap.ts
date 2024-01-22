import { Mod } from "@rian8337/osu-base";
import { DroidTapEvaluator } from "../../evaluators/droid/DroidTapEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";
import { RawTouchSkill } from "./RawTouchSkill";

export class RawTouchTap extends RawTouchSkill {
    protected override readonly strainDecayBase = 0.3;

    private readonly skillMultiplier: number = 1375;
    private readonly greatWindow: number;
    private readonly considerCheesability: boolean;

    constructor(
        mods: Mod[],
        clockRate: number,
        firstObject: DroidDifficultyHitObject,
        greatWindow: number,
        considerCheesability: boolean,
    ) {
        super(mods, clockRate, firstObject);

        this.greatWindow = greatWindow;
        this.considerCheesability = considerCheesability;
    }

    override clone() {
        const skill = new RawTouchTap(
            this.mods,
            this.clockRate,
            this.firstObject,
            this.greatWindow,
            this.considerCheesability,
        );

        for (let i = 0; i < this.lastObjects.length; ++i) {
            const lastObjects = this.lastObjects[i];

            for (let j = 0; j < lastObjects.length; ++j) {
                skill.lastObjects[i].push(lastObjects[j]);
            }
        }

        return skill;
    }

    protected override strainValueOf(current: DroidDifficultyHitObject) {
        return (
            DroidTapEvaluator.evaluateDifficultyOf(
                current,
                this.greatWindow,
                this.considerCheesability,
            ) * this.skillMultiplier
        );
    }

    protected override strainValueIf(
        current: DroidDifficultyHitObject,
        currentHand: TouchHand.left | TouchHand.right,
        lastHand: TouchHand.left | TouchHand.right,
    ) {
        let singletapMultiplier = 1;

        // Reduction in speed value for singletapping consecutive notes.
        if (currentHand === lastHand) {
            singletapMultiplier = 0.93;
        }

        return (
            DroidTapEvaluator.evaluateDifficultyOf(
                this.getSimulatedObject(current, currentHand),
                this.greatWindow,
                true,
                current.strainTime / 2,
            ) *
            this.skillMultiplier *
            singletapMultiplier
        );
    }
}
