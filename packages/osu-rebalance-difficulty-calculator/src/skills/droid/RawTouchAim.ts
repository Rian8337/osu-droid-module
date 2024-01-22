import { Mod } from "@rian8337/osu-base";
import { DroidAimEvaluator } from "../../evaluators/droid/DroidAimEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";
import { RawTouchSkill } from "./RawTouchSkill";

export class RawTouchAim extends RawTouchSkill {
    protected override readonly strainDecayBase = 0.15;

    private readonly skillMultiplier = 24.55;
    private readonly withSliders: boolean;

    constructor(
        mods: Mod[],
        clockRate: number,
        firstObject: DroidDifficultyHitObject,
        withSliders: boolean,
    ) {
        super(mods, clockRate, firstObject);

        this.withSliders = withSliders;
    }

    override clone() {
        const skill = new RawTouchAim(
            this.mods,
            this.clockRate,
            this.firstObject,
            this.withSliders,
        );

        skill._currentStrain = this._currentStrain;
        skill.lastHand = this.lastHand;

        for (let i = 0; i < this.lastObjects.length; ++i) {
            skill.lastObjects[i] = this.lastObjects[i].slice();
        }

        return skill;
    }

    protected override strainValueOf(current: DroidDifficultyHitObject) {
        return (
            DroidAimEvaluator.evaluateDifficultyOf(current, this.withSliders) *
            this.skillMultiplier
        );
    }

    protected override strainValueIf(
        current: DroidDifficultyHitObject,
        currentHand: TouchHand.left | TouchHand.right,
        lastHand: TouchHand.left | TouchHand.right,
    ) {
        let obstructionBonus = 1;

        // Add a bonus for the hand co-ordination required to aim with both hands.
        if (currentHand !== lastHand) {
            obstructionBonus += 1.1;

            // Add an obstrution bonus if the most recent instance of the "other hand" is in between the current object and the previous object with the actual hand
            const simulatedSwap = this.getSimulatedSwapObject(
                current,
                currentHand,
            );
            const angle = simulatedSwap.angle;

            if (angle !== null) {
                obstructionBonus +=
                    1.5 /
                    (1 + Math.pow(Math.E, -(angle - (3 * Math.PI) / 5) / 9));
            }
        }

        return (
            DroidAimEvaluator.evaluateDifficultyOf(
                this.getSimulatedObject(current, currentHand),
                this.withSliders,
            ) *
            obstructionBonus *
            this.skillMultiplier
        );
    }
}
