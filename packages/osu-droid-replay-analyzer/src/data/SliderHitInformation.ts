/**
 * Represents hit information about sliders in a beatmap.
 */
export interface SliderHitInformation {
    /**
     * Hit information of slider ticks.
     */
    readonly tick: SliderNestedHitObjectInformation;

    /**
     * hit information of slider ends.
     */
    readonly end: SliderNestedHitObjectInformation;
}

/**
 * Hit information of a specific nested hit object.
 */
export interface SliderNestedHitObjectInformation {
    /**
     * The amount of the nested hit objects that were obtained.
     */
    obtained: number;

    /**
     * The amount of the nested hit objects in the beatmap.
     */
    readonly total: number;
}
