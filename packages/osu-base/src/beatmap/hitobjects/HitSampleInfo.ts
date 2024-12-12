/**
 * Represents a gameplay hit sample.
 */
export abstract class HitSampleInfo {
    /**
     * The sample volume.
     *
     * If this is 0, the control point's volume should be used instead.
     */
    readonly volume: number;

    /**
     * All possible filenames that can be used as an audio source, returned in order of preference (highest first).
     */
    abstract get lookupNames(): string[];

    constructor(volume: number = 0) {
        this.volume = volume;
    }
}
