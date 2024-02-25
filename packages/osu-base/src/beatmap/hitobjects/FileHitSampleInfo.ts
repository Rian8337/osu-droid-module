import { HitSampleInfo } from "./HitSampleInfo";

/**
 * Represents a custom gameplay hit sample that can be loaded from files.
 */
export class FileHitSampleInfo extends HitSampleInfo {
    /**
     * The name of the file to load the sample from.
     */
    readonly filename: string;

    constructor(filename: string, volume: number = 0) {
        super(volume);

        this.filename = filename;
    }
}
