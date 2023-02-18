/**
 * An evaluator for calculating rhythm skill.
 *
 * This class should be considered an "evaluating" class and not persisted.
 */
export abstract class RhythmEvaluator {
    protected static readonly rhythmMultiplier: number = 0.75;
    protected static readonly historyTimeMax: number = 5000; // 5 seconds of calculateRhythmBonus max.
}
