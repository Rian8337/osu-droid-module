import { Mod } from "@rian8337/osu-base";
import { DroidAimEvaluator } from "../../evaluators/droid/DroidAimEvaluator";
import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { TouchHand } from "../../structures/TouchHand";
import { RawTouchSkill } from "./RawTouchSkill";
import { DifficultyHitObjectCache } from "../../utils/DifficultyHitObjectCache";

export class RawTouchAim extends RawTouchSkill {
    protected override readonly strainDecayBase = 0.15;

    private readonly snapSkillMultiplier = 19.64;
    private readonly flowSkillMultiplier = 24.55;
    private readonly withSliders: boolean;

    constructor(
        mods: Mod[],
        clockRate: number,
        isForceAR: boolean,
        objectCache: DifficultyHitObjectCache<DroidDifficultyHitObject>,
        withSliders: boolean,
    ) {
        super(mods, clockRate, isForceAR, objectCache);

        this.withSliders = withSliders;
    }

    override clone(): RawTouchAim {
        const clone = new RawTouchAim(
            this.mods,
            this.clockRate,
            this.isForceAR,
            this.objectCache,
            this.withSliders,
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
            DroidAimEvaluator.evaluateSnapDifficultyOf(
                current,
                this.withSliders,
            ) *
                this.snapSkillMultiplier +
            DroidAimEvaluator.evaluateFlowDifficultyOf(current, false) *
                this.flowSkillMultiplier
        );
    }

    protected override strainValueIf(
        simulated: DroidDifficultyHitObject,
        currentHand: TouchHand.left | TouchHand.right,
        lastHand: TouchHand.left | TouchHand.right,
    ) {
        let obstructionBonus = 1;
        let flowAimMultiplier = 1;

        // Add a bonus for the hand co-ordination required to aim with both hands.
        if (currentHand !== lastHand) {
            let bonus = 1.1;

            // Add an obstrution bonus if the most recent instance of the "other hand" is in between the current object and the previous object with the actual hand
            const simulatedSwap = this.createSimulatedSwapObject(
                simulated,
                currentHand,
            );
            const angle = simulatedSwap.angle;

            if (angle !== null) {
                bonus += 1.5 / (1 + Math.exp(-(angle - (3 * Math.PI) / 5) / 9));
            }

            // Decay by strain time.
            bonus /= 1 + simulated.strainTime / 1000;

            obstructionBonus += bonus;

            // Massive reduction in flow aim value for switching hands.
            flowAimMultiplier *= 0.325;
        } else {
            // Reduction in flow aim value for singletapping consecutive notes.
            flowAimMultiplier *= 0.93;
        }

        const snapAimStrain =
            DroidAimEvaluator.evaluateSnapDifficultyOf(
                simulated,
                this.withSliders,
            ) *
            obstructionBonus *
            this.snapSkillMultiplier;

        const flowAimStrain =
            DroidAimEvaluator.evaluateFlowDifficultyOf(simulated, true) *
            obstructionBonus *
            flowAimMultiplier *
            this.flowSkillMultiplier;

        return snapAimStrain + flowAimStrain;
    }
}
