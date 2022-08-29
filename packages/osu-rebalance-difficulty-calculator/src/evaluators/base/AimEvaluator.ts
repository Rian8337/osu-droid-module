/**
 * An evaluator for calculating aim skill.
 *
 * This class should be considered an "evaluating" class and not persisted.
 */
export abstract class AimEvaluator {
    protected static readonly wideAngleMultiplier: number = 1.5;
    protected static readonly acuteAngleMultiplier: number = 1.95;
    protected static readonly sliderMultiplier: number = 1.35;
    protected static readonly velocityChangeMultiplier: number = 0.75;

    /**
     * Calculates the bonus of wide angles.
     */
    protected static calculateWideAngleBonus(angle: number): number {
        return Math.pow(
            Math.sin(
                (3 / 4) *
                    (Math.min((5 / 6) * Math.PI, Math.max(Math.PI / 6, angle)) -
                        Math.PI / 6)
            ),
            2
        );
    }

    /**
     * Calculates the bonus of acute angles.
     */
    protected static calculateAcuteAngleBonus(angle: number): number {
        return 1 - this.calculateWideAngleBonus(angle);
    }
}
