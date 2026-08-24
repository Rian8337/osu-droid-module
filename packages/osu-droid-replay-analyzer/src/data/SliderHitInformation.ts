/**
 * Represents hit information about sliders in a beatmap.
 */
export interface SliderHitInformation {
    /**
     * Hit information of slider heads.
     */
    readonly head: SliderNestedHitObjectInformation;

    /**
     * Hit information of slider ticks.
     */
    readonly tick: SliderNestedHitObjectInformation;

    /**
     * Hit information of slider repeats.
     */
    readonly repeat: SliderNestedHitObjectInformation;

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
    total: number;
}
