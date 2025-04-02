import { CacheableDifficultyAttributes } from "./CacheableDifficultyAttributes";
import { DifficultyAttributes } from "./DifficultyAttributes";
import { IDroidDifficultyAttributes } from "./IDroidDifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!droid performance points.
 */
export class DroidDifficultyAttributes
    extends DifficultyAttributes
    implements IDroidDifficultyAttributes
{
    tapDifficulty = 0;
    rhythmDifficulty = 0;
    visualDifficulty = 0;
    tapDifficultStrainCount = 0;
    flashlightDifficultStrainCount = 0;
    visualDifficultStrainCount = 0;
    averageSpeedDeltaTime = 0;
    vibroFactor = 1;

    constructor(
        cacheableAttributes?: CacheableDifficultyAttributes<IDroidDifficultyAttributes>,
    ) {
        super(cacheableAttributes);

        if (!cacheableAttributes) {
            return;
        }

        this.tapDifficulty = cacheableAttributes.tapDifficulty;
        this.rhythmDifficulty = cacheableAttributes.rhythmDifficulty;
        this.visualDifficulty = cacheableAttributes.visualDifficulty;
        this.tapDifficultStrainCount =
            cacheableAttributes.tapDifficultStrainCount;
        this.flashlightDifficultStrainCount =
            cacheableAttributes.flashlightDifficultStrainCount;
        this.visualDifficultStrainCount =
            cacheableAttributes.visualDifficultStrainCount;
        this.averageSpeedDeltaTime = cacheableAttributes.averageSpeedDeltaTime;
        this.vibroFactor = cacheableAttributes.vibroFactor;
    }

    override toString(): string {
        return (
            super.toString() +
            ` (${this.aimDifficulty.toFixed(2)} aim, ` +
            `${this.tapDifficulty.toFixed(2)} tap, ` +
            `${this.rhythmDifficulty.toFixed(2)} rhythm, ` +
            `${this.flashlightDifficulty.toFixed(2)} flashlight, ` +
            `${this.visualDifficulty.toFixed(2)} visual)`
        );
    }
}
