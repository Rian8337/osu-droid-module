/**
 * An evaluator for calculating flashlight skill.
 *
 * This class should be considered an "evaluating" class and not persisted.
 */
export abstract class FlashlightEvaluator {
    protected static readonly maxOpacityBonus: number = 0.4;
    protected static readonly hiddenBonus: number = 0.2;
    protected static readonly minVelocity: number = 0.5;
    protected static readonly sliderMultiplier: number = 1.3;
}
