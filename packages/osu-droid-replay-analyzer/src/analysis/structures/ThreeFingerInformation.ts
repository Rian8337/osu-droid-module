/**
 * Information about the result of a three-finger check.
 */
export interface ThreeFingerInformation {
    /**
     * Whether the beatmap is three-fingered.
     */
    readonly is3Finger: boolean;

    /**
     * The final penalty. By default this is 1.
     */
    readonly penalty: number;
}
