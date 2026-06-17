import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidFlowAimEvaluator } from "./DroidFlowAimEvaluator";

/**
 * An evaluator for calculating osu!droid flow aim difficulty when playing with a touch device.
 *
 * Wraps {@link DroidFlowAimEvaluator} with additional bonuses for hand coordination,
 * drag transitions, and physical obstruction between hands.
 */
export abstract class DroidTouchFlowAimEvaluator {
    private static readonly handCoordinationBonus = 1.475;
    private static readonly transitionToDragBonus = 0.9;
    private static readonly flowObstructionMaxBonus = 4.35;

    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        includeSliders: boolean,
    ): number {
        const { touchData } = current;

        if (!touchData?.perHandObject) {
            return 0;
        }

        const isHandSwitch = touchData.aimingHand !== touchData.prevAimingHand;

        const isTransitionToDrag =
            touchData.action.isDrag &&
            touchData.prevAction !== null &&
            !touchData.prevAction.isDrag;

        let flowMultiplier = 1;

        if (isHandSwitch) {
            flowMultiplier += this.handCoordinationBonus;
        }

        if (isTransitionToDrag) {
            flowMultiplier += this.transitionToDragBonus;
        }

        flowMultiplier +=
            touchData.obstructionFactor * this.flowObstructionMaxBonus;

        const flowDifficultyNoSliders =
            DroidFlowAimEvaluator.evaluateDifficultyOf(
                touchData.perHandObject,
                false,
            );

        if (!includeSliders) {
            return flowDifficultyNoSliders * flowMultiplier;
        }

        const flowDifficultyWithSliders =
            DroidFlowAimEvaluator.evaluateDifficultyOf(
                touchData.perHandObject,
                true,
            );

        return (
            flowDifficultyNoSliders * flowMultiplier +
            (flowDifficultyWithSliders - flowDifficultyNoSliders)
        );
    }
}
