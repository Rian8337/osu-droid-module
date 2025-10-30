import { CacheableDifficultyAttributes } from "./CacheableDifficultyAttributes";
import { DifficultyAttributes } from "./DifficultyAttributes";
import { IOsuDifficultyAttributes } from "./IOsuDifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!standard performance points.
 */
export class OsuDifficultyAttributes
    extends DifficultyAttributes
    implements IOsuDifficultyAttributes
{
    approachRate = 0;
    drainRate = 0;
    speedDifficulty = 0;
    speedDifficultStrainCount = 0;
    speedTopWeightedSliderFactor = 0;

    constructor(
        cacheableAttributes?: CacheableDifficultyAttributes<IOsuDifficultyAttributes>,
    ) {
        super(cacheableAttributes);

        if (!cacheableAttributes) {
            return;
        }

        this.approachRate = cacheableAttributes.approachRate;
        this.drainRate = cacheableAttributes.drainRate;
        this.speedDifficulty = cacheableAttributes.speedDifficulty;
        this.speedDifficultStrainCount =
            cacheableAttributes.speedDifficultStrainCount;
        this.speedTopWeightedSliderFactor =
            cacheableAttributes.speedTopWeightedSliderFactor;
    }

    override toString(): string {
        return (
            super.toString() +
            ` (${this.aimDifficulty.toFixed(2)} aim, ` +
            `${this.speedDifficulty.toFixed(2)} speed, ` +
            `${this.flashlightDifficulty.toFixed(2)} flashlight)`
        );
    }
}
