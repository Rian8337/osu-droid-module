import { Mod } from "@rian8337/osu-base";
import { DroidAimEvaluator } from "../../evaluators/droid/DroidAimEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";
import { RawTouchSkill } from "./RawTouchSkill";

export class RawTouchAim extends RawTouchSkill {
    protected override readonly strainDecayBase = 0.15;

    private readonly skillMultiplier = 24.55;
    private readonly withSliders: boolean;

    constructor(copy: RawTouchAim);
    constructor(
        mods: Mod[],
        clockRate: number,
        firstObject: DroidDifficultyHitObject,
        isForceAR: boolean,
        withSliders: boolean,
    );
    constructor(
        modsOrCopy: Mod[] | RawTouchAim,
        clockRate?: number,
        firstObject?: DroidDifficultyHitObject,
        isForceAR?: boolean,
        withSliders?: boolean,
    ) {
        if (modsOrCopy instanceof RawTouchAim) {
            super(modsOrCopy);

            this.withSliders = modsOrCopy.withSliders;

            return;
        }

        // These are safe to non-null (see constructor overloads).
        super(modsOrCopy, clockRate!, firstObject!, isForceAR!);

        this.withSliders = withSliders!;
    }

    protected override strainValueOf(current: DroidDifficultyHitObject) {
        return (
            DroidAimEvaluator.evaluateDifficultyOf(
                current,
                this.withSliders,
                false,
            ) * this.skillMultiplier
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
                    1.5 / (1 + Math.exp(-(angle - (3 * Math.PI) / 5) / 9));
            }
        }

        let singletapMultiplier = 1;

        // Reduction in flow aim value for singletapping consecutive notes.
        if (currentHand === lastHand) {
            singletapMultiplier = 0.93;
        }

        const simulatedObject = this.getSimulatedObject(current, currentHand);
        const snapAimStrain =
            DroidAimEvaluator.evaluateSnapDifficultyOf(
                simulatedObject,
                this.withSliders,
            ) * obstructionBonus;
        const flowAimStrain =
            DroidAimEvaluator.evaluateFlowDifficultyOf(simulatedObject, true) *
            singletapMultiplier;

        return (snapAimStrain + flowAimStrain) * this.skillMultiplier;
    }
}
