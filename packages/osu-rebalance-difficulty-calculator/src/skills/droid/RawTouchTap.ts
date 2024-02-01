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

    constructor(copy: RawTouchTap);
    constructor(
        mods: Mod[],
        clockRate: number,
        isForceAR: boolean,
        objectCache: DifficultyHitObjectCache<DroidDifficultyHitObject>,
        greatWindow: number,
        considerCheesability: boolean,
    );
    constructor(
        modsOrCopy: Mod[] | RawTouchTap,
        clockRate?: number,
        isForceAR?: boolean,
        objectCache?: DifficultyHitObjectCache<DroidDifficultyHitObject>,
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
        super(modsOrCopy, clockRate!, isForceAR!, objectCache!);

        this.greatWindow = greatWindow!;
        this.considerCheesability = considerCheesability!;
    }

    override clone(): RawTouchTap {
        return new RawTouchTap(this);
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
