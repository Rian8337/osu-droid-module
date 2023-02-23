/**
 * Contains information about factors to nerf in three finger detection.
 */
export interface NerfFactor {
    /**
     * Nerf factor from the strain of the section.
     */
    readonly strainFactor: number;

    /**
     * Nerf factor based on the length of the strain.
     */
    readonly lengthFactor: number;

    /**
     * Nerf factor based on how much a section is 3-fingered.
     */
    readonly fingerFactor: number;
}
