import { DroidDifficultyHitObject } from "../../preprocessing/DroidDifficultyHitObject";
import { DroidAgilityEvaluator } from "./DroidAgilityEvaluator";

/**
 * An evaluator for calculating osu!droid agility difficulty when playing with a touch device.
 *
 * Wraps {@link DroidAgilityEvaluator} with additional bonuses for hand coordination,
 * drag transitions, and physical obstruction between hands.
 */
export abstract class DroidTouchAgilityEvaluator {
    private static readonly handCoordinationBonus = 0.7;
    private static readonly transitionToDragBonus = 0.3;
    private static readonly agilityObstructionMaxBonus = 1.5;

    static evaluateDifficultyOf(current: DroidDifficultyHitObject): number {
        const { touchData } = current;

        if (!touchData?.perHandObject) {
            return 0;
        }

        const isHandSwitch = touchData.aimingHand !== touchData.prevAimingHand;
        const isTransitionToDrag =
            touchData.action.isDrag &&
            touchData.prevAction !== null &&
            !touchData.prevAction.isDrag;

        let agilityMultiplier = 1;

        if (isHandSwitch) {
            agilityMultiplier += this.handCoordinationBonus;
        }

        if (isTransitionToDrag) {
            agilityMultiplier += this.transitionToDragBonus;
        }

        agilityMultiplier +=
            touchData.obstructionFactor * this.agilityObstructionMaxBonus;

        const agility =
            touchData.cachedRawAim?.agility ??
            DroidAgilityEvaluator.evaluateDifficultyOf(touchData.perHandObject);

        return agility * agilityMultiplier;
    }
}
