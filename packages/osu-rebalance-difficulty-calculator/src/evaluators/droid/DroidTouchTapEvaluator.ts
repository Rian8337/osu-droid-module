import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidTapEvaluator } from "./DroidTapEvaluator";

/**
 * An evaluator for calculating osu!droid tap difficulty when playing with a touch device.
 *
 * Wraps {@link DroidTapEvaluator} with additional bonuses for hand coordination and
 * a singletap nerf, accounting for the doubled per-hand strain time when alternating.
 */
export abstract class DroidTouchTapEvaluator {
    private static readonly singletapMultiplier = 0.95;
    private static readonly handCoordinationBonus = 0.275;

    static evaluateDifficultyOf(
        current: DroidDifficultyHitObject,
        considerCheesability: boolean,
    ): number {
        const { touchData } = current;

        if (!touchData?.perHandObject) {
            return 0;
        }

        // During a drag action, use the standard evaluator since the drag hand covers the
        // strain time correctly without any per-hand correction.
        if (touchData.action.isDrag) {
            return DroidTapEvaluator.evaluateDifficultyOf(
                current,
                considerCheesability,
            );
        }

        const isHandSwitch = touchData.aimingHand !== touchData.prevAimingHand;

        // Two taps with the same hand consecutively (singletap style on jumps).
        // When prevAction is null (first object), prevAimingHand is null, so this is always false.
        const isSingletapped =
            !touchData.prevAction?.isDrag &&
            touchData.aimingHand === touchData.prevAimingHand;

        // After a drag action the non-drag hand's history does not account for the drag object.
        // Use the original (non-per-hand) object so strain time is computed correctly.
        const calculateStrainWithOriginalObject =
            touchData.prevAction?.isDrag === true && isHandSwitch;

        const evaluationObject = calculateStrainWithOriginalObject
            ? current
            : touchData.perHandObject;

        let speedMultiplier = 1;

        if (isHandSwitch) {
            speedMultiplier += this.handCoordinationBonus;
        }

        // When fully alternating with two hands the per-hand strain time is roughly double the
        // usual value. Halve it here to compensate.
        let tapValue = DroidTapEvaluator.evaluateDifficultyOf(
            evaluationObject,
            considerCheesability,
            0.5,
        );

        if (isSingletapped) {
            tapValue *= this.singletapMultiplier;
        }

        return tapValue * speedMultiplier;
    }
}
