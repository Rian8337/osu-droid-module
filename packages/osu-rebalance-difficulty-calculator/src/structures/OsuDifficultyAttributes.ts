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
    speedDifficulty = 0;
    speedDifficultStrainCount = 0;

    constructor(
        cacheableAttributes?: CacheableDifficultyAttributes<IOsuDifficultyAttributes>,
    ) {
        super(cacheableAttributes);

        if (!cacheableAttributes) {
            return;
        }

        this.approachRate = cacheableAttributes.approachRate;
        this.speedDifficulty = cacheableAttributes.speedDifficulty;
        this.speedDifficultStrainCount =
            cacheableAttributes.speedDifficultStrainCount;
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
