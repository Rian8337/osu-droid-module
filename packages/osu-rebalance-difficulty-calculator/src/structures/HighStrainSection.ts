/**
 * Represents a beatmap section at which the strains of objects are considerably high.
 */
export interface HighStrainSection {
    /**
     * The index of the first object in this section with respect to the full beatmap.
     */
    readonly firstObjectIndex: number;

    /**
     * The index of the last object in this section with respect to the full beatmap.
     */
    readonly lastObjectIndex: number;

    /**
     * The summed strain of this section.
     */
    readonly sumStrain: number;
}
