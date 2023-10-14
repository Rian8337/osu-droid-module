import { AimEvaluator } from "../base/AimEvaluator";

/**
 * An evaluator for calculating osu!droid Aim skill.
 */
export abstract class DroidAimEvaluator extends AimEvaluator {
    protected static override readonly wideAngleMultiplier: number = 1.65;
    protected static override readonly sliderMultiplier: number = 1.5;
    protected static override readonly velocityChangeMultiplier: number = 0.85;
}
