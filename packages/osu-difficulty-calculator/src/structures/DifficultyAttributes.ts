import { ModMap, ModUtil } from "@rian8337/osu-base";
import { CacheableDifficultyAttributes } from "./CacheableDifficultyAttributes";
import { IDifficultyAttributes } from "./IDifficultyAttributes";

/**
 * Holds data that can be used to calculate performance points.
 */
export abstract class DifficultyAttributes implements IDifficultyAttributes {
    mods = new ModMap();
    starRating = 0;
    maxCombo = 0;
    aimDifficulty = 0;
    flashlightDifficulty = 0;
    speedNoteCount = 0;
    sliderFactor = 1;
    clockRate = 1;
    overallDifficulty = 0;
    hitCircleCount = 0;
    sliderCount = 0;
    spinnerCount = 0;
    aimDifficultSliderCount = 0;
    aimDifficultStrainCount = 0;

    constructor(
        cacheableAttributes?: CacheableDifficultyAttributes<IDifficultyAttributes>,
    ) {
        if (!cacheableAttributes) {
            return;
        }

        this.mods = ModUtil.deserializeMods(cacheableAttributes.mods);
        this.starRating = cacheableAttributes.starRating;
        this.maxCombo = cacheableAttributes.maxCombo;
        this.aimDifficulty = cacheableAttributes.aimDifficulty;
        this.flashlightDifficulty = cacheableAttributes.flashlightDifficulty;
        this.speedNoteCount = cacheableAttributes.speedNoteCount;
        this.sliderFactor = cacheableAttributes.sliderFactor;
        this.clockRate = cacheableAttributes.clockRate;
        this.overallDifficulty = cacheableAttributes.overallDifficulty;
        this.hitCircleCount = cacheableAttributes.hitCircleCount;
        this.sliderCount = cacheableAttributes.sliderCount;
        this.spinnerCount = cacheableAttributes.spinnerCount;
        this.aimDifficultSliderCount =
            cacheableAttributes.aimDifficultSliderCount;
        this.aimDifficultStrainCount =
            cacheableAttributes.aimDifficultStrainCount;
    }

    /**
     * Converts this `DifficultyAttributes` instance to an attribute structure that can be cached.
     *
     * @returns The cacheable attributes.
     */
    toCacheableAttributes(): CacheableDifficultyAttributes<this> {
        return {
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            ...this,
            mods: this.mods.serializeMods(),
        };
    }

    /**
     * Returns a string representation of the difficulty attributes.
     */
    toString(): string {
        return `${this.starRating.toFixed(2)} stars`;
    }
}
