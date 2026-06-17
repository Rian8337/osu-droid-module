import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidSnapAimEvaluator } from "./DroidSnapAimEvaluator";

/**
 * An evaluator for calculating osu!droid snap aim difficulty when playing with a touch device.
 *
 * Wraps {@link DroidSnapAimEvaluator} with additional bonuses for hand coordination,
 * drag transitions, and physical obstruction between hands.
 */
export abstract class DroidTouchSnapAimEvaluator {
    private static readonly handCoordinationBonus = 1.05;
    private static readonly transitionToDragBonus = 1.95;
    private static readonly snapObstructionMaxBonus = 3.2;

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

        let snapMultiplier = 1;

        if (isHandSwitch) {
            snapMultiplier += this.handCoordinationBonus;
        }

        if (isTransitionToDrag) {
            snapMultiplier += this.transitionToDragBonus;
        }

        snapMultiplier +=
            touchData.obstructionFactor * this.snapObstructionMaxBonus;

        const snapDifficultyNoSliders =
            touchData.cachedRawAim?.snapNoSliders ??
            DroidSnapAimEvaluator.evaluateDifficultyOf(
                touchData.perHandObject,
                false,
            );

        if (!includeSliders) {
            return snapDifficultyNoSliders * snapMultiplier;
        }

        const snapDifficultyWithSliders =
            touchData.cachedRawAim?.snapWithSliders ??
            DroidSnapAimEvaluator.evaluateDifficultyOf(
                touchData.perHandObject,
                true,
            );

        return (
            snapDifficultyNoSliders * snapMultiplier +
            (snapDifficultyWithSliders - snapDifficultyNoSliders)
        );
    }
}
