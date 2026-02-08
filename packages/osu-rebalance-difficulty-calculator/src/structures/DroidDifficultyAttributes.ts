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
    tapTopWeightedSliderFactor = 0;
    rhythmDifficulty = 0;
    tapDifficultStrainCount = 0;
    averageSpeedDeltaTime = 0;
    vibroFactor = 1;
    nestedScorePerObject = 0;
    maximumScore = 0;
    aimMissPenaltyCoefficientA = 0;
    aimMissPenaltyCoefficientB = 0;
    aimMissPenaltyCoefficientC = 0;

    constructor(
        cacheableAttributes?: CacheableDifficultyAttributes<IDroidDifficultyAttributes>,
    ) {
        super(cacheableAttributes);

        if (!cacheableAttributes) {
            return;
        }

        this.tapDifficulty = cacheableAttributes.tapDifficulty;
        this.rhythmDifficulty = cacheableAttributes.rhythmDifficulty;
        this.readingDifficulty = cacheableAttributes.readingDifficulty;
        this.tapDifficultStrainCount =
            cacheableAttributes.tapDifficultStrainCount;
        this.readingDifficultNoteCount =
            cacheableAttributes.readingDifficultNoteCount;
        this.averageSpeedDeltaTime = cacheableAttributes.averageSpeedDeltaTime;
        this.vibroFactor = cacheableAttributes.vibroFactor;
        this.tapTopWeightedSliderFactor =
            cacheableAttributes.tapTopWeightedSliderFactor;
        this.maximumScore = cacheableAttributes.maximumScore;
        this.aimMissPenaltyCoefficientA =
            cacheableAttributes.aimMissPenaltyCoefficientA;
        this.aimMissPenaltyCoefficientB =
            cacheableAttributes.aimMissPenaltyCoefficientB;
        this.aimMissPenaltyCoefficientC =
            cacheableAttributes.aimMissPenaltyCoefficientC;
    }

    override toString(): string {
        return (
            super.toString() +
            ` (${this.aimDifficulty.toFixed(2)} aim, ` +
            `${this.tapDifficulty.toFixed(2)} tap, ` +
            `${this.rhythmDifficulty.toFixed(2)} rhythm, ` +
            `${this.flashlightDifficulty.toFixed(2)} flashlight, ` +
            `${this.readingDifficulty.toFixed(2)} reading)`
        );
    }
}
