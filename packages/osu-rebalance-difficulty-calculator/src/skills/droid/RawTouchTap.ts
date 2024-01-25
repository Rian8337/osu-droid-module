import { Mod } from "@rian8337/osu-base";
import { DroidTapEvaluator } from "../../evaluators/droid/DroidTapEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";
import { RawTouchSkill } from "./RawTouchSkill";

export class RawTouchTap extends RawTouchSkill {
    protected override readonly strainDecayBase = 0.3;

    private readonly skillMultiplier = 1375;
    private readonly greatWindow: number;
    private readonly considerCheesability: boolean;

    constructor(copy: RawTouchTap);
    constructor(
        mods: Mod[],
        clockRate: number,
        firstObject: DroidDifficultyHitObject,
        isForceAR: boolean,
        greatWindow: number,
        considerCheesability: boolean,
    );
    constructor(
        modsOrCopy: Mod[] | RawTouchTap,
        clockRate?: number,
        firstObject?: DroidDifficultyHitObject,
        isForceAR?: boolean,
        greatWindow?: number,
        considerCheesability?: boolean,
    ) {
        if (modsOrCopy instanceof RawTouchTap) {
            super(modsOrCopy);

            this.greatWindow = modsOrCopy.greatWindow;
            this.considerCheesability = modsOrCopy.considerCheesability;

            return;
        }

        // These are safe to non-null (see constructor overloads).
        super(modsOrCopy, clockRate!, firstObject!, isForceAR!);

        this.greatWindow = greatWindow!;
        this.considerCheesability = considerCheesability!;
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
        current: DroidDifficultyHitObject,
        currentHand: TouchHand.left | TouchHand.right,
        lastHand: TouchHand.left | TouchHand.right,
    ) {
        let handMultiplier = 1;

        if (currentHand === lastHand) {
            // Reduction in speed value for singletapping consecutive notes.
            handMultiplier *= 0.93;
        } else {
            // Increase in speed value for hand coordination.
            handMultiplier *= 1.4;
        }

        return (
            DroidTapEvaluator.evaluateDifficultyOf(
                this.getSimulatedObject(current, currentHand),
                this.greatWindow,
                this.considerCheesability,
                true,
            ) *
            this.skillMultiplier *
            handMultiplier
        );
    }
}
