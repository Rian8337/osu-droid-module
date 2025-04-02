import { CacheableDifficultyAttributes } from "./CacheableDifficultyAttributes";
import { DifficultSlider } from "./DifficultSlider";
import { DroidDifficultyAttributes } from "./DroidDifficultyAttributes";
import { HighStrainSection } from "./HighStrainSection";
import { IExtendedDroidDifficultyAttributes } from "./IExtendedDroidDifficultyAttributes";

/**
 * Holds data that can be used to calculate osu!droid performance points as well
 * as doing some analysis using the replay of a score.
 */
export class ExtendedDroidDifficultyAttributes
    extends DroidDifficultyAttributes
    implements IExtendedDroidDifficultyAttributes
{
    mode = "live" as const;
    possibleThreeFingeredSections: HighStrainSection[] = [];
    difficultSliders: DifficultSlider[] = [];
    aimNoteCount = 0;
    flashlightSliderFactor = 1;
    visualSliderFactor = 1;

    constructor(
        cacheableAttributes?: CacheableDifficultyAttributes<IExtendedDroidDifficultyAttributes>,
    ) {
        super(cacheableAttributes);

        if (!cacheableAttributes) {
            return;
        }

        this.possibleThreeFingeredSections =
            cacheableAttributes.possibleThreeFingeredSections;
        this.difficultSliders = cacheableAttributes.difficultSliders;
        this.aimNoteCount = cacheableAttributes.aimNoteCount;
        this.flashlightSliderFactor =
            cacheableAttributes.flashlightSliderFactor;
        this.visualSliderFactor = cacheableAttributes.visualSliderFactor;
    }
}
