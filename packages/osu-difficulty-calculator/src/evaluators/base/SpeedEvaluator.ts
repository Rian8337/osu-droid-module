/**
 * An evaluator for calculating speed or tap skill.
 *
 * This class should be considered an "evaluating" class and not persisted.
 */
export abstract class SpeedEvaluator {
    // ~200 1/4 BPM streams
    protected static readonly minSpeedBonus: number = 75;
}
